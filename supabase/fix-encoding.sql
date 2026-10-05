-- Corrige a acentuação das áreas e subcategorias que foram gravadas com
-- codificação quebrada (mojibake) no primeiro seed. Alvo por sort_order
-- (que é ASCII e não quebrou). Rodar uma vez no SQL Editor do Supabase.

update public.areas set
  name = 'Marketing',
  subcats = array['Planejamento','Conteúdo','Social Media','Campanhas','Tráfego Pago','Influenciadores e Parcerias','Eventos','E-mail e WhatsApp','Análise de Resultados']
where sort_order = 1;

update public.areas set
  name = 'Administração',
  subcats = array['Documentos','Contratos','Fornecedores','Estoque e Operação','Logística','Processos Internos','Reuniões','Jurídico','RH e Equipe']
where sort_order = 2;

update public.areas set
  name = 'Design',
  subcats = array['Social Media','Campanhas','E-commerce','Materiais Impressos','Embalagens','Produto','Identidade Visual','Foto e Vídeo','Aprovações']
where sort_order = 3;

update public.areas set
  name = 'Financeiro',
  subcats = array['Contas a Pagar','Contas a Receber','Fluxo de Caixa','Cobranças','Impostos','Notas Fiscais','Orçamento','Conciliação','Relatórios']
where sort_order = 4;

update public.areas set
  name = 'Comercial',
  subcats = array['Leads','Prospecção','Atendimento','Propostas','Negociação','Vendas','Pós-venda','CRM','Parcerias']
where sort_order = 5;
