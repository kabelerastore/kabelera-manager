# Kabelera Manager — Persistência, Login, Áreas/Usuários Dinâmicos, Gantt e Timeline — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar o protótipo em memória do Kabelera Manager num app web real, compartilhado e seguro, com login, persistência no Supabase, áreas e usuários dinâmicos, views Gantt e Timeline, publicado no GitHub Pages.

**Architecture:** Site 100% estático (HTML/CSS/JS, sem build step) hospedado no GitHub Pages. Backend inteiramente no Supabase: Auth (login e-mail/senha), Postgres (dados, protegido por RLS) e uma Edge Function para criação de usuários por admin. O cliente carrega todos os dados após o login e grava de forma otimista com rollback em erro.

**Tech Stack:** HTML/CSS/JavaScript vanilla (ES5/ES6, sem framework), `@supabase/supabase-js` via CDN, Supabase (Postgres + Auth + Edge Functions em Deno), Node 24 `node --test` para testes de funções puras, `npx serve` para servir localmente, GitHub Pages para deploy.

## Global Constraints

- Idioma de toda a interface e textos: Português brasileiro, com acentuação e pontuação corretas.
- Sem build step: scripts entram por `<script src>` (CDN ou arquivo local); nada de bundler/transpiler.
- IDs de entidades vêm do banco (`gen_random_uuid()`), nunca de `Math.random()`.
- Datas puras (prazo, início, conclusão) tratadas no fuso local do Brasil; nunca derivar data de `Date.prototype.toISOString()` (UTC).
- Conteúdo de um usuário é renderizado na tela de outro: todo texto livre passa por `esc()` antes de ir ao HTML.
- A `service_role` key do Supabase NUNCA aparece no código do cliente; vive apenas como secret da Edge Function.
- Exclusões são lógicas (`is_active = false`), nunca `DELETE`, para preservar histórico e referências.
- Os 4 fluxos de status (`creative`, `comercial`, `financeiro`, `admin`) são fixos no código; áreas novas escolhem um deles.
- Cada tarefa termina com uma entrega testável e um commit.

**Fonte do protótipo:** `C:\Users\Patricia\Downloads\kabelera-manager.html` (1402 linhas). As linhas citadas neste plano referem-se a esse arquivo.

---

## File Structure

```
kabelera-manager/
  index.html              # markup base + telas (login, carregando, erro, app shell)
  styles.css              # todo o CSS (hoje embutido no <style> do protótipo)
  lib.js                  # funções PURAS, testáveis em Node e no browser (UMD-ish)
  app.js                  # estado, render, eventos, views (hoje no <script> do protótipo)
  supabase-client.js      # init do Supabase, auth e wrapper de queries + mappers
  config.example.js       # modelo de config (URL + anon key) versionado
  config.js               # config real (gitignored) — criado na etapa de deploy
  package.json            # scripts de teste e serve (não é dependência de runtime)
  .gitignore
  test/
    lib.test.js           # testes das funções puras de lib.js
    mappers.test.js       # testes dos mappers snake_case<->camelCase
  supabase/
    schema.sql            # tabelas, RLS, função is_admin(), seed das 5 áreas
    functions/create-user/index.ts   # Edge Function de criação de usuário
  docs/superpowers/
    specs/2026-10-02-kabelera-manager-persistencia-gantt-design.md
    plans/2026-10-02-kabelera-manager-persistencia-gantt.md
  README.md               # setup Supabase, contas, deploy GitHub Pages
```

Responsabilidades:
- `lib.js`: só funções puras (escape, datas, fluxos, prioridade). Sem DOM, sem estado, sem rede. É a fronteira testável.
- `supabase-client.js`: toda a conversa com o Supabase e a tradução entre o formato do banco (snake_case) e o formato do app (camelCase).
- `app.js`: tudo que mexe no DOM e no estado da tela.
- `index.html`/`styles.css`: markup e estilo.

---

## Task 1: Scaffold do repositório + funções puras testáveis (com as correções da revisão)

Esta tarefa cria a base testável e já corrige, com TDD, os pontos de segurança/correção da revisão: `esc` escapando aspa simples, `escRegex` para `mentionify`, helpers de data em fuso local, e `nextStatusOnApprove`.

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `lib.js`
- Create: `test/lib.test.js`

**Interfaces:**
- Consumes: nada.
- Produces (todas expostas em `window.KM` no browser e `module.exports` em Node):
  - `esc(s: string): string` — escapa `& < > " '`.
  - `escRegex(s: string): string` — escapa metacaracteres de regex.
  - `mentionify(text: string, users: Array<{id,name}>): string` — escapa o texto, depois destaca `@Nome`/`@Primeiro` em negrito azul.
  - `toISODate(d: Date): string` — `YYYY-MM-DD` no fuso LOCAL (não UTC).
  - `addDaysISO(iso: string, n: number): string` — soma dias a uma data `YYYY-MM-DD`, retorna `YYYY-MM-DD`.
  - `FLOWS: object`, `FINAL_STATUSES: object`, `RETURN_RULES: object` — constantes dos 4 fluxos.
  - `isFinalStatus(flow: string, status: string): boolean`.
  - `nextStatusOnApprove(flow: string, status: string): string` — próximo status ao aprovar; para `creative` em `Aprovação` retorna `Programado`; genericamente retorna o próximo status do fluxo, ou o mesmo se já for o último.
  - `priorityRank(p)`, `priorityClass(p)` — iguais ao protótipo.

- [ ] **Step 1: Criar `package.json`**

```json
{
  "name": "kabelera-manager",
  "version": "1.0.0",
  "private": true,
  "description": "Gestao de projetos, tarefas e equipe da Kabelera",
  "scripts": {
    "test": "node --test",
    "serve": "npx --yes serve -l 5173 ."
  }
}
```

- [ ] **Step 2: Criar `.gitignore`**

```
config.js
node_modules/
.DS_Store
Thumbs.db
```

- [ ] **Step 3: Escrever o teste que falha (`test/lib.test.js`)**

```js
const test = require('node:test');
const assert = require('node:assert');
const KM = require('../lib.js');

test('esc escapa aspa simples e angulares', () => {
  assert.strictEqual(KM.esc(`<b>"ola" 'tchau' & fim`), '&lt;b&gt;&quot;ola&quot; &#39;tchau&#39; &amp; fim');
});

test('escRegex escapa metacaracteres', () => {
  assert.strictEqual(KM.escRegex('a.b*c(d)'), 'a\\.b\\*c\\(d\\)');
});

test('mentionify destaca mencao e nao quebra com nome com caractere especial', () => {
  const users = [{ id: 'u1', name: 'Ana (RH)' }];
  const out = KM.mentionify('oi @Ana (RH) tudo bem', users);
  assert.ok(out.includes('<b'), 'deve conter negrito');
  assert.ok(out.includes('Ana (RH)'));
});

test('toISODate usa fuso local, nao UTC', () => {
  // 1 de marco de 2026, 23:00 horario local. Em UTC-3 vira 2026-03-02 em UTC.
  const d = new Date(2026, 2, 1, 23, 0, 0);
  assert.strictEqual(KM.toISODate(d), '2026-03-01');
});

test('addDaysISO soma dias corretamente atravessando mes', () => {
  assert.strictEqual(KM.addDaysISO('2026-01-30', 3), '2026-02-02');
  assert.strictEqual(KM.addDaysISO('2026-03-10', -3), '2026-03-07');
});

test('isFinalStatus reconhece status finais por fluxo', () => {
  assert.strictEqual(KM.isFinalStatus('creative', 'Concluído'), true);
  assert.strictEqual(KM.isFinalStatus('creative', 'Revisão'), false);
  assert.strictEqual(KM.isFinalStatus('comercial', 'Pós-venda'), true);
});

test('nextStatusOnApprove avanca creative de Aprovacao para Programado', () => {
  assert.strictEqual(KM.nextStatusOnApprove('creative', 'Aprovação'), 'Programado');
});

test('nextStatusOnApprove avanca para proximo status em fluxo generico', () => {
  assert.strictEqual(KM.nextStatusOnApprove('admin', 'A Fazer'), 'Em Andamento');
});

test('nextStatusOnApprove no ultimo status permanece', () => {
  assert.strictEqual(KM.nextStatusOnApprove('admin', 'Concluído'), 'Concluído');
});
```

- [ ] **Step 4: Rodar o teste e ver falhar**

Run: `npm test`
Expected: FAIL — `Cannot find module '../lib.js'`.

- [ ] **Step 5: Escrever `lib.js`**

```js
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.KM = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(s) {
    return (s == null ? '' : String(s)).replace(/[&<>"']/g, function (c) { return ESC_MAP[c]; });
  }
  function escRegex(s) {
    return (s == null ? '' : String(s)).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  function mentionify(text, users) {
    var out = esc(text);
    (users || []).forEach(function (u) {
      var first = String(u.name).split(' ')[0];
      var re = new RegExp('@' + escRegex(u.name) + '|@' + escRegex(first), 'g');
      out = out.replace(re, '<b style="color:var(--accent)">$&</b>');
    });
    return out;
  }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function toISODate(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function addDaysISO(iso, n) {
    var p = iso.split('-');
    var d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
    d.setDate(d.getDate() + n);
    return toISODate(d);
  }

  var FLOWS = {
    creative: ['Backlog', 'Planejamento', 'Em produção', 'Revisão', 'Aprovação', 'Programado', 'Concluído'],
    comercial: ['Novo Lead', 'Contato', 'Qualificação', 'Proposta', 'Negociação', 'Fechado', 'Pós-venda'],
    financeiro: ['Pendente', 'Programado', 'Aguardando', 'Pago/Recebido', 'Conciliado'],
    admin: ['Solicitado', 'A Fazer', 'Em Andamento', 'Aguardando Terceiro', 'Revisão', 'Concluído']
  };
  var FINAL_STATUSES = {
    creative: ['Concluído'], comercial: ['Fechado', 'Pós-venda'],
    financeiro: ['Pago/Recebido', 'Conciliado'], admin: ['Concluído']
  };
  var RETURN_RULES = { creative: { 'Aprovação': 'Em produção' } };

  function isFinalStatus(flow, status) { return (FINAL_STATUSES[flow] || []).indexOf(status) > -1; }
  function nextStatusOnApprove(flow, status) {
    if (flow === 'creative' && status === 'Aprovação') return 'Programado';
    var cols = FLOWS[flow] || [];
    var i = cols.indexOf(status);
    if (i === -1 || i === cols.length - 1) return status;
    return cols[i + 1];
  }
  function priorityRank(p) { return { 'Baixa': 0, 'Média': 1, 'Alta': 2, 'Urgente': 3 }[p] || 0; }
  function priorityClass(p) { return { 'Baixa': 'pr-good', 'Média': 'pr-warning', 'Alta': 'pr-serious', 'Urgente': 'pr-critical' }[p] || 'pr-good'; }

  return {
    esc: esc, escRegex: escRegex, mentionify: mentionify,
    toISODate: toISODate, addDaysISO: addDaysISO,
    FLOWS: FLOWS, FINAL_STATUSES: FINAL_STATUSES, RETURN_RULES: RETURN_RULES,
    isFinalStatus: isFinalStatus, nextStatusOnApprove: nextStatusOnApprove,
    priorityRank: priorityRank, priorityClass: priorityClass
  };
});
```

- [ ] **Step 6: Rodar o teste e ver passar**

Run: `npm test`
Expected: PASS — todos os testes de `lib.test.js` verdes.

- [ ] **Step 7: Commit**

```bash
git add package.json .gitignore lib.js test/lib.test.js
git commit -m "feat: funções puras testáveis com correções de segurança e data (fuso local)"
```

---

## Task 2: Dividir o monólito em index.html + styles.css + app.js (comportamento preservado)

Entrega: o mesmo app do protótipo, com os mesmos dados fictícios em memória, funcionando igual — mas agora em arquivos separados e usando as funções de `lib.js`. Nada de Supabase ainda.

**Files:**
- Create: `index.html` (shell: estrutura das linhas 348-396 do protótipo + tags de script/css)
- Create: `styles.css` (conteúdo do `<style>`, linhas 4-345 do protótipo)
- Create: `app.js` (conteúdo do `<script>`, linhas 399-1400 do protótipo, com os ajustes abaixo)

**Interfaces:**
- Consumes: `window.KM` de `lib.js` (Task 1).
- Produces: o objeto global de app segue encapsulado em IIFE; nenhuma nova interface pública.

- [ ] **Step 1: Criar `styles.css`** — copiar exatamente o conteúdo entre `<style>` (linha 4) e `</style>` (linha 346) do protótipo, sem as tags `<style>`.

- [ ] **Step 2: Criar `index.html`** com este shell (inclui `<title>`, link do CSS, fontes, o markup do `#app` das linhas 348-396, e os scripts na ordem lib → supabase → client → app):

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Kabelera Manager</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Inter:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="styles.css">
</head>
<body>
<a class="skip-link" href="#content">Pular para o conteúdo</a>
<div id="gateScreen" class="gate-screen"></div>
<div id="app">
  <!-- COLAR AQUI o markup das linhas 350-391 do protótipo (de <aside class="sidebar"> até </nav>) -->
</div>
<div class="overlay" id="sidebarOverlay"></div>
<div class="overlay" id="drawerOverlay"></div>
<aside class="task-drawer" id="taskDrawer"></aside>
<div class="toast" id="toast"></div>

<script src="lib.js"></script>
<script src="app.js"></script>
</body>
</html>
```

(Os scripts `supabase-client.js` e o CDN do Supabase entram na Task 5; por enquanto só `lib.js` + `app.js`.)

- [ ] **Step 3: Criar `app.js`** — copiar o conteúdo entre `<script>` (linha 399, começando em `(function(){`) e `</script>` (linha 1401), sem as tags. Depois aplicar estes ajustes:
  - No topo do IIFE, logo após `"use strict";`, adicionar: `var KM = window.KM;`
  - Remover a definição local de `esc` (linha 663) e passar a usar `KM.esc`. Fazer o mesmo substituindo os usos de `esc(` por `KM.esc(` OU adicionar `var esc = KM.esc;` logo após a linha do `var KM`.
  - Substituir a definição local de `mentionify` (linhas 664-672) por `var mentionify = function(text){ return KM.mentionify(text, USERS); };`
  - Substituir `FLOWS`, `FINAL_STATUSES`, `RETURN_RULES` locais (linhas 465-472) por `var FLOWS = KM.FLOWS, FINAL_STATUSES = KM.FINAL_STATUSES, RETURN_RULES = KM.RETURN_RULES;`
  - Substituir `priorityRank`/`priorityClass` locais (linhas 651-652) por `var priorityRank = KM.priorityRank, priorityClass = KM.priorityClass;`

- [ ] **Step 4: Servir e verificar no browser**

Run: `npm run serve` e abrir `http://localhost:5173/`
Expected: o app abre no Dashboard, idêntico ao protótipo. Verificar manualmente: trocar de área no menu, arrastar um card no Kanban, abrir o drawer de uma tarefa, criar uma tarefa pelo botão "Nova tarefa", comentar com `@Caio`. Tudo funcionando como antes. Nenhum erro no console (F12).

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css app.js
git commit -m "refactor: dividir o protótipo em index.html, styles.css e app.js usando lib.js"
```

---

## Task 3: Esquema do banco, RLS e seed das áreas (`supabase/schema.sql`)

Entrega: um arquivo SQL que, aplicado no editor SQL do Supabase, cria todas as tabelas, liga RLS com as políticas corretas, cria a função `is_admin()` e popula as 5 áreas originais.

**Files:**
- Create: `supabase/schema.sql`

**Interfaces:**
- Produces: tabelas `profiles`, `areas`, `projects`, `tasks`, `notifications`; função `public.is_admin()`.

- [ ] **Step 1: Escrever `supabase/schema.sql`**

```sql
-- Kabelera Manager — esquema, RLS e seed
-- Aplicar no Supabase: SQL Editor > New query > colar tudo > Run.

create extension if not exists pgcrypto;

-- PERFIS (espelham auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role_label text default '',
  area_ids uuid[] default '{}',
  is_admin boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.areas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  flow text not null check (flow in ('creative','comercial','financeiro','admin')),
  color text not null default '#2A78D6',
  subcats text[] not null default '{}',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  responsible_id uuid,
  participants uuid[] default '{}',
  start_date date,
  due_date date,
  status text default 'Planejamento',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  area_id uuid references public.areas(id),
  subcategory text default '',
  project_id uuid references public.projects(id),
  requester_id uuid,
  responsible_id uuid,
  participants uuid[] default '{}',
  priority text default 'Média',
  status text not null,
  due_date date,
  start_date date,
  completed_at date,
  checklist jsonb not null default '[]',
  subtasks jsonb not null default '[]',
  comments jsonb not null default '[]',
  attachments jsonb not null default '[]',
  links jsonb not null default '[]',
  dependencies jsonb not null default '[]',
  history jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  text text not null,
  created_at timestamptz not null default now(),
  read boolean not null default false
);

-- Função auxiliar: o usuário atual é admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.areas enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.notifications enable row level security;

-- profiles: todos autenticados leem; cada um edita o próprio perfil (campos não-admin);
-- admin edita qualquer perfil (inclui is_admin / is_active).
create policy profiles_select on public.profiles for select to authenticated using (true);
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin_all on public.profiles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- areas: todos autenticados leem; só admin insere/edita.
create policy areas_select on public.areas for select to authenticated using (true);
create policy areas_admin_write on public.areas for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- projects e tasks: todos autenticados leem e escrevem.
create policy projects_rw on public.projects for all to authenticated using (true) with check (true);
create policy tasks_rw on public.tasks for all to authenticated using (true) with check (true);

-- notifications: cada um vê/edita só as suas; qualquer autenticado pode inserir (para mencionar outro).
create policy notif_select_own on public.notifications for select to authenticated using (user_id = auth.uid());
create policy notif_update_own on public.notifications for update to authenticated using (user_id = auth.uid());
create policy notif_insert on public.notifications for insert to authenticated with check (true);

-- SEED das 5 áreas originais (idempotente por nome)
insert into public.areas (name, flow, color, subcats, sort_order)
select v.name, v.flow, v.color, v.subcats, v.sort_order
from (values
  ('Marketing','creative','marketing', array['Planejamento','Conteúdo','Social Media','Campanhas','Tráfego Pago','Influenciadores e Parcerias','Eventos','E-mail e WhatsApp','Análise de Resultados'], 1),
  ('Administração','admin','admin', array['Documentos','Contratos','Fornecedores','Estoque e Operação','Logística','Processos Internos','Reuniões','Jurídico','RH e Equipe'], 2),
  ('Design','creative','design', array['Social Media','Campanhas','E-commerce','Materiais Impressos','Embalagens','Produto','Identidade Visual','Foto e Vídeo','Aprovações'], 3),
  ('Financeiro','financeiro','financeiro', array['Contas a Pagar','Contas a Receber','Fluxo de Caixa','Cobranças','Impostos','Notas Fiscais','Orçamento','Conciliação','Relatórios'], 4),
  ('Comercial','comercial','comercial', array['Leads','Prospecção','Atendimento','Propostas','Negociação','Vendas','Pós-venda','CRM','Parcerias'], 5)
) as v(name,flow,color,subcats,sort_order)
where not exists (select 1 from public.areas a where a.name = v.name);
```

- [ ] **Step 2: Verificação (documentada, executada na etapa de deploy)**

No SQL Editor do Supabase, após rodar o script, rodar:
```sql
select name, flow, array_length(subcats,1) as n_subcats from public.areas order by sort_order;
```
Expected: 5 linhas (Marketing, Administração, Design, Financeiro, Comercial) com `flow` correto e `n_subcats = 9` em cada.

- [ ] **Step 3: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: esquema do banco, RLS e seed das 5 áreas"
```

---

## Task 4: Edge Function `create-user`

Entrega: função Deno que, chamada por um admin autenticado, cria um usuário no Auth e o perfil correspondente, usando a `service_role` key guardada como secret.

**Files:**
- Create: `supabase/functions/create-user/index.ts`

**Interfaces:**
- Consumes: header `Authorization: Bearer <access_token do admin>`; body `{ email, password, name, role_label, area_ids, is_admin }`.
- Produces: resposta JSON `{ ok: true, id }` ou `{ ok: false, error }`.

- [ ] **Step 1: Escrever `supabase/functions/create-user/index.ts`**

```ts
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

    const body = await req.json();
    const { email, password, name, role_label, area_ids, is_admin } = body;
    if (!email || !password || !name) return json({ ok: false, error: "E-mail, senha e nome são obrigatórios." }, 400);

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
    });
    if (createErr || !created?.user) return json({ ok: false, error: createErr?.message || "Falha ao criar usuário." }, 400);

    const { error: profErr } = await admin.from("profiles").insert({
      id: created.user.id, name, role_label: role_label || "",
      area_ids: area_ids || [], is_admin: !!is_admin, is_active: true,
    });
    if (profErr) return json({ ok: false, error: "Usuário criado no Auth, mas falhou o perfil: " + profErr.message }, 500);

    return json({ ok: true, id: created.user.id });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});
```

- [ ] **Step 2: Verificação (documentada, na etapa de deploy)**

Após `supabase functions deploy create-user` e configurar os secrets, testar com curl (substituir placeholders):
```bash
curl -i -X POST "https://<PROJ>.supabase.co/functions/v1/create-user" \
  -H "Authorization: Bearer <ACCESS_TOKEN_DE_ADMIN>" \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@kabelera.com","password":"senhaForte123","name":"Teste"}'
```
Expected: `{"ok":true,"id":"..."}`. Chamar com token de não-admin deve retornar 403.

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/create-user/index.ts
git commit -m "feat: Edge Function create-user (admin cria usuário com service_role)"
```

---

## Task 5: `supabase-client.js` — init, auth e wrapper de dados + mappers

Entrega: módulo que inicializa o Supabase e expõe funções de auth e CRUD que o `app.js` vai consumir, mais os mappers entre o formato do banco (snake_case) e o do app (camelCase). Os mappers são testados em Node.

**Files:**
- Create: `config.example.js`
- Create: `supabase-client.js`
- Create: `test/mappers.test.js`
- Modify: `index.html` (adicionar o CDN do Supabase, o `config.js` e o `supabase-client.js` antes de `app.js`)

**Interfaces:**
- Consumes: `window.KM`; `window.KM_CONFIG = { url, anonKey }` (de `config.js`); CDN `window.supabase`.
- Produces `window.KMDB` com:
  - mappers puros (também exportados para Node): `taskFromRow(row)`, `taskToRow(task)`, `projectFromRow`, `projectToRow`, `areaFromRow`, `profileFromRow`, `notifFromRow`.
  - auth: `signIn(email,password)`, `signOut()`, `getSession()`, `onAuthChange(cb)`, `resetPassword(email)`.
  - dados: `loadAll()` → `{ areas, users, projects, tasks, notifications, me }`; `insertTask(task)`, `updateTask(id, patch)`, `insertProject`, `updateProject`, `insertNotifications(rows)`, `markNotifRead(id)`; admin: `insertArea`, `updateArea`, `updateProfile`, `createUser(payload)`.

- [ ] **Step 1: Criar `config.example.js`**

```js
// Copie para config.js e preencha com os dados do seu projeto Supabase.
// config.js é gitignored (a anon key pode ficar no cliente, mas evitamos versionar por higiene).
window.KM_CONFIG = {
  url: "https://SEU-PROJETO.supabase.co",
  anonKey: "SUA_ANON_KEY"
};
```

- [ ] **Step 2: Escrever o teste dos mappers que falha (`test/mappers.test.js`)**

```js
const test = require('node:test');
const assert = require('node:assert');
// Carrega supabase-client em contexto Node com stubs globais mínimos.
global.window = {};
global.self = global.window;
window.KM_CONFIG = { url: 'http://x', anonKey: 'k' };
window.supabase = { createClient: () => ({ auth: {}, from: () => ({}) }) };
const KMDB = require('../supabase-client.js');

test('taskFromRow converte snake_case para camelCase', () => {
  const row = { id: 't1', title: 'X', area_id: 'a1', project_id: null, requester_id: 'u1',
    responsible_id: 'u2', due_date: '2026-10-10', start_date: null, completed_at: null,
    priority: 'Alta', status: 'Backlog', subcategory: 'Conteúdo', description: '',
    participants: ['u3'], checklist: [], subtasks: [], comments: [], attachments: [],
    links: [], dependencies: [], history: [], created_at: '2026-10-01T00:00:00Z' };
  const t = KMDB.taskFromRow(row);
  assert.strictEqual(t.areaId, 'a1');
  assert.strictEqual(t.responsibleId, 'u2');
  assert.strictEqual(t.dueDate, '2026-10-10');
  assert.deepStrictEqual(t.participants, ['u3']);
});

test('taskToRow converte camelCase para snake_case e nao inclui id em insert', () => {
  const t = { title: 'X', areaId: 'a1', projectId: null, requesterId: 'u1', responsibleId: 'u2',
    dueDate: null, startDate: null, completedAt: null, priority: 'Média', status: 'Backlog',
    subcategory: 'Conteúdo', description: '', participants: [], checklist: [], subtasks: [],
    comments: [], attachments: [], links: [], dependencies: [], history: [] };
  const row = KMDB.taskToRow(t);
  assert.strictEqual(row.area_id, 'a1');
  assert.strictEqual(row.responsible_id, 'u2');
  assert.ok(!('id' in row));
  assert.ok(!('areaId' in row));
});

test('areaFromRow mantém subcats e flow', () => {
  const a = KMDB.areaFromRow({ id: 'a1', name: 'Marketing', flow: 'creative', color: 'marketing', subcats: ['X'], sort_order: 1, is_active: true });
  assert.strictEqual(a.flow, 'creative');
  assert.deepStrictEqual(a.subcats, ['X']);
});
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npm test`
Expected: FAIL — `Cannot find module '../supabase-client.js'`.

- [ ] **Step 4: Escrever `supabase-client.js`**

```js
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.KMDB = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---- mappers puros ----
  function taskFromRow(r) {
    return {
      id: r.id, title: r.title, description: r.description || '', areaId: r.area_id,
      subcategory: r.subcategory || '', projectId: r.project_id, requesterId: r.requester_id,
      responsibleId: r.responsible_id, participants: r.participants || [], priority: r.priority,
      status: r.status, dueDate: r.due_date, startDate: r.start_date, completedAt: r.completed_at,
      checklist: r.checklist || [], subtasks: r.subtasks || [], comments: r.comments || [],
      attachments: r.attachments || [], links: r.links || [], dependencies: r.dependencies || [],
      history: r.history || [], createdAt: r.created_at
    };
  }
  function taskToRow(t) {
    return {
      title: t.title, description: t.description || '', area_id: t.areaId,
      subcategory: t.subcategory || '', project_id: t.projectId || null,
      requester_id: t.requesterId, responsible_id: t.responsibleId,
      participants: t.participants || [], priority: t.priority, status: t.status,
      due_date: t.dueDate || null, start_date: t.startDate || null, completed_at: t.completedAt || null,
      checklist: t.checklist || [], subtasks: t.subtasks || [], comments: t.comments || [],
      attachments: t.attachments || [], links: t.links || [], dependencies: t.dependencies || [],
      history: t.history || []
    };
  }
  function projectFromRow(r) {
    return { id: r.id, name: r.name, description: r.description || '', responsibleId: r.responsible_id,
      participants: r.participants || [], startDate: r.start_date, dueDate: r.due_date, status: r.status };
  }
  function projectToRow(p) {
    return { name: p.name, description: p.description || '', responsible_id: p.responsibleId,
      participants: p.participants || [], start_date: p.startDate || null, due_date: p.dueDate || null, status: p.status };
  }
  function areaFromRow(r) {
    return { id: r.id, name: r.name, flow: r.flow, color: r.color, dep: r.color,
      subcats: r.subcats || [], sortOrder: r.sort_order, isActive: r.is_active };
  }
  function profileFromRow(r) {
    return { id: r.id, name: r.name, roleLabel: r.role_label || '', areas: r.area_ids || [],
      isAdmin: !!r.is_admin, isActive: r.is_active,
      initials: String(r.name).trim().slice(0, 2).toUpperCase() };
  }
  function notifFromRow(r) { return { id: r.id, userId: r.user_id, text: r.text, createdAt: r.created_at, read: r.read }; }

  // ---- runtime (browser) ----
  var sb = null;
  function client() {
    if (!sb) {
      var cfg = root.KM_CONFIG;
      sb = root.supabase.createClient(cfg.url, cfg.anonKey);
    }
    return sb;
  }
  function must(res) { if (res.error) throw res.error; return res.data; }

  async function signIn(email, password) {
    return must(await client().auth.signInWithPassword({ email: email, password: password }));
  }
  async function signOut() { await client().auth.signOut(); }
  async function getSession() { return (await client().auth.getSession()).data.session; }
  function onAuthChange(cb) { client().auth.onAuthStateChange(function (_e, s) { cb(s); }); }
  async function resetPassword(email) {
    return must(await client().auth.resetPasswordForEmail(email, { redirectTo: root.location.origin + root.location.pathname }));
  }

  async function loadAll() {
    var c = client();
    var session = (await c.auth.getSession()).data.session;
    var meId = session && session.user ? session.user.id : null;
    var areas = (must(await c.from('areas').select('*').eq('is_active', true).order('sort_order'))).map(areaFromRow);
    var users = (must(await c.from('profiles').select('*').eq('is_active', true).order('name'))).map(profileFromRow);
    var projects = (must(await c.from('projects').select('*').eq('is_active', true).order('created_at'))).map(projectFromRow);
    var tasks = (must(await c.from('tasks').select('*').order('created_at'))).map(taskFromRow);
    var notifications = (must(await c.from('notifications').select('*').order('created_at', { ascending: false }))).map(notifFromRow);
    var me = users.find(function (u) { return u.id === meId; }) || null;
    return { areas: areas, users: users, projects: projects, tasks: tasks, notifications: notifications, me: me };
  }

  async function insertTask(task) { return taskFromRow(must(await client().from('tasks').insert(taskToRow(task)).select().single())); }
  async function updateTask(id, patchTask) { return taskFromRow(must(await client().from('tasks').update(taskToRow(patchTask)).eq('id', id).select().single())); }
  async function insertProject(p) { return projectFromRow(must(await client().from('projects').insert(projectToRow(p)).select().single())); }
  async function updateProject(id, p) { return projectFromRow(must(await client().from('projects').update(projectToRow(p)).eq('id', id).select().single())); }
  async function insertNotifications(rows) { return must(await client().from('notifications').insert(rows)); }
  async function markNotifRead(id) { return must(await client().from('notifications').update({ read: true }).eq('id', id)); }

  async function insertArea(a) {
    return areaFromRow(must(await client().from('areas').insert({
      name: a.name, flow: a.flow, color: a.color, subcats: a.subcats, sort_order: a.sortOrder || 0
    }).select().single()));
  }
  async function updateArea(id, patch) { return areaFromRow(must(await client().from('areas').update(patch).eq('id', id).select().single())); }
  async function updateProfile(id, patch) { return profileFromRow(must(await client().from('profiles').update(patch).eq('id', id).select().single())); }
  async function createUser(payload) {
    var session = (await client().auth.getSession()).data.session;
    var res = await root.fetch(root.KM_CONFIG.url + '/functions/v1/create-user', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + (session ? session.access_token : ''), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    var data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Falha ao criar usuário.');
    return data;
  }

  return {
    taskFromRow: taskFromRow, taskToRow: taskToRow, projectFromRow: projectFromRow, projectToRow: projectToRow,
    areaFromRow: areaFromRow, profileFromRow: profileFromRow, notifFromRow: notifFromRow,
    signIn: signIn, signOut: signOut, getSession: getSession, onAuthChange: onAuthChange, resetPassword: resetPassword,
    loadAll: loadAll, insertTask: insertTask, updateTask: updateTask, insertProject: insertProject,
    updateProject: updateProject, insertNotifications: insertNotifications, markNotifRead: markNotifRead,
    insertArea: insertArea, updateArea: updateArea, updateProfile: updateProfile, createUser: createUser
  };
});
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npm test`
Expected: PASS — todos os testes (lib + mappers) verdes.

- [ ] **Step 6: Atualizar `index.html`** — inserir, antes de `<script src="app.js"></script>`:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="config.js"></script>
<script src="supabase-client.js"></script>
```

- [ ] **Step 7: Commit**

```bash
git add supabase-client.js config.example.js test/mappers.test.js index.html
git commit -m "feat: cliente Supabase (auth, CRUD, mappers testados)"
```

---

## Task 6: Tela de login, gate de autenticação e botão Sair

Entrega: o app não abre sem login. Tela de login e-mail/senha com "esqueci minha senha"; rodapé da sidebar troca o seletor de usuário por nome do logado + Sair; `state.currentUserId` vem da sessão.

**Files:**
- Modify: `styles.css` (estilos `.gate-screen`, `.login-card`)
- Modify: `app.js` (fluxo de init, gate, sidebar footer, logout)

**Interfaces:**
- Consumes: `window.KMDB` (auth).
- Produces: `state.session`, `state.me`; funções `showLogin()`, `startApp()`.

- [ ] **Step 1: Estilos no fim de `styles.css`**

```css
.gate-screen{position:fixed; inset:0; z-index:150; display:none; align-items:center; justify-content:center; background:var(--bg); padding:20px;}
.gate-screen.show{display:flex;}
.login-card{background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-lg); box-shadow:var(--shadow); padding:26px; width:360px; max-width:100%;}
.login-card h1{font-size:20px; margin:0 0 4px;}
.login-card p.sub{font-size:12.5px; color:var(--text-muted); margin:0 0 18px;}
.login-card .field-row{margin-bottom:12px;}
.login-card .field-row label{display:block; font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:.03em; margin-bottom:5px;}
.login-card input{width:100%;}
.login-error{color:var(--status-critical); font-size:12.5px; margin:8px 0 0; min-height:16px;}
.login-link{background:none; border:none; color:var(--accent); font-size:12px; cursor:pointer; padding:0; margin-top:10px;}
.app-loading{display:flex; align-items:center; justify-content:center; min-height:50vh; color:var(--text-muted); font-size:13px;}
.app-error{text-align:center; padding:50px 20px; color:var(--text-secondary);}
```

- [ ] **Step 2: No `app.js`, adicionar o fluxo de login.** Substituir o bloco de INIT final (linhas 1394-1399 do protótipo) por:

```js
/* ======================= INIT / AUTH ======================= */
document.getElementById('hamburgerBtn').innerHTML = icon('menu',18);
document.getElementById('sidebarClose').innerHTML = icon('close',16);
window.addEventListener('hashchange', onHashChange);

function showLogin(message){
  document.getElementById('app').style.display='none';
  var gate = document.getElementById('gateScreen');
  gate.classList.add('show');
  gate.innerHTML = '<div class="login-card"><h1>Kabelera Manager</h1><p class="sub">Entre com seu e-mail e senha.</p>' +
    '<div class="field-row"><label>E-mail</label><input type="email" id="loginEmail" autocomplete="username"></div>' +
    '<div class="field-row"><label>Senha</label><input type="password" id="loginPassword" autocomplete="current-password"></div>' +
    '<button class="btn btn-primary" id="loginBtn" style="width:100%;justify-content:center;">Entrar</button>' +
    '<div class="login-error" id="loginError">'+(message||'')+'</div>' +
    '<button class="login-link" id="forgotBtn">Esqueci minha senha</button></div>';
  document.getElementById('loginPassword').addEventListener('keydown', function(e){ if(e.key==='Enter') doLogin(); });
}
async function doLogin(){
  var email=document.getElementById('loginEmail').value.trim();
  var pass=document.getElementById('loginPassword').value;
  var errEl=document.getElementById('loginError');
  errEl.textContent='';
  try{ await KMDB.signIn(email, pass); await startApp(); }
  catch(e){ errEl.textContent='E-mail ou senha incorretos.'; }
}
async function doForgot(){
  var email=document.getElementById('loginEmail').value.trim();
  if(!email){ document.getElementById('loginError').textContent='Digite seu e-mail primeiro.'; return; }
  try{ await KMDB.resetPassword(email); document.getElementById('loginError').style.color='var(--text-secondary)'; document.getElementById('loginError').textContent='Enviamos um link de redefinição para seu e-mail.'; }
  catch(e){ document.getElementById('loginError').textContent='Não foi possível enviar o e-mail.'; }
}

async function startApp(){
  document.getElementById('gateScreen').classList.remove('show');
  document.getElementById('app').style.display='';
  document.getElementById('content').innerHTML = '<div class="app-loading">Carregando seus dados...</div>';
  await bootstrapData();                 // definido na Task 7
  if(!location.hash) location.hash = '#/dashboard';
  onHashChange();
}

(async function init(){
  var session = await KMDB.getSession();
  if(session) await startApp();
  else showLogin();
})();
})();
```

- [ ] **Step 3: Trocar o rodapé da sidebar (linhas 363-369).** Em `renderSidebar()`, substituir o preenchimento do `user-switch` por nome do logado + botão Sair. Localizar o bloco que monta `currentUserSelect` (linhas 810-812) e substituir por:

```js
var footer = document.querySelector('.sidebar-footer .user-switch');
if(footer){
  footer.innerHTML = '<div class="avatar" id="currentUserAvatar">'+initialsOf(state.currentUserId)+'</div>' +
    '<div style="flex:1;min-width:0;"><div style="font-weight:700;font-size:13px;">'+esc(userLabel(state.currentUserId))+'</div></div>' +
    '<button class="btn btn-ghost btn-sm" id="logoutBtn">Sair</button>';
}
```

- [ ] **Step 4: Tratar login/logout nos listeners.** No listener de `click` (perto da linha 1279), adicionar no topo:

```js
if(e.target.closest('#loginBtn')){ doLogin(); return; }
if(e.target.closest('#forgotBtn')){ doForgot(); return; }
if(e.target.closest('#logoutBtn')){ KMDB.signOut().then(function(){ location.hash=''; showLogin(); }); return; }
```

E remover o handler antigo de `currentUserSelect` no listener de `change` (linha 1359), pois o seletor não existe mais.

- [ ] **Step 5: Verificar no browser** (após a Task 7 estar pronta o fluxo completo roda; nesta task, verificar que, sem sessão, aparece a tela de login e que credenciais erradas mostram "E-mail ou senha incorretos"). Como ainda não há `bootstrapData`, criar um stub temporário `async function bootstrapData(){}` no topo do IIFE para esta task compilar; ele é substituído na Task 7.

Run: `npm run serve`, abrir o app (com `config.js` apontando para um projeto Supabase de teste).
Expected: tela de login aparece; senha errada mostra o erro; senha certa remove a tela (mesmo que o app abra vazio, pois bootstrap é stub).

- [ ] **Step 6: Commit**

```bash
git add styles.css app.js
git commit -m "feat: tela de login, gate de autenticação e botão Sair"
```

---

## Task 7: Carregar dados do Supabase (bootstrap) + estados de carregando/erro

Entrega: ao entrar, o app busca áreas, usuários, projetos, tarefas e notificações do banco e preenche os arrays que o render já consome. Falha de carga mostra tela de erro com "Tentar de novo". Remove os dados fictícios e o `ID_MAP`/`remapAllUsers`.

**Files:**
- Modify: `app.js`

**Interfaces:**
- Consumes: `KMDB.loadAll()`.
- Produces: `bootstrapData()` que popula `AREAS`, `USERS`, `PROJECTS`, `TASKS`, `NOTIFICATIONS`, `state.me`, `state.currentUserId`.

- [ ] **Step 1: Transformar as constantes de dados em `let` mutáveis.** No protótipo, `USERS` (449), `AREAS` (474), `PROJECTS` (483), `TASKS` (497), `NOTIFICATIONS` (589) são `var` com conteúdo fixo. Substituir cada atribuição de conteúdo por arrays vazios:

```js
var USERS = [];
var AREAS = [];
var PROJECTS = [];
var TASKS = [];
var NOTIFICATIONS = [];
```

Remover completamente: o bloco `ID_MAP`/`remapUser` (linhas 457-462), a IIFE de dependência de exemplo (583-587) e a IIFE `remapAllUsers` (603-620). O `mkTask` (490-495) pode ser mantido (ainda é usado por `createTask`), mas o `createTask` passará a persistir (Task 8).

- [ ] **Step 2: Implementar `bootstrapData()`** (substitui o stub da Task 6). Adicionar no IIFE:

```js
async function bootstrapData(){
  var attempt = 0;
  async function tryLoad(){
    attempt++;
    try{
      var data = await KMDB.loadAll();
      USERS = data.users; AREAS = data.areas; PROJECTS = data.projects;
      TASKS = data.tasks; NOTIFICATIONS = data.notifications;
      state.me = data.me;
      state.currentUserId = data.me ? data.me.id : (USERS[0] && USERS[0].id);
      return true;
    }catch(e){
      if(attempt < 2) return tryLoad();
      showLoadError();
      return false;
    }
  }
  return tryLoad();
}
function showLoadError(){
  document.getElementById('content').innerHTML =
    '<div class="app-error">Não foi possível carregar os dados.<br><br>' +
    '<button class="btn btn-primary" id="retryLoadBtn">Tentar de novo</button></div>';
}
```

- [ ] **Step 3: Tratar o botão "Tentar de novo".** No listener de `click`, adicionar:

```js
if(e.target.closest('#retryLoadBtn')){ startApp(); return; }
```

- [ ] **Step 4: Ajustar `area()` e afins para lista dinâmica.** As funções `area(id)` (481), `project(id)` (488), `user(id)` (463) já buscam por `find` nos arrays — continuam válidas com os arrays preenchidos pelo bootstrap. O `AREA_ICON` (795) e `AREA_ICON[marketing...]` são fixos por área original; para áreas novas (sem ícone mapeado), usar um ícone padrão. Em `renderSidebar()`, onde usa o `nav-dot` por área, o estilo de cor passa a aceitar tanto token quanto hex: trocar `background:var(--dep-'+a.dep+')` por `background:'+areaColorCSS(a)`. Adicionar helper:

```js
function areaColorCSS(a){
  // áreas originais usam token de cor (marketing, design...); novas usam hex.
  var tokens = ['marketing','design','admin','financeiro','comercial'];
  return tokens.indexOf(a.color)>-1 ? 'var(--dep-'+a.color+')' : a.color;
}
```

(Uso completo de `areaColorCSS`/cores dinâmicas detalhado na Task 9.)

- [ ] **Step 5: Verificar no browser**

Run: `npm run serve`, logar com a conta de admin de teste (criada no deploy).
Expected: app abre no Dashboard; as 5 áreas aparecem no menu (vindas do banco); sem tarefas ainda (banco vazio), os indicadores mostram zeros e as listas mostram os estados vazios. Forçar erro (desligar internet, recarregar) mostra a tela "Tentar de novo".

- [ ] **Step 6: Commit**

```bash
git add app.js
git commit -m "feat: carregar dados do Supabase no bootstrap com estados de carregando e erro"
```

---

## Task 8: Escritas otimistas com rollback + notificações no banco

Entrega: toda mutação (criar/mover/editar tarefa, checklist, subtarefa, comentário, anexo, link, aprovar/reprovar) atualiza a tela na hora e persiste no Supabase; em erro, desfaz a tela e avisa. Menção em comentário insere notificação no banco.

**Files:**
- Modify: `app.js`

**Interfaces:**
- Consumes: `KMDB.insertTask/updateTask/insertNotifications`.
- Produces: `persistTask(task)` helper; mutações passam a ser async com rollback.

- [ ] **Step 1: Helper de persistência com rollback.** Adicionar:

```js
function snapshot(t){ return JSON.parse(JSON.stringify(t)); }
async function persistTask(t, prevSnapshot, okMsg){
  try{
    var saved = await KMDB.updateTask(t.id, t);
    Object.assign(t, saved);
    if(okMsg) showToast(okMsg);
  }catch(e){
    if(prevSnapshot){ Object.assign(t, prevSnapshot); }
    showToast('Não foi possível salvar — tente de novo.');
    renderContent(); if(state.drawerTaskId) renderDrawer();
  }
}
```

- [ ] **Step 2: `moveTask` persistente.** Reescrever `moveTask` (685-693) para guardar snapshot, aplicar local, e persistir:

```js
function moveTask(taskId, newStatus){
  var t = taskById(taskId); if(!t || t.status===newStatus) return;
  var prev = snapshot(t);
  var old = t.status;
  t.status = newStatus;
  if(KM.isFinalStatus(area(t.areaId).flow, newStatus)){ if(!t.completedAt) t.completedAt = TODAY_ISO; }
  else { t.completedAt = null; }
  pushHistory(t,'status',old,newStatus);
  persistTask(t, prev);
}
```

(Trocar todos os usos de `isFinal(t)` que dependiam do fluxo para usar o helper de `lib.js` onde fizer sentido; `isFinal(t)` em 639 pode permanecer, pois usa `FINAL_STATUSES` que agora vem de `KM`.)

- [ ] **Step 3: `approveTask`/`rejectTask` corrigidos e persistentes.** Reescrever (694-704):

```js
function approveTask(taskId){
  var t=taskById(taskId); var a=area(t.areaId);
  moveTask(taskId, KM.nextStatusOnApprove(a.flow, t.status));
  showToast('Tarefa aprovada.');
}
function rejectTask(taskId){
  var t=taskById(taskId); var a=area(t.areaId);
  var back = (RETURN_RULES[a.flow] && RETURN_RULES[a.flow]['Aprovação']) || FLOWS[a.flow][0];
  moveTask(taskId, back);
  showToast('Tarefa reprovada — retornou para "'+back+'".');
}
```

- [ ] **Step 4: Campos, checklist, subtarefas, anexos, links persistentes.** Cada mutador (`updateTaskField` 705, `addChecklistItem` 713, `toggleChecklist` 717, `addSubtask` 720, `toggleSubtask` 724, `addAttachment` 740, `addLink` 745) passa a: guardar `var prev = snapshot(t)` antes de alterar e chamar `persistTask(t, prev)` ao fim. Exemplo para `updateTaskField`:

```js
function updateTaskField(taskId, field, value){
  var t=taskById(taskId); if(!t) return;
  var old = t[field]; if(old===value) return;
  var prev = snapshot(t);
  t[field]=value;
  var labelMap={responsibleId:'responsável',priority:'prioridade',dueDate:'prazo de entrega'};
  pushHistory(t, labelMap[field]||field, field==='responsibleId'?userLabel(old):(old||'—'), field==='responsibleId'?userLabel(value):(value||'—'));
  persistTask(t, prev);
}
```

Aplicar o mesmo padrão (snapshot + persistTask) aos demais mutadores listados.

- [ ] **Step 5: `addComment` com notificação no banco.** Reescrever (727-739):

```js
function addComment(taskId, text){
  if(!text.trim()) return;
  var t=taskById(taskId); var prev = snapshot(t);
  t.comments.push({id:uid('cm'), authorId:state.currentUserId, text:text.trim(), createdAt:nowISOTime()});
  var notifRows=[];
  USERS.forEach(function(u){
    if(u.id===state.currentUserId) return;
    var first=u.name.split(' ')[0];
    if(text.indexOf('@'+u.name)>-1 || text.indexOf('@'+first)>-1){
      notifRows.push({ user_id:u.id, text:userLabel(state.currentUserId)+' mencionou você em "'+t.title+'".' });
    }
  });
  persistTask(t, prev);
  if(notifRows.length){ KMDB.insertNotifications(notifRows).catch(function(){}); showToast('Notificação enviada.'); }
}
```

- [ ] **Step 6: `createTask` persistente.** Reescrever (750-760) para inserir no banco e usar o id retornado:

```js
function createTask(data){
  var a = area(data.areaId);
  var t = mkTask({
    title:data.title, description:data.description||'', areaId:data.areaId, subcategory:data.subcategory,
    projectId:data.projectId||null, requesterId:data.requesterId, responsibleId:data.responsibleId,
    priority:data.priority, status:FLOWS[a.flow][0], dueDate:data.dueDate||null, createdAt:TODAY_ISO
  });
  t.history.push({id:uid('h'), field:'criação', from:null, to:'Tarefa criada', at:nowISOTime(), by:state.currentUserId});
  KMDB.insertTask(t).then(function(saved){
    TASKS.push(saved); renderContent();
  }).catch(function(){ showToast('Não foi possível criar a tarefa — tente de novo.'); });
  return t;
}
```

Ajustar o handler do `modalSaveBtn` (1294-1306): remover o `TASKS.push`/`renderContent` imediato (agora feito no `.then`), mantendo `closeModal()`.

- [ ] **Step 7: Notificações lidas persistem.** No handler de `notifRow` (1288-1289), após `n.read=true`, chamar `KMDB.markNotifRead(n.id).catch(function(){});`.

- [ ] **Step 8: Verificar no browser**

Run: `npm run serve`, logar.
Expected: criar tarefa → aparece e sobrevive a um F5 (recarregar). Mover card → persiste após F5. Comentar com `@Caio` → logar como Caio e ver a notificação. Simular erro (desligar internet) ao mover um card → card volta ao lugar e aparece o toast de erro.

- [ ] **Step 9: Commit**

```bash
git add app.js
git commit -m "feat: escritas otimistas com rollback e notificações persistidas"
```

---

## Task 9: Áreas dinâmicas na interface (menu, Kanban, filtros, modal, cores)

Entrega: toda a UI que listava áreas passa a vir de `AREAS` (já carregado do banco), incluindo áreas novas com cor hex. O `depStyle`/`depColorVar` e os ícones por área lidam com áreas desconhecidas.

**Files:**
- Modify: `app.js`
- Modify: `styles.css`

**Interfaces:**
- Consumes: `AREAS` dinâmico; `areaColorCSS(a)` (Task 7).

- [ ] **Step 1: `depStyle`/`depColorVar` aceitam hex.** Reescrever (653-654):

```js
function depStyle(areaId){ var a=area(areaId); return 'style="--dep-rgb:'+hexOrTokenRGB(a)+'"'; }
function depColorVar(areaId){ return areaColorCSS(area(areaId)); }
function hexOrTokenRGB(a){
  var tokens={marketing:'237,161,0',design:'232,123,164',admin:'235,104,52',financeiro:'27,175,122',comercial:'42,120,214'};
  if(tokens[a.color]) return 'var(--dep-'+a.color+'-rgb)';
  // hex -> "r,g,b"
  var h=a.color.replace('#',''); if(h.length===3){ h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2]; }
  var n=parseInt(h,16); return [(n>>16)&255,(n>>8)&255,n&255].join(',');
}
```

Isso mantém as áreas originais com as variáveis CSS existentes e faz as novas (hex) funcionarem no Kanban, pills e calendário, que já usam `--dep-rgb`.

- [ ] **Step 2: Ícone de área com padrão.** `AREA_ICON` (795) ganha fallback. Onde a sidebar usa ícone de área, trocar por `AREA_ICON[a.id] ? icon(AREA_ICON[a.id]) : ''` — mas como o menu de áreas usa `nav-dot` (cor), não ícone, basta garantir que `nav-dot` use `areaColorCSS(a)` (feito na Task 7, Step 4). Confirmar que `renderSidebar` usa `areaColorCSS(a)` no `nav-dot`.

- [ ] **Step 3: Modal de nova tarefa lê áreas dinâmicas.** O `renderModal` (1238) já monta `#mArea` a partir de `AREAS.map(...)` — confirmar que continua. A subcategoria `#mSubcat` lê `a.subcats` da área selecionada — já dinâmico. Nenhuma mudança além de garantir que `state.modalArea` cai numa área válida: ao abrir o modal, se `state.modalArea` não existir em `AREAS`, usar `AREAS[0].id`.

```js
function openModal(areaId){
  state.modalOpen = true;
  var pick = areaId || (state.route.name==='area' ? state.route.params.areaId : null);
  if(!area(pick)) pick = AREAS[0] && AREAS[0].id;
  state.modalArea = pick;
  renderModal();
}
```

- [ ] **Step 4: Verificar no browser**

Run: `npm run serve`.
Expected: tudo que listava áreas (menu lateral, filtro de área no calendário global, dropdown do modal, pills de área nas listas) continua correto. (A criação de áreas novas vem na Task 10; aqui garantimos que o rendering é data-driven e tolera cor hex.)

- [ ] **Step 5: Commit**

```bash
git add app.js styles.css
git commit -m "feat: interface de áreas totalmente orientada a dados, com suporte a cor hex"
```

---

## Task 10: Tela de administração — usuários e áreas

Entrega: na tela de Configurações, admins veem seções para criar/desativar/promover usuários (via Edge Function) e criar/desativar/reordenar áreas. Não-admin vê a tela atual em modo leitura.

**Files:**
- Modify: `app.js` (`viewSettings` e handlers)
- Modify: `styles.css` (formulários da administração)

**Interfaces:**
- Consumes: `KMDB.createUser`, `KMDB.updateProfile`, `KMDB.insertArea`, `KMDB.updateArea`, `state.me.isAdmin`.

- [ ] **Step 1: `viewSettings` com blocos de admin.** Estender `viewSettings` (1129) para, quando `state.me && state.me.isAdmin`, acrescentar antes do bloco "Sobre este protótipo":

```js
function adminUsersBlock(){
  return '<div class="settings-block"><h3>Usuários (admin)</h3><div class="card" style="padding:14px 16px;">' +
    USERS.map(function(u){
      return '<div class="area-row"><div style="flex:1;"><b style="font-size:13px;">'+esc(u.name)+'</b> '+
        (u.isAdmin?'<span class="tag">admin</span>':'')+'<div class="role">'+esc(u.roleLabel)+'</div></div>' +
        '<button class="btn btn-ghost btn-sm" data-toggle-admin="'+u.id+'">'+(u.isAdmin?'Rebaixar':'Tornar admin')+'</button>' +
        '<button class="btn btn-danger-ghost btn-sm" data-deactivate-user="'+u.id+'">Desativar</button></div>';
    }).join('') +
    '<div style="margin-top:14px;"><b style="font-size:12.5px;">Novo usuário</b>' +
    '<div class="field-two" style="margin-top:8px;"><div class="field-row"><label>Nome</label><input id="nuName"></div>' +
    '<div class="field-row"><label>E-mail</label><input id="nuEmail" type="email"></div></div>' +
    '<div class="field-two"><div class="field-row"><label>Senha inicial</label><input id="nuPass" type="text"></div>' +
    '<div class="field-row"><label>Função (texto)</label><input id="nuRole"></div></div>' +
    '<label class="checklist-item"><input type="checkbox" id="nuAdmin"><span>É administrador</span></label>' +
    '<button class="btn btn-primary btn-sm" id="createUserBtn" style="margin-top:8px;">Criar usuário</button></div>' +
    '</div></div>';
}
function adminAreasBlock(){
  return '<div class="settings-block"><h3>Nova área (admin)</h3><div class="card" style="padding:14px 16px;">' +
    '<div class="field-two"><div class="field-row"><label>Nome</label><input id="naName"></div>' +
    '<div class="field-row"><label>Cor (hex)</label><input id="naColor" type="text" value="#7A5AF8"></div></div>' +
    '<div class="field-row"><label>Fluxo</label><select id="naFlow">' +
    [['creative','Criativo'],['comercial','Comercial'],['financeiro','Financeiro'],['admin','Administrativo']].map(function(f){return '<option value="'+f[0]+'">'+f[1]+'</option>';}).join('') +
    '</select></div>' +
    '<div class="field-row"><label>Subcategorias (separadas por vírgula)</label><input id="naSubcats" placeholder="Ex: Planejamento, Execução, Relatórios"></div>' +
    '<button class="btn btn-primary btn-sm" id="createAreaBtn">Criar área</button></div></div>';
}
```

E no `viewSettings`, antes do retorno, se admin: `html += adminAreasBlock() + adminUsersBlock();`

- [ ] **Step 2: Handlers de admin.** No listener de `click`, adicionar:

```js
if(e.target.closest('#createUserBtn')){
  var payload={ email:val('nuEmail'), password:val('nuPass'), name:val('nuName'),
    role_label:val('nuRole'), area_ids:[], is_admin:document.getElementById('nuAdmin').checked };
  if(!payload.email||!payload.password||!payload.name){ showToast('Preencha nome, e-mail e senha.'); return; }
  KMDB.createUser(payload).then(function(){ return startApp(); }).then(function(){ navigate('#/configuracoes'); showToast('Usuário criado.'); })
    .catch(function(err){ showToast(err.message||'Falha ao criar usuário.'); });
  return;
}
var toggleAdmin=e.target.closest('[data-toggle-admin]');
if(toggleAdmin){ var uu=user(toggleAdmin.getAttribute('data-toggle-admin'));
  KMDB.updateProfile(uu.id,{is_admin:!uu.isAdmin}).then(function(){ return startApp(); }).then(function(){ navigate('#/configuracoes'); }).catch(function(){ showToast('Falha ao atualizar.'); }); return; }
var deact=e.target.closest('[data-deactivate-user]');
if(deact){ var du=deact.getAttribute('data-deactivate-user');
  if(du===state.currentUserId){ showToast('Você não pode desativar a si mesmo.'); return; }
  KMDB.updateProfile(du,{is_active:false}).then(function(){ return startApp(); }).then(function(){ navigate('#/configuracoes'); showToast('Usuário desativado.'); }).catch(function(){ showToast('Falha ao desativar.'); }); return; }
if(e.target.closest('#createAreaBtn')){
  var subs=val('naSubcats').split(',').map(function(s){return s.trim();}).filter(Boolean);
  if(!val('naName')){ showToast('Dê um nome à área.'); return; }
  KMDB.insertArea({ name:val('naName'), color:val('naColor')||'#7A5AF8', flow:document.getElementById('naFlow').value, subcats:subs, sortOrder:AREAS.length+1 })
    .then(function(){ return startApp(); }).then(function(){ navigate('#/configuracoes'); showToast('Área criada.'); })
    .catch(function(){ showToast('Falha ao criar área (você é admin?).'); });
  return;
}
```

Adicionar o helper `function val(id){ var el=document.getElementById(id); return el?el.value.trim():''; }` junto aos demais helpers.

- [ ] **Step 3: Verificar no browser**

Run: `npm run serve`, logar como admin.
Expected: em Configurações, aparecem os blocos de admin. Criar uma área "Podcast" (fluxo Criativo, cor hex) → ela surge no menu lateral com a cor e um Kanban com as colunas do fluxo criativo. Criar um usuário de teste → conseguir logar com ele noutra aba; logado como não-admin, os blocos de administração não aparecem.

- [ ] **Step 4: Commit**

```bash
git add app.js styles.css
git commit -m "feat: administração de usuários e áreas na tela de Configurações"
```

---

## Task 11: View Gantt por área

Entrega: a aba Gantt de cada área mostra barras início→prazo por tarefa, agrupadas por subcategoria, com linha de "hoje" e indicação de dependência; respeita os filtros.

**Files:**
- Modify: `app.js` (`viewArea` e nova `ganttHTML`)
- Modify: `styles.css`

**Interfaces:**
- Consumes: `tasksForArea`, `matchesFilters`, `KM.addDaysISO`, `depStyle`.
- Produces: `ganttHTML(area, tasks)`.

- [ ] **Step 1: Ligar a aba Gantt.** Em `viewArea` (955-969), trocar o `else` que joga tudo no placeholder para tratar `gantt` e `timeline` separadamente:

```js
  if(view==='kanban') html += kanbanHTML(a, tasks);
  else if(view==='lista') html += listTableHTML(tasks);
  else if(view==='calendario') html += calendarHTML(tasks, 'area:'+areaId);
  else if(view==='gantt') html += ganttHTML(a, tasks);
  else if(view==='timeline') html += timelineHTML(a, tasks);
  else html += '<div class="empty-state">Visualização indisponível.</div>';
```

- [ ] **Step 2: Implementar `ganttHTML`.**

```js
function ganttHTML(a, tasks){
  var dated = tasks.filter(function(t){ return t.dueDate; });
  if(!dated.length) return '<div class="empty-state">Sem tarefas com prazo para exibir no Gantt.</div>';
  // janela de datas
  var starts = dated.map(function(t){ return t.startDate || KM.addDaysISO(t.dueDate,-3); });
  var min = starts.concat(dated.map(function(t){return t.dueDate;})).sort()[0];
  var max = dated.map(function(t){return t.dueDate;}).concat([TODAY_ISO]).sort().pop();
  // garante que "hoje" cabe
  min = (min < TODAY_ISO) ? min : TODAY_ISO;
  max = (max > TODAY_ISO) ? max : TODAY_ISO;
  var dayMs=86400000;
  var minD=new Date(min+'T00:00:00'), maxD=new Date(max+'T00:00:00');
  var totalDays=Math.round((maxD-minD)/dayMs)+1;
  var colW=26; // px por dia
  function offsetDays(iso){ return Math.round((new Date(iso+'T00:00:00')-minD)/dayMs); }
  // agrupar por subcategoria
  var bySub={}; dated.forEach(function(t){ (bySub[t.subcategory||'Sem subcategoria']=bySub[t.subcategory||'Sem subcategoria']||[]).push(t); });
  var todayLeft = offsetDays(TODAY_ISO)*colW;
  var rows='';
  Object.keys(bySub).forEach(function(sub){
    rows += '<div class="gantt-group">'+esc(sub)+'</div>';
    bySub[sub].forEach(function(t){
      var s=t.startDate || KM.addDaysISO(t.dueDate,-3);
      var left=offsetDays(s)*colW;
      var width=Math.max(colW, (offsetDays(t.dueDate)-offsetDays(s)+1)*colW);
      var hasDep=(t.dependencies&&t.dependencies.length);
      rows += '<div class="gantt-row"><div class="gantt-label" data-open-task="'+t.id+'">'+esc(t.title)+'</div>' +
        '<div class="gantt-track" style="width:'+(totalDays*colW)+'px">' +
          '<div class="gantt-bar'+(isOverdue(t)?' is-overdue':'')+'" '+depStyle(t.areaId)+' style="left:'+left+'px;width:'+width+'px;" data-open-task="'+t.id+'">' +
            (hasDep?icon('link',12):'') + '<span>'+fmtDate(t.dueDate)+'</span>' +
          '</div>' +
        '</div></div>';
    });
  });
  return '<div class="gantt-wrap"><div class="gantt-today" style="left:'+(160+todayLeft)+'px"></div>'+rows+'</div>';
}
```

- [ ] **Step 3: Estilos do Gantt em `styles.css`.**

```css
.gantt-wrap{position:relative; overflow-x:auto; border:1px solid var(--border); border-radius:var(--radius-md); background:var(--surface); padding:8px 0;}
.gantt-group{font-size:11px; text-transform:uppercase; letter-spacing:.04em; color:var(--text-muted); font-weight:700; padding:10px 12px 4px;}
.gantt-row{display:flex; align-items:center; min-height:34px;}
.gantt-label{width:160px; flex:none; font-size:12px; padding:0 10px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; cursor:pointer;}
.gantt-track{position:relative; height:24px; flex:none;}
.gantt-bar{position:absolute; top:2px; height:20px; border-radius:6px; background:rgba(var(--dep-rgb),.9); color:var(--dep-text-on-tint); font-size:10.5px; font-weight:700; display:flex; align-items:center; gap:4px; padding:0 7px; cursor:pointer; overflow:hidden; white-space:nowrap;}
.gantt-bar.is-overdue{outline:2px solid var(--status-critical); outline-offset:-2px;}
.gantt-today{position:absolute; top:0; bottom:0; width:2px; background:var(--accent); z-index:2; pointer-events:none;}
```

- [ ] **Step 4: Verificar no browser**

Run: `npm run serve`. Criar algumas tarefas com prazos variados numa área, abrir a aba Gantt.
Expected: barras agrupadas por subcategoria, linha azul do "hoje" visível, barras atrasadas destacadas, clicar numa barra abre o drawer. Filtros (prioridade, responsável) reduzem as barras.

- [ ] **Step 5: Commit**

```bash
git add app.js styles.css
git commit -m "feat: view Gantt por área"
```

---

## Task 12: View Timeline por área

Entrega: a aba Timeline mostra um feed cronológico (mais recente primeiro) juntando histórico e comentários de todas as tarefas da área; respeita filtros; clicar abre a tarefa.

**Files:**
- Modify: `app.js` (`timelineHTML`)
- Modify: `styles.css`

**Interfaces:**
- Consumes: `tasksForArea`/`tasks` já filtradas, `fmtDateTime`, `userLabel`.
- Produces: `timelineHTML(area, tasks)`.

- [ ] **Step 1: Implementar `timelineHTML`.**

```js
function timelineHTML(a, tasks){
  var events=[];
  tasks.forEach(function(t){
    (t.history||[]).forEach(function(h){
      events.push({ at:h.at, taskId:t.id, title:t.title,
        text:'<b>'+esc(userLabel(h.by))+'</b> alterou '+esc(h.field)+(h.from?' de "'+esc(h.from)+'"':'')+' para "'+esc(h.to)+'"' });
    });
    (t.comments||[]).forEach(function(c){
      events.push({ at:c.createdAt, taskId:t.id, title:t.title,
        text:'<b>'+esc(userLabel(c.authorId))+'</b> comentou: '+mentionify(c.text) });
    });
  });
  if(!events.length) return '<div class="empty-state">Nenhuma atividade registrada nesta área ainda.</div>';
  events.sort(function(x,y){ return (y.at||'').localeCompare(x.at||''); });
  return '<div class="timeline">' + events.slice(0,200).map(function(ev){
    return '<div class="tl-item" data-open-task="'+ev.taskId+'"><span class="tl-dot"></span>' +
      '<div class="tl-body"><div class="tl-text">'+ev.text+'</div>' +
      '<div class="tl-meta">'+esc(ev.title)+' · '+fmtDateTime(ev.at)+'</div></div></div>';
  }).join('') + '</div>';
}
```

- [ ] **Step 2: Estilos em `styles.css`.**

```css
.timeline{border:1px solid var(--border); border-radius:var(--radius-md); background:var(--surface); padding:6px 0;}
.tl-item{display:flex; gap:10px; padding:11px 16px; border-bottom:1px solid var(--border); cursor:pointer;}
.tl-item:last-child{border-bottom:none;}
.tl-item:hover{background:var(--surface-2);}
.tl-dot{width:8px; height:8px; border-radius:50%; background:var(--accent); margin-top:5px; flex:none;}
.tl-text{font-size:13px; line-height:1.5;}
.tl-meta{font-size:11px; color:var(--text-muted); margin-top:2px;}
```

- [ ] **Step 3: Verificar no browser**

Run: `npm run serve`. Numa área com tarefas: mover cards, comentar, então abrir a aba Timeline.
Expected: eventos do mais recente ao mais antigo, misturando mudanças de status e comentários; clicar num item abre a tarefa; filtros de área reduzem os eventos.

- [ ] **Step 4: Commit**

```bash
git add app.js styles.css
git commit -m "feat: view Timeline por área"
```

---

## Task 13: Botão "Atualizar" + rebusca ao navegar

Entrega: um botão na barra de topo rebusca os dados do Supabase sob demanda; navegar entre páginas do menu também rebusca (sem travar a navegação).

**Files:**
- Modify: `app.js`
- Modify: `index.html` (botão na topbar, opcional se montado via JS)

**Interfaces:**
- Consumes: `KMDB.loadAll` via `refreshData()`.
- Produces: `refreshData()`.

- [ ] **Step 1: `refreshData()`** (rebusca silenciosa, sem destruir a tela em erro):

```js
async function refreshData(){
  try{
    var data = await KMDB.loadAll();
    USERS=data.users; AREAS=data.areas; PROJECTS=data.projects; TASKS=data.tasks; NOTIFICATIONS=data.notifications;
    if(data.me){ state.me=data.me; }
    renderAll();
  }catch(e){ /* mantém dados atuais; silencioso */ }
}
```

- [ ] **Step 2: Botão Atualizar na topbar.** Em `renderTopbar` (826), antes do `newTaskBtn`, injetar um botão. Alterar o markup da topbar em `index.html` (dentro de `.topbar-actions`) para incluir:

```html
<button class="icon-btn" id="refreshBtn" aria-label="Atualizar" title="Atualizar">⟳</button>
```

E no listener de `click`: `if(e.target.closest('#refreshBtn')){ refreshData(); showToast('Atualizado.'); return; }`

- [ ] **Step 3: Rebusca ao navegar.** Em `onHashChange` (777-782), após `renderAll()`, disparar `refreshData()` de forma assíncrona (não bloqueia o render imediato):

```js
function onHashChange(){
  var r = parseHash();
  state.route = r;
  closeDrawer(); closeModal(); state.notifOpen=false;
  renderAll();
  if(state.me){ refreshData(); }
}
```

- [ ] **Step 4: Verificar no browser**

Run: abrir em duas abas logadas (admin em uma, outro usuário em outra). Criar uma tarefa na aba A; na aba B, clicar em Atualizar (ou navegar para outra página) e ver a tarefa aparecer.
Expected: os dados sincronizam ao atualizar/navegar; erro de rede no refresh não quebra a tela (continua com os dados atuais).

- [ ] **Step 5: Commit**

```bash
git add app.js index.html
git commit -m "feat: botão Atualizar e rebusca ao navegar"
```

---

## Task 14: README e empacotamento para deploy

Entrega: `README.md` com o passo a passo completo de setup (Supabase, contas, Edge Function, config.js) e publicação no GitHub Pages. Esta é a tarefa de documentação; o deploy em si é feito com a Patrícia depois.

**Files:**
- Create: `README.md`

- [ ] **Step 1: Escrever `README.md`**

```markdown
# Kabelera Manager

Sistema de gestão de projetos, tarefas e equipe da Kabelera. Site estático
(HTML/CSS/JS, sem build) com backend no Supabase, publicado no GitHub Pages.

## Rodar localmente
1. `npm install` não é necessário (sem dependências de runtime).
2. Copie `config.example.js` para `config.js` e preencha `url` e `anonKey` do seu projeto Supabase.
3. `npm run serve` e abra http://localhost:5173
4. Testes das funções puras: `npm test`

## Configurar o Supabase (uma vez)
1. Crie um projeto em https://supabase.com
2. SQL Editor → cole e rode `supabase/schema.sql` (cria tabelas, RLS e as 5 áreas).
3. Authentication → Users → crie a conta da Patrícia (e-mail + senha).
4. SQL Editor → marque-a como admin:
   `update public.profiles set is_admin = true, name = 'Paty' where id = '<uuid-da-conta>';`
   (o uuid aparece em Authentication → Users). Se a linha de profile não existir,
   insira: `insert into public.profiles (id, name, is_admin) values ('<uuid>','Paty',true);`
5. Edge Function:
   - Instale a Supabase CLI e rode `supabase functions deploy create-user`.
   - Configure os secrets:
     `supabase secrets set SERVICE_ROLE_KEY=<service_role_key> SUPABASE_URL=<url_do_projeto>`
   - A `service_role key` está em Project Settings → API. NUNCA a coloque no `config.js`.
6. Em `config.js`, use a **anon key** (Project Settings → API → Project API keys → anon public).

## Publicar no GitHub Pages
1. Crie um repositório no github.com e dê push deste projeto.
2. Settings → Pages → Build and deployment → Deploy from a branch → `main` / `/root` → Save.
3. Aguarde o link `https://<usuario>.github.io/<repo>/`.
4. Como `config.js` é gitignored, crie-o no repositório para o Pages encontrá-lo:
   ou remova `config.js` do `.gitignore` e comite (a anon key pode ficar pública,
   protegida pelo RLS), ou gere o `config.js` no fluxo de publicação.

## Segurança
- A proteção dos dados vem do RLS no Supabase, não do segredo da anon key.
- Criação de usuário só funciona chamada por um admin (validado na Edge Function).
- Usuários e áreas são desativados (`is_active=false`), nunca apagados.
```

- [ ] **Step 2: Decisão sobre `config.js` no Pages.** Como o GitHub Pages serve arquivos do repositório e `config.js` está no `.gitignore`, para o deploy funcionar é preciso versioná-lo. Remover `config.js` do `.gitignore` NA ETAPA DE DEPLOY (com a Patrícia), deixando claro no README que a anon key é pública por design. Deixar o `.gitignore` como está durante o desenvolvimento local.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: README com setup do Supabase, Edge Function e deploy no GitHub Pages"
```

---

## Self-Review (feito pelo autor do plano)

**Cobertura do spec:**
- Persistência compartilhada → Tasks 3, 5, 7, 8. ✔
- Login e-mail/senha + recuperação → Task 6. ✔
- Áreas dinâmicas → Tasks 3 (tabela+seed), 9 (render), 10 (criar). ✔
- Usuários dinâmicos + admin → Tasks 3 (profiles+RLS), 4 (edge fn), 10 (UI). ✔
- Gantt → Task 11. Timeline → Task 12. ✔
- Sincronização otimista + rollback + refresh + loading/erro → Tasks 7, 8, 13. ✔
- Deploy GitHub Pages → Task 14. ✔
- Correções da revisão (esc', escRegex, data local, approveTask, uuid do banco) → Tasks 1, 8. ✔
- Começar vazio → Task 7 (arrays vazios, remoção dos dados fictícios). ✔
- Divisão em arquivos → Task 2. ✔

**Placeholders:** nenhum "TBD/TODO"; passos de verificação de Supabase são "documentados" porque dependem de infra externa, mas trazem o comando e o resultado esperado exatos.

**Consistência de tipos:** `taskToRow`/`taskFromRow`, `areaFromRow` e os nomes de campos (camelCase no app, snake_case no banco) usados em supabase-client.js (Task 5) batem com o uso em app.js (Tasks 7, 8, 10). `KM.isFinalStatus`/`nextStatusOnApprove` definidos na Task 1 e usados na Task 8. `areaColorCSS`/`hexOrTokenRGB`/`depStyle` consistentes entre Tasks 7 e 9. `bootstrapData`/`startApp`/`refreshData` definidos e usados coerentemente (Tasks 6, 7, 13).

**Escopo:** um plano, um app funcional ao fim. Tempo real e upload real de anexos ficaram explicitamente fora.
