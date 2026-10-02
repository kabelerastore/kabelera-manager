import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return json({ ok: false, error: "Sem autenticação." }, 401);

    // Verifica quem chamou e se é admin.
    const admin = createClient(url, serviceKey);
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) return json({ ok: false, error: "Sessão inválida." }, 401);
    const { data: prof } = await admin.from("profiles").select("is_admin").eq("id", userData.user.id).single();
    if (!prof?.is_admin) return json({ ok: false, error: "Apenas administradores podem criar usuários." }, 403);

    let body;
    try { body = await req.json(); }
    catch (_e) { return json({ ok: false, error: "Corpo da requisição inválido." }, 400); }
    const { email, password, name, role_label, area_ids, is_admin } = body;
    if (!email || !password || !name) return json({ ok: false, error: "E-mail, senha e nome são obrigatórios." }, 400);

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
    });
    if (createErr || !created?.user) return json({ ok: false, error: createErr?.message || "Falha ao criar usuário." }, 400);

    const { error: profErr } = await admin.from("profiles").insert({
      id: created.user.id, name, role_label: role_label || "",
      area_ids: Array.isArray(area_ids) ? area_ids : [], is_admin: !!is_admin, is_active: true,
    });
    if (profErr) {
      // rollback: evita um usuário de Auth órfão, sem perfil (que ficaria sem admin e quebraria o próprio gate).
      await admin.auth.admin.deleteUser(created.user.id);
      return json({ ok: false, error: "Falha ao criar o perfil; o usuário foi revertido. " + profErr.message }, 500);
    }

    return json({ ok: true, id: created.user.id });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});
