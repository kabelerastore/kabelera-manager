const test = require('node:test');
const assert = require('node:assert');
const KM = require('../lib.js');

test('esc escapa aspa simples e angulares', () => {
  assert.strictEqual(KM.esc(`<b>"ola" 'tchau' & fim`), '&lt;b&gt;&quot;ola&quot; &#39;tchau&#39; &amp; fim');
});

test('escRegex escapa metacaracteres', () => {
  assert.strictEqual(KM.escRegex('a.b*c(d)'), 'a\\.b\\*c\\(d\\)');
});

test('mentionify destaca mencao e nao quebra com nome com caractere especial', () => {
  const users = [{ id: 'u1', name: 'Ana (RH)' }];
  const out = KM.mentionify('oi @Ana (RH) tudo bem', users);
  assert.ok(out.includes('<b'), 'deve conter negrito');
  assert.ok(out.includes('Ana (RH)'));
});

test('toISODate usa fuso local, nao UTC', () => {
  // 1 de marco de 2026, 23:00 horario local. Em UTC-3 vira 2026-03-02 em UTC.
  const d = new Date(2026, 2, 1, 23, 0, 0);
  assert.strictEqual(KM.toISODate(d), '2026-03-01');
});

test('addDaysISO soma dias corretamente atravessando mes', () => {
  assert.strictEqual(KM.addDaysISO('2026-01-30', 3), '2026-02-02');
  assert.strictEqual(KM.addDaysISO('2026-03-10', -3), '2026-03-07');
});

test('isFinalStatus reconhece status finais por fluxo', () => {
  assert.strictEqual(KM.isFinalStatus('creative', 'Concluído'), true);
  assert.strictEqual(KM.isFinalStatus('creative', 'Revisão'), false);
  assert.strictEqual(KM.isFinalStatus('comercial', 'Pós-venda'), true);
});

test('nextStatusOnApprove avanca creative de Aprovacao para Programado', () => {
  assert.strictEqual(KM.nextStatusOnApprove('creative', 'Aprovação'), 'Programado');
});

test('nextStatusOnApprove avanca para proximo status em fluxo generico', () => {
  assert.strictEqual(KM.nextStatusOnApprove('admin', 'A Fazer'), 'Em Andamento');
});

test('nextStatusOnApprove no ultimo status permanece', () => {
  assert.strictEqual(KM.nextStatusOnApprove('admin', 'Concluído'), 'Concluído');
});

test('normalizeTheme retorna light so para "light", senao dark', () => {
  assert.strictEqual(KM.normalizeTheme('light'), 'light');
  assert.strictEqual(KM.normalizeTheme('dark'), 'dark');
  assert.strictEqual(KM.normalizeTheme(null), 'dark');
  assert.strictEqual(KM.normalizeTheme(undefined), 'dark');
  assert.strictEqual(KM.normalizeTheme('xpto'), 'dark');
  assert.strictEqual(KM.normalizeTheme(''), 'dark');
});
