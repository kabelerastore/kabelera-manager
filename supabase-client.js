(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.KMDB = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Referência ao objeto global (window no browser, globalThis no Node) usada
  // pelas funções de runtime abaixo (client, resetPassword, createUser).
  var root = (typeof self !== 'undefined') ? self
           : (typeof globalThis !== 'undefined') ? globalThis
           : (typeof window !== 'undefined') ? window : this;

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
  function notifFromRow(r) { return { id: r.id, userId: r.user_id, text: r.text, taskId: r.task_id || null, createdAt: r.created_at, read: r.read }; }
  function mindmapFromRow(r) {
    return { id: r.id, title: r.title, data: r.data || {}, createdBy: r.created_by || null,
      isActive: r.is_active, createdAt: r.created_at, updatedAt: r.updated_at };
  }
  function mindmapToRow(m) { return { title: m.title, data: m.data || {} }; }

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
    var tasks = (must(await c.from('tasks').select('*').eq('is_active', true).order('created_at'))).map(taskFromRow);
    var notifications = (must(await c.from('notifications').select('*').order('created_at', { ascending: false }))).map(notifFromRow);
    var me = users.find(function (u) { return u.id === meId; }) || null;
    return { areas: areas, users: users, projects: projects, tasks: tasks, notifications: notifications, me: me };
  }

  async function insertTask(task) { return taskFromRow(must(await client().from('tasks').insert(taskToRow(task)).select().single())); }
  async function updateTask(id, patchTask) { return taskFromRow(must(await client().from('tasks').update(taskToRow(patchTask)).eq('id', id).select().single())); }
  async function setTaskActive(id, active) { return must(await client().from('tasks').update({ is_active: active }).eq('id', id)); }
  async function uploadFile(file) {
    var safe = String(file.name).replace(/[^\w.\-]/g, '_');
    var path = Date.now() + '_' + safe;
    var up = await client().storage.from('anexos').upload(path, file);
    if (up.error) throw up.error;
    var pub = client().storage.from('anexos').getPublicUrl(path);
    return { url: pub.data.publicUrl, path: path };
  }
  async function insertProject(p) { return projectFromRow(must(await client().from('projects').insert(projectToRow(p)).select().single())); }
  async function setProjectActive(id, active) { return must(await client().from('projects').update({ is_active: active }).eq('id', id)); }
  async function updateProject(id, p) { return projectFromRow(must(await client().from('projects').update(projectToRow(p)).eq('id', id).select().single())); }
  async function listMindmaps() {
    return (must(await client().from('mindmaps').select('id,title,created_at,created_by')
      .eq('is_active', true).order('created_at', { ascending: false })))
      .map(function (r) { return { id: r.id, title: r.title, createdAt: r.created_at, createdBy: r.created_by }; });
  }
  async function getMindmap(id) { return mindmapFromRow(must(await client().from('mindmaps').select('*').eq('id', id).single())); }
  async function insertMindmap(title, data) {
    var session = (await client().auth.getSession()).data.session;
    var row = { title: title, data: data || {}, created_by: session && session.user ? session.user.id : null };
    return mindmapFromRow(must(await client().from('mindmaps').insert(row).select().single()));
  }
  async function updateMindmap(id, patch) {
    var row = {}; if (patch.title !== undefined) row.title = patch.title; if (patch.data !== undefined) row.data = patch.data;
    row.updated_at = new Date().toISOString();
    return mindmapFromRow(must(await client().from('mindmaps').update(row).eq('id', id).select().single()));
  }
  async function setMindmapActive(id, active) { return must(await client().from('mindmaps').update({ is_active: active }).eq('id', id)); }
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
    mindmapFromRow: mindmapFromRow, mindmapToRow: mindmapToRow,
    listMindmaps: listMindmaps, getMindmap: getMindmap, insertMindmap: insertMindmap,
    updateMindmap: updateMindmap, setMindmapActive: setMindmapActive,
    signIn: signIn, signOut: signOut, getSession: getSession, onAuthChange: onAuthChange, resetPassword: resetPassword,
    loadAll: loadAll, insertTask: insertTask, updateTask: updateTask, setTaskActive: setTaskActive, uploadFile: uploadFile, insertProject: insertProject,
    updateProject: updateProject, setProjectActive: setProjectActive, insertNotifications: insertNotifications, markNotifRead: markNotifRead,
    insertArea: insertArea, updateArea: updateArea, updateProfile: updateProfile, createUser: createUser
  };
});
