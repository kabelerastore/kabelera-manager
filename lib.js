(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.KM = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(s) {
    return (s == null ? '' : String(s)).replace(/[&<>"']/g, function (c) { return ESC_MAP[c]; });
  }
  function escRegex(s) {
    return (s == null ? '' : String(s)).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  function mentionify(text, users) {
    var out = esc(text);
    (users || []).forEach(function (u) {
      var first = String(u.name).split(' ')[0];
      var re = new RegExp('@' + escRegex(u.name) + '|@' + escRegex(first), 'g');
      out = out.replace(re, '<b style="color:var(--accent)">$&</b>');
    });
    return out;
  }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function toISODate(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function addDaysISO(iso, n) {
    var p = iso.split('-');
    var d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
    d.setDate(d.getDate() + n);
    return toISODate(d);
  }

  var FLOWS = {
    creative: ['Backlog', 'Planejamento', 'Em produção', 'Revisão', 'Aprovação', 'Programado', 'Concluído'],
    comercial: ['Novo Lead', 'Contato', 'Qualificação', 'Proposta', 'Negociação', 'Fechado', 'Pós-venda'],
    financeiro: ['Pendente', 'Programado', 'Aguardando', 'Pago/Recebido', 'Conciliado'],
    admin: ['Solicitado', 'A Fazer', 'Em Andamento', 'Aguardando Terceiro', 'Revisão', 'Concluído']
  };
  var FINAL_STATUSES = {
    creative: ['Concluído'], comercial: ['Fechado', 'Pós-venda'],
    financeiro: ['Pago/Recebido', 'Conciliado'], admin: ['Concluído']
  };
  var RETURN_RULES = { creative: { 'Aprovação': 'Em produção' } };

  function isFinalStatus(flow, status) { return (FINAL_STATUSES[flow] || []).indexOf(status) > -1; }
  function nextStatusOnApprove(flow, status) {
    if (flow === 'creative' && status === 'Aprovação') return 'Programado';
    var cols = FLOWS[flow] || [];
    var i = cols.indexOf(status);
    if (i === -1 || i === cols.length - 1) return status;
    return cols[i + 1];
  }
  function priorityRank(p) { return { 'Baixa': 0, 'Média': 1, 'Alta': 2, 'Urgente': 3 }[p] || 0; }
  function priorityClass(p) { return { 'Baixa': 'pr-good', 'Média': 'pr-warning', 'Alta': 'pr-serious', 'Urgente': 'pr-critical' }[p] || 'pr-good'; }
  function normalizeTheme(raw) { return raw === 'light' ? 'light' : 'dark'; }

  // ---- Mapas mentais (operacoes puras de arvore) ----
  var MM_COLOR_RE = /^#[0-9a-fA-F]{3,8}$/;
  var MM_FALLBACK = '#8a8f99';
  var mmSeq = 0;
  function mmSafeColor(c) { return (typeof c === 'string' && MM_COLOR_RE.test(c)) ? c : MM_FALLBACK; }
  function mmNewNode(text, color) {
    mmSeq += 1;
    return { id: 'n_' + Date.now().toString(36) + '_' + mmSeq, text: text || '', color: mmSafeColor(color), collapsed: false, children: [] };
  }
  function mmFind(root, id) {
    if (!root) return null;
    if (root.id === id) return root;
    var kids = root.children || [];
    for (var i = 0; i < kids.length; i++) { var f = mmFind(kids[i], id); if (f) return f; }
    return null;
  }
  function mmFindParent(root, id) {
    var kids = (root && root.children) || [];
    for (var i = 0; i < kids.length; i++) {
      if (kids[i].id === id) return root;
      var f = mmFindParent(kids[i], id); if (f) return f;
    }
    return null;
  }
  function mmAddChild(root, parentId, node) {
    var p = mmFind(root, parentId); if (p) { p.children = p.children || []; p.children.push(node); }
    return root;
  }
  function mmAddSibling(root, nodeId, node) {
    var p = mmFindParent(root, nodeId); if (!p) return root; // raiz => no-op
    var i = p.children.indexOf(mmFind(root, nodeId));
    p.children.splice(i + 1, 0, node);
    return root;
  }
  function mmRemove(root, id) {
    var p = mmFindParent(root, id); if (!p) return root; // raiz => no-op
    var n = mmFind(root, id);
    p.children.splice(p.children.indexOf(n), 1);
    return root;
  }
  function mmIsDescendant(root, ancestorId, maybeId) {
    var a = mmFind(root, ancestorId); if (!a) return false;
    return !!mmFind({ id: '__mm_probe__', children: a.children }, maybeId);
  }
  function mmMove(root, nodeId, newParentId, index) {
    if (nodeId === newParentId) return root;
    var p = mmFindParent(root, nodeId); if (!p) return root; // raiz => no-op
    if (mmIsDescendant(root, nodeId, newParentId)) return root; // laco => no-op
    var np = mmFind(root, newParentId); if (!np) return root;
    var n = mmFind(root, nodeId);
    p.children.splice(p.children.indexOf(n), 1);
    np.children = np.children || [];
    var idx = (typeof index === 'number') ? Math.max(0, Math.min(index, np.children.length)) : np.children.length;
    np.children.splice(idx, 0, n);
    return root;
  }
  function mmUpdate(root, id, patch) {
    var n = mmFind(root, id); if (!n) return root;
    if (patch.text !== undefined) n.text = patch.text;
    if (patch.color !== undefined) n.color = mmSafeColor(patch.color);
    if (patch.collapsed !== undefined) n.collapsed = !!patch.collapsed;
    return root;
  }
  function mmDefaultChildColor(root, parentId) {
    var p = mmFind(root, parentId); return (p && p.color) ? p.color : '#2f80ed';
  }
  function mmLayout(root, opts) {
    opts = opts || {}; var colW = opts.colW || 220, gap = opts.gap || 44, startY = opts.startY || 24;
    var out = []; var y = startY;
    (function walk(n, depth, parentId) {
      var pos = { id: n.id, x: depth * colW, y: 0, depth: depth, parentId: parentId };
      var kids = n.collapsed ? [] : (n.children || []);
      if (!kids.length) { pos.y = y; y += gap; }
      else {
        var first, last;
        kids.forEach(function (k, i) { var cp = walk(k, depth + 1, n.id); if (i === 0) first = cp; last = cp; });
        pos.y = (first.y + last.y) / 2;
      }
      out.push(pos); return pos;
    })(root, 0, null);
    return out;
  }

  return {
    esc: esc, escRegex: escRegex, mentionify: mentionify,
    toISODate: toISODate, addDaysISO: addDaysISO,
    FLOWS: FLOWS, FINAL_STATUSES: FINAL_STATUSES, RETURN_RULES: RETURN_RULES,
    isFinalStatus: isFinalStatus, nextStatusOnApprove: nextStatusOnApprove,
    priorityRank: priorityRank, priorityClass: priorityClass,
    normalizeTheme: normalizeTheme,
    mmNewNode: mmNewNode, mmSafeColor: mmSafeColor, mmFind: mmFind, mmFindParent: mmFindParent,
    mmAddChild: mmAddChild, mmAddSibling: mmAddSibling, mmRemove: mmRemove, mmIsDescendant: mmIsDescendant,
    mmMove: mmMove, mmUpdate: mmUpdate, mmDefaultChildColor: mmDefaultChildColor, mmLayout: mmLayout
  };
});
