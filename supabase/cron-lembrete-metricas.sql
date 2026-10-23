-- Lembrete mensal pra conferir o relatório de Métricas de Redes Sociais.
-- Roda todo dia 1, à tarde, e avisa todos os admins.
-- Seguro rodar mais de uma vez (idempotente).

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Função que cria a notificação pra cada admin.
-- security definer: roda como dono e pode inserir em notifications ignorando RLS.
create or replace function public.lembrar_metricas()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
begin
  insert into public.notifications (user_id, text)
  select
    p.id,
    '📊 Leitura mensal de métricas de redes sociais já rodou — confira a aba "Métricas de Redes Sociais".'
  from public.profiles p
  where p.is_admin = true
    and p.is_active = true;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- Agendamento: todo dia 1, 17h UTC (= 14h de Brasília).
-- Remove um agendamento anterior de mesmo nome antes de recriar (idempotente).
do $$
begin
  if exists (select 1 from cron.job where jobname = 'lembrete-metricas') then
    perform cron.unschedule('lembrete-metricas');
  end if;
end $$;

select cron.schedule(
  'lembrete-metricas',
  '0 17 1 * *',
  $cron$ select public.lembrar_metricas(); $cron$
);
