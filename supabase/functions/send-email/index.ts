import { createClient } from "jsr:@supabase/supabase-js@2";

// Função acionada por um Database Webhook do Supabase quando uma linha é
// inserida em public.notifications. Ela descobre o e-mail do destinatário e
// envia o aviso pelo Resend. Configurar os secrets: RESEND_API_KEY, WEBHOOK_SECRET
// e (opcional) EMAIL_FROM. "Verify JWT" fica OFF (o webhook não manda JWT de
// usuário); a trava de acesso é o WEBHOOK_SECRET no header x-webhook-secret.

Deno.serve(async (req) => {
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

  try {
    // Porta trancada: só atende quem apresentar o segredo combinado.
    // O Database Webhook do Supabase manda esse segredo no header x-webhook-secret.
    // Sem WEBHOOK_SECRET configurado ou com segredo errado, rejeita (evita chamadas públicas).
    const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
    const sentSecret = req.headers.get("x-webhook-secret") || "";
    if (!webhookSecret || sentSecret !== webhookSecret) {
      return json({ ok: false, error: "Não autorizado." }, 401);
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) return json({ ok: false, error: "RESEND_API_KEY não configurada." }, 500);
    const from = Deno.env.get("EMAIL_FROM") || "Kabelera Manager <onboarding@resend.dev>";
    const appUrl = Deno.env.get("APP_URL") || "https://kabelerastore.github.io/kabelera-manager/";

    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY"))!;
    const admin = createClient(url, serviceKey);

    const body = await req.json();
    // Database Webhook manda { type, table, record, ... }
    const record = body?.record || body;
    const userId = record?.user_id;
    const text = record?.text || "Você tem uma nova notificação no Kabelera Manager.";
    if (!userId) return json({ ok: false, error: "Sem user_id." }, 400);

    // Descobre o e-mail do destinatário.
    const { data: userData, error: userErr } = await admin.auth.admin.getUserById(userId);
    if (userErr || !userData?.user?.email) return json({ ok: false, error: "Usuário sem e-mail." }, 404);
    const to = userData.user.email;

    const html =
      '<div style="font-family:Arial,sans-serif;font-size:15px;color:#151824;line-height:1.5;">' +
      '<p>' + escapeHtml(text) + '</p>' +
      '<p><a href="' + appUrl + '" style="color:#111;background:#fffa2a;padding:9px 16px;border-radius:8px;text-decoration:none;font-weight:bold;">Abrir o Kabelera Manager</a></p>' +
      '<p style="color:#8A90A1;font-size:12px;">Você recebeu este e-mail porque participa do Kabelera Manager.</p>' +
      '</div>';

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + resendKey, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject: "Kabelera Manager — novo aviso", html }),
    });
    const out = await resp.json();
    if (!resp.ok) return json({ ok: false, error: out }, 502);
    return json({ ok: true, id: out?.id });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});

function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}
