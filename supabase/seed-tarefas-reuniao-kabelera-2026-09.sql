-- Tarefas extraídas das reuniões Kabelera de 25/09 e 29/09 (transcrição + anotações).
-- Sem due_date nem responsible_id de propósito — a Patrícia preenche manualmente no app.
-- Rodar uma única vez no SQL Editor do Supabase (projeto "Gestao de tarefas Kabelera").

-- 1) Projetos (um por frente de trabalho que saiu das reuniões)
insert into public.projects (name, status) values
  ('Lançamento 10/10', 'Planejamento'),
  ('Lives de Venda', 'Planejamento'),
  ('Pré-Black e Black Friday', 'Planejamento'),
  ('Ações Internas de Marketing', 'Planejamento'),
  ('Produção de Conteúdo', 'Planejamento'),
  ('Call de Vendas', 'Planejamento'),
  ('Parcerias e Novos Canais', 'Planejamento'),
  ('Produção Nova', 'Planejamento'),
  ('Equipe e Operação', 'Planejamento');

-- 2) Tarefas, cada uma ligada à área (flow certo = status inicial certo) e ao projeto

-- MARKETING (flow creative -> status inicial 'Backlog') ------------------

insert into public.tasks (title, area_id, project_id, status) values
('Divulgar o 10/10 (compre 2 leve 3)', (select id from public.areas where name='Marketing'), (select id from public.projects where name='Lançamento 10/10'), 'Backlog'),
('Testar a promoção "compre 2 leve 3"', (select id from public.areas where name='Marketing'), (select id from public.projects where name='Lançamento 10/10'), 'Backlog'),
('Roteiro de criativos do aplicativo', (select id from public.areas where name='Marketing'), (select id from public.projects where name='Lançamento 10/10'), 'Backlog'),
('Selecionar modelos para conteúdo (Ari, Iara, Paty, Gabi)', (select id from public.areas where name='Marketing'), (select id from public.projects where name='Lançamento 10/10'), 'Backlog'),
('Criar roteiros e referências de conteúdo', (select id from public.areas where name='Marketing'), (select id from public.projects where name='Lançamento 10/10'), 'Backlog'),
('Vídeo com a Camila Campos', (select id from public.areas where name='Marketing'), (select id from public.projects where name='Lançamento 10/10'), 'Backlog'),

('Perguntar pra Carol se topa live dia 05/10 no TikTok', (select id from public.areas where name='Marketing'), (select id from public.projects where name='Lives de Venda'), 'Backlog'),
('Live 10/10: TikTok (Carol) + Instagram (Ari), 19h-00h', (select id from public.areas where name='Marketing'), (select id from public.projects where name='Lives de Venda'), 'Backlog'),
('Live 20/10: TikTok (Carol) + Instagram (Ari), 19h-00h', (select id from public.areas where name='Marketing'), (select id from public.projects where name='Lives de Venda'), 'Backlog'),

('Divulgar 11/11 (pré-black)', (select id from public.areas where name='Marketing'), (select id from public.projects where name='Pré-Black e Black Friday'), 'Backlog'),
('Divulgar Black Friday (27-29/11)', (select id from public.areas where name='Marketing'), (select id from public.projects where name='Pré-Black e Black Friday'), 'Backlog'),
('Ações de frete grátis e frete fixo até o dia da Black', (select id from public.areas where name='Marketing'), (select id from public.projects where name='Pré-Black e Black Friday'), 'Backlog'),
('Brindes e desconto de 10%', (select id from public.areas where name='Marketing'), (select id from public.projects where name='Pré-Black e Black Friday'), 'Backlog'),
('Configurar no site: Oferta Relâmpago (horário limitado)', (select id from public.areas where name='Marketing'), (select id from public.projects where name='Pré-Black e Black Friday'), 'Backlog'),
('Configurar no site: Ticket Médio Maior Valor (desconto por faixa de compra)', (select id from public.areas where name='Marketing'), (select id from public.projects where name='Pré-Black e Black Friday'), 'Backlog'),
('Configurar no site: Leve 3 Pague 2', (select id from public.areas where name='Marketing'), (select id from public.projects where name='Pré-Black e Black Friday'), 'Backlog'),
('Configurar no site: Combo de Valor Fixo (Leve 3 por R$99,90)', (select id from public.areas where name='Marketing'), (select id from public.projects where name='Pré-Black e Black Friday'), 'Backlog'),
('Configurar no site: Desconto na 2ª Peça', (select id from public.areas where name='Marketing'), (select id from public.projects where name='Pré-Black e Black Friday'), 'Backlog'),
('Configurar no site: Escassez Total (R$50 off, desativa após 10 usos)', (select id from public.areas where name='Marketing'), (select id from public.projects where name='Pré-Black e Black Friday'), 'Backlog'),

('Estruturar e disparar campanha de recuperação de carrinho (WhatsApp)', (select id from public.areas where name='Marketing'), (select id from public.projects where name='Ações Internas de Marketing'), 'Backlog'),
('Elaboração dos e-mails de campanha + estruturar/lançar', (select id from public.areas where name='Marketing'), (select id from public.projects where name='Ações Internas de Marketing'), 'Backlog'),
('Pesquisar como fazer lives com som gravado', (select id from public.areas where name='Marketing'), (select id from public.projects where name='Ações Internas de Marketing'), 'Backlog'),
('Pesquisar como fazer live no Instagram offline, sem celular', (select id from public.areas where name='Marketing'), (select id from public.projects where name='Ações Internas de Marketing'), 'Backlog'),
('Montar painel/relatório de métricas e KPIs de redes sociais', (select id from public.areas where name='Marketing'), (select id from public.projects where name='Ações Internas de Marketing'), 'Backlog'),

('Alugar espaço para 2ª quinzena de outubro', (select id from public.areas where name='Marketing'), (select id from public.projects where name='Produção de Conteúdo'), 'Backlog'),
('Fechar estúdio para gravação (Casa Alice / Turmalina Estúdio)', (select id from public.areas where name='Marketing'), (select id from public.projects where name='Produção de Conteúdo'), 'Backlog'),
('Bater agenda: convidar modelo feminina, fechar local e equipe', (select id from public.areas where name='Marketing'), (select id from public.projects where name='Produção de Conteúdo'), 'Backlog'),
('Pedir pra Bianca roteirizar', (select id from public.areas where name='Marketing'), (select id from public.projects where name='Produção de Conteúdo'), 'Backlog'),
('Diária de produção de vídeo e foto de produto', (select id from public.areas where name='Marketing'), (select id from public.projects where name='Produção de Conteúdo'), 'Backlog');

-- COMERCIAL (flow comercial -> status inicial 'Novo Lead') ---------------

insert into public.tasks (title, area_id, project_id, status) values
('Acompanhar a Tamara na venda pros clientes atuais', (select id from public.areas where name='Comercial'), (select id from public.projects where name='Call de Vendas'), 'Novo Lead'),
('Organizar planilha de clientes por segmento RFM', (select id from public.areas where name='Comercial'), (select id from public.projects where name='Call de Vendas'), 'Novo Lead'),
('Pedir no sistema Prática planilha: nome, telefone, segmento RFM, último produto', (select id from public.areas where name='Comercial'), (select id from public.projects where name='Call de Vendas'), 'Novo Lead'),

('Retomar conversa do turbante com a Ells, apresentar pra Paty e fazer protótipo', (select id from public.areas where name='Comercial'), (select id from public.projects where name='Parcerias e Novos Canais'), 'Novo Lead'),
('Decidir se o lançamento com a Curly Care vai ser em fevereiro', (select id from public.areas where name='Comercial'), (select id from public.projects where name='Parcerias e Novos Canais'), 'Novo Lead'),
('Cobrar Paty sobre conteúdo com os bonés customizados', (select id from public.areas where name='Comercial'), (select id from public.projects where name='Parcerias e Novos Canais'), 'Novo Lead');

-- DESIGN (flow creative -> status inicial 'Backlog') ----------------------

insert into public.tasks (title, area_id, project_id, status) values
('Fazer dad hat (mesmas cores), mínimo 20 unidades de cada', (select id from public.areas where name='Design'), (select id from public.projects where name='Produção Nova'), 'Backlog'),
('Desenvolver saquinho novo de embalagem', (select id from public.areas where name='Design'), (select id from public.projects where name='Produção Nova'), 'Backlog'),
('Mandar modelo de boné + amostra de tecido pro fornecedor testar acabamento', (select id from public.areas where name='Design'), (select id from public.projects where name='Produção Nova'), 'Backlog'),
('Decidir e fechar etiqueta/adesivo dos bonés', (select id from public.areas where name='Design'), (select id from public.projects where name='Produção Nova'), 'Backlog');

-- ADMINISTRAÇÃO (flow admin -> status inicial 'Solicitado') --------------

insert into public.tasks (title, area_id, project_id, status) values
('Criar usuário da Tamara na Wbuy e limitar ações (Calebe)', (select id from public.areas where name='Administração'), (select id from public.projects where name='Equipe e Operação'), 'Solicitado'),
('Entregar notebook pra Tamara (Calebe)', (select id from public.areas where name='Administração'), (select id from public.projects where name='Equipe e Operação'), 'Solicitado'),
('Comprar mouse pra Tamara', (select id from public.areas where name='Administração'), (select id from public.projects where name='Equipe e Operação'), 'Solicitado'),
('Reunião com a Brígida sobre toucas de frio', (select id from public.areas where name='Administração'), (select id from public.projects where name='Equipe e Operação'), 'Solicitado'),
('Varal de boné: comprar argola mosquetão (100-150 un.)', (select id from public.areas where name='Administração'), (select id from public.projects where name='Equipe e Operação'), 'Solicitado'),
('Avaliar boné esportivo (pro pedido da Black)', (select id from public.areas where name='Administração'), (select id from public.projects where name='Equipe e Operação'), 'Solicitado'),
('Avaliar B2B Torcidas (novo segmento)', (select id from public.areas where name='Administração'), (select id from public.projects where name='Equipe e Operação'), 'Solicitado'),
('Atualizar planilha de estoque atual', (select id from public.areas where name='Administração'), (select id from public.projects where name='Equipe e Operação'), 'Solicitado');
