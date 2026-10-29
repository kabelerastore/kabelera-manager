-- Afiliados: análise por mês + data de contato. Rodar UMA vez (depois do afiliados.sql).
alter table public.afiliados add column if not exists data_contato date;
alter table public.afiliados add column if not exists vendas_mensais jsonb not null default '{}';

-- Migra qualquer venda avulsa já digitada para o mês corrente (out/2026).
update public.afiliados
  set vendas_mensais = jsonb_build_object(to_char(now(),'YYYY-MM'), vendas)
  where coalesce(vendas,0) <> 0 and (vendas_mensais = '{}'::jsonb or vendas_mensais is null);
