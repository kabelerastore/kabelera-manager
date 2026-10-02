(function(){
"use strict";
var KM = window.KM;
var KMDB = window.KMDB;
var esc = KM.esc;

/* STUB TEMPORÁRIO (Task 6) — substituído pela implementação real na Task 7 */
async function bootstrapData(){}

/* ======================= ICONS ======================= */
function icon(name, size){
  size = size || 18;
  var p = '<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">';
  var paths = {
    dashboard:'<rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.6"/><rect x="13" y="3.5" width="7.5" height="4.5" rx="1.6"/><rect x="13" y="10.5" width="7.5" height="10" rx="1.6"/><rect x="3.5" y="13.5" width="7.5" height="7" rx="1.6"/>',
    projects:'<path d="M3.5 8.2 12 4l8.5 4.2L12 12.4z"/><path d="M3.5 12.2 12 16.4l8.5-4.2"/><path d="M3.5 16.2 12 20.4l8.5-4.2"/>',
    marketing:'<path d="M4 10v4l6 1.6V8.4z"/><path d="M10 8.4 19 5v14l-9-3.4"/><path d="M6.5 15.6 8 20.5h2.2l-1-4.6"/>',
    admin:'<rect x="3.5" y="8" width="17" height="11" rx="2"/><path d="M8.5 8V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2"/><path d="M3.5 13h17"/>',
    design:'<path d="M12 3a9 9 0 1 0 0 18c1.4 0 2.2-.9 2.2-2 0-.6-.2-1-.6-1.4-.4-.4-.6-.8-.6-1.3 0-1 .8-1.8 1.8-1.8h1.8A4.8 4.8 0 0 0 21.4 9.9 9 9 0 0 0 12 3z"/><circle cx="7.5" cy="12" r="1.1" fill="currentColor"/><circle cx="9" cy="8" r="1.1" fill="currentColor"/><circle cx="14" cy="7.3" r="1.1" fill="currentColor"/>',
    finance:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v9M14.6 9.6c0-1-1-1.8-2.6-1.8s-2.6.8-2.6 1.9c0 2.6 5.2 1.3 5.2 3.9 0 1.1-1.1 1.9-2.6 1.9s-2.7-.8-2.7-1.9"/>',
    sales:'<path d="M3.5 17 9 11.2l4 3 7.5-8"/><path d="M16.5 6.2H20.5v4"/>',
    tasks:'<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M8 12.5l2.4 2.4L16 9.5"/>',
    calendar:'<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>',
    team:'<circle cx="9" cy="8.3" r="3"/><path d="M3.3 19c0-3 2.5-5 5.7-5s5.7 2 5.7 5"/><circle cx="17" cy="9" r="2.3"/><path d="M15.8 12.2c2.5.2 4.4 2 4.4 4.6"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1h-.2a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.6v-.2a2 2 0 1 1 4 0v.1c0 .7.4 1.3 1 1.6h.1a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1c.3.6.9 1 1.6 1h.2a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1z"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    bell:'<path d="M6 9a6 6 0 1 1 12 0c0 4.5 1.5 6 1.5 6h-15S6 13.5 6 9z"/><path d="M9.5 18.5a2.5 2.5 0 0 0 5 0"/>',
    close:'<path d="M6 6l12 12M18 6 6 18"/>',
    chevronLeft:'<path d="M15 5l-7 7 7 7"/>',
    chevronRight:'<path d="M9 5l7 7-7 7"/>',
    chevronDown:'<path d="M6 9l6 6 6-6"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
    grip:'<circle cx="9" cy="6" r="1.2" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="18" r="1.2" fill="currentColor" stroke="none"/>',
    paperclip:'<path d="M17.5 8.5 9.9 16a3 3 0 1 1-4.2-4.2l8-8a5 5 0 0 1 7 7l-8.2 8.2"/>',
    link:'<path d="M9.5 14.5 14.5 9.5"/><path d="M12.2 6.8 14 5a3.5 3.5 0 1 1 5 5l-1.8 1.8"/><path d="M11.8 17.2 10 19a3.5 3.5 0 1 1-5-5l1.8-1.8"/>',
    check:'<path d="M5 12.5l4.5 4.5L19 7"/>',
    warn:'<path d="M12 3.5 21 19H3z"/><path d="M12 9.5v4M12 16.5h.01"/>',
    clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
    thumbUp:'<circle cx="12" cy="12" r="9.5"/><path d="M8 12.5 11 15.5 16 9.5"/>',
    xCircle:'<circle cx="12" cy="12" r="9.5"/><path d="M9 9l6 6M15 9l-6 6"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6h.01"/>'
  };
  return p + (paths[name]||'') + '</svg>';
}

/* ======================= DATA ======================= */
var TODAY = new Date(2026,8,22);
function iso(offset){ var d = new Date(TODAY.getTime()+offset*86400000); return d.toISOString().slice(0,10); }
var TODAY_ISO = iso(0);
function fmtDate(s){ if(!s) return '—'; var d=new Date(s+'T00:00:00'); return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}); }
function fmtDateLong(s){ if(!s) return '—'; var d=new Date(s+'T00:00:00'); return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'}); }
function fmtDateTime(s){ var d=new Date(s); return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})+' às '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}); }
function nowISOTime(){ var d=new Date(TODAY); return d.toISOString(); }
function uid(prefix){ return prefix+'_'+Math.random().toString(36).slice(2,9); }

var USERS = [
  {id:'patricia', name:'Paty', role:'colaborador', roleLabel:'Marketing, Design & Gestão de Marca', areas:['marketing','design'], initials:'PA'},
  {id:'caio', name:'Caio', role:'colaborador', roleLabel:'Administração, Financeiro & Operações', areas:['administracao','financeiro'], initials:'CA'},
  {id:'calebe', name:'Calebe', role:'colaborador', roleLabel:'Comercial & Estratégia', areas:['comercial'], initials:'CB'}
];
// A equipe real tem 3 pessoas. Os dados de exemplo abaixo foram escritos originalmente para
// um time maior e depois consolidados nessas 3 pessoas pelo mapeamento ID_MAP mais abaixo:
// Paty assume marketing + design (e gestão de marca); Caio assume administração + financeiro (operações); Calebe assume comercial (e estratégia).
var ID_MAP = {
  bruno:'patricia', carla:'patricia', fabio:'patricia', giulia:'patricia',
  joaopedro:'caio', isabela:'caio', henrique:'caio', ana:'caio',
  diego:'calebe', elaine:'calebe'
};
function remapUser(id){ return ID_MAP[id] || id; }
function user(id){ return USERS.find(function(u){return u.id===id;}); }

var FLOWS = KM.FLOWS, FINAL_STATUSES = KM.FINAL_STATUSES, RETURN_RULES = KM.RETURN_RULES;

var AREAS = [
  {id:'marketing', name:'Marketing', flow:'creative', dep:'marketing', subcats:['Planejamento','Conteúdo','Social Media','Campanhas','Tráfego Pago','Influenciadores e Parcerias','Eventos','E-mail e WhatsApp','Análise de Resultados']},
  {id:'administracao', name:'Administração', flow:'admin', dep:'admin', subcats:['Documentos','Contratos','Fornecedores','Estoque e Operação','Logística','Processos Internos','Reuniões','Jurídico','RH e Equipe']},
  {id:'design', name:'Design', flow:'creative', dep:'design', subcats:['Social Media','Campanhas','E-commerce','Materiais Impressos','Embalagens','Produto','Identidade Visual','Foto e Vídeo','Aprovações']},
  {id:'financeiro', name:'Financeiro', flow:'financeiro', dep:'financeiro', subcats:['Contas a Pagar','Contas a Receber','Fluxo de Caixa','Cobranças','Impostos','Notas Fiscais','Orçamento','Conciliação','Relatórios']},
  {id:'comercial', name:'Comercial', flow:'comercial', dep:'comercial', subcats:['Leads','Prospecção','Atendimento','Propostas','Negociação','Vendas','Pós-venda','CRM','Parcerias']}
];
function area(id){ return AREAS.find(function(a){return a.id===id;}); }

var PROJECTS = [
  {id:'proj_lancamento', name:'Lançamento Nova Coleção', description:'Lançamento da coleção de verão em todos os canais: loja física, e-commerce e redes sociais.', responsibleId:'bruno', participants:['bruno','carla','fabio','giulia','diego','henrique','joaopedro','isabela'], startDate:iso(-20), dueDate:iso(25), status:'Em andamento'},
  {id:'proj_reforma', name:'Reforma da Loja Conceito', description:'Reforma do espaço físico da loja principal para o novo conceito visual da marca.', responsibleId:'joaopedro', participants:['joaopedro','fabio','henrique'], startDate:iso(-5), dueDate:iso(45), status:'Em andamento'},
  {id:'proj_blackfriday', name:'Campanha Black Friday', description:'Planejamento e execução da campanha de Black Friday em todos os canais de venda.', responsibleId:'bruno', participants:['bruno','giulia','isabela'], startDate:iso(20), dueDate:iso(55), status:'Planejamento'}
];
function project(id){ return PROJECTS.find(function(p){return p.id===id;}); }

function mkTask(o){
  return Object.assign({
    id: uid('t'), projectId:null, participants:[], checklist:[], subtasks:[], comments:[], attachments:[], links:[], dependencies:[], history:[],
    createdAt: iso(-3), startDate:null, completedAt:null
  }, o);
}

var TASKS = [
  // MARKETING
  mkTask({title:'Planejamento de conteúdo — Nova Coleção', description:'Definir os temas, formatos e datas de publicação do conteúdo de lançamento da nova coleção.', areaId:'marketing', subcategory:'Conteúdo', projectId:'proj_lancamento', requesterId:'ana', responsibleId:'carla', priority:'Média', status:'Concluído', dueDate:iso(6), completedAt:iso(-4), createdAt:iso(-18)}),
  mkTask({title:'Roteiro de vídeo institucional', description:'Roteiro para o vídeo institucional que apresenta a marca aos novos clientes.', areaId:'marketing', subcategory:'Conteúdo', requesterId:'bruno', responsibleId:'carla', priority:'Alta', status:'Em produção', dueDate:iso(3)}),
  mkTask({title:'Post feed — teaser Nova Coleção', description:'Arte e legenda do post teaser anunciando a nova coleção nas redes sociais.', areaId:'marketing', subcategory:'Social Media', projectId:'proj_lancamento', requesterId:'bruno', responsibleId:'carla', participants:['bruno'], priority:'Alta', status:'Aprovação', dueDate:iso(1)}),
  mkTask({title:'Estratégia de lançamento — Nova Coleção', description:'Documento de estratégia com posicionamento, canais, cronograma e metas do lançamento.', areaId:'marketing', subcategory:'Planejamento', projectId:'proj_lancamento', requesterId:'ana', responsibleId:'bruno', priority:'Urgente', status:'Em produção', dueDate:iso(-1),
    checklist:[{id:uid('ck'),text:'Mapear canais de divulgação',done:true},{id:uid('ck'),text:'Definir cronograma de mídia',done:true},{id:uid('ck'),text:'Validar orçamento com Financeiro',done:false},{id:uid('ck'),text:'Aprovar posicionamento com direção',done:false}],
    subtasks:[{id:uid('st'),title:'Levantar concorrentes diretos',done:true,responsibleId:'carla'},{id:uid('st'),title:'Reunião de alinhamento com Comercial',done:false,responsibleId:'bruno'}],
    comments:[{id:uid('cm'),authorId:'ana',text:'Precisamos fechar isso ainda essa semana, o time comercial está esperando.',createdAt:iso(-2)+'T14:20:00'}],
    dependencies:[],
    history:[{id:uid('h'),field:'status',from:'Planejamento',to:'Em produção',at:iso(-6)+'T09:00:00',by:'bruno'},{id:uid('h'),field:'prioridade',from:'Alta',to:'Urgente',at:iso(-2)+'T14:22:00',by:'ana'}]
  }),
  mkTask({title:'Configurar campanha Meta Ads — Setembro', description:'Configuração de campanha de tráfego pago para o mês de setembro.', areaId:'marketing', subcategory:'Tráfego Pago', requesterId:'bruno', responsibleId:'carla', priority:'Média', status:'Programado', dueDate:iso(5)}),
  mkTask({title:'Parceria com influenciadora @paula.moda', description:'Negociar permuta de produtos por conteúdo com a influenciadora.', areaId:'marketing', subcategory:'Influenciadores e Parcerias', requesterId:'bruno', responsibleId:'bruno', priority:'Baixa', status:'Backlog', dueDate:null, createdAt:iso(-16)}),
  mkTask({title:'Disparo de e-mail — carrinho abandonado', description:'Configurar automação de e-mail para clientes que abandonaram o carrinho.', areaId:'marketing', subcategory:'E-mail e WhatsApp', requesterId:'ana', responsibleId:'carla', priority:'Média', status:'Revisão', dueDate:iso(2)}),
  mkTask({title:'Relatório de performance — agosto', description:'Consolidar métricas de todas as campanhas de agosto.', areaId:'marketing', subcategory:'Análise de Resultados', requesterId:'ana', responsibleId:'bruno', priority:'Baixa', status:'Concluído', dueDate:iso(-10), completedAt:iso(-8)}),
  mkTask({title:'Planejamento do evento de inauguração da loja', description:'Estruturar o evento de inauguração da loja reformada.', areaId:'marketing', subcategory:'Eventos', requesterId:'ana', responsibleId:'bruno', priority:'Baixa', status:'Backlog', dueDate:iso(30), createdAt:iso(-19)}),
  mkTask({title:'Estratégia Black Friday', description:'Definir eixo criativo e canais para a campanha de Black Friday.', areaId:'marketing', subcategory:'Planejamento', projectId:'proj_blackfriday', requesterId:'bruno', responsibleId:'bruno', priority:'Média', status:'Backlog', dueDate:iso(35)}),

  // DESIGN
  mkTask({title:'Key Visual — Nova Coleção', description:'Peça-chave visual que vai nortear toda a comunicação da nova coleção.', areaId:'design', subcategory:'Identidade Visual', projectId:'proj_lancamento', requesterId:'bruno', responsibleId:'giulia', participants:['fabio'], priority:'Urgente', status:'Aprovação', dueDate:iso(0),
    checklist:[{id:uid('ck'),text:'Explorar 3 direções de arte',done:true},{id:uid('ck'),text:'Selecionar direção final com Marketing',done:true},{id:uid('ck'),text:'Preparar variações para redes sociais',done:false}],
    comments:[{id:uid('cm'),authorId:'giulia',text:'Segue a versão final para aprovação, ajustei o contraste do logo conforme o feedback.',createdAt:iso(-1)+'T11:05:00'},{id:uid('cm'),authorId:'ana',text:'Ficou ótimo! Só confirma se a paleta está alinhada com a campanha de mídia paga antes de programar.',createdAt:iso(-1)+'T16:40:00'}],
    attachments:[{id:uid('at'),name:'key-visual-v3-final.png',size:'2.4 MB',uploadedBy:'giulia',createdAt:iso(-1)+'T11:00:00'},{id:uid('at'),name:'variações-redes-sociais.zip',size:'8.1 MB',uploadedBy:'giulia',createdAt:iso(-1)+'T11:02:00'}],
    dependencies:[],
    history:[{id:uid('h'),field:'status',from:'Em produção',to:'Revisão',at:iso(-3)+'T10:00:00',by:'giulia'},{id:uid('h'),field:'status',from:'Revisão',to:'Aprovação',at:iso(-1)+'T11:05:00',by:'giulia'}]
  }),
  mkTask({title:'Criativos — Nova Coleção (tráfego pago)', description:'Peças criativas para os anúncios de tráfego pago da nova coleção.', areaId:'design', subcategory:'Campanhas', projectId:'proj_lancamento', requesterId:'carla', responsibleId:'giulia', priority:'Alta', status:'Em produção', dueDate:iso(3)}),
  mkTask({title:'Banner home do e-commerce', description:'Banner principal da home do site para a semana promocional.', areaId:'design', subcategory:'E-commerce', requesterId:'carla', responsibleId:'giulia', priority:'Média', status:'Revisão', dueDate:iso(1)}),
  mkTask({title:'Etiquetas e embalagem da nova coleção', description:'Design das etiquetas e da embalagem para os produtos da nova coleção.', areaId:'design', subcategory:'Embalagens', projectId:'proj_lancamento', requesterId:'joaopedro', responsibleId:'fabio', priority:'Alta', status:'Planejamento', dueDate:iso(8)}),
  mkTask({title:'Catálogo impresso — showroom', description:'Catálogo impresso para apresentação no showroom aos lojistas parceiros.', areaId:'design', subcategory:'Materiais Impressos', requesterId:'diego', responsibleId:'giulia', priority:'Baixa', status:'Backlog', dueDate:null, createdAt:iso(-20)}),
  mkTask({title:'Sessão de fotos — lookbook nova coleção', description:'Produção fotográfica do lookbook oficial da nova coleção.', areaId:'design', subcategory:'Foto e Vídeo', projectId:'proj_lancamento', requesterId:'bruno', responsibleId:'fabio', priority:'Alta', status:'Programado', dueDate:iso(12)}),
  mkTask({title:'Atualizar manual de marca', description:'Revisão geral do manual de identidade visual da marca.', areaId:'design', subcategory:'Identidade Visual', requesterId:'fabio', responsibleId:'fabio', priority:'Baixa', status:'Backlog', dueDate:iso(40), createdAt:iso(-25)}),
  mkTask({title:'Aprovar mockups de produto — linha inverno', description:'Mockups dos novos produtos da linha de inverno para aprovação da direção.', areaId:'design', subcategory:'Produto', requesterId:'ana', responsibleId:'fabio', priority:'Média', status:'Aprovação', dueDate:iso(-2),
    history:[{id:uid('h'),field:'status',from:'Revisão',to:'Aprovação',at:iso(-4)+'T09:30:00',by:'fabio'}]
  }),
  mkTask({title:'Revisar posts sociais da semana', description:'Revisão final das artes de redes sociais antes da publicação.', areaId:'design', subcategory:'Aprovações', requesterId:'bruno', responsibleId:'fabio', priority:'Média', status:'Concluído', dueDate:iso(-5), completedAt:iso(-5)}),
  mkTask({title:'Conceito visual da nova loja', description:'Direção de arte para o novo conceito visual da loja física.', areaId:'design', subcategory:'Identidade Visual', projectId:'proj_reforma', requesterId:'joaopedro', responsibleId:'fabio', priority:'Média', status:'Planejamento', dueDate:iso(20)}),
  mkTask({title:'Peças gráficas Black Friday', description:'Kit de peças gráficas para a campanha de Black Friday em todos os canais.', areaId:'design', subcategory:'Campanhas', projectId:'proj_blackfriday', requesterId:'bruno', responsibleId:'giulia', priority:'Baixa', status:'Backlog', dueDate:iso(40)}),

  // COMERCIAL
  mkTask({title:'Qualificar leads da campanha de setembro', description:'Triagem e qualificação dos leads recebidos pela campanha de tráfego pago.', areaId:'comercial', subcategory:'Leads', requesterId:'diego', responsibleId:'elaine', priority:'Média', status:'Novo Lead', dueDate:iso(2)}),
  mkTask({title:'Prospecção ativa — lojistas região sul', description:'Prospecção de novos lojistas parceiros na região sul do país.', areaId:'comercial', subcategory:'Prospecção', requesterId:'diego', responsibleId:'elaine', priority:'Baixa', status:'Contato', dueDate:iso(7)}),
  mkTask({title:'Atendimento — pedido corporativo Loja Bella', description:'Atendimento ao pedido corporativo solicitado pela Loja Bella.', areaId:'comercial', subcategory:'Atendimento', requesterId:'elaine', responsibleId:'elaine', priority:'Alta', status:'Qualificação', dueDate:iso(1)}),
  mkTask({title:'Proposta comercial — rede Vitrine Moda', description:'Elaborar proposta comercial para a rede de lojas Vitrine Moda.', areaId:'comercial', subcategory:'Propostas', requesterId:'diego', responsibleId:'diego', priority:'Alta', status:'Proposta', dueDate:iso(0)}),
  mkTask({title:'Negociação de condições — cliente Estação Norte', description:'Negociar prazos e condições comerciais com o cliente Estação Norte.', areaId:'comercial', subcategory:'Negociação', requesterId:'diego', responsibleId:'diego', priority:'Urgente', status:'Negociação', dueDate:iso(-1),
    comments:[{id:uid('cm'),authorId:'diego',text:'Cliente pediu mais 5 dias de prazo de pagamento, vou levar para o Financeiro avaliar.',createdAt:iso(-1)+'T13:00:00'},{id:uid('cm'),authorId:'henrique',text:'Consigo liberar até 45 dias sem problema, pode fechar.',createdAt:iso(-1)+'T15:30:00'}],
    links:[{id:uid('lk'),url:'https://exemplo.com/propostas/estacao-norte-v2',label:'Proposta v2 (PDF)'}],
    history:[{id:uid('h'),field:'status',from:'Proposta',to:'Negociação',at:iso(-4)+'T10:00:00',by:'diego'}]
  }),
  mkTask({title:'Estratégia comercial — Nova Coleção', description:'Definir metas de venda, mix de produtos e argumentos comerciais para a nova coleção.', areaId:'comercial', subcategory:'Vendas', projectId:'proj_lancamento', requesterId:'ana', responsibleId:'diego', priority:'Alta', status:'Qualificação', dueDate:iso(9)}),
  mkTask({title:'Atualizar cadastro de clientes no CRM', description:'Padronizar e atualizar os cadastros de clientes ativos no CRM.', areaId:'comercial', subcategory:'CRM', requesterId:'diego', responsibleId:'elaine', priority:'Baixa', status:'Contato', dueDate:iso(4)}),
  mkTask({title:'Fechamento — pedido loja Vitrine Moda', description:'Fechamento do pedido negociado com a rede Vitrine Moda.', areaId:'comercial', subcategory:'Vendas', requesterId:'diego', responsibleId:'diego', priority:'Média', status:'Fechado', dueDate:iso(-6), completedAt:iso(-6)}),
  mkTask({title:'Follow-up pós-venda — cliente Estação Norte', description:'Follow-up de satisfação após a entrega do pedido.', areaId:'comercial', subcategory:'Pós-venda', requesterId:'diego', responsibleId:'elaine', priority:'Baixa', status:'Pós-venda', dueDate:iso(-3), completedAt:iso(-3)}),

  // FINANCEIRO
  mkTask({title:'Pagamento — fornecedor de tecidos', description:'Processar pagamento da fatura do fornecedor de tecidos do mês.', areaId:'financeiro', subcategory:'Contas a Pagar', requesterId:'joaopedro', responsibleId:'henrique', priority:'Alta', status:'Pendente', dueDate:iso(1)}),
  mkTask({title:'Cobrança — cliente em atraso Loja Nova Era', description:'Realizar cobrança formal do cliente com fatura em atraso.', areaId:'financeiro', subcategory:'Cobranças', requesterId:'diego', responsibleId:'henrique', priority:'Urgente', status:'Pendente', dueDate:iso(-2),
    attachments:[{id:uid('at'),name:'boleto-nova-era-ago.pdf',size:'180 KB',uploadedBy:'henrique',createdAt:iso(-2)+'T08:00:00'}],
    comments:[{id:uid('cm'),authorId:'henrique',text:'Terceira tentativa de contato, vou escalar para o jurídico se não houver retorno até sexta.',createdAt:iso(-1)+'T09:00:00'}]
  }),
  mkTask({title:'Emitir notas fiscais — pedidos da semana', description:'Emissão das notas fiscais referentes aos pedidos faturados na semana.', areaId:'financeiro', subcategory:'Notas Fiscais', requesterId:'henrique', responsibleId:'henrique', priority:'Média', status:'Programado', dueDate:iso(2)}),
  mkTask({title:'Fluxo de caixa — projeção outubro', description:'Atualizar a projeção de fluxo de caixa para outubro.', areaId:'financeiro', subcategory:'Fluxo de Caixa', requesterId:'ana', responsibleId:'henrique', priority:'Média', status:'Aguardando', dueDate:iso(5)}),
  mkTask({title:'Orçamento — campanha Nova Coleção', description:'Consolidar e aprovar o orçamento total da campanha de lançamento.', areaId:'financeiro', subcategory:'Orçamento', projectId:'proj_lancamento', requesterId:'bruno', responsibleId:'henrique', priority:'Alta', status:'Pendente', dueDate:iso(3)}),
  mkTask({title:'Apuração de impostos — 3º trimestre', description:'Apuração e conferência dos impostos referentes ao terceiro trimestre.', areaId:'financeiro', subcategory:'Impostos', requesterId:'ana', responsibleId:'henrique', priority:'Alta', status:'Aguardando', dueDate:iso(15)}),
  mkTask({title:'Conciliação bancária — agosto', description:'Conciliação dos extratos bancários referentes a agosto.', areaId:'financeiro', subcategory:'Conciliação', requesterId:'henrique', responsibleId:'henrique', priority:'Baixa', status:'Conciliado', dueDate:iso(-12), completedAt:iso(-10)}),
  mkTask({title:'Relatório financeiro mensal — agosto', description:'Relatório consolidado dos resultados financeiros de agosto.', areaId:'financeiro', subcategory:'Relatórios', requesterId:'ana', responsibleId:'henrique', priority:'Baixa', status:'Pago/Recebido', dueDate:iso(-7), completedAt:iso(-7)}),
  mkTask({title:'Orçamento da reforma', description:'Levantar e aprovar o orçamento total da reforma da loja conceito.', areaId:'financeiro', subcategory:'Orçamento', projectId:'proj_reforma', requesterId:'joaopedro', responsibleId:'henrique', priority:'Média', status:'Pendente', dueDate:iso(10)}),

  // ADMINISTRAÇÃO
  mkTask({title:'Renovar contrato de transportadora', description:'Renovação do contrato com a transportadora responsável pela logística.', areaId:'administracao', subcategory:'Contratos', requesterId:'ana', responsibleId:'joaopedro', priority:'Alta', status:'A Fazer', dueDate:iso(4)}),
  mkTask({title:'Organizar documentos fiscais do trimestre', description:'Organização e arquivamento dos documentos fiscais do trimestre.', areaId:'administracao', subcategory:'Documentos', requesterId:'henrique', responsibleId:'isabela', priority:'Média', status:'Em Andamento', dueDate:iso(6)}),
  mkTask({title:'Cotação com novos fornecedores de embalagem', description:'Levantar cotações de novos fornecedores de embalagem para a nova coleção.', areaId:'administracao', subcategory:'Fornecedores', projectId:'proj_lancamento', requesterId:'fabio', responsibleId:'joaopedro', priority:'Média', status:'Concluído', dueDate:iso(-2), completedAt:iso(-2)}),
  mkTask({title:'Contagem de estoque — depósito central', description:'Contagem física do estoque no depósito central.', areaId:'administracao', subcategory:'Estoque e Operação', requesterId:'diego', responsibleId:'isabela', priority:'Alta', status:'A Fazer', dueDate:iso(-1)}),
  mkTask({title:'Logística de entrega — nova coleção às lojas', description:'Planejar a logística de distribuição da nova coleção para as lojas parceiras.', areaId:'administracao', subcategory:'Logística', projectId:'proj_lancamento', requesterId:'diego', responsibleId:'joaopedro', priority:'Alta', status:'Solicitado', dueDate:iso(18)}),
  mkTask({title:'Revisar processo de recebimento de mercadorias', description:'Mapear e revisar o processo interno de recebimento de mercadorias.', areaId:'administracao', subcategory:'Processos Internos', requesterId:'joaopedro', responsibleId:'isabela', priority:'Baixa', status:'Solicitado', dueDate:iso(25), createdAt:iso(-15)}),
  mkTask({title:'Pauta da reunião mensal de diretoria', description:'Preparar a pauta da reunião mensal com a diretoria.', areaId:'administracao', subcategory:'Reuniões', requesterId:'ana', responsibleId:'ana', priority:'Média', status:'Em Andamento', dueDate:iso(2)}),
  mkTask({title:'Revisão de contrato com fornecedor jurídico', description:'Revisão das cláusulas do contrato com o escritório de advocacia parceiro.', areaId:'administracao', subcategory:'Jurídico', requesterId:'ana', responsibleId:'ana', priority:'Alta', status:'Revisão', dueDate:iso(-3),
    links:[{id:uid('lk'),url:'https://exemplo.com/juridico/contrato-rev4',label:'Minuta do contrato (rev. 4)'}],
    history:[{id:uid('h'),field:'status',from:'Em Andamento',to:'Revisão',at:iso(-5)+'T09:00:00',by:'ana'}]
  }),
  mkTask({title:'Processo seletivo — assistente de e-commerce', description:'Condução do processo seletivo para a vaga de assistente de e-commerce.', areaId:'administracao', subcategory:'RH e Equipe', requesterId:'ana', responsibleId:'isabela', priority:'Média', status:'Concluído', dueDate:iso(-9), completedAt:iso(-9)}),
  mkTask({title:'Cronograma de obra com fornecedor', description:'Alinhar o cronograma de obra da reforma com o fornecedor contratado.', areaId:'administracao', subcategory:'Fornecedores', projectId:'proj_reforma', requesterId:'joaopedro', responsibleId:'joaopedro', priority:'Média', status:'Aguardando Terceiro', dueDate:iso(15)}),
  mkTask({title:'Planejamento de estoque para Black Friday', description:'Planejar níveis de estoque para atender a demanda da Black Friday.', areaId:'administracao', subcategory:'Estoque e Operação', projectId:'proj_blackfriday', requesterId:'diego', responsibleId:'isabela', priority:'Média', status:'Solicitado', dueDate:iso(30)})
];
// dependency example: Key Visual depends on the launch strategy task
(function(){
  var kv = TASKS.find(function(t){return t.title==='Key Visual — Nova Coleção';});
  var strat = TASKS.find(function(t){return t.title==='Estratégia de lançamento — Nova Coleção';});
  if(kv && strat) kv.dependencies = [strat.id];
})();

var NOTIFICATIONS = [
  {id:uid('n'), userId:'fabio', text:'Você foi atribuído à tarefa "Aprovar mockups de produto — linha inverno".', createdAt:iso(-2)+'T09:00:00', read:true},
  {id:uid('n'), userId:'fabio', text:'"Aprovar mockups de produto — linha inverno" está atrasada.', createdAt:iso(0)+'T08:00:00', read:false},
  {id:uid('n'), userId:'fabio', text:'Novo comentário em "Key Visual — Nova Coleção".', createdAt:iso(-1)+'T11:05:00', read:true},
  {id:uid('n'), userId:'fabio', text:'"Key Visual — Nova Coleção" chegou para aprovação.', createdAt:iso(-1)+'T11:06:00', read:false},
  {id:uid('n'), userId:'fabio', text:'Você aprovou "Revisar posts sociais da semana".', createdAt:iso(-5)+'T17:00:00', read:true},
  {id:uid('n'), userId:'fabio', text:'Caio mencionou você em um comentário.', createdAt:iso(-1)+'T16:40:00', read:false},
  {id:uid('n'), userId:'fabio', text:'Novo comentário em "Etiquetas e embalagem da nova coleção".', createdAt:iso(-3)+'T10:20:00', read:true},
  {id:uid('n'), userId:'bruno', text:'"Estratégia de lançamento — Nova Coleção" está atrasada.', createdAt:iso(0)+'T08:00:00', read:false},
  {id:uid('n'), userId:'bruno', text:'"Post feed — teaser Nova Coleção" chegou para aprovação.', createdAt:iso(-1)+'T09:00:00', read:false},
  {id:uid('n'), userId:'diego', text:'O prazo de "Proposta comercial — rede Vitrine Moda" vence hoje.', createdAt:iso(0)+'T08:00:00', read:false},
  {id:uid('n'), userId:'diego', text:'"Negociação de condições — cliente Estação Norte" está atrasada.', createdAt:iso(0)+'T08:00:00', read:false}
];

// Consolida os dados de exemplo (escritos para um time de 10 pessoas) nas 3 pessoas reais da equipe.
(function remapAllUsers(){
  function uniq(arr){ var seen=[]; arr.forEach(function(v){ if(seen.indexOf(v)===-1) seen.push(v); }); return seen; }
  TASKS.forEach(function(t){
    t.requesterId = remapUser(t.requesterId);
    t.responsibleId = remapUser(t.responsibleId);
    t.participants = uniq(t.participants.map(remapUser)).filter(function(id){ return id!==t.responsibleId; });
    t.subtasks.forEach(function(s){ s.responsibleId = remapUser(s.responsibleId); });
    t.comments.forEach(function(c){ c.authorId = remapUser(c.authorId); });
    t.attachments.forEach(function(f){ f.uploadedBy = remapUser(f.uploadedBy); });
    t.history.forEach(function(h){ h.by = remapUser(h.by); });
  });
  PROJECTS.forEach(function(p){
    p.responsibleId = remapUser(p.responsibleId);
    p.participants = uniq(p.participants.map(remapUser));
  });
  NOTIFICATIONS.forEach(function(n){ n.userId = remapUser(n.userId); });
})();

/* ======================= STATE ======================= */
var state = {
  currentUserId:'patricia',
  route:{name:'dashboard', params:{}, view:'kanban'},
  drawerTaskId:null,
  drawerTab:'detalhes',
  modalOpen:false,
  modalArea:'marketing',
  bannerDismissed:false,
  calMonthOffset:0,
  filters:{}, // per areaId key -> {responsavel, subcat, prioridade, prazo}
  sidebarOpen:false,
  notifOpen:false
};
function getFilters(key){ return state.filters[key] || (state.filters[key]={responsavel:'',subcat:'',prioridade:'',prazo:''}); }

/* ======================= HELPERS ======================= */
function isFinal(t){ var a=area(t.areaId); return FINAL_STATUSES[a.flow].indexOf(t.status)>-1; }
function isOverdue(t){ return t.dueDate && !isFinal(t) && t.dueDate < TODAY_ISO; }
function isDueToday(t){ return t.dueDate === TODAY_ISO && !isFinal(t); }
function isDueThisWeek(t){ if(!t.dueDate||isFinal(t)) return false; return t.dueDate>=TODAY_ISO && t.dueDate<=iso(7); }
function lastActivityISO(t){
  var dates=[t.createdAt];
  (t.history||[]).forEach(function(h){dates.push(h.at.slice(0,10));});
  (t.comments||[]).forEach(function(c){dates.push(c.createdAt.slice(0,10));});
  return dates.sort().pop();
}
function isStalled(t){ if(isFinal(t)) return false; var last=lastActivityISO(t); var days=(new Date(TODAY_ISO)-new Date(last))/86400000; return days>=7; }
function isAwaitingApproval(t){ return t.status==='Aprovação'; }
var priorityRank = KM.priorityRank, priorityClass = KM.priorityClass;
function depStyle(areaId){ var a=area(areaId); return 'style="--dep-rgb:var(--dep-'+a.dep+'-rgb)"'; }
function depColorVar(areaId){ var a=area(areaId); return 'var(--dep-'+a.dep+')'; }
function taskById(id){ return TASKS.find(function(t){return t.id===id;}); }
function tasksForArea(areaId){ return TASKS.filter(function(t){return t.areaId===areaId;}); }
function tasksForProject(projectId){ return TASKS.filter(function(t){return t.projectId===projectId;}); }
function openTasks(){ return TASKS.filter(function(t){return !isFinal(t);}); }
function computeProjectProgress(p){ var ts=tasksForProject(p.id); if(!ts.length) return 0; var done=ts.filter(isFinal).length; return Math.round(done/ts.length*100); }
function userLabel(id){ var u=user(id); return u?u.name:'—'; }
function initialsOf(id){ var u=user(id); return u?u.initials:'?'; }
function avatarHTML(id, cls){ return '<div class="avatar '+(cls||'')+'" title="'+esc(userLabel(id))+'">'+initialsOf(id)+'</div>'; }
var mentionify = function(text){ return KM.mentionify(text, USERS); };
function pushHistory(t, field, from, to){
  t.history.push({id:uid('h'), field:field, from:from, to:to, at:nowISOTime(), by:state.currentUserId});
}
function showToast(msg){
  var el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(showToast._tm);
  showToast._tm = setTimeout(function(){ el.classList.remove('show'); }, 2600);
}

/* ---- mutation actions ---- */
function moveTask(taskId, newStatus){
  var t = taskById(taskId); if(!t) return;
  if(t.status===newStatus) return;
  var old = t.status;
  t.status = newStatus;
  if(isFinal(t)){ if(!t.completedAt) t.completedAt = TODAY_ISO; }
  else { t.completedAt = null; }
  pushHistory(t,'status',old,newStatus);
}
function approveTask(taskId){
  var t=taskById(taskId); var a=area(t.areaId); var target = RETURN_RULES[a.flow] ? 'Programado' : t.status;
  moveTask(taskId, a.flow==='creative' ? 'Programado' : t.status);
  showToast('Tarefa aprovada.');
}
function rejectTask(taskId){
  var t=taskById(taskId); var a=area(t.areaId);
  var back = (RETURN_RULES[a.flow] && RETURN_RULES[a.flow]['Aprovação']) || FLOWS[a.flow][0];
  moveTask(taskId, back);
  showToast('Tarefa reprovada — retornou para "'+back+'".');
}
function updateTaskField(taskId, field, value){
  var t=taskById(taskId); if(!t) return;
  var old = t[field];
  if(old===value) return;
  t[field]=value;
  var labelMap={responsibleId:'responsável',priority:'prioridade',dueDate:'prazo de entrega'};
  pushHistory(t, labelMap[field]||field, field==='responsibleId'?userLabel(old):(old||'—'), field==='responsibleId'?userLabel(value):(value||'—'));
}
function addChecklistItem(taskId, text){
  if(!text.trim()) return;
  var t=taskById(taskId); t.checklist.push({id:uid('ck'), text:text.trim(), done:false});
}
function toggleChecklist(taskId, itemId){
  var t=taskById(taskId); var it=t.checklist.find(function(i){return i.id===itemId;}); if(it) it.done=!it.done;
}
function addSubtask(taskId, title){
  if(!title.trim()) return;
  var t=taskById(taskId); t.subtasks.push({id:uid('st'), title:title.trim(), done:false, responsibleId:t.responsibleId});
}
function toggleSubtask(taskId, stId){
  var t=taskById(taskId); var s=t.subtasks.find(function(i){return i.id===stId;}); if(s) s.done=!s.done;
}
function addComment(taskId, text){
  if(!text.trim()) return;
  var t=taskById(taskId);
  t.comments.push({id:uid('cm'), authorId:state.currentUserId, text:text.trim(), createdAt:nowISOTime()});
  USERS.forEach(function(u){
    if(u.id===state.currentUserId) return;
    var first=u.name.split(' ')[0];
    if(text.indexOf('@'+u.name)>-1 || text.indexOf('@'+first)>-1){
      NOTIFICATIONS.unshift({id:uid('n'), userId:u.id, text:userLabel(state.currentUserId)+' mencionou você em "'+t.title+'".', createdAt:nowISOTime(), read:false});
      showToast('Notificação enviada para '+u.name+'.');
    }
  });
}
function addAttachment(taskId, name){
  if(!name.trim()) return;
  var t=taskById(taskId);
  t.attachments.push({id:uid('at'), name:name.trim(), size:(Math.round(Math.random()*4000)/1000).toFixed(1)+' MB', uploadedBy:state.currentUserId, createdAt:nowISOTime()});
}
function addLink(taskId, url, label){
  if(!url.trim()) return;
  var t=taskById(taskId);
  t.links.push({id:uid('lk'), url:url.trim(), label:(label.trim()||url.trim())});
}
function createTask(data){
  var a = area(data.areaId);
  var t = mkTask({
    title:data.title, description:data.description||'', areaId:data.areaId, subcategory:data.subcategory,
    projectId:data.projectId||null, requesterId:data.requesterId, responsibleId:data.responsibleId,
    priority:data.priority, status:FLOWS[a.flow][0], dueDate:data.dueDate||null, createdAt:TODAY_ISO
  });
  t.history.push({id:uid('h'), field:'criação', from:null, to:'Tarefa criada', at:nowISOTime(), by:state.currentUserId});
  TASKS.push(t);
  return t;
}

/* ======================= ROUTER ======================= */
function parseHash(){
  var h = location.hash.replace(/^#\/?/, '');
  var qIdx = h.indexOf('?');
  var path = qIdx>-1 ? h.slice(0,qIdx) : h;
  var query = {};
  if(qIdx>-1){ h.slice(qIdx+1).split('&').forEach(function(kv){ var kvArr=kv.split('='); if(kvArr[0]) query[decodeURIComponent(kvArr[0])]=decodeURIComponent(kvArr[1]||''); }); }
  var parts = path.split('/').filter(Boolean);
  if(!parts.length) return {name:'dashboard', params:{}, query:query};
  if(parts[0]==='area') return {name:'area', params:{areaId:parts[1]}, query:query};
  if(parts[0]==='projetos' && parts[1]) return {name:'projeto', params:{id:parts[1]}, query:query};
  if(parts[0]==='projetos') return {name:'projetos', params:{}, query:query};
  return {name:parts[0], params:{}, query:query};
}
function navigate(hash){ location.hash = hash; }
function onHashChange(){
  var r = parseHash();
  state.route = r;
  closeDrawer(); closeModal(); state.notifOpen=false;
  renderAll();
}

/* ======================= RENDER: SHELL ======================= */
var NAV_MAIN = [
  {route:'#/dashboard', label:'Visão Geral', icon:'dashboard', match:'dashboard'},
  {route:'#/projetos', label:'Projetos', icon:'projects', match:'projetos,projeto'}
];
var NAV_AFTER_AREAS = [
  {route:'#/minhas-tarefas', label:'Minhas Tarefas', icon:'tasks', match:'minhas-tarefas'},
  {route:'#/calendario', label:'Calendário', icon:'calendar', match:'calendario'},
  {route:'#/equipe', label:'Equipe', icon:'team', match:'equipe'},
  {route:'#/configuracoes', label:'Configurações', icon:'settings', match:'configuracoes'}
];
var AREA_ICON = {marketing:'marketing', administracao:'admin', design:'design', financeiro:'finance', comercial:'sales'};

function renderSidebar(){
  var r = state.route;
  function itemHTML(it){
    var active = it.match.split(',').indexOf(r.name)>-1;
    return '<button class="nav-item'+(active?' active':'')+'" data-nav="'+it.route+'">'+icon(it.icon)+'<span>'+it.label+'</span></button>';
  }
  document.getElementById('navMain').innerHTML = NAV_MAIN.map(itemHTML).join('');
  document.getElementById('navAreas').innerHTML = AREAS.map(function(a){
    var active = r.name==='area' && r.params.areaId===a.id;
    return '<button class="nav-item'+(active?' active':'')+'" data-nav="#/area/'+a.id+'"><span class="nav-dot" style="background:var(--dep-'+a.dep+')"></span><span>'+a.name+'</span></button>';
  }).join('');
  document.getElementById('navFooterLinks').innerHTML = NAV_AFTER_AREAS.map(itemHTML).join('');

  var footer = document.querySelector('.sidebar-footer .user-switch');
  if(footer){
    footer.innerHTML = '<div class="avatar" id="currentUserAvatar">'+initialsOf(state.currentUserId)+'</div>' +
      '<div style="flex:1;min-width:0;"><div style="font-weight:700;font-size:13px;">'+esc(userLabel(state.currentUserId))+'</div></div>' +
      '<button class="btn btn-ghost btn-sm" id="logoutBtn">Sair</button>';
  }
}

function pageTitleFor(r){
  if(r.name==='dashboard') return ['Visão Geral', 'Panorama de todas as áreas e projetos'];
  if(r.name==='area') return [area(r.params.areaId).name, 'Quadro de tarefas da área'];
  if(r.name==='projetos') return ['Projetos', 'Iniciativas que cruzam várias áreas'];
  if(r.name==='projeto') return [project(r.params.id) ? project(r.params.id).name : 'Projeto', 'Todas as tarefas deste projeto, de qualquer área'];
  if(r.name==='minhas-tarefas') return ['Minhas Tarefas', 'Sua visão pessoal de prazos e prioridades'];
  if(r.name==='calendario') return ['Calendário', 'Todos os prazos da empresa'];
  if(r.name==='equipe') return ['Equipe', 'Carga de trabalho por pessoa'];
  if(r.name==='configuracoes') return ['Configurações', 'Áreas, fluxos e usuários'];
  return ['Kabelera Manager', ''];
}
function renderTopbar(){
  var t = pageTitleFor(state.route);
  document.getElementById('pageTitle').textContent = t[0];
  document.getElementById('pageSub').textContent = t[1];
  var btn=document.getElementById('newTaskBtn');
  btn.innerHTML = icon('plus',16)+'<span>Nova tarefa</span>';
  renderNotifBell();
}
function renderNotifBell(){
  var list = NOTIFICATIONS.filter(function(n){return n.userId===state.currentUserId;});
  var unread = list.filter(function(n){return !n.read;}).length;
  document.getElementById('notifBtn').innerHTML = icon('bell',18) + (unread? '<span class="badge-dot">'+unread+'</span>':'');
  var panel = document.getElementById('notifPanel');
  if(!state.notifOpen){ panel.innerHTML=''; return; }
  panel.innerHTML = '<div class="dropdown-panel"><h4>Notificações</h4>' +
    (list.length ? list.map(function(n){
      return '<div class="notif-row'+(n.read?' read':'')+'" data-notif="'+n.id+'"><span class="dot"></span><div><div>'+esc(n.text)+'</div><div class="notif-time">'+fmtDateTime(n.createdAt)+'</div></div></div>';
    }).join('') : '<div class="notif-empty">Nenhuma notificação por aqui.</div>') +
    '</div>';
}

function renderMobileNav(){
  var r = state.route;
  var items = [
    {route:'#/dashboard', label:'Início', icon:'dashboard', match:'dashboard'},
    {route:'#/projetos', label:'Projetos', icon:'projects', match:'projetos,projeto'},
    {route:'#/minhas-tarefas', label:'Tarefas', icon:'tasks', match:'minhas-tarefas'},
    {route:'#/calendario', label:'Agenda', icon:'calendar', match:'calendario'}
  ];
  var html = '<div class="mobile-nav-inner">' + items.map(function(it){
    var active = it.match.split(',').indexOf(r.name)>-1;
    return '<button class="mnav-item'+(active?' active':'')+'" data-nav="'+it.route+'">'+icon(it.icon,20)+'<span>'+it.label+'</span></button>';
  }).join('') + '<button class="mnav-item" id="mnavMore">'+icon('menu',20)+'<span>Mais</span></button></div>';
  document.getElementById('mobileNav').innerHTML = html;
}

/* ======================= RENDER: VIEWS ======================= */
function renderContent(){
  var r = state.route;
  var el = document.getElementById('content');
  if(r.name==='dashboard') el.innerHTML = viewDashboard();
  else if(r.name==='area') el.innerHTML = viewArea(r.params.areaId, r.query.view||'kanban');
  else if(r.name==='projetos') el.innerHTML = viewProjectsList();
  else if(r.name==='projeto') el.innerHTML = viewProjectDetail(r.params.id);
  else if(r.name==='minhas-tarefas') el.innerHTML = viewMyTasks();
  else if(r.name==='calendario') el.innerHTML = viewCalendarPage();
  else if(r.name==='equipe') el.innerHTML = viewTeam();
  else if(r.name==='configuracoes') el.innerHTML = viewSettings();
  else el.innerHTML = '<div class="empty-state">Página não encontrada.</div>';
  wireDynamicCharts();
}

/* ---- Dashboard ---- */
function viewDashboard(){
  var open = openTasks();
  var done = TASKS.filter(isFinal);
  var overdue = TASKS.filter(isOverdue);
  var dueToday = TASKS.filter(isDueToday);
  var week = TASKS.filter(isDueThisWeek);
  var approval = TASKS.filter(isAwaitingApproval);
  var activeProjects = PROJECTS.filter(function(p){return p.status!=='Concluído';});

  var byArea = AREAS.map(function(a){ return {label:a.name, value:tasksForArea(a.id).filter(function(t){return !isFinal(t);}).length, color:'var(--dep-'+a.dep+')'}; });
  var byUser = USERS.map(function(u){ return {label:u.name.split(' ')[0], value:TASKS.filter(function(t){return t.responsibleId===u.id && !isFinal(t);}).length}; })
    .filter(function(d){return d.value>0;}).sort(function(a,b){return b.value-a.value;});

  var banner = state.bannerDismissed ? '' : '<div class="banner">'+icon('info',16)+'<span>Protótipo navegável com dados fictícios em memória — dá para arrastar cards, aprovar tarefas, criar tarefas e comentar; nada fica salvo entre sessões ainda.</span><button data-dismiss-banner aria-label="Fechar">'+icon('close',14)+'</button></div>';

  return banner + '<div class="stat-grid">' +
    statTile('Tarefas abertas', open.length) +
    statTile('Concluídas', done.length, 'good') +
    statTile('Atrasadas', overdue.length, overdue.length?'critical':'') +
    statTile('Vencendo hoje', dueToday.length, dueToday.length?'warning':'') +
    statTile('Da semana', week.length) +
    statTile('Aguardando aprovação', approval.length, approval.length?'warning':'') +
    statTile('Projetos ativos', activeProjects.length) +
    '</div>' +

    '<div class="section-head"><h2>Progresso dos projetos</h2></div>' +
    '<div class="projects-grid">' + PROJECTS.map(projectCardHTML).join('') + '</div>' +

    '<div class="section-head"><h2>Tarefas por área e por responsável</h2></div>' +
    '<div class="chart-grid">' +
      barChartCard('Tarefas abertas por área', byArea) +
      barChartCard('Tarefas abertas por responsável', byUser.map(function(d){return {label:d.label, value:d.value, color:'var(--accent)'};})) +
    '</div>' +

    '<div class="section-head"><h2>Atenção</h2><span class="count">o que precisa de ação agora</span></div>' +
    '<div class="attn-grid">' +
      attnCard('Atrasadas', overdue, 'critical') +
      attnCard('Prazos próximos (7 dias)', week, 'warning') +
      attnCard('Urgentes', TASKS.filter(function(t){return t.priority==='Urgente' && !isFinal(t);}), 'critical') +
      attnCard('Paradas há muito tempo', TASKS.filter(isStalled), '') +
      attnCard('Aguardando aprovação', approval, 'warning') +
    '</div>';
}
function statTile(label, value, accent){
  return '<div class="stat-tile'+(accent?' accent-'+accent:'')+'"><div class="stat-label">'+label+'</div><div class="stat-value">'+value+'</div></div>';
}
function barChartCard(title, data){
  var max = Math.max.apply(null, data.map(function(d){return d.value;}).concat([1]));
  return '<div class="chart-card"><h3>'+title+'</h3>' + (data.length? data.map(function(d){
    var pct = Math.max(4, Math.round(d.value/max*100));
    return '<div class="bar-row"><div class="lbl">'+esc(d.label)+'</div><div class="bar-track"><div class="bar-fill" style="width:'+pct+'%;background:'+d.color+'"></div></div><div class="bar-val">'+d.value+'</div></div>';
  }).join('') : '<div class="empty-state" style="padding:16px 0;">Sem dados para exibir.</div>') + '</div>';
}
function attnCard(title, list, tone){
  list = list.slice().sort(function(a,b){ return (a.dueDate||'9999').localeCompare(b.dueDate||'9999'); });
  return '<div class="attn-card"><div class="attn-card-head">'+title+'<span class="count-pill">'+list.length+'</span></div>' +
    '<div class="attn-list">' + (list.length ? list.slice(0,8).map(function(t){
      return '<div class="attn-row" data-open-task="'+t.id+'"><span class="pill dep-pill" '+depStyle(t.areaId)+'>'+area(t.areaId).name+'</span><span class="t">'+esc(t.title)+'</span>' +
        (t.dueDate ? '<span class="tag'+(tone==='critical'?' overdue-chip':(tone==='warning'?' due-today-chip':''))+'">'+fmtDate(t.dueDate)+'</span>' : '') +
      '</div>';
    }).join('') : '<div class="attn-empty">Nada por aqui — tudo em dia.</div>') + '</div></div>';
}
function projectCardHTML(p){
  var ts = tasksForProject(p.id);
  var pct = computeProjectProgress(p);
  var overdueCt = ts.filter(isOverdue).length;
  return '<div class="project-card" data-open-project="'+p.id+'">' +
    '<div style="display:flex;align-items:center;gap:8px;"><h3>'+esc(p.name)+'</h3><span class="tag" style="margin-left:auto">'+esc(p.status)+'</span></div>' +
    '<div class="project-desc">'+esc(p.description)+'</div>' +
    '<div class="progress-track"><div class="progress-fill" style="width:'+pct+'%"></div></div>' +
    '<div class="project-meta"><span>'+pct+'% concluído</span><span>'+ts.length+' tarefas</span><span>'+ts.filter(isFinal).length+' concluídas</span>' + (overdueCt? '<span style="color:var(--status-critical);font-weight:700">'+overdueCt+' atrasadas</span>':'') + '</div>' +
    '<div style="display:flex;align-items:center;gap:10px;"><div class="avatars-stack">'+p.participants.slice(0,5).map(function(id){return avatarHTML(id);}).join('')+'</div><span style="font-size:11px;color:var(--text-muted)">até '+fmtDate(p.dueDate)+'</span></div>' +
    '</div>';
}

/* ---- Area board ---- */
function viewArea(areaId, view){
  var a = area(areaId);
  var f = getFilters('area:'+areaId);
  var tasks = tasksForArea(areaId).filter(function(t){ return matchesFilters(t, f); });
  var tabs = ['kanban','lista','calendario','timeline','gantt'];
  var labels = {kanban:'Kanban', lista:'Lista', calendario:'Calendário', timeline:'Timeline', gantt:'Gantt'};
  var html = '<div class="view-tabs">' + tabs.map(function(v){
    return '<button class="view-tab'+(v===view?' active':'')+'" data-area-view="'+areaId+'|'+v+'">'+labels[v]+'</button>';
  }).join('') + '</div>';
  html += filtersBarHTML('area:'+areaId, a);
  if(view==='kanban') html += kanbanHTML(a, tasks);
  else if(view==='lista') html += listTableHTML(tasks);
  else if(view==='calendario') html += calendarHTML(tasks, 'area:'+areaId);
  else html += '<div class="empty-state">'+icon('clock',26)+'<div style="margin-top:10px;">'+labels[view]+' chega na próxima fase (v2) — por enquanto acompanhe pelo Kanban, Lista ou Calendário.</div></div>';
  return html;
}
function filtersBarHTML(key, a){
  var f = getFilters(key);
  var members = USERS;
  var subcats = a ? a.subcats : [];
  return '<div class="filters-bar" data-filter-key="'+key+'">' +
    '<select data-filter="responsavel"><option value="">Todos os responsáveis</option>' + members.map(function(u){return '<option value="'+u.id+'"'+(f.responsavel===u.id?' selected':'')+'>'+u.name+'</option>';}).join('') + '</select>' +
    (subcats.length? '<select data-filter="subcat"><option value="">Todas as subcategorias</option>' + subcats.map(function(s){return '<option value="'+esc(s)+'"'+(f.subcat===s?' selected':'')+'>'+s+'</option>';}).join('') + '</select>' : '') +
    '<select data-filter="prioridade"><option value="">Todas as prioridades</option>' + ['Baixa','Média','Alta','Urgente'].map(function(p){return '<option value="'+p+'"'+(f.prioridade===p?' selected':'')+'>'+p+'</option>';}).join('') + '</select>' +
    '<select data-filter="prazo"><option value="">Qualquer prazo</option><option value="atrasadas"'+(f.prazo==='atrasadas'?' selected':'')+'>Atrasadas</option><option value="hoje"'+(f.prazo==='hoje'?' selected':'')+'>Vencendo hoje</option><option value="semana"'+(f.prazo==='semana'?' selected':'')+'>Esta semana</option><option value="sem"'+(f.prazo==='sem'?' selected':'')+'>Sem prazo</option></select>' +
    '</div>';
}
function matchesFilters(t, f){
  if(f.responsavel && t.responsibleId!==f.responsavel) return false;
  if(f.subcat && t.subcategory!==f.subcat) return false;
  if(f.prioridade && t.priority!==f.prioridade) return false;
  if(f.prazo==='atrasadas' && !isOverdue(t)) return false;
  if(f.prazo==='hoje' && !isDueToday(t)) return false;
  if(f.prazo==='semana' && !isDueThisWeek(t)) return false;
  if(f.prazo==='sem' && t.dueDate) return false;
  return true;
}
function kanbanHTML(a, tasks){
  var cols = FLOWS[a.flow];
  return '<div class="board-scroll" data-board="'+a.id+'">' + cols.map(function(col){
    var colTasks = tasks.filter(function(t){return t.status===col;});
    return '<div class="kcol"><div class="kcol-head"><span>'+col+'</span><span class="count-pill">'+colTasks.length+'</span></div>' +
      '<div class="kcol-body" data-col="'+esc(col)+'" data-area="'+a.id+'" '+depStyle(a.id)+'>' +
      (colTasks.length ? colTasks.map(function(t){return kanbanCardHTML(t,a);}).join('') : '') +
      '</div></div>';
  }).join('') + '</div>';
}
function kanbanCardHTML(t, a){
  var overdue = isOverdue(t);
  return '<div class="kcard'+(overdue?' is-overdue':'')+'" draggable="true" data-task-card="'+t.id+'" data-open-task="'+t.id+'">' +
    '<div class="kcard-title">'+esc(t.title)+'</div>' +
    '<div class="kcard-tags"><span class="tag">'+esc(t.subcategory)+'</span><span class="pill '+priorityClass(t.priority)+'">'+t.priority+'</span>' + (overdue?'<span class="pill overdue-chip">Atrasada</span>':(isDueToday(t)?'<span class="pill due-today-chip">Hoje</span>':'')) + '</div>' +
    '<div class="kcard-foot">' + avatarHTML(t.responsibleId) + '<span class="grow" style="font-size:11px;color:var(--text-muted)">'+fmtDate(t.dueDate)+'</span>' +
    '<select data-move-task="'+t.id+'" aria-label="Mover para">' + FLOWS[a.flow].map(function(c){return '<option value="'+esc(c)+'"'+(c===t.status?' selected':'')+'>'+c+'</option>';}).join('') + '</select>' +
    '</div></div>';
}
function listTableHTML(tasks){
  tasks = tasks.slice().sort(function(a,b){ return (a.dueDate||'9999').localeCompare(b.dueDate||'9999'); });
  if(!tasks.length) return '<div class="empty-state">Nenhuma tarefa encontrada com esses filtros.</div>';
  return '<div class="table-wrap"><table><thead><tr><th>Tarefa</th><th>Área</th><th>Subcategoria</th><th>Responsável</th><th>Prioridade</th><th>Status</th><th>Prazo</th></tr></thead><tbody>' +
    tasks.map(function(t){
      return '<tr class="'+(isOverdue(t)?'row-overdue':'')+'" data-open-task="'+t.id+'"><td class="title-cell">'+esc(t.title)+'</td><td><span class="pill dep-pill" '+depStyle(t.areaId)+'>'+area(t.areaId).name+'</span></td><td>'+esc(t.subcategory)+'</td><td>'+userLabel(t.responsibleId)+'</td><td><span class="pill '+priorityClass(t.priority)+'">'+t.priority+'</span></td><td>'+esc(t.status)+'</td><td>'+ (isOverdue(t)?'<span class="tag overdue-chip">'+fmtDate(t.dueDate)+'</span>':fmtDate(t.dueDate)) +'</td></tr>';
    }).join('') + '</tbody></table></div>';
}
function calendarHTML(tasks, key){
  var base = new Date(TODAY.getFullYear(), TODAY.getMonth()+state.calMonthOffset, 1);
  var year=base.getFullYear(), month=base.getMonth();
  var first = new Date(year,month,1);
  var startOffset = (first.getDay()+6)%7; // monday-first
  var daysInMonth = new Date(year,month+1,0).getDate();
  var daysInPrev = new Date(year,month,0).getDate();
  var cells = [];
  for(var i=0;i<startOffset;i++) cells.push({day:daysInPrev-startOffset+1+i, muted:true, dateStr:null});
  for(var d=1; d<=daysInMonth; d++){
    var ds = year+'-'+String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    cells.push({day:d, muted:false, dateStr:ds, today: ds===TODAY_ISO});
  }
  while(cells.length%7!==0 || cells.length<35){ cells.push({day:cells.length, muted:true, dateStr:null}); }
  var monthLabel = base.toLocaleDateString('pt-BR',{month:'long', year:'numeric'});
  monthLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
  var wd = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
  return '<div class="cal-head" data-cal-key="'+key+'"><button class="icon-btn" data-cal-nav="-1">'+icon('chevronLeft',16)+'</button><h3>'+monthLabel+'</h3><button class="icon-btn" data-cal-nav="1">'+icon('chevronRight',16)+'</button><button class="btn btn-ghost btn-sm" data-cal-nav="0" style="margin-left:8px;">Hoje</button></div>' +
    '<div class="cal-grid">' + wd.map(function(w){return '<div class="cal-wd">'+w+'</div>';}).join('') +
    cells.map(function(c){
      if(c.muted) return '<div class="cal-day muted"></div>';
      var dayTasks = tasks.filter(function(t){return t.dueDate===c.dateStr;});
      return '<div class="cal-day'+(c.today?' today':'')+'"><div class="cal-daynum">'+c.day+'</div>' +
        dayTasks.slice(0,3).map(function(t){ return '<div class="cal-chip" '+depStyle(t.areaId)+' data-open-task="'+t.id+'">'+esc(t.title)+'</div>'; }).join('') +
        (dayTasks.length>3 ? '<div class="cal-more">+'+(dayTasks.length-3)+' mais</div>' : '') +
      '</div>';
    }).join('') + '</div>';
}

/* ---- Projects ---- */
function viewProjectsList(){
  return '<div class="section-head"><h2>Todos os projetos</h2><span class="count">'+PROJECTS.length+'</span></div><div class="projects-grid">' + PROJECTS.map(projectCardHTML).join('') + '</div>';
}
function viewProjectDetail(id){
  var p = project(id);
  if(!p) return '<div class="empty-state">Projeto não encontrado.</div>';
  var ts = tasksForProject(id);
  var pct = computeProjectProgress(p);
  var byArea = {};
  ts.forEach(function(t){ (byArea[t.areaId]=byArea[t.areaId]||[]).push(t); });
  return '<button class="btn btn-ghost btn-sm" data-nav="#/projetos" style="margin-bottom:14px;">'+icon('chevronLeft',14)+'<span>Todos os projetos</span></button>' +
    '<div class="card" style="padding:18px; margin-bottom:20px;">' +
      '<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:flex-start;"><div style="flex:1;min-width:220px;"><h2 style="margin:0 0 6px;font-size:18px;">'+esc(p.name)+'</h2><div style="color:var(--text-secondary);font-size:13px;line-height:1.5;">'+esc(p.description)+'</div></div><span class="tag">'+esc(p.status)+'</span></div>' +
      '<div class="progress-track" style="margin-top:16px;"><div class="progress-fill" style="width:'+pct+'%"></div></div>' +
      '<div class="project-meta" style="margin-top:10px;"><span><b>'+pct+'%</b> concluído</span><span>'+ts.length+' tarefas · '+ts.filter(isFinal).length+' concluídas · '+ts.filter(isOverdue).length+' atrasadas</span><span>Responsável: '+userLabel(p.responsibleId)+'</span><span>'+fmtDateLong(p.startDate)+' → '+fmtDateLong(p.dueDate)+'</span></div>' +
      '<div style="display:flex;align-items:center;gap:8px;margin-top:12px;"><span style="font-size:11.5px;color:var(--text-muted)">Participantes</span><div class="avatars-stack">'+p.participants.map(function(id){return avatarHTML(id);}).join('')+'</div></div>' +
    '</div>' +
    '<div class="section-head"><h2>Tarefas por área</h2><span class="count">independente de quem está vendo</span></div>' +
    (Object.keys(byArea).length ? AREAS.filter(function(a){return byArea[a.id];}).map(function(a){
      return '<div style="margin-bottom:18px;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><span class="nav-dot" style="background:var(--dep-'+a.dep+')"></span><b style="font-size:13px;">'+a.name+'</b><span class="count">'+byArea[a.id].length+(byArea[a.id].length===1?' tarefa':' tarefas')+'</span></div>' + listTableHTML(byArea[a.id]) + '</div>';
    }).join('') : '<div class="empty-state">Nenhuma tarefa vinculada a este projeto ainda.</div>');
}

/* ---- Minhas Tarefas ---- */
function viewMyTasks(){
  var uidc = state.currentUserId;
  var mine = TASKS.filter(function(t){ return t.responsibleId===uidc || t.requesterId===uidc || t.participants.indexOf(uidc)>-1; });
  var groups = {
    'Hoje': mine.filter(function(t){return isDueToday(t);}),
    'Atrasadas': mine.filter(isOverdue),
    'Esta semana': mine.filter(function(t){return isDueThisWeek(t) && !isDueToday(t);}),
    'Próximas': mine.filter(function(t){return t.dueDate && t.dueDate>iso(7) && !isFinal(t);}),
    'Concluídas': mine.filter(isFinal)
  };
  var html = '<div class="section-head"><h2>Tarefas de '+userLabel(uidc)+'</h2><span class="count">'+mine.length+' no total</span></div>';
  ['Atrasadas','Hoje','Esta semana','Próximas','Concluídas'].forEach(function(g){
    html += '<div class="section-head"><h2 style="font-size:13.5px;">'+g+'</h2><span class="count">'+groups[g].length+'</span></div>' + listTableHTML(groups[g]);
  });
  html += '<div class="section-head"><h2>Minha semana</h2></div>' + weekStripHTML(uidc);
  return html;
}
function weekStripHTML(uidc){
  var day0 = new Date(TODAY); var dow=(day0.getDay()+6)%7; day0.setDate(day0.getDate()-dow);
  var labels=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
  var html = '<div class="week-strip">';
  for(var i=0;i<7;i++){
    var d = new Date(day0); d.setDate(d.getDate()+i);
    var ds = d.toISOString().slice(0,10);
    var dayTasks = TASKS.filter(function(t){return t.dueDate===ds && (t.responsibleId===uidc||t.participants.indexOf(uidc)>-1);});
    html += '<div class="week-col'+(ds===TODAY_ISO?' today':'')+'"><h4>'+labels[i]+' '+d.getDate()+'</h4>' +
      (dayTasks.length? dayTasks.map(function(t){return '<div class="week-task" data-open-task="'+t.id+'">'+esc(t.title)+'</div>';}).join('') : '<div class="week-empty">Sem tarefas</div>') +
      '</div>';
  }
  return html + '</div>';
}

/* ---- Calendar page ---- */
function viewCalendarPage(){
  var f = getFilters('global-cal');
  var tasks = TASKS.filter(function(t){ return (!f.responsavel || t.responsibleId===f.responsavel) && (!f.subcat || t.areaId===f.subcat); });
  return filtersBarHTMLGlobalCal(f) + calendarHTML(tasks, 'global-cal');
}
function filtersBarHTMLGlobalCal(f){
  return '<div class="filters-bar" data-filter-key="global-cal">' +
    '<select data-filter="subcat"><option value="">Todas as áreas</option>' + AREAS.map(function(a){return '<option value="'+a.id+'"'+(f.subcat===a.id?' selected':'')+'>'+a.name+'</option>';}).join('') + '</select>' +
    '<select data-filter="responsavel"><option value="">Todos os responsáveis</option>' + USERS.map(function(u){return '<option value="'+u.id+'"'+(f.responsavel===u.id?' selected':'')+'>'+u.name+'</option>';}).join('') + '</select>' +
    '</div>';
}

/* ---- Team ---- */
function viewTeam(){
  return '<div class="team-grid">' + USERS.map(function(u){
    var open = TASKS.filter(function(t){return t.responsibleId===u.id && !isFinal(t);}).length;
    var late = TASKS.filter(function(t){return t.responsibleId===u.id && isOverdue(t);}).length;
    return '<div class="team-card">' + avatarHTML(u.id,'lg') + '<div class="meta"><div class="name">'+u.name+(u.nickname?' <span style="font-weight:500;color:var(--text-muted);">"'+u.nickname+'"</span>':'')+'</div><div class="role">'+u.roleLabel+'</div>' +
      '<div class="team-stats"><span><b>'+open+'</b> abertas</span><span style="color:'+(late?'var(--status-critical)':'inherit')+'"><b>'+late+'</b> atrasadas</span></div></div></div>';
  }).join('') + '</div>';
}

/* ---- Settings ---- */
function viewSettings(){
  var html = '<div class="settings-block"><h3>Áreas e subcategorias</h3><div class="card" style="padding:6px 16px;">' +
    AREAS.map(function(a){
      return '<div class="area-row"><span class="area-swatch" style="background:var(--dep-'+a.dep+')"></span><div><b style="font-size:13px;">'+a.name+'</b><div class="chip-row">'+a.subcats.map(function(s){return '<span class="tag">'+s+'</span>';}).join('')+'</div></div></div>';
    }).join('') + '</div></div>' +
    '<div class="settings-block"><h3>Fluxos de status por área</h3><div class="card" style="padding:14px 16px;">' +
    AREAS.map(function(a){
      return '<div style="margin-bottom:12px;"><b style="font-size:12.5px;">'+a.name+'</b><div class="flow-chain" style="margin-top:6px;">' + FLOWS[a.flow].map(function(c,i){ return (i? '<span class="arrow">→</span>':'') + '<span class="tag">'+c+'</span>'; }).join('') + '</div></div>';
    }).join('') + '</div></div>' +
    '<div class="settings-block"><h3>Usuários e papéis</h3><div class="table-wrap"><table><thead><tr><th>Nome</th><th>Papel</th><th>Área</th></tr></thead><tbody>' +
    USERS.map(function(u){ return '<tr><td>'+u.name+(u.nickname?' <span class="tag">'+u.nickname+'</span>':'')+'</td><td>'+u.roleLabel+'</td><td>'+(u.areas&&u.areas.length?u.areas.map(function(id){return area(id).name;}).join(' + '):'Todas as áreas')+'</td></tr>'; }).join('') +
    '</tbody></table></div></div>' +
    '<div class="settings-block"><h3>Sobre este protótipo</h3><div class="card" style="padding:14px 16px;font-size:12.5px;color:var(--text-secondary);line-height:1.6;">Este é um protótipo navegável com dados fictícios para validar fluxo e experiência antes da construção da versão com backend, banco de dados e autenticação real. Alterações feitas aqui (mover cards, aprovar tarefas, comentar, criar tarefas) ficam apenas na memória do navegador e são perdidas ao atualizar a página.</div></div>';
  return html;
}

/* ======================= DRAWER ======================= */
var DRAWER_TABS = [
  {id:'detalhes', label:'Detalhes'},
  {id:'checklist', label:'Checklist'},
  {id:'subtarefas', label:'Subtarefas'},
  {id:'comentarios', label:'Comentários'},
  {id:'anexos', label:'Anexos'},
  {id:'links', label:'Links'},
  {id:'dependencias', label:'Dependências'},
  {id:'historico', label:'Histórico'}
];
function openDrawer(taskId){
  state.drawerTaskId = taskId; state.drawerTab='detalhes';
  document.getElementById('drawerOverlay').classList.add('show');
  document.getElementById('taskDrawer').classList.add('open');
  renderDrawer();
}
function closeDrawer(){
  state.drawerTaskId = null;
  document.getElementById('drawerOverlay').classList.remove('show');
  document.getElementById('taskDrawer').classList.remove('open');
}
function renderDrawer(){
  var t = taskById(state.drawerTaskId);
  var el = document.getElementById('taskDrawer');
  if(!t){ el.innerHTML=''; return; }
  var a = area(t.areaId);
  var overdue = isOverdue(t);
  var head = '<div class="drawer-head"><div class="drawer-top-row"><h2>'+esc(t.title)+'</h2><button class="drawer-close" id="drawerCloseBtn">'+icon('close',16)+'</button></div>' +
    '<div class="drawer-tags"><span class="pill dep-pill" '+depStyle(t.areaId)+'>'+a.name+'</span><span class="tag">'+esc(t.subcategory)+'</span><span class="pill '+priorityClass(t.priority)+'">'+t.priority+'</span><span class="tag">'+esc(t.status)+'</span>' + (overdue?'<span class="pill overdue-chip">Atrasada</span>':'') + (t.projectId?'<span class="tag" data-open-project="'+t.projectId+'" style="cursor:pointer;color:var(--accent)">'+esc(project(t.projectId).name)+'</span>':'') + '</div>' +
    (t.status==='Aprovação' ? '<div class="approve-row"><button class="btn btn-primary btn-sm" data-approve="'+t.id+'">'+icon('thumbUp',14)+'<span>Aprovar</span></button><button class="btn btn-danger-ghost btn-sm" data-reject="'+t.id+'">'+icon('xCircle',14)+'<span>Reprovar</span></button></div>' : '') +
    '</div>';
  var tabs = '<div class="drawer-tabs">' + DRAWER_TABS.map(function(tb){
    var count = tb.id==='checklist'?t.checklist.length:tb.id==='subtarefas'?t.subtasks.length:tb.id==='comentarios'?t.comments.length:tb.id==='anexos'?t.attachments.length:tb.id==='links'?t.links.length:tb.id==='dependencias'?t.dependencies.length:null;
    return '<button class="dtab'+(state.drawerTab===tb.id?' active':'')+'" data-drawer-tab="'+tb.id+'">'+tb.label+(count?' ('+count+')':'')+'</button>';
  }).join('') + '</div>';
  el.innerHTML = head + tabs + '<div class="drawer-body">' + drawerTabBody(t,a) + '</div>';
}
function drawerTabBody(t,a){
  if(state.drawerTab==='detalhes'){
    return '<div class="desc-text" style="margin-bottom:16px;">'+esc(t.description||'Sem descrição.')+'</div>' +
      '<div class="field-two">' +
      '<div class="field-row"><label>Responsável</label><select data-field="responsibleId">'+USERS.map(function(u){return '<option value="'+u.id+'"'+(u.id===t.responsibleId?' selected':'')+'>'+u.name+'</option>';}).join('')+'</select></div>' +
      '<div class="field-row"><label>Prioridade</label><select data-field="priority">'+['Baixa','Média','Alta','Urgente'].map(function(p){return '<option value="'+p+'"'+(p===t.priority?' selected':'')+'>'+p+'</option>';}).join('')+'</select></div>' +
      '<div class="field-row"><label>Status</label><select data-field="status">'+FLOWS[a.flow].map(function(c){return '<option value="'+esc(c)+'"'+(c===t.status?' selected':'')+'>'+c+'</option>';}).join('')+'</select></div>' +
      '<div class="field-row"><label>Prazo de entrega</label><input type="date" data-field="dueDate" value="'+(t.dueDate||'')+'"></div>' +
      '</div>' +
      '<div class="field-row"><label>Solicitante</label><div style="font-size:13px;">'+userLabel(t.requesterId)+'</div></div>' +
      '<div class="field-row"><label>Participantes</label><div style="font-size:13px;">'+(t.participants.length?t.participants.map(userLabel).join(', '):'Nenhum participante além do responsável.')+'</div></div>' +
      '<div class="field-two">' +
      '<div class="field-row"><label>Criada em</label><div style="font-size:13px;">'+fmtDateLong(t.createdAt)+'</div></div>' +
      '<div class="field-row"><label>Concluída em</label><div style="font-size:13px;">'+(t.completedAt?fmtDateLong(t.completedAt):'—')+'</div></div>' +
      '</div>';
  }
  if(state.drawerTab==='checklist'){
    var doneCt = t.checklist.filter(function(c){return c.done;}).length;
    return (t.checklist.length? '<div style="font-size:11.5px;color:var(--text-muted);margin-bottom:6px;">'+doneCt+' de '+t.checklist.length+' concluídos</div>':'') +
      (t.checklist.length? t.checklist.map(function(c){ return '<label class="checklist-item'+(c.done?' done':'')+'"><input type="checkbox" data-toggle-check="'+c.id+'" '+(c.done?'checked':'')+'><span>'+esc(c.text)+'</span></label>'; }).join('') : '<div class="empty-state" style="padding:20px 0;">Nenhum item ainda.</div>') +
      '<div class="add-row"><input type="text" id="newChecklistInput" placeholder="Novo item do checklist"><button class="btn btn-ghost btn-sm" id="addChecklistBtn">Adicionar</button></div>';
  }
  if(state.drawerTab==='subtarefas'){
    return (t.subtasks.length? t.subtasks.map(function(s){ return '<div class="subtask-row"><input type="checkbox" data-toggle-subtask="'+s.id+'" '+(s.done?'checked':'')+'><span style="flex:1;'+(s.done?'text-decoration:line-through;color:var(--text-muted);':'')+'">'+esc(s.title)+'</span><span class="tag">'+userLabel(s.responsibleId)+'</span></div>'; }).join('') : '<div class="empty-state" style="padding:20px 0;">Nenhuma subtarefa ainda.</div>') +
      '<div class="add-row"><input type="text" id="newSubtaskInput" placeholder="Nova subtarefa"><button class="btn btn-ghost btn-sm" id="addSubtaskBtn">Adicionar</button></div>';
  }
  if(state.drawerTab==='comentarios'){
    return (t.comments.length? t.comments.slice().reverse().map(function(c){ return '<div class="comment">'+avatarHTML(c.authorId)+'<div class="body"><div class="head"><span class="name">'+userLabel(c.authorId)+'</span><span class="time">'+fmtDateTime(c.createdAt)+'</span></div><div class="txt">'+mentionify(c.text)+'</div></div></div>'; }).join('') : '<div class="empty-state" style="padding:20px 0;">Nenhum comentário ainda.</div>') +
      '<div class="field-row" style="margin-top:12px;"><label>Adicionar comentário (use @Nome para mencionar)</label><textarea id="newCommentInput" rows="3" placeholder="Escreva um comentário..."></textarea><div style="margin-top:8px;text-align:right;"><button class="btn btn-primary btn-sm" id="addCommentBtn">Comentar</button></div></div>';
  }
  if(state.drawerTab==='anexos'){
    return (t.attachments.length? t.attachments.map(function(f){ return '<div class="attach-row"><div class="attach-icon">'+icon('paperclip',15)+'</div><div style="flex:1;"><div style="font-weight:600;">'+esc(f.name)+'</div><div style="color:var(--text-muted);font-size:11px;">'+f.size+' · enviado por '+userLabel(f.uploadedBy)+'</div></div></div>'; }).join('') : '<div class="empty-state" style="padding:20px 0;">Nenhum anexo ainda.</div>') +
      '<div class="add-row"><input type="text" id="newAttachInput" placeholder="nome-do-arquivo.pdf"><button class="btn btn-ghost btn-sm" id="addAttachBtn">Adicionar</button></div>';
  }
  if(state.drawerTab==='links'){
    return (t.links.length? t.links.map(function(l){ return '<div class="link-row">'+icon('link',15)+'<a href="'+esc(l.url)+'" target="_blank" rel="noopener" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+esc(l.label)+'</a></div>'; }).join('') : '<div class="empty-state" style="padding:20px 0;">Nenhum link ainda.</div>') +
      '<div class="add-row"><input type="text" id="newLinkLabel" placeholder="Título" style="max-width:120px;"><input type="url" id="newLinkUrl" placeholder="https://..."><button class="btn btn-ghost btn-sm" id="addLinkBtn">Adicionar</button></div>';
  }
  if(state.drawerTab==='dependencias'){
    return (t.dependencies.length? t.dependencies.map(function(depId){ var dt=taskById(depId); if(!dt) return ''; return '<div class="dep-row" data-open-task="'+dt.id+'" style="cursor:pointer;">' + (!isFinal(dt) ? icon('warn',15) : icon('check',15)) + '<span style="flex:1;">'+esc(dt.title)+'</span><span class="tag">'+esc(dt.status)+'</span></div>'; }).join('') : '<div class="empty-state" style="padding:20px 0;">Nenhuma dependência registrada.</div>') +
      '<div style="font-size:11.5px;color:var(--text-muted);margin-top:10px;">No MVP, dependências são informativas — não bloqueiam o avanço da tarefa.</div>';
  }
  if(state.drawerTab==='historico'){
    var hist = t.history.slice().reverse();
    return (hist.length? hist.map(function(h){ return '<div class="hist-item"><span class="dot"></span><div><div><b>'+userLabel(h.by)+'</b> alterou '+h.field+(h.from?' de "'+esc(h.from)+'"':'')+' para "'+esc(h.to)+'"</div><div style="color:var(--text-muted);font-size:11px;">'+fmtDateTime(h.at)+'</div></div></div>'; }).join('') : '<div class="empty-state" style="padding:20px 0;">Nenhuma alteração registrada ainda.</div>');
  }
  return '';
}

/* ======================= NEW TASK MODAL ======================= */
function openModal(areaId){
  state.modalOpen = true; state.modalArea = areaId || (state.route.name==='area' ? state.route.params.areaId : 'marketing');
  renderModal();
}
function closeModal(){ state.modalOpen=false; document.getElementById('modal-root') && document.getElementById('modal-root').remove(); }
function renderModal(){
  var old = document.getElementById('modal-root'); if(old) old.remove();
  if(!state.modalOpen) return;
  var a = area(state.modalArea);
  var wrap = document.createElement('div');
  wrap.id='modal-root'; wrap.className='modal-overlay';
  wrap.innerHTML = '<div class="modal">' +
    '<div class="modal-head"><h2>Nova tarefa</h2><button class="drawer-close" id="modalCloseBtn" style="margin-left:auto;">'+icon('close',16)+'</button></div>' +
    '<div class="modal-body">' +
      '<div class="field-row"><label>Título*</label><input type="text" id="mTitle" placeholder="Ex: Preparar apresentação para o cliente"></div>' +
      '<div class="field-row"><label>Descrição</label><textarea id="mDesc" rows="2" placeholder="Detalhes da tarefa (opcional)"></textarea></div>' +
      '<div class="field-two">' +
        '<div class="field-row"><label>Área*</label><select id="mArea">'+AREAS.map(function(ar){return '<option value="'+ar.id+'"'+(ar.id===a.id?' selected':'')+'>'+ar.name+'</option>';}).join('')+'</select></div>' +
        '<div class="field-row"><label>Subcategoria*</label><select id="mSubcat">'+a.subcats.map(function(s){return '<option value="'+esc(s)+'">'+s+'</option>';}).join('')+'</select></div>' +
      '</div>' +
      '<div class="field-row"><label>Projeto (opcional)</label><select id="mProject"><option value="">Nenhum</option>'+PROJECTS.map(function(p){return '<option value="'+p.id+'">'+esc(p.name)+'</option>';}).join('')+'</select></div>' +
      '<div class="field-two">' +
        '<div class="field-row"><label>Solicitante</label><select id="mRequester">'+USERS.map(function(u){return '<option value="'+u.id+'"'+(u.id===state.currentUserId?' selected':'')+'>'+u.name+'</option>';}).join('')+'</select></div>' +
        '<div class="field-row"><label>Responsável</label><select id="mResponsible">'+USERS.map(function(u){return '<option value="'+u.id+'">'+u.name+'</option>';}).join('')+'</select></div>' +
      '</div>' +
      '<div class="field-two">' +
        '<div class="field-row"><label>Prioridade</label><select id="mPriority">'+['Baixa','Média','Alta','Urgente'].map(function(p){return '<option value="'+p+'"'+(p==='Média'?' selected':'')+'>'+p+'</option>';}).join('')+'</select></div>' +
        '<div class="field-row"><label>Prazo de entrega</label><input type="date" id="mDue"></div>' +
      '</div>' +
    '</div>' +
    '<div class="modal-foot"><button class="btn btn-ghost" id="modalCancelBtn">Cancelar</button><button class="btn btn-primary" id="modalSaveBtn">Criar tarefa</button></div>' +
  '</div>';
  document.body.appendChild(wrap);
  document.getElementById('mArea').addEventListener('change', function(){
    state.modalArea = this.value; renderModal();
  });
}

/* ======================= EVENT WIRING ======================= */
function wireDynamicCharts(){ /* placeholder for future chart libs; bars are CSS-based already */ }

function renderAll(){
  renderSidebar(); renderTopbar(); renderContent(); renderMobileNav();
  if(state.drawerTaskId) renderDrawer();
}

document.addEventListener('click', function(e){
  if(e.target.closest('#loginBtn')){ doLogin(); return; }
  if(e.target.closest('#forgotBtn')){ doForgot(); return; }
  if(e.target.closest('#logoutBtn')){ KMDB.signOut().then(function(){ location.hash=''; showLogin(); }); return; }

  var navBtn = e.target.closest('[data-nav]');
  if(navBtn){ navigate(navBtn.getAttribute('data-nav')); return; }

  if(e.target.closest('#sidebarClose') || e.target.closest('#sidebarOverlay')){ state.sidebarOpen=false; syncSidebar(); return; }
  if(e.target.closest('#hamburgerBtn')){ state.sidebarOpen=true; syncSidebar(); return; }
  if(e.target.closest('#mnavMore')){ state.sidebarOpen=true; syncSidebar(); return; }

  if(e.target.closest('#notifBtn')){ state.notifOpen=!state.notifOpen; renderNotifBell(); return; }
  var notifRow = e.target.closest('[data-notif]');
  if(notifRow){ var n=NOTIFICATIONS.find(function(x){return x.id===notifRow.getAttribute('data-notif');}); if(n) n.read=true; renderNotifBell(); return; }
  if(!e.target.closest('#notifPanel') && !e.target.closest('#notifBtn') && state.notifOpen){ state.notifOpen=false; renderNotifBell(); }

  if(e.target.closest('#newTaskBtn')){ openModal(); return; }
  if(e.target.closest('#modalCloseBtn') || e.target.closest('#modalCancelBtn') || e.target===document.getElementById('modal-root')){ closeModal(); return; }
  if(e.target.closest('#modalSaveBtn')){
    var title = document.getElementById('mTitle').value.trim();
    if(!title){ showToast('Dê um título para a tarefa.'); return; }
    var t = createTask({
      title:title, description:document.getElementById('mDesc').value,
      areaId:document.getElementById('mArea').value, subcategory:document.getElementById('mSubcat').value,
      projectId:document.getElementById('mProject').value||null, requesterId:document.getElementById('mRequester').value,
      responsibleId:document.getElementById('mResponsible').value, priority:document.getElementById('mPriority').value,
      dueDate:document.getElementById('mDue').value||null
    });
    closeModal(); showToast('Tarefa criada.'); renderContent();
    return;
  }

  var dismissBanner = e.target.closest('[data-dismiss-banner]');
  if(dismissBanner){ state.bannerDismissed=true; renderContent(); return; }

  var openTask = e.target.closest('[data-open-task]');
  if(openTask && !e.target.closest('select')){ openDrawer(openTask.getAttribute('data-open-task')); return; }
  if(e.target.closest('#drawerCloseBtn') || e.target.closest('#drawerOverlay')){ closeDrawer(); return; }

  var openProj = e.target.closest('[data-open-project]');
  if(openProj){ closeDrawer(); navigate('#/projetos/'+openProj.getAttribute('data-open-project')); return; }

  var dtab = e.target.closest('[data-drawer-tab]');
  if(dtab){ state.drawerTab = dtab.getAttribute('data-drawer-tab'); renderDrawer(); return; }

  var approveBtn = e.target.closest('[data-approve]');
  if(approveBtn){ approveTask(approveBtn.getAttribute('data-approve')); renderDrawer(); renderContent(); return; }
  var rejectBtn = e.target.closest('[data-reject]');
  if(rejectBtn){ rejectTask(rejectBtn.getAttribute('data-reject')); renderDrawer(); renderContent(); return; }

  if(e.target.closest('#addChecklistBtn')){ var el=document.getElementById('newChecklistInput'); addChecklistItem(state.drawerTaskId, el.value); el.value=''; renderDrawer(); return; }
  if(e.target.closest('#addSubtaskBtn')){ var el2=document.getElementById('newSubtaskInput'); addSubtask(state.drawerTaskId, el2.value); el2.value=''; renderDrawer(); return; }
  if(e.target.closest('#addCommentBtn')){ var el3=document.getElementById('newCommentInput'); addComment(state.drawerTaskId, el3.value); el3.value=''; renderDrawer(); return; }
  if(e.target.closest('#addAttachBtn')){ var el4=document.getElementById('newAttachInput'); addAttachment(state.drawerTaskId, el4.value); el4.value=''; renderDrawer(); return; }
  if(e.target.closest('#addLinkBtn')){ var lu=document.getElementById('newLinkUrl'), ll=document.getElementById('newLinkLabel'); addLink(state.drawerTaskId, lu.value, ll.value); lu.value=''; ll.value=''; renderDrawer(); return; }

  var areaViewBtn = e.target.closest('[data-area-view]');
  if(areaViewBtn){ var parts=areaViewBtn.getAttribute('data-area-view').split('|'); navigate('#/area/'+parts[0]+'?view='+parts[1]); return; }

  var calNav = e.target.closest('[data-cal-nav]');
  if(calNav){ var dv=calNav.getAttribute('data-cal-nav'); state.calMonthOffset = dv==='0'?0:state.calMonthOffset+parseInt(dv,10); renderContent(); return; }
});

document.addEventListener('change', function(e){
  if(e.target.matches('[data-move-task]')){
    moveTask(e.target.getAttribute('data-move-task'), e.target.value);
    renderContent();
    return;
  }
  if(e.target.matches('[data-filter]')){
    var bar = e.target.closest('[data-filter-key]'); var key = bar.getAttribute('data-filter-key');
    var f = getFilters(key); f[e.target.getAttribute('data-filter')] = e.target.value;
    renderContent();
    return;
  }
  if(e.target.matches('[data-field]')){
    var field = e.target.getAttribute('data-field');
    updateTaskField(state.drawerTaskId, field, e.target.value);
    renderDrawer(); renderContent();
    return;
  }
  if(e.target.matches('[data-toggle-check]')){ toggleChecklist(state.drawerTaskId, e.target.getAttribute('data-toggle-check')); renderDrawer(); return; }
  if(e.target.matches('[data-toggle-subtask]')){ toggleSubtask(state.drawerTaskId, e.target.getAttribute('data-toggle-subtask')); renderDrawer(); return; }
});

/* drag & drop */
document.addEventListener('dragstart', function(e){
  var card = e.target.closest('[data-task-card]');
  if(card){ e.dataTransfer.setData('text/plain', card.getAttribute('data-task-card')); card.classList.add('dragging'); }
});
document.addEventListener('dragend', function(e){
  var card = e.target.closest('[data-task-card]');
  if(card) card.classList.remove('dragging');
});
document.addEventListener('dragover', function(e){
  var col = e.target.closest('[data-col]');
  if(col){ e.preventDefault(); col.classList.add('drag-over'); }
});
document.addEventListener('dragleave', function(e){
  var col = e.target.closest('[data-col]');
  if(col) col.classList.remove('drag-over');
});
document.addEventListener('drop', function(e){
  var col = e.target.closest('[data-col]');
  if(col){
    e.preventDefault(); col.classList.remove('drag-over');
    var taskId = e.dataTransfer.getData('text/plain');
    if(taskId) moveTask(taskId, col.getAttribute('data-col'));
    renderContent();
  }
});

function syncSidebar(){
  document.getElementById('sidebar').classList.toggle('open', state.sidebarOpen);
  document.getElementById('sidebarOverlay').classList.toggle('show', state.sidebarOpen);
}

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
