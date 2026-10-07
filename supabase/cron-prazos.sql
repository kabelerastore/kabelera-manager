-- Lembretes de prazo do Kabelera Manager.
-- Roda 1x/dia e avisa o responsável E os participantes de tarefas que vencem hoje ou amanhã.
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
  with due as (
    select t.id, t.responsible_id, t.participants,
      '⏰ A tarefa "' || t.title || '" vence '
        || case when t.due_date = v_hoje then 'hoje' else 'amanhã' end
        || ' (' || to_char(t.due_date, 'DD/MM') || ').' as msg
    from public.tasks t
    where t.is_active = true
      and t.completed_at is null
      and t.due_date in (v_hoje, v_hoje + 1)
  ),
  destinatarios as (
    select id as task_id, responsible_id as user_id, msg from due where responsible_id is not null
    union
    select d.id, p.participant_id, d.msg
    from due d, unnest(d.participants) as p(participant_id)
    where p.participant_id is not null and p.participant_id <> d.responsible_id
  )
  insert into public.notifications (user_id, text, task_id)
  select user_id, msg, task_id from destinatarios;

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
