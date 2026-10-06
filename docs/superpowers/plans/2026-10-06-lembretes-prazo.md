# Lembretes de prazo (pg_cron) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Um job diário no Supabase que cria notificações (e, pelo webhook existente, e-mails) avisando responsáveis de tarefas que vencem hoje ou amanhã.

**Architecture:** pg_cron agenda uma função SQL `notificar_prazos()` que insere linhas em `public.notifications`. O webhook `notif-email` já existente dispara no INSERT e manda o e-mail via Resend. Nenhuma alteração no app/site; tudo vive no Postgres do Supabase. Entregável único: o arquivo `supabase/cron-prazos.sql`, que a Patrícia roda no SQL Editor.

**Tech Stack:** PostgreSQL (Supabase), extensões `pg_cron` e `pg_net` (esta já instalada), fuso `America/Sao_Paulo`.

## Global Constraints

- Nenhuma mudança de schema: usar só colunas existentes (`tasks.title`, `tasks.due_date`, `tasks.responsible_id`, `tasks.completed_at`, `tasks.is_active`; `notifications.user_id`, `notifications.text`, `notifications.task_id`).
- Destinatário do aviso: apenas `tasks.responsible_id`.
- Avisar apenas tarefas que vencem HOJE ou AMANHÃ; nunca atrasadas; nunca concluídas (`completed_at is null`) nem excluídas (`is_active = true`).
- Horário: 08h de Brasília = `0 11 * * *` em UTC (cron do Supabase roda em UTC; Brasil sem horário de verão, UTC-3).
- Cálculo de "hoje"/"amanhã" sempre no fuso `America/Sao_Paulo`.
- Nome do job: `lembretes-prazo` (estável, pra reagendar/remover sem duplicar).
- Texto do aviso em pt-BR, data formatada `DD/MM`. Sem travessão.
- Função `security definer` (roda como dono, ignora RLS no INSERT).
- Idempotência de instalação: o script pode ser rodado mais de uma vez sem duplicar o job nem quebrar (usar `cron.unschedule` defensivo + `create or replace function`).

---

### Task 1: Arquivo SQL `cron-prazos.sql` (extensões + função + agendamento)

**Files:**
- Create: `supabase/cron-prazos.sql`

**Interfaces:**
- Consumes: tabelas `public.tasks` e `public.notifications` (schema existente, pós migração 2026-10-05 que adicionou `tasks.is_active` e `notifications.task_id`).
- Produces: função `public.notificar_prazos() returns integer` (retorna quantas notificações inseriu, útil pro teste manual); job de cron chamado `lembretes-prazo`.

- [ ] **Step 1: Escrever o arquivo `supabase/cron-prazos.sql`**

```sql
-- Lembretes de prazo do Kabelera Manager.
-- Roda 1x/dia e avisa o responsável de tarefas que vencem hoje ou amanhã.
-- Seguro rodar mais de uma vez (idempotente).

-- 1) Extensões necessárias (pg_net já costuma estar instalada pelos webhooks).
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 2) Função que cria as notificações dos prazos.
--    security definer: roda como dono e pode inserir em notifications ignorando RLS.
--    Retorna quantas notificações foram criadas (útil no teste manual).
create or replace function public.notificar_prazos()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hoje date := (now() at time zone 'America/Sao_Paulo')::date;
  v_count integer := 0;
begin
  insert into public.notifications (user_id, text, task_id)
  select
    t.responsible_id,
    '⏰ A tarefa "' || t.title || '" vence '
      || case when t.due_date = v_hoje then 'hoje' else 'amanhã' end
      || ' (' || to_char(t.due_date, 'DD/MM') || ').',
    t.id
  from public.tasks t
  where t.is_active = true
    and t.completed_at is null
    and t.responsible_id is not null
    and t.due_date in (v_hoje, v_hoje + 1);

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- 3) Agendamento: todo dia às 11h UTC (= 08h de Brasília).
--    Remove um agendamento anterior de mesmo nome antes de recriar (idempotente).
do $$
begin
  if exists (select 1 from cron.job where jobname = 'lembretes-prazo') then
    perform cron.unschedule('lembretes-prazo');
  end if;
end $$;

select cron.schedule(
  'lembretes-prazo',
  '0 11 * * *',
  $cron$ select public.notificar_prazos(); $cron$
);
```

- [ ] **Step 2: Conferir o arquivo (revisão de olho)**

Ler o arquivo e confirmar:
- usa `is_active`, `completed_at`, `responsible_id`, `due_date in (v_hoje, v_hoje+1)` no filtro;
- insere `user_id`, `text`, `task_id`;
- o texto diz "vence hoje" quando `due_date = v_hoje`, senão "vence amanhã";
- agendamento `0 11 * * *` com nome `lembretes-prazo`.

- [ ] **Step 3: Commit**

```bash
git add supabase/cron-prazos.sql docs/superpowers/specs/2026-10-06-lembretes-prazo-design.md docs/superpowers/plans/2026-10-06-lembretes-prazo.md
git commit -m "feat: lembretes de prazo diarios via pg_cron"
```

---

### Task 2: Instalar no Supabase e verificar de ponta a ponta (com a Patrícia)

Esta task é executada no painel do Supabase pela Patrícia, passo a passo guiado. Claude não tem acesso ao banco; o papel do Claude é guiar e interpretar os resultados que a Patrícia colar/printar.

**Files:** nenhum (execução no painel).

**Interfaces:**
- Consumes: `public.notificar_prazos()` e o job `lembretes-prazo` criados na Task 1.

- [ ] **Step 1: Rodar o script no SQL Editor**

No Supabase → SQL Editor → New query → colar todo o conteúdo de `supabase/cron-prazos.sql` → Run.
Expected: execução sem erro. Se `pg_cron` não puder ser criada por SQL, habilitar em Database → Extensions (procurar `pg_cron`, Enable) e rodar o script de novo.

- [ ] **Step 2: Confirmar que o job foi agendado**

Rodar no SQL Editor:
```sql
select jobname, schedule, active from cron.job where jobname = 'lembretes-prazo';
```
Expected: 1 linha, `schedule = '0 11 * * *'`, `active = true`.

- [ ] **Step 3: Preparar uma tarefa de teste**

No app (ou no SQL Editor), garantir que existe uma tarefa com:
- `due_date` = hoje,
- um `responsible_id` cujo usuário tenha e-mail real acessível,
- `completed_at` vazio e `is_active = true`.
(Pode ser uma tarefa real existente que vença hoje, ou criar uma de teste.)

- [ ] **Step 4: Disparar a função manualmente (sem esperar as 08h)**

Rodar no SQL Editor:
```sql
select public.notificar_prazos();
```
Expected: retorna um inteiro >= 1 (quantidade de avisos criados). Se retornar 0, não há tarefa vencendo hoje/amanhã que passe nos filtros (rever o Step 3).

- [ ] **Step 5: Verificar a notificação no banco**

```sql
select user_id, text, task_id, read, created_at
from public.notifications
order by created_at desc
limit 5;
```
Expected: aparece a linha nova com texto `⏰ A tarefa "<nome>" vence hoje (DD/MM).` e o `task_id` correto.

- [ ] **Step 6: Verificar o e-mail e o sininho**

- No app: o aviso aparece no sininho do responsável e, ao clicar, abre a tarefa.
- No e-mail do responsável (inclusive spam): chegou e-mail com remetente `avisos@kabelera.com.br`.
- No Resend (resend.com/emails): aparece o envio novo com status Delivered.
Expected: todos os três confirmados.

- [ ] **Step 7: Verificar que tarefa concluída NÃO gera aviso**

Marcar uma tarefa como concluída (preencher `completed_at`) ou usar uma já concluída que venceria hoje, rodar `select public.notificar_prazos();` de novo e conferir que ela não gerou notificação nova para aquela tarefa.
Expected: nenhuma notificação criada para a tarefa concluída.

---

## Notas de verificação (resumo)

- O job real só roda às 08h BRT; o teste de ponta a ponta é feito chamando `notificar_prazos()` à mão (Steps 4-6).
- Reexecutar `notificar_prazos()` manualmente no mesmo dia cria avisos repetidos (é esperado em teste manual). No dia a dia, o cron chama 1x/dia, então não repete.
- Para desligar o robozinho no futuro: `select cron.unschedule('lembretes-prazo');`.
