-- Consolida projetos duplicados do Kabelera Manager.
-- Move as tarefas pro projeto que fica e desativa (nunca apaga de vez) o projeto que sai.
-- Rodar uma única vez no SQL Editor do Supabase (projeto "Gestao de tarefas Kabelera").

-- 1) Lançamento 10/10 -> Lives de Venda
update public.tasks set project_id = (select id from public.projects where name='Lives de Venda')
where project_id = (select id from public.projects where name='Lançamento 10/10');

update public.projects set is_active = false where name='Lançamento 10/10';

-- 2) Abordagem por Telefone -> Call de Vendas
update public.tasks set project_id = (select id from public.projects where name='Call de Vendas')
where project_id = (select id from public.projects where name='Abordagem por Telefone');

update public.projects set is_active = false where name='Abordagem por Telefone';

-- 3) Produção Nova -> Produção de Vídeos Nova
update public.tasks set project_id = (select id from public.projects where name='Produção de Vídeos Nova')
where project_id = (select id from public.projects where name='Produção Nova');

update public.projects set is_active = false where name='Produção Nova';
