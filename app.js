(function(){
"use strict";
var KM = window.KM;
var KMDB = window.KMDB;
var esc = KM.esc;

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
      showLoadError(e);
      return false;
    }
  }
  return tryLoad();
}
function showLoadError(e){
  var detail = e ? String((e && e.message) || e) : '';
  document.getElementById('content').innerHTML =
    '<div class="app-error">Não foi possível carregar os dados.<br><br>' +
    (detail ? '<div class="login-error" style="min-height:auto;white-space:pre-wrap;margin-bottom:14px;">'+esc(detail)+'</div>' : '') +
    '<button class="btn btn-primary" id="retryLoadBtn">Tentar de novo</button></div>';
}
async function refreshData(){
  try{
    var data = await KMDB.loadAll();
    USERS=data.users; AREAS=data.areas; PROJECTS=data.projects; TASKS=data.tasks; NOTIFICATIONS=data.notifications;
    if(data.me){ state.me=data.me; }
    renderAll();
  }catch(e){ /* mantém dados atuais; silencioso */ }
}

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
    chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/>',
    moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
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
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6h.01"/>',
    mapa:'<circle cx="5" cy="12" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M7 12h4M11 12l5-5M11 12l5 5"/>'
  };
  return p + (paths[name]||'') + '</svg>';
}

/* ======================= TEMA (claro/escuro) ======================= */
function currentTheme(){
  var attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'light' || attr === 'dark') return attr;
  var saved; try { saved = localStorage.getItem('km-theme'); } catch(e){}
  return KM.normalizeTheme(saved);
}
function applyTheme(tema){
  tema = KM.normalizeTheme(tema);
  document.documentElement.setAttribute('data-theme', tema);
  try { localStorage.setItem('km-theme', tema); } catch(e){}
  var btn = document.getElementById('themeToggleBtn');
  if (btn) btn.innerHTML = icon(tema === 'dark' ? 'moon' : 'sun', 18);
  var mf = document.getElementById('metricsFrame');
  if (mf) { try { mf.contentWindow.location.reload(); } catch(e){ mf.src = mf.src; } }
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

var USERS = [];
function user(id){ return USERS.find(function(u){return u.id===id;}); }

var FLOWS = KM.FLOWS, FINAL_STATUSES = KM.FINAL_STATUSES, RETURN_RULES = KM.RETURN_RULES;

var AREAS = [];
function area(id){ return AREAS.find(function(a){return a.id===id;}); }

var PROJECTS = [];
function project(id){ return PROJECTS.find(function(p){return p.id===id;}); }

function mkTask(o){
  return Object.assign({
    id: uid('t'), projectId:null, participants:[], checklist:[], subtasks:[], comments:[], attachments:[], links:[], dependencies:[], history:[],
    createdAt: iso(-3), startDate:null, completedAt:null
  }, o);
}

var TASKS = [];

var NOTIFICATIONS = [];

/* ======================= STATE ======================= */
var state = {
  currentUserId:null,
  route:{name:'dashboard', params:{}, view:'kanban'},
  drawerTaskId:null,
  drawerTab:'detalhes',
  modalOpen:false,
  modalArea:'marketing',
  projectModalOpen:false,
  projectModalId:null,
  bannerDismissed:false,
  calMonthOffset:0,
  filters:{}, // per areaId key -> {responsavel, subcat, prioridade, prazo}
  sidebarOpen:false,
  notifOpen:false,
  mindmaps:[], mapLoaded:false, currentMapId:null, map:null,
  mapSelectedNodeId:null, mapSaveState:'salvo', mapMoveMode:false
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
function depStyle(areaId){ var a=area(areaId); return 'style="--dep-rgb:'+hexOrTokenRGB(a)+'"'; }
function depColorVar(areaId){ return areaColorCSS(area(areaId)); }
function hexOrTokenRGB(a){
  var tokens={marketing:'237,161,0',design:'232,123,164',admin:'235,104,52',financeiro:'27,175,122',comercial:'42,120,214'};
  if(tokens[a.color]) return 'var(--dep-'+a.color+'-rgb)';
  // hex -> "r,g,b"
  var h=a.color.replace('#',''); if(h.length===3){ h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2]; }
  var n=parseInt(h,16); return [(n>>16)&255,(n>>8)&255,n&255].join(',');
}
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
function val(id){ var el=document.getElementById(id); return el?el.value.trim():''; }
function showToast(msg){
  var el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(showToast._tm);
  showToast._tm = setTimeout(function(){ el.classList.remove('show'); }, 2600);
}

/* ---- mutation actions ---- */
function snapshot(t){ return JSON.parse(JSON.stringify(t)); }
async function persistTask(t, prevSnapshot, okMsg){
  try{
    var saved = await KMDB.updateTask(t.id, t);
    Object.assign(t, saved);
    if(okMsg) showToast(okMsg);
    return true;
  }catch(e){
    if(prevSnapshot){ Object.assign(t, prevSnapshot); }
    showToast('Não foi possível salvar — tente de novo.');
    renderContent(); if(state.drawerTaskId) renderDrawer();
    return false;
  }
}
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
function updateTaskField(taskId, field, value){
  var t=taskById(taskId); if(!t) return;
  var old = t[field]; if(old===value) return;
  var prev = snapshot(t);
  t[field]=value;
  var labelMap={responsibleId:'responsável',priority:'prioridade',dueDate:'prazo de entrega',startDate:'data de início',title:'título',description:'descrição',projectId:'projeto',participants:'participantes',subcategory:'subcategoria'};
  function fieldLabel(f,v){
    if(f==='responsibleId') return userLabel(v);
    if(f==='projectId') return v && project(v) ? project(v).name : '—';
    if(f==='participants') return (v && v.length) ? v.map(userLabel).join(', ') : '—';
    return v || '—';
  }
  pushHistory(t, labelMap[field]||field, fieldLabel(field,old), fieldLabel(field,value));
  var p = persistTask(t, prev);
  if(field==='responsibleId' && value && value!==state.currentUserId){
    p.then(function(ok){ if(ok){ KMDB.insertNotifications([{ user_id:value, task_id:t.id, text:userLabel(state.currentUserId)+' atribuiu a você a tarefa "'+t.title+'".' }]).catch(function(){}); } });
  }
  if(field==='participants'){
    var oldArr = old || [];
    var added = (value||[]).filter(function(id){ return oldArr.indexOf(id)===-1 && id!==state.currentUserId; });
    if(added.length){
      p.then(function(ok){ if(ok){ KMDB.insertNotifications(added.map(function(participantId){ return { user_id:participantId, task_id:t.id, text:userLabel(state.currentUserId)+' adicionou você como participante da tarefa "'+t.title+'".' }; })).catch(function(){}); } });
    }
  }
}
function changeTaskArea(taskId, newAreaId){
  var t=taskById(taskId); if(!t) return;
  var na=area(newAreaId); if(!na || t.areaId===newAreaId) return;
  var prev=snapshot(t);
  var oldArea=area(t.areaId); var oldAreaName=oldArea?oldArea.name:t.areaId;
  var oldSub=t.subcategory, oldStatus=t.status;
  t.areaId=newAreaId;
  // subcategoria sempre reseta: cada área tem a própria lista
  t.subcategory=(na.subcats&&na.subcats.length)?na.subcats[0]:'';
  // status só reseta se não existir no fluxo da nova área
  var cols=FLOWS[na.flow]||[];
  if(cols.indexOf(t.status)===-1){ t.status=cols[0]||t.status; }
  if(!KM.isFinalStatus(na.flow, t.status)){ t.completedAt=null; }
  pushHistory(t,'área',oldAreaName,na.name);
  if(oldSub!==t.subcategory) pushHistory(t,'subcategoria',oldSub,t.subcategory);
  if(oldStatus!==t.status) pushHistory(t,'status',oldStatus,t.status);
  persistTask(t, prev);
}
function addChecklistItem(taskId, text){
  if(!text.trim()) return;
  var t=taskById(taskId); var prev = snapshot(t);
  t.checklist.push({id:uid('ck'), text:text.trim(), done:false});
  persistTask(t, prev);
}
function toggleChecklist(taskId, itemId){
  var t=taskById(taskId); var it=t.checklist.find(function(i){return i.id===itemId;}); if(!it) return;
  var prev = snapshot(t);
  it.done=!it.done;
  persistTask(t, prev);
}
function addSubtask(taskId, title){
  if(!title.trim()) return;
  var t=taskById(taskId); var prev = snapshot(t);
  t.subtasks.push({id:uid('st'), title:title.trim(), done:false, responsibleId:t.responsibleId});
  persistTask(t, prev);
}
function toggleSubtask(taskId, stId){
  var t=taskById(taskId); var s=t.subtasks.find(function(i){return i.id===stId;}); if(!s) return;
  var prev = snapshot(t);
  s.done=!s.done;
  persistTask(t, prev);
}
async function addComment(taskId, text){
  if(!text.trim()) return;
  var t=taskById(taskId); var prev = snapshot(t);
  t.comments.push({id:uid('cm'), authorId:state.currentUserId, text:text.trim(), createdAt:nowISOTime()});
  var notifRows=[];
  USERS.forEach(function(u){
    if(u.id===state.currentUserId) return;
    var first=u.name.split(' ')[0];
    if(text.indexOf('@'+u.name)>-1 || text.indexOf('@'+first)>-1){
      notifRows.push({ user_id:u.id, task_id:t.id, text:userLabel(state.currentUserId)+' mencionou você em "'+t.title+'".' });
    }
  });
  var ok = await persistTask(t, prev);
  if(ok && notifRows.length){ KMDB.insertNotifications(notifRows).catch(function(){}); showToast('Notificação enviada.'); }
}
function uploadAttachment(taskId, file){
  var t=taskById(taskId); if(!t) return;
  showToast('Enviando anexo...');
  KMDB.uploadFile(file).then(function(res){
    var prev = snapshot(t);
    t.attachments.push({id:uid('at'), name:file.name, url:res.url, path:res.path, size:(file.size/1048576).toFixed(2)+' MB', uploadedBy:state.currentUserId, createdAt:nowISOTime()});
    persistTask(t, prev, 'Anexo enviado.').then(function(){ if(state.drawerTaskId) renderDrawer(); });
  }).catch(function(){ showToast('Falha ao enviar o anexo (o armazenamento está configurado?).'); });
}
function addLink(taskId, url, label){
  if(!url.trim()) return;
  var t=taskById(taskId); var prev = snapshot(t);
  t.links.push({id:uid('lk'), url:url.trim(), label:(label.trim()||url.trim())});
  persistTask(t, prev);
}
function createTask(data){
  var a = area(data.areaId);
  var t = mkTask({
    title:data.title, description:data.description||'', areaId:data.areaId, subcategory:data.subcategory,
    projectId:data.projectId||null, requesterId:data.requesterId, responsibleId:data.responsibleId,
    priority:data.priority, status:FLOWS[a.flow][0], startDate:data.startDate||null, dueDate:data.dueDate||null, createdAt:TODAY_ISO
  });
  t.history.push({id:uid('h'), field:'criação', from:null, to:'Tarefa criada', at:nowISOTime(), by:state.currentUserId});
  KMDB.insertTask(t).then(function(saved){
    TASKS.push(saved); renderContent();
    if(saved.responsibleId && saved.responsibleId !== state.currentUserId){
      KMDB.insertNotifications([{ user_id:saved.responsibleId, task_id:saved.id, text:userLabel(state.currentUserId)+' atribuiu a você a tarefa "'+saved.title+'".' }]).catch(function(){});
    }
  }).catch(function(){ showToast('Não foi possível criar a tarefa — tente de novo.'); });
  return t;
}
function deleteProject(id){
  var p=project(id); if(!p) return;
  if(!window.confirm('Excluir o projeto "'+p.name+'"? As tarefas dele continuam existindo, apenas sem projeto vinculado.')) return;
  KMDB.setProjectActive(id, false).then(function(){
    PROJECTS = PROJECTS.filter(function(x){ return x.id!==id; });
    navigate('#/projetos'); showToast('Projeto excluído.');
  }).catch(function(){ showToast('Não foi possível excluir o projeto.'); });
}
function deleteTask(taskId){
  var t=taskById(taskId); if(!t) return;
  if(!window.confirm('Excluir a tarefa "'+t.title+'"? Ela sai das listas e dos quadros (o histórico fica preservado no banco).')) return;
  KMDB.setTaskActive(taskId, false).then(function(){
    TASKS = TASKS.filter(function(x){ return x.id!==taskId; });
    closeDrawer(); renderContent(); showToast('Tarefa excluída.');
  }).catch(function(){ showToast('Não foi possível excluir — tente de novo.'); });
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
  closeDrawer(); closeModal(); closeProjectModal(); state.notifOpen=false;
  renderAll();
  if(state.me){ refreshData(); }
}

/* ======================= RENDER: SHELL ======================= */
var NAV_MAIN = [
  {route:'#/dashboard', label:'Visão Geral', icon:'dashboard', match:'dashboard'},
  {route:'#/projetos', label:'Projetos', icon:'projects', match:'projetos,projeto'}
];
var NAV_AFTER_AREAS = [
  {route:'#/minhas-tarefas', label:'Minhas Tarefas', icon:'tasks', match:'minhas-tarefas'},
  {route:'#/calendario', label:'Calendário', icon:'calendar', match:'calendario'},
  {route:'#/metricas', label:'Métricas de Redes Sociais', icon:'chart', match:'metricas'},
  {route:'#/mapas', label:'Mapas Mentais', icon:'mapa', match:'mapas'},
  {route:'#/equipe', label:'Equipe', icon:'team', match:'equipe'},
  {route:'#/configuracoes', label:'Configurações', icon:'settings', match:'configuracoes'}
];
var AREA_ICON = {marketing:'marketing', administracao:'admin', design:'design', financeiro:'finance', comercial:'sales'};
function areaColorCSS(a){
  // áreas originais usam token de cor (marketing, design...); novas usam hex.
  var tokens = ['marketing','design','admin','financeiro','comercial'];
  return tokens.indexOf(a.color)>-1 ? 'var(--dep-'+a.color+')' : a.color;
}

function renderSidebar(){
  var r = state.route;
  function itemHTML(it){
    var active = it.match.split(',').indexOf(r.name)>-1;
    return '<button class="nav-item'+(active?' active':'')+'" data-nav="'+it.route+'">'+icon(it.icon)+'<span>'+it.label+'</span></button>';
  }
  document.getElementById('navMain').innerHTML = NAV_MAIN.map(itemHTML).join('');
  var todasActive = r.name==='todas';
  var todasItem = '<button class="nav-item'+(todasActive?' active':'')+'" data-nav="#/todas"><span class="nav-dot" style="background:var(--text-muted)"></span><span>Todas</span></button>';
  document.getElementById('navAreas').innerHTML = todasItem + AREAS.map(function(a){
    var active = r.name==='area' && r.params.areaId===a.id;
    return '<button class="nav-item'+(active?' active':'')+'" data-nav="#/area/'+a.id+'"><span class="nav-dot" style="background:'+areaColorCSS(a)+'"></span><span>'+a.name+'</span></button>';
  }).join('');
  document.getElementById('navFooterLinks').innerHTML = NAV_AFTER_AREAS.map(itemHTML).join('');

  var footer = document.querySelector('.sidebar-footer .user-switch');
  if(footer){
    footer.innerHTML = '<div class="avatar" id="currentUserAvatar">'+esc(initialsOf(state.currentUserId))+'</div>' +
      '<div style="flex:1;min-width:0;"><div style="font-weight:700;font-size:13px;">'+esc(userLabel(state.currentUserId))+'</div></div>' +
      '<button class="btn btn-ghost btn-sm" id="logoutBtn">Sair</button>';
  }
}

function pageTitleFor(r){
  if(r.name==='dashboard') return ['Visão Geral', 'Panorama de todas as áreas e projetos'];
  if(r.name==='todas') return ['Todas', 'Todas as tarefas, de todas as áreas, de uma vez'];
  if(r.name==='area') return [area(r.params.areaId).name, 'Quadro de tarefas da área'];
  if(r.name==='projetos') return ['Projetos', 'Iniciativas que cruzam várias áreas'];
  if(r.name==='projeto') return [project(r.params.id) ? project(r.params.id).name : 'Projeto', 'Todas as tarefas deste projeto, de qualquer área'];
  if(r.name==='minhas-tarefas') return ['Minhas Tarefas', 'Sua visão pessoal de prazos e prioridades'];
  if(r.name==='calendario') return ['Calendário', 'Todos os prazos da empresa'];
  if(r.name==='equipe') return ['Equipe', 'Carga de trabalho por pessoa'];
  if(r.name==='configuracoes') return ['Configurações', 'Áreas, fluxos e usuários'];
  if(r.name==='metricas') return ['Métricas de Redes Sociais', 'Redes sociais da Kabelera'];
  if(r.name==='mapas') return ['Mapas Mentais', 'Seus mapas de campanha'];
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
  else if(r.name==='todas') el.innerHTML = viewTodas(r.query.view||'lista');
  else if(r.name==='area') el.innerHTML = viewArea(r.params.areaId, r.query.view||'kanban');
  else if(r.name==='projetos') el.innerHTML = viewProjectsList();
  else if(r.name==='projeto') el.innerHTML = viewProjectDetail(r.params.id);
  else if(r.name==='minhas-tarefas') el.innerHTML = viewMyTasks();
  else if(r.name==='calendario') el.innerHTML = viewCalendarPage();
  else if(r.name==='equipe') el.innerHTML = viewTeam();
  else if(r.name==='configuracoes') el.innerHTML = viewSettings();
  else if(r.name==='metricas') el.innerHTML = viewMetrics();
  else if(r.name==='mapas') el.innerHTML = viewMindmaps();
  else el.innerHTML = '<div class="empty-state">Página não encontrada.</div>';
  wireDynamicCharts();
  if(r.name==='mapas' && state.currentMapId) renderMapStage();
}

/* ---- Métricas (relatório de redes sociais embutido) ---- */
function viewMetrics(){
  return '<div class="metrics-wrap">' +
    '<iframe id="metricsFrame" class="metrics-frame" src="relatorios/redes-sociais.html?v=1" title="Relatório de redes sociais da Kabelera"></iframe>' +
    '</div>';
}

/* ======================= MAPAS MENTAIS ======================= */
var MAP_SWATCHES = ['#fffa2a','#db0808','#2f80ed','#27ae60','#9b51e0','#e8590c'];

function viewMindmaps(){
  if(state.currentMapId) return viewMapEditor();
  if(!state.mapLoaded){
    KMDB.listMindmaps().then(function(list){ state.mindmaps=list; state.mapLoaded=true; if(state.route.name==='mapas' && !state.currentMapId) renderContent(); })
      .catch(function(){ showToast('Não foi possível carregar os mapas.'); });
    return '<div class="empty-state" style="padding:40px 0;">Carregando mapas...</div>';
  }
  var cards = state.mindmaps.map(function(m){
    return '<div class="mapcard" data-open-map="'+m.id+'">'+
      '<div class="mapcard-thumb"></div>'+
      '<b>'+esc(m.title)+'</b>'+
      '<div class="mapcard-row"><small>'+fmtDateLong((m.createdAt||'').slice(0,10))+'</small>'+
      '<span class="trash" data-del-map="'+m.id+'">excluir</span></div></div>';
  }).join('');
  return '<div class="mm-head"><h3 style="margin:0;">Mapas Mentais</h3><button class="btn btn-primary" id="newMapBtn">'+icon('plus',16)+'<span>Novo mapa</span></button></div>'+
    '<div class="maps-grid">'+(cards || '<div class="empty-state">Nenhum mapa ainda. Crie o primeiro.</div>')+'</div>';
}

function viewMapEditor(){
  var m=state.map; if(!m) return '';
  var sel=state.mapSelectedNodeId; var isRoot = m.data && sel===m.data.id;
  var selNode = KM.mmFind(m.data, sel);
  var saveTxt = state.mapSaveState==='salvando'?'salvando...':state.mapSaveState==='erro'?'erro ao salvar':'salvo';
  var bar = '<div class="mm-actionbar">'+
    '<span class="mm-sel">Ramo: <b>'+(selNode?esc(selNode.text):'—')+'</b></span>'+
    '<button class="chip" data-mm="child">+ ramo filho</button>'+
    '<button class="chip" data-mm="sibling"'+(isRoot?' disabled':'')+'>+ ramo irmão</button>'+
    '<button class="chip" data-mm="rename">renomear</button>'+
    '<span class="chip">cor <input type="color" id="mmColor" value="'+(selNode?KM.mmSafeColor(selNode.color):'#2f80ed')+'">'+
      '<span class="mm-swatches">'+MAP_SWATCHES.map(function(c){return '<span class="mm-sw" data-mm-color="'+c+'" style="background:'+c+'"></span>';}).join('')+'</span></span>'+
    '<button class="chip'+(state.mapMoveMode?' chip-on':'')+'" data-mm="move"'+(isRoot?' disabled':'')+'>mover</button>'+
    '<button class="chip chip-danger" data-mm="delete"'+(isRoot?' disabled':'')+'>excluir</button>'+
    '</div>';
  return '<div class="mm-top"><button class="btn btn-ghost btn-sm" id="mapBackBtn">'+icon('chevronLeft',14)+'<span>voltar</span></button>'+
    '<span class="mm-name">'+esc(m.title)+'</span>'+
    '<span class="mm-save mm-save-'+state.mapSaveState+'">'+saveTxt+'</span></div>'+
    bar + (state.mapMoveMode?'<div class="mm-movehint">Toque no ramo-destino pra pendurar o ramo ali.</div>':'')+
    '<div class="mm-canvas"><div class="mm-stage" id="mmStage"></div></div>';
}

function renderMapStage(){
  var stage=document.getElementById('mmStage'); if(!stage||!state.map) return;
  var root=state.map.data; if(!root || !root.id){ stage.innerHTML='<div class="empty-state">Mapa vazio.</div>'; return; }
  stage.innerHTML='';
  var COLW=210, GAP=40, Y0=16;
  var pos={}; KM.mmLayout(root,{colW:COLW,gap:GAP,startY:Y0}).forEach(function(p){ pos[p.id]=p; });
  var nodes=[];
  (function walk(n){
    var p=pos[n.id]; if(!p) return;
    var c=KM.mmSafeColor(n.color);
    var el=document.createElement('div');
    el.className='mm-node'+(n.id===state.mapSelectedNodeId?' sel':'');
    el.style.setProperty('--c',c); el.style.left=p.x+'px'; el.style.top=p.y+'px';
    el.setAttribute('data-node',n.id); el.setAttribute('draggable','true');
    el.textContent=n.text;
    var kids=n.children||[];
    if(kids.length){ var cc=document.createElement('span'); cc.className='mm-collapse'; cc.setAttribute('data-collapse',n.id); cc.textContent=n.collapsed?'+':'–'; el.appendChild(cc); }
    stage.appendChild(el); n._el=el; nodes.push(n);
    if(!n.collapsed) kids.forEach(walk);
  })(root);
  var maxY=0,maxX=0; nodes.forEach(function(n){ maxY=Math.max(maxY,pos[n.id].y); maxX=Math.max(maxX,pos[n.id].x+n._el.offsetWidth); });
  stage.style.height=(maxY+40)+'px'; stage.style.minWidth=(maxX+20)+'px';
  var svgns='http://www.w3.org/2000/svg';
  var svg=document.createElementNS(svgns,'svg'); svg.setAttribute('class','mm-wires');
  (function wire(n){
    if(n.collapsed) return;
    (n.children||[]).forEach(function(k){
      if(!pos[k.id]||!k._el) return;
      var x1=n._el.offsetLeft+n._el.offsetWidth, y1=pos[n.id].y, x2=k._el.offsetLeft, y2=pos[k.id].y, mx=(x1+x2)/2;
      var path=document.createElementNS(svgns,'path');
      path.setAttribute('d','M '+x1+' '+y1+' C '+mx+' '+y1+', '+mx+' '+y2+', '+x2+' '+y2);
      path.setAttribute('fill','none'); path.setAttribute('stroke',KM.mmSafeColor(k.color));
      path.setAttribute('stroke-width','1.4'); path.setAttribute('stroke-linecap','round'); path.setAttribute('opacity','0.85');
      svg.appendChild(path);
      var dot=document.createElementNS(svgns,'circle'); dot.setAttribute('cx',x2); dot.setAttribute('cy',y2); dot.setAttribute('r','2.2'); dot.setAttribute('fill',KM.mmSafeColor(k.color));
      svg.appendChild(dot);
      wire(k);
    });
  })(root);
  stage.insertBefore(svg, stage.firstChild);
}

/* ---- mapas: fluxo e persistência ---- */
var _mapSaveTimer=null;
function mapMutate(fn){
  if(!state.map) return;
  fn(state.map.data);
  state.mapSaveState='salvando';
  renderContent();
  clearTimeout(_mapSaveTimer);
  _mapSaveTimer=setTimeout(mapAutosave, 800);
}
function mapAutosave(){
  if(!state.map) return;
  var id=state.map.id;
  KMDB.updateMindmap(id,{ title: state.map.title, data: state.map.data })
    .then(function(){ if(state.map && state.map.id===id){ state.mapSaveState='salvo'; updateSaveBadge(); } })
    .catch(function(){ if(state.map && state.map.id===id){ state.mapSaveState='erro'; updateSaveBadge(); showToast('Não foi possível salvar o mapa.'); } });
}
function updateSaveBadge(){
  var b=document.querySelector('.mm-save'); if(!b) return;
  b.className='mm-save mm-save-'+state.mapSaveState;
  b.textContent=state.mapSaveState==='salvando'?'salvando...':state.mapSaveState==='erro'?'erro ao salvar':'salvo';
}
function openSimplePrompt(titulo, label, cb, valorInicial){
  var old=document.getElementById('mm-prompt-root'); if(old) old.remove();
  var wrap=document.createElement('div'); wrap.id='mm-prompt-root'; wrap.className='modal-overlay';
  wrap.innerHTML='<div class="modal" style="max-width:420px;">'+
    '<div class="modal-head"><h2>'+esc(titulo)+'</h2><button class="drawer-close" id="mmPromptClose" style="margin-left:auto;">'+icon('close',16)+'</button></div>'+
    '<div class="modal-body"><div class="field-row"><label>'+esc(label)+'</label><input type="text" id="mmPromptInput" value="'+esc(valorInicial||'')+'"></div></div>'+
    '<div class="modal-foot"><button class="btn btn-ghost" id="mmPromptCancel">Cancelar</button><button class="btn btn-primary" id="mmPromptOk">Salvar</button></div>'+
    '</div>';
  document.body.appendChild(wrap);
  var input=document.getElementById('mmPromptInput'); input.focus(); input.select();
  function close(){ wrap.remove(); }
  function ok(){ var v=input.value; close(); cb(v); }
  document.getElementById('mmPromptClose').onclick=close;
  document.getElementById('mmPromptCancel').onclick=close;
  document.getElementById('mmPromptOk').onclick=ok;
  wrap.addEventListener('click', function(e){ if(e.target===wrap) close(); });
  input.addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); ok(); } if(e.key==='Escape'){ close(); } });
}
function createMapFlow(){
  openSimplePrompt('Novo mapa', 'Nome do mapa', function(nome){
    if(!nome || !nome.trim()) return;
    var root = KM.mmNewNode(nome.trim(), '#fffa2a');
    KMDB.insertMindmap(nome.trim(), root).then(function(m){
      state.mapLoaded=false; state.currentMapId=m.id; state.map=m; state.mapSelectedNodeId=root.id; state.mapSaveState='salvo';
      renderContent();
    }).catch(function(){ showToast('Não foi possível criar o mapa.'); });
  });
}
function openMap(id){
  KMDB.getMindmap(id).then(function(m){
    state.currentMapId=m.id; state.map=m;
    state.mapSelectedNodeId = m.data && m.data.id ? m.data.id : null;
    state.mapSaveState='salvo'; state.mapMoveMode=false;
    renderContent();
  }).catch(function(){ showToast('Não foi possível abrir o mapa.'); });
}
function backToMapList(){ state.currentMapId=null; state.map=null; state.mapLoaded=false; state.mapMoveMode=false; renderContent(); }
function deleteMap(id){
  if(!window.confirm('Excluir este mapa? Ele sai da lista.')) return;
  KMDB.setMindmapActive(id,false).then(function(){ state.mapLoaded=false; renderContent(); })
    .catch(function(){ showToast('Não foi possível excluir o mapa.'); });
}
function mapRenameNode(id){
  var n=KM.mmFind(state.map.data,id); if(!n) return;
  openSimplePrompt('Renomear ramo','Texto do ramo', function(novo){
    if(novo===null||novo===undefined) return; var txt=novo.trim(); if(!txt) return;
    mapMutate(function(root){ KM.mmUpdate(root,id,{text:txt}); if(root.id===id) state.map.title=txt; });
  }, n.text);
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

  var byArea = AREAS.map(function(a){ return {label:a.name, value:tasksForArea(a.id).filter(function(t){return !isFinal(t);}).length, color:areaColorCSS(a)}; });
  var byUser = USERS.map(function(u){ return {label:u.name.split(' ')[0], value:TASKS.filter(function(t){return t.responsibleId===u.id && !isFinal(t);}).length}; })
    .filter(function(d){return d.value>0;}).sort(function(a,b){return b.value-a.value;});

  var banner = '';

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
function viewTodas(view){
  var f = getFilters('todas');
  var tasks = TASKS.filter(function(t){ return matchesFilters(t, f); });
  var tabs = ['lista','calendario'];
  var labels = {lista:'Lista', calendario:'Calendário'};
  var html = '<div class="view-tabs">' + tabs.map(function(v){
    return '<button class="view-tab'+(v===view?' active':'')+'" data-todas-view="'+v+'">'+labels[v]+'</button>';
  }).join('') + '</div>';
  html += filtersBarHTML('todas', null);
  if(view==='calendario') html += calendarHTML(tasks, 'todas');
  else html += listTableHTML(tasks);
  return html;
}
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
  else if(view==='gantt') html += ganttHTML(a, tasks);
  else if(view==='timeline') html += timelineHTML(a, tasks);
  else html += '<div class="empty-state">Visualização indisponível.</div>';
  return html;
}
function filtersBarHTML(key, a){
  var f = getFilters(key);
  var members = USERS;
  var subcats = a ? a.subcats : [];
  return '<div class="filters-bar" data-filter-key="'+key+'">' +
    '<select data-filter="responsavel"><option value="">Todos os responsáveis</option>' + members.map(function(u){return '<option value="'+u.id+'"'+(f.responsavel===u.id?' selected':'')+'>'+esc(u.name)+'</option>';}).join('') + '</select>' +
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
    '<div class="kcard-foot">' + avatarHTML(t.responsibleId) + '<span class="grow" style="font-size:11px;color:var(--text-muted)">'+(t.startDate?fmtDate(t.startDate)+' → ':'')+fmtDate(t.dueDate)+'</span>' +
    '<select data-move-task="'+t.id+'" aria-label="Mover para">' + FLOWS[a.flow].map(function(c){return '<option value="'+esc(c)+'"'+(c===t.status?' selected':'')+'>'+c+'</option>';}).join('') + '</select>' +
    '</div></div>';
}
function listTableHTML(tasks){
  tasks = tasks.slice().sort(function(a,b){ return (a.dueDate||'9999').localeCompare(b.dueDate||'9999'); });
  if(!tasks.length) return '<div class="empty-state">Nenhuma tarefa encontrada com esses filtros.</div>';
  return '<div class="table-wrap"><table><thead><tr><th>Tarefa</th><th>Área</th><th>Subcategoria</th><th>Responsável</th><th>Prioridade</th><th>Status</th><th>Prazo</th></tr></thead><tbody>' +
    tasks.map(function(t){
      return '<tr class="'+(isOverdue(t)?'row-overdue':'')+'" data-open-task="'+t.id+'"><td class="title-cell">'+esc(t.title)+'</td><td><span class="pill dep-pill" '+depStyle(t.areaId)+'>'+area(t.areaId).name+'</span></td><td>'+esc(t.subcategory)+'</td><td>'+esc(userLabel(t.responsibleId))+'</td><td><span class="pill '+priorityClass(t.priority)+'">'+t.priority+'</span></td><td>'+esc(t.status)+'</td><td>'+ (isOverdue(t)?'<span class="tag overdue-chip">'+fmtDate(t.dueDate)+'</span>':fmtDate(t.dueDate)) +'</td></tr>';
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

/* ---- Gantt ---- */
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

/* ---- Timeline ---- */
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

/* ---- Projects ---- */
function viewProjectsList(){
  var head = '<div class="section-head"><h2>Todos os projetos</h2><span class="count">'+PROJECTS.length+'</span>' +
    '<button class="btn btn-primary btn-sm" id="newProjectBtn" style="margin-left:auto;">'+icon('plus',14)+'<span>Novo projeto</span></button></div>';
  if(!PROJECTS.length){
    return head + '<div class="empty-state">Nenhum projeto ainda. Clique em "Novo projeto" para criar o primeiro.</div>';
  }
  return head + '<div class="projects-grid">' + PROJECTS.map(projectCardHTML).join('') + '</div>';
}
function viewProjectDetail(id){
  var p = project(id);
  if(!p) return '<div class="empty-state">Projeto não encontrado.</div>';
  var ts = tasksForProject(id);
  var pct = computeProjectProgress(p);
  var byArea = {};
  ts.forEach(function(t){ (byArea[t.areaId]=byArea[t.areaId]||[]).push(t); });
  return '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;"><button class="btn btn-ghost btn-sm" data-nav="#/projetos">'+icon('chevronLeft',14)+'<span>Todos os projetos</span></button><button class="btn btn-ghost btn-sm" data-edit-project="'+p.id+'">Editar projeto</button><button class="btn btn-danger-ghost btn-sm" data-delete-project="'+p.id+'">Excluir projeto</button></div>' +
    '<div class="card" style="padding:18px; margin-bottom:20px;">' +
      '<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:flex-start;"><div style="flex:1;min-width:220px;"><h2 style="margin:0 0 6px;font-size:18px;">'+esc(p.name)+'</h2><div style="color:var(--text-secondary);font-size:13px;line-height:1.5;">'+esc(p.description)+'</div></div><span class="tag">'+esc(p.status)+'</span></div>' +
      '<div class="progress-track" style="margin-top:16px;"><div class="progress-fill" style="width:'+pct+'%"></div></div>' +
      '<div class="project-meta" style="margin-top:10px;"><span><b>'+pct+'%</b> concluído</span><span>'+ts.length+' tarefas · '+ts.filter(isFinal).length+' concluídas · '+ts.filter(isOverdue).length+' atrasadas</span><span>Responsável: '+esc(userLabel(p.responsibleId))+'</span><span>'+fmtDateLong(p.startDate)+' → '+fmtDateLong(p.dueDate)+'</span></div>' +
      '<div style="display:flex;align-items:center;gap:8px;margin-top:12px;"><span style="font-size:11.5px;color:var(--text-muted)">Participantes</span><div class="avatars-stack">'+p.participants.map(function(id){return avatarHTML(id);}).join('')+'</div></div>' +
    '</div>' +
    '<div class="section-head"><h2>Tarefas por área</h2><span class="count">independente de quem está vendo</span></div>' +
    (Object.keys(byArea).length ? AREAS.filter(function(a){return byArea[a.id];}).map(function(a){
      return '<div style="margin-bottom:18px;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><span class="nav-dot" style="background:'+areaColorCSS(a)+'"></span><b style="font-size:13px;">'+a.name+'</b><span class="count">'+byArea[a.id].length+(byArea[a.id].length===1?' tarefa':' tarefas')+'</span></div>' + listTableHTML(byArea[a.id]) + '</div>';
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
  var html = '<div class="section-head"><h2>Tarefas de '+esc(userLabel(uidc))+'</h2><span class="count">'+mine.length+' no total</span></div>';
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
    '<select data-filter="responsavel"><option value="">Todos os responsáveis</option>' + USERS.map(function(u){return '<option value="'+u.id+'"'+(f.responsavel===u.id?' selected':'')+'>'+esc(u.name)+'</option>';}).join('') + '</select>' +
    '</div>';
}

/* ---- Team ---- */
function viewTeam(){
  return '<div class="team-grid">' + USERS.map(function(u){
    var open = TASKS.filter(function(t){return t.responsibleId===u.id && !isFinal(t);}).length;
    var late = TASKS.filter(function(t){return t.responsibleId===u.id && isOverdue(t);}).length;
    return '<div class="team-card">' + avatarHTML(u.id,'lg') + '<div class="meta"><div class="name">'+esc(u.name)+(u.nickname?' <span style="font-weight:500;color:var(--text-muted);">"'+esc(u.nickname)+'"</span>':'')+'</div><div class="role">'+esc(u.roleLabel)+'</div>' +
      '<div class="team-stats"><span><b>'+open+'</b> abertas</span><span style="color:'+(late?'var(--status-critical)':'inherit')+'"><b>'+late+'</b> atrasadas</span></div></div></div>';
  }).join('') + '</div>';
}

/* ---- Settings ---- */
function viewSettings(){
  var html = '<div class="settings-block"><h3>Áreas e subcategorias</h3><div class="card" style="padding:6px 16px;">' +
    AREAS.map(function(a){
      return '<div class="area-row"><span class="area-swatch" style="background:'+areaColorCSS(a)+'"></span><div><b style="font-size:13px;">'+a.name+'</b><div class="chip-row">'+a.subcats.map(function(s){return '<span class="tag">'+s+'</span>';}).join('')+'</div></div></div>';
    }).join('') + '</div></div>' +
    '<div class="settings-block"><h3>Fluxos de status por área</h3><div class="card" style="padding:14px 16px;">' +
    AREAS.map(function(a){
      return '<div style="margin-bottom:12px;"><b style="font-size:12.5px;">'+a.name+'</b><div class="flow-chain" style="margin-top:6px;">' + FLOWS[a.flow].map(function(c,i){ return (i? '<span class="arrow">→</span>':'') + '<span class="tag">'+c+'</span>'; }).join('') + '</div></div>';
    }).join('') + '</div></div>' +
    '<div class="settings-block"><h3>Usuários e papéis</h3><div class="table-wrap"><table><thead><tr><th>Nome</th><th>Papel</th><th>Área</th></tr></thead><tbody>' +
    USERS.map(function(u){ return '<tr><td>'+esc(u.name)+(u.nickname?' <span class="tag">'+esc(u.nickname)+'</span>':'')+'</td><td>'+esc(u.roleLabel)+'</td><td>'+(u.areas&&u.areas.length?u.areas.map(function(id){return area(id).name;}).join(' + '):'Todas as áreas')+'</td></tr>'; }).join('') +
    '</tbody></table></div></div>';
  if(state.me && state.me.isAdmin){ html += adminAreasBlock() + adminUsersBlock(); }
  html += '<div class="settings-block"><h3>Sobre o Kabelera Manager</h3><div class="card" style="padding:14px 16px;font-size:12.5px;color:var(--text-secondary);line-height:1.6;">Gestão de projetos, tarefas e equipe da Kabelera, com dados salvos no Supabase e protegidos por login. Usuários e áreas são desativados, nunca apagados, para preservar o histórico.</div></div>';
  return html;
}
function adminUsersBlock(){
  return '<div class="settings-block"><h3>Usuários (admin)</h3><div class="card" style="padding:14px 16px;">' +
    USERS.map(function(u){
      return '<div class="area-row" style="flex-wrap:wrap;gap:6px;"><div style="flex:1;min-width:160px;"><b style="font-size:13px;">'+esc(u.name)+'</b> '+
        (u.isAdmin?'<span class="tag">admin</span>':'')+
        '<div style="display:flex;gap:6px;margin-top:4px;"><input type="text" id="role_'+u.id+'" value="'+esc(u.roleLabel)+'" placeholder="Função" style="font-size:12px;padding:4px 8px;"><button class="btn btn-ghost btn-sm" data-save-role="'+u.id+'">Salvar função</button></div></div>' +
        '<button class="btn btn-ghost btn-sm" data-toggle-admin="'+u.id+'">'+(u.isAdmin?'Rebaixar':'Tornar admin')+'</button>' +
        '<button class="btn btn-danger-ghost btn-sm" data-deactivate-user="'+u.id+'">Remover</button></div>';
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
  var existing = '<div class="settings-block"><h3>Áreas existentes (admin)</h3><div class="card" style="padding:14px 16px;">' +
    AREAS.map(function(a){
      return '<div class="area-row" style="flex-wrap:wrap;gap:6px;">' +
        '<input type="text" id="aname_'+a.id+'" value="'+esc(a.name)+'" style="font-size:12px;padding:4px 8px;max-width:140px;" title="Nome">' +
        '<input type="text" id="acolor_'+a.id+'" value="'+esc(a.color)+'" style="font-size:12px;padding:4px 8px;max-width:90px;" title="Cor (token ou hex)">' +
        '<input type="text" id="asubs_'+a.id+'" value="'+esc((a.subcats||[]).join(', '))+'" placeholder="Subcategorias (vírgula)" style="font-size:12px;padding:4px 8px;flex:1;min-width:160px;">' +
        '<button class="btn btn-ghost btn-sm" data-save-area="'+a.id+'">Salvar</button>' +
        '<button class="btn btn-danger-ghost btn-sm" data-remove-area="'+a.id+'">Remover</button>' +
      '</div>';
    }).join('') + '</div></div>';
  return existing + '<div class="settings-block"><h3>Nova área (admin)</h3><div class="card" style="padding:14px 16px;">' +
    '<div class="field-two"><div class="field-row"><label>Nome</label><input id="naName"></div>' +
    '<div class="field-row"><label>Cor (hex)</label><input id="naColor" type="text" value="#7A5AF8"></div></div>' +
    '<div class="field-row"><label>Fluxo</label><select id="naFlow">' +
    [['creative','Criativo'],['comercial','Comercial'],['financeiro','Financeiro'],['admin','Administrativo']].map(function(f){return '<option value="'+f[0]+'">'+f[1]+'</option>';}).join('') +
    '</select></div>' +
    '<div class="field-row"><label>Subcategorias (separadas por vírgula)</label><input id="naSubcats" placeholder="Ex: Planejamento, Execução, Relatórios"></div>' +
    '<button class="btn btn-primary btn-sm" id="createAreaBtn">Criar área</button></div></div>';
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
    '<div class="drawer-tags"><span class="pill dep-pill" '+depStyle(t.areaId)+'>'+a.name+'</span><span class="tag">'+esc(t.subcategory)+'</span><span class="pill '+priorityClass(t.priority)+'">'+t.priority+'</span><span class="tag">'+esc(t.status)+'</span>' + (overdue?'<span class="pill overdue-chip">Atrasada</span>':'') + (t.projectId && project(t.projectId)?'<span class="tag" data-open-project="'+t.projectId+'" style="cursor:pointer;color:var(--accent)">'+esc(project(t.projectId).name)+'</span>':'') + '</div>' +
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
    return '<div class="field-row"><label>Título</label><input type="text" data-field="title" value="'+esc(t.title)+'"></div>' +
      '<div class="field-row"><label>Descrição</label><textarea data-field="description" rows="3" placeholder="Sem descrição.">'+esc(t.description||'')+'</textarea></div>' +
      '<div class="field-two">' +
      '<div class="field-row"><label>Área</label><select data-field="areaId">'+AREAS.map(function(ar){return '<option value="'+ar.id+'"'+(ar.id===t.areaId?' selected':'')+'>'+esc(ar.name)+'</option>';}).join('')+'</select></div>' +
      '<div class="field-row"><label>Subcategoria</label><select data-field="subcategory">'+(a.subcats||[]).map(function(s){return '<option value="'+esc(s)+'"'+(s===t.subcategory?' selected':'')+'>'+esc(s)+'</option>';}).join('')+'</select></div>' +
      '</div>' +
      '<div class="field-two">' +
      '<div class="field-row"><label>Responsável</label><select data-field="responsibleId">'+USERS.map(function(u){return '<option value="'+u.id+'"'+(u.id===t.responsibleId?' selected':'')+'>'+esc(u.name)+'</option>';}).join('')+'</select></div>' +
      '<div class="field-row"><label>Prioridade</label><select data-field="priority">'+['Baixa','Média','Alta','Urgente'].map(function(p){return '<option value="'+p+'"'+(p===t.priority?' selected':'')+'>'+p+'</option>';}).join('')+'</select></div>' +
      '<div class="field-row"><label>Status</label><select data-field="status">'+FLOWS[a.flow].map(function(c){return '<option value="'+esc(c)+'"'+(c===t.status?' selected':'')+'>'+c+'</option>';}).join('')+'</select></div>' +
      '<div class="field-row"><label>Data de início</label><input type="date" data-field="startDate" value="'+(t.startDate||'')+'"></div>' +
      '<div class="field-row"><label>Prazo de entrega</label><input type="date" data-field="dueDate" value="'+(t.dueDate||'')+'"></div>' +
      '<div class="field-row"><label>Projeto</label><select data-field="projectId"><option value="">— Nenhum —</option>'+PROJECTS.map(function(pr){return '<option value="'+pr.id+'"'+(pr.id===t.projectId?' selected':'')+'>'+esc(pr.name)+'</option>';}).join('')+'</select></div>' +
      '</div>' +
      '<div class="field-row"><label>Solicitante</label><div style="font-size:13px;">'+esc(userLabel(t.requesterId))+'</div></div>' +
      '<div class="field-row"><label>Participantes (além do responsável)</label><select multiple size="5" data-field="participants">'+USERS.map(function(u){return '<option value="'+u.id+'"'+(t.participants&&t.participants.indexOf(u.id)>-1?' selected':'')+'>'+esc(u.name)+'</option>';}).join('')+'</select><div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Segure Ctrl (ou Cmd) para marcar vários.</div></div>' +
      '<div class="field-two">' +
      '<div class="field-row"><label>Criada em</label><div style="font-size:13px;">'+fmtDateLong(t.createdAt)+'</div></div>' +
      '<div class="field-row"><label>Concluída em</label><div style="font-size:13px;">'+(t.completedAt?fmtDateLong(t.completedAt):'—')+'</div></div>' +
      '</div>' +
      '<div style="margin-top:18px;border-top:1px solid var(--border);padding-top:14px;"><button class="btn btn-danger-ghost btn-sm" data-delete-task="'+t.id+'">'+icon('close',14)+'<span>Excluir tarefa</span></button></div>';
  }
  if(state.drawerTab==='checklist'){
    var doneCt = t.checklist.filter(function(c){return c.done;}).length;
    return (t.checklist.length? '<div style="font-size:11.5px;color:var(--text-muted);margin-bottom:6px;">'+doneCt+' de '+t.checklist.length+' concluídos</div>':'') +
      (t.checklist.length? t.checklist.map(function(c){ return '<label class="checklist-item'+(c.done?' done':'')+'"><input type="checkbox" data-toggle-check="'+c.id+'" '+(c.done?'checked':'')+'><span>'+esc(c.text)+'</span></label>'; }).join('') : '<div class="empty-state" style="padding:20px 0;">Nenhum item ainda.</div>') +
      '<div class="add-row"><input type="text" id="newChecklistInput" placeholder="Novo item do checklist"><button class="btn btn-ghost btn-sm" id="addChecklistBtn">Adicionar</button></div>';
  }
  if(state.drawerTab==='subtarefas'){
    return (t.subtasks.length? t.subtasks.map(function(s){ return '<div class="subtask-row"><input type="checkbox" data-toggle-subtask="'+s.id+'" '+(s.done?'checked':'')+'><span style="flex:1;'+(s.done?'text-decoration:line-through;color:var(--text-muted);':'')+'">'+esc(s.title)+'</span><span class="tag">'+esc(userLabel(s.responsibleId))+'</span></div>'; }).join('') : '<div class="empty-state" style="padding:20px 0;">Nenhuma subtarefa ainda.</div>') +
      '<div class="add-row"><input type="text" id="newSubtaskInput" placeholder="Nova subtarefa"><button class="btn btn-ghost btn-sm" id="addSubtaskBtn">Adicionar</button></div>';
  }
  if(state.drawerTab==='comentarios'){
    return (t.comments.length? t.comments.slice().reverse().map(function(c){ return '<div class="comment">'+avatarHTML(c.authorId)+'<div class="body"><div class="head"><span class="name">'+esc(userLabel(c.authorId))+'</span><span class="time">'+fmtDateTime(c.createdAt)+'</span></div><div class="txt">'+mentionify(c.text)+'</div></div></div>'; }).join('') : '<div class="empty-state" style="padding:20px 0;">Nenhum comentário ainda.</div>') +
      '<div class="field-row" style="margin-top:12px;"><label>Adicionar comentário (use @Nome para mencionar)</label><textarea id="newCommentInput" rows="3" placeholder="Escreva um comentário..."></textarea><div style="margin-top:8px;text-align:right;"><button class="btn btn-primary btn-sm" id="addCommentBtn">Comentar</button></div></div>';
  }
  if(state.drawerTab==='anexos'){
    return (t.attachments.length? t.attachments.map(function(f){
      var nameHTML = f.url ? '<a href="'+esc(f.url)+'" target="_blank" rel="noopener" style="font-weight:600;">'+esc(f.name)+'</a>' : '<div style="font-weight:600;">'+esc(f.name)+'</div>';
      return '<div class="attach-row"><div class="attach-icon">'+icon('paperclip',15)+'</div><div style="flex:1;">'+nameHTML+'<div style="color:var(--text-muted);font-size:11px;">'+esc(f.size||'')+' · enviado por '+esc(userLabel(f.uploadedBy))+'</div></div></div>';
    }).join('') : '<div class="empty-state" style="padding:20px 0;">Nenhum anexo ainda.</div>') +
      '<div class="add-row"><input type="file" id="newAttachFile"><button class="btn btn-ghost btn-sm" id="addAttachBtn">Enviar</button></div>';
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
    return (hist.length? hist.map(function(h){ return '<div class="hist-item"><span class="dot"></span><div><div><b>'+esc(userLabel(h.by))+'</b> alterou '+h.field+(h.from?' de "'+esc(h.from)+'"':'')+' para "'+esc(h.to)+'"</div><div style="color:var(--text-muted);font-size:11px;">'+fmtDateTime(h.at)+'</div></div></div>'; }).join('') : '<div class="empty-state" style="padding:20px 0;">Nenhuma alteração registrada ainda.</div>');
  }
  return '';
}

/* ======================= NEW TASK MODAL ======================= */
function openModal(areaId){
  state.modalOpen = true;
  var pick = areaId || (state.route.name==='area' ? state.route.params.areaId : null);
  if(!area(pick)) pick = AREAS[0] && AREAS[0].id;
  state.modalArea = pick;
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
        '<div class="field-row"><label>Solicitante</label><select id="mRequester">'+USERS.map(function(u){return '<option value="'+u.id+'"'+(u.id===state.currentUserId?' selected':'')+'>'+esc(u.name)+'</option>';}).join('')+'</select></div>' +
        '<div class="field-row"><label>Responsável</label><select id="mResponsible">'+USERS.map(function(u){return '<option value="'+u.id+'">'+esc(u.name)+'</option>';}).join('')+'</select></div>' +
      '</div>' +
      '<div class="field-two">' +
        '<div class="field-row"><label>Data de início</label><input type="date" id="mStart"></div>' +
        '<div class="field-row"><label>Prazo de entrega</label><input type="date" id="mDue"></div>' +
      '</div>' +
      '<div class="field-row"><label>Prioridade</label><select id="mPriority">'+['Baixa','Média','Alta','Urgente'].map(function(p){return '<option value="'+p+'"'+(p==='Média'?' selected':'')+'>'+p+'</option>';}).join('')+'</select></div>' +
    '</div>' +
    '<div class="modal-foot"><button class="btn btn-ghost" id="modalCancelBtn">Cancelar</button><button class="btn btn-primary" id="modalSaveBtn">Criar tarefa</button></div>' +
  '</div>';
  document.body.appendChild(wrap);
  document.getElementById('mArea').addEventListener('change', function(){
    state.modalArea = this.value; renderModal();
  });
}

/* ======================= PROJECT MODAL ======================= */
function openProjectModal(id){ state.projectModalOpen=true; state.projectModalId=id||null; renderProjectModal(); }
function closeProjectModal(){ state.projectModalOpen=false; var el=document.getElementById('project-modal-root'); if(el) el.remove(); }
function renderProjectModal(){
  var old=document.getElementById('project-modal-root'); if(old) old.remove();
  if(!state.projectModalOpen) return;
  var p = state.projectModalId ? project(state.projectModalId) : null;
  var statuses=['Planejamento','Em andamento','Pausado','Concluído'];
  var wrap=document.createElement('div'); wrap.id='project-modal-root'; wrap.className='modal-overlay';
  wrap.innerHTML = '<div class="modal">' +
    '<div class="modal-head"><h2>'+(p?'Editar projeto':'Novo projeto')+'</h2><button class="drawer-close" id="projectModalCloseBtn" style="margin-left:auto;">'+icon('close',16)+'</button></div>' +
    '<div class="modal-body">' +
      '<div class="field-row"><label>Nome*</label><input type="text" id="pName" value="'+(p?esc(p.name):'')+'" placeholder="Ex: Lançamento coleção verão"></div>' +
      '<div class="field-row"><label>Descrição</label><textarea id="pDesc" rows="2" placeholder="Do que se trata (opcional)">'+(p?esc(p.description||''):'')+'</textarea></div>' +
      '<div class="field-two">' +
        '<div class="field-row"><label>Responsável</label><select id="pResponsible"><option value="">—</option>'+USERS.map(function(u){return '<option value="'+u.id+'"'+(p&&p.responsibleId===u.id?' selected':'')+'>'+esc(u.name)+'</option>';}).join('')+'</select></div>' +
        '<div class="field-row"><label>Status</label><select id="pStatus">'+statuses.map(function(s){return '<option value="'+s+'"'+((p?p.status:'Planejamento')===s?' selected':'')+'>'+s+'</option>';}).join('')+'</select></div>' +
      '</div>' +
      '<div class="field-two">' +
        '<div class="field-row"><label>Data de início</label><input type="date" id="pStart" value="'+(p&&p.startDate?p.startDate:'')+'"></div>' +
        '<div class="field-row"><label>Prazo de entrega</label><input type="date" id="pDue" value="'+(p&&p.dueDate?p.dueDate:'')+'"></div>' +
      '</div>' +
      '<div class="field-row"><label>Participantes</label><select id="pParticipants" multiple size="5">'+USERS.map(function(u){return '<option value="'+u.id+'"'+(p&&p.participants&&p.participants.indexOf(u.id)>-1?' selected':'')+'>'+esc(u.name)+'</option>';}).join('')+'</select><div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Segure Ctrl (ou Cmd) para marcar vários.</div></div>' +
    '</div>' +
    '<div class="modal-foot"><button class="btn btn-ghost" id="projectCancelBtn">Cancelar</button><button class="btn btn-primary" id="projectSaveBtn">'+(p?'Salvar':'Criar projeto')+'</button></div>' +
  '</div>';
  document.body.appendChild(wrap);
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
  if(e.target.closest('#retryLoadBtn')){ startApp(); return; }
  if(e.target.closest('#refreshBtn')){ refreshData(); showToast('Atualizado.'); return; }
  if(e.target.closest('#themeToggleBtn')){ applyTheme(currentTheme()==='dark'?'light':'dark'); return; }

  var navBtn = e.target.closest('[data-nav]');
  if(navBtn && navBtn.getAttribute('data-nav')==='#/mapas'){
    state.currentMapId=null; state.map=null; state.mapLoaded=false; state.mapMoveMode=false;
    if(state.route.name==='mapas'){ renderContent(); } else { navigate('#/mapas'); }
    if(state.sidebarOpen){ state.sidebarOpen=false; syncSidebar(); }
    return;
  }
  if(navBtn){ navigate(navBtn.getAttribute('data-nav')); if(state.sidebarOpen){ state.sidebarOpen=false; syncSidebar(); } return; }

  if(e.target.closest('#sidebarClose') || e.target.closest('#sidebarOverlay')){ state.sidebarOpen=false; syncSidebar(); return; }
  if(e.target.closest('#hamburgerBtn')){ state.sidebarOpen=true; syncSidebar(); return; }
  if(e.target.closest('#mnavMore')){ state.sidebarOpen=true; syncSidebar(); return; }

  if(e.target.closest('#notifBtn')){ state.notifOpen=!state.notifOpen; renderNotifBell(); return; }
  var notifRow = e.target.closest('[data-notif]');
  if(notifRow){ var n=NOTIFICATIONS.find(function(x){return x.id===notifRow.getAttribute('data-notif');}); if(n){ n.read=true; KMDB.markNotifRead(n.id).catch(function(){}); state.notifOpen=false; renderNotifBell(); if(n.taskId && taskById(n.taskId)){ openDrawer(n.taskId); } } return; }
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
      startDate:document.getElementById('mStart').value||null,
      dueDate:document.getElementById('mDue').value||null
    });
    closeModal(); showToast('Tarefa criada.');
    return;
  }

  // ---- Mapas Mentais ----
  if(e.target.closest('#newMapBtn')){ createMapFlow(); return; }
  var delMap=e.target.closest('[data-del-map]');
  if(delMap){ e.stopPropagation(); deleteMap(delMap.getAttribute('data-del-map')); return; }
  var openMapEl=e.target.closest('[data-open-map]');
  if(openMapEl){ openMap(openMapEl.getAttribute('data-open-map')); return; }
  if(e.target.closest('#mapBackBtn')){ backToMapList(); return; }
  if(state.map && state.route.name==='mapas' && state.currentMapId){
    var cl=e.target.closest('[data-collapse]');
    if(cl){ var cid=cl.getAttribute('data-collapse'); var cn=KM.mmFind(state.map.data,cid); mapMutate(function(root){ KM.mmUpdate(root,cid,{collapsed:cn?!cn.collapsed:true}); }); return; }
    var mm=e.target.closest('[data-mm]');
    if(mm){
      var act=mm.getAttribute('data-mm'); var sel=state.mapSelectedNodeId; var root=state.map.data;
      if(act==='child'){ var nc=KM.mmNewNode('Novo ramo', KM.mmDefaultChildColor(root,sel)); mapMutate(function(r){ KM.mmAddChild(r,sel,nc); }); state.mapSelectedNodeId=nc.id; renderContent(); return; }
      if(act==='sibling'){ var p=KM.mmFindParent(root,sel); if(!p) return; var ns=KM.mmNewNode('Novo ramo', KM.mmDefaultChildColor(root,p.id)); mapMutate(function(r){ KM.mmAddSibling(r,sel,ns); }); state.mapSelectedNodeId=ns.id; renderContent(); return; }
      if(act==='rename'){ mapRenameNode(sel); return; }
      if(act==='delete'){ if(root.id===sel) return; if(!window.confirm('Excluir este ramo e tudo que pendura nele?')) return; var par=KM.mmFindParent(root,sel); mapMutate(function(r){ KM.mmRemove(r,sel); }); state.mapSelectedNodeId=par?par.id:root.id; renderContent(); return; }
      if(act==='move'){ if(root.id===sel) return; state.mapMoveMode=!state.mapMoveMode; renderContent(); return; }
      return;
    }
    var sw=e.target.closest('[data-mm-color]');
    if(sw){ var col=sw.getAttribute('data-mm-color'); mapMutate(function(r){ KM.mmUpdate(r,state.mapSelectedNodeId,{color:col}); }); return; }
    var nd=e.target.closest('[data-node]');
    if(nd){
      var nid=nd.getAttribute('data-node');
      if(state.mapMoveMode && state.mapSelectedNodeId && nid!==state.mapSelectedNodeId){
        var moving=state.mapSelectedNodeId; state.mapMoveMode=false;
        mapMutate(function(r){ KM.mmMove(r, moving, nid); });
        return;
      }
      state.mapSelectedNodeId=nid; renderContent(); return;
    }
  }

  if(e.target.closest('#newProjectBtn')){ openProjectModal(null); return; }
  var editProj = e.target.closest('[data-edit-project]');
  if(editProj){ openProjectModal(editProj.getAttribute('data-edit-project')); return; }
  var delProj = e.target.closest('[data-delete-project]');
  if(delProj){ deleteProject(delProj.getAttribute('data-delete-project')); return; }
  if(e.target.closest('#projectModalCloseBtn') || e.target.closest('#projectCancelBtn') || e.target===document.getElementById('project-modal-root')){ closeProjectModal(); return; }
  if(e.target.closest('#projectSaveBtn')){
    var pname=val('pName'); if(!pname){ showToast('Dê um nome ao projeto.'); return; }
    var parts=Array.prototype.slice.call(document.getElementById('pParticipants').selectedOptions).map(function(o){return o.value;});
    var ppayload={ name:pname, description:val('pDesc'), responsibleId:document.getElementById('pResponsible').value||null, participants:parts, startDate:val('pStart')||null, dueDate:val('pDue')||null, status:document.getElementById('pStatus').value };
    if(state.projectModalId){
      KMDB.updateProject(state.projectModalId, ppayload).then(function(saved){ var i=PROJECTS.map(function(x){return x.id;}).indexOf(saved.id); if(i>-1) PROJECTS[i]=saved; closeProjectModal(); renderContent(); showToast('Projeto atualizado.'); }).catch(function(){ showToast('Não foi possível salvar o projeto.'); });
    } else {
      KMDB.insertProject(ppayload).then(function(saved){ PROJECTS.push(saved); closeProjectModal(); navigate('#/projetos/'+saved.id); showToast('Projeto criado.'); }).catch(function(){ showToast('Não foi possível criar o projeto.'); });
    }
    return;
  }

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
  var saveRole=e.target.closest('[data-save-role]');
  if(saveRole){ var rid=saveRole.getAttribute('data-save-role');
    KMDB.updateProfile(rid,{role_label:val('role_'+rid)}).then(function(){ return refreshData(); }).then(function(){ showToast('Função atualizada.'); }).catch(function(){ showToast('Falha ao salvar função.'); }); return; }
  var saveArea=e.target.closest('[data-save-area]');
  if(saveArea){ var aid=saveArea.getAttribute('data-save-area');
    var asubs=val('asubs_'+aid).split(',').map(function(s){return s.trim();}).filter(Boolean);
    KMDB.updateArea(aid,{ name:val('aname_'+aid), color:val('acolor_'+aid)||'#7A5AF8', subcats:asubs }).then(function(){ return refreshData(); }).then(function(){ showToast('Área atualizada.'); }).catch(function(){ showToast('Falha ao salvar área.'); }); return; }
  var remArea=e.target.closest('[data-remove-area]');
  if(remArea){ var raid=remArea.getAttribute('data-remove-area');
    if(TASKS.some(function(t){ return t.areaId===raid; })){ showToast('Essa área tem tarefas. Exclua ou mova as tarefas antes de remover a área.'); return; }
    if(!window.confirm('Remover esta área? Ela sai do menu (pode ser recriada depois).')) return;
    KMDB.updateArea(raid,{is_active:false}).then(function(){ return refreshData(); }).then(function(){ showToast('Área removida.'); }).catch(function(){ showToast('Falha ao remover área.'); }); return; }

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
  var delTask = e.target.closest('[data-delete-task]');
  if(delTask){ deleteTask(delTask.getAttribute('data-delete-task')); return; }

  if(e.target.closest('#addChecklistBtn')){ var el=document.getElementById('newChecklistInput'); addChecklistItem(state.drawerTaskId, el.value); el.value=''; renderDrawer(); return; }
  if(e.target.closest('#addSubtaskBtn')){ var el2=document.getElementById('newSubtaskInput'); addSubtask(state.drawerTaskId, el2.value); el2.value=''; renderDrawer(); return; }
  if(e.target.closest('#addCommentBtn')){ var el3=document.getElementById('newCommentInput'); addComment(state.drawerTaskId, el3.value); el3.value=''; renderDrawer(); return; }
  if(e.target.closest('#addAttachBtn')){ var fi=document.getElementById('newAttachFile'); if(fi && fi.files && fi.files[0]){ uploadAttachment(state.drawerTaskId, fi.files[0]); } else { showToast('Escolha um arquivo primeiro.'); } return; }
  if(e.target.closest('#addLinkBtn')){ var lu=document.getElementById('newLinkUrl'), ll=document.getElementById('newLinkLabel'); addLink(state.drawerTaskId, lu.value, ll.value); lu.value=''; ll.value=''; renderDrawer(); return; }

  var areaViewBtn = e.target.closest('[data-area-view]');
  if(areaViewBtn){ var parts=areaViewBtn.getAttribute('data-area-view').split('|'); navigate('#/area/'+parts[0]+'?view='+parts[1]); return; }

  var todasViewBtn = e.target.closest('[data-todas-view]');
  if(todasViewBtn){ navigate('#/todas?view='+todasViewBtn.getAttribute('data-todas-view')); return; }

  var calNav = e.target.closest('[data-cal-nav]');
  if(calNav){ var dv=calNav.getAttribute('data-cal-nav'); state.calMonthOffset = dv==='0'?0:state.calMonthOffset+parseInt(dv,10); renderContent(); return; }
});

document.addEventListener('change', function(e){
  if(e.target.id==='mmColor' && state.map && state.mapSelectedNodeId){
    var c=e.target.value; mapMutate(function(r){ KM.mmUpdate(r,state.mapSelectedNodeId,{color:c}); });
    return;
  }
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
  if(e.target.matches('[data-field="participants"]')){
    var parts = Array.prototype.slice.call(e.target.selectedOptions).map(function(o){return o.value;});
    updateTaskField(state.drawerTaskId, 'participants', parts);
    renderDrawer(); renderContent();
    return;
  }
  if(e.target.matches('[data-field="projectId"]')){
    updateTaskField(state.drawerTaskId, 'projectId', e.target.value||null);
    renderDrawer(); renderContent();
    return;
  }
  if(e.target.matches('[data-field="areaId"]')){
    changeTaskArea(state.drawerTaskId, e.target.value);
    renderDrawer(); renderContent();
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

/* mapas: atalhos de teclado (desktop) */
document.addEventListener('keydown', function(e){
  if(state.route.name!=='mapas' || !state.currentMapId || !state.map || !state.mapSelectedNodeId) return;
  var tag=document.activeElement && document.activeElement.tagName;
  if(tag==='INPUT' || tag==='TEXTAREA') return;
  var root=state.map.data, sel=state.mapSelectedNodeId;
  if(e.key==='Tab'){ e.preventDefault(); var nc=KM.mmNewNode('Novo ramo',KM.mmDefaultChildColor(root,sel)); mapMutate(function(r){KM.mmAddChild(r,sel,nc);}); state.mapSelectedNodeId=nc.id; renderContent(); }
  else if(e.key==='Enter'){ e.preventDefault(); var p=KM.mmFindParent(root,sel); if(!p) return; var ns=KM.mmNewNode('Novo ramo',KM.mmDefaultChildColor(root,p.id)); mapMutate(function(r){KM.mmAddSibling(r,sel,ns);}); state.mapSelectedNodeId=ns.id; renderContent(); }
  else if(e.key==='F2'){ e.preventDefault(); mapRenameNode(sel); }
  else if(e.key==='Delete'){ if(root.id===sel) return; var par=KM.mmFindParent(root,sel); mapMutate(function(r){KM.mmRemove(r,sel);}); state.mapSelectedNodeId=par?par.id:root.id; renderContent(); }
});

/* mapas: arrastar pra reorganizar */
var _mapDragId=null;
document.addEventListener('dragstart', function(e){ var n=e.target.closest('[data-node]'); if(n){ _mapDragId=n.getAttribute('data-node'); if(e.dataTransfer) e.dataTransfer.effectAllowed='move'; } });
document.addEventListener('dragover', function(e){ var n=e.target.closest('[data-node]'); if(n && _mapDragId){ e.preventDefault(); document.querySelectorAll('.mm-node.mm-drop').forEach(function(x){x.classList.remove('mm-drop');}); if(n.getAttribute('data-node')!==_mapDragId) n.classList.add('mm-drop'); } });
document.addEventListener('drop', function(e){ var n=e.target.closest('[data-node]'); if(n && _mapDragId){ e.preventDefault(); var target=n.getAttribute('data-node'); var moving=_mapDragId; _mapDragId=null; document.querySelectorAll('.mm-node.mm-drop').forEach(function(x){x.classList.remove('mm-drop');}); if(target!==moving && state.map){ mapMutate(function(r){ KM.mmMove(r,moving,target); }); } } });
document.addEventListener('dragend', function(){ _mapDragId=null; document.querySelectorAll('.mm-node.mm-drop').forEach(function(x){x.classList.remove('mm-drop');}); });

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
  gate.innerHTML = '<div class="login-card"><div class="login-logo"><img src="assets/logo.png" alt="Kabelera"></div><h1>Kabelera Manager</h1><p class="sub">Entre com seu e-mail e senha.</p>' +
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
  var ok = await bootstrapData();         // definido na Task 7
  if(!ok) return; // falha de carga: showLoadError() já mostrou a tela de erro com "Tentar de novo"
  if(!location.hash) location.hash = '#/dashboard';
  onHashChange();
}

function showFatal(e){
  var appEl=document.getElementById('app'); if(appEl) appEl.style.display='none';
  var gate = document.getElementById('gateScreen');
  gate.classList.add('show');
  gate.innerHTML = '<div class="login-card"><h1>Erro ao iniciar</h1>' +
    '<p class="sub">O app não conseguiu iniciar. Detalhe técnico abaixo:</p>' +
    '<div class="login-error" style="min-height:auto;white-space:pre-wrap;">'+esc(String((e && e.stack) || (e && e.message) || e))+'</div></div>';
}
(async function init(){
  try{
    applyTheme(currentTheme());
    if(!window.supabase || !window.supabase.createClient){
      throw new Error('A biblioteca do Supabase não carregou (conexão ou bloqueador de anúncios?).');
    }
    if(!window.KM_CONFIG || !window.KM_CONFIG.url){
      throw new Error('config.js não carregou (faltam as chaves do projeto).');
    }
    var session = await KMDB.getSession();
    if(session) await startApp();
    else showLogin();
  }catch(e){
    showFatal(e);
  }
})();
})();
