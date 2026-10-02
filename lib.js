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

  return {
    esc: esc, escRegex: escRegex, mentionify: mentionify,
    toISODate: toISODate, addDaysISO: addDaysISO,
    FLOWS: FLOWS, FINAL_STATUSES: FINAL_STATUSES, RETURN_RULES: RETURN_RULES,
    isFinalStatus: isFinalStatus, nextStatusOnApprove: nextStatusOnApprove,
    priorityRank: priorityRank, priorityClass: priorityClass
  };
});
