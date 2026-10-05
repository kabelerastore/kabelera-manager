const test = require('node:test');
const assert = require('node:assert');
// Carrega supabase-client em contexto Node com stubs globais mínimos.
global.window = {};
global.self = global.window;
window.KM_CONFIG = { url: 'http://x', anonKey: 'k' };
window.supabase = { createClient: () => ({ auth: {}, from: () => ({}) }) };
const KMDB = require('../supabase-client.js');

test('taskFromRow converte snake_case para camelCase', () => {
  const row = { id: 't1', title: 'X', area_id: 'a1', project_id: null, requester_id: 'u1',
    responsible_id: 'u2', due_date: '2026-10-10', start_date: null, completed_at: null,
    priority: 'Alta', status: 'Backlog', subcategory: 'Conteúdo', description: '',
    participants: ['u3'], checklist: [], subtasks: [], comments: [], attachments: [],
    links: [], dependencies: [], history: [], created_at: '2026-10-01T00:00:00Z' };
  const t = KMDB.taskFromRow(row);
  assert.strictEqual(t.areaId, 'a1');
  assert.strictEqual(t.responsibleId, 'u2');
  assert.strictEqual(t.dueDate, '2026-10-10');
  assert.deepStrictEqual(t.participants, ['u3']);
});

test('taskToRow converte camelCase para snake_case e nao inclui id em insert', () => {
  const t = { title: 'X', areaId: 'a1', projectId: null, requesterId: 'u1', responsibleId: 'u2',
    dueDate: null, startDate: null, completedAt: null, priority: 'Média', status: 'Backlog',
    subcategory: 'Conteúdo', description: '', participants: [], checklist: [], subtasks: [],
    comments: [], attachments: [], links: [], dependencies: [], history: [] };
  const row = KMDB.taskToRow(t);
  assert.strictEqual(row.area_id, 'a1');
  assert.strictEqual(row.responsible_id, 'u2');
  assert.ok(!('id' in row));
  assert.ok(!('areaId' in row));
});

test('areaFromRow mantém subcats e flow', () => {
  const a = KMDB.areaFromRow({ id: 'a1', name: 'Marketing', flow: 'creative', color: 'marketing', subcats: ['X'], sort_order: 1, is_active: true });
  assert.strictEqual(a.flow, 'creative');
  assert.deepStrictEqual(a.subcats, ['X']);
});
