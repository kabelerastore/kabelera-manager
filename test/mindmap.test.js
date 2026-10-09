const test = require('node:test');
const assert = require('node:assert');
const KM = require('../lib.js');

function sampleTree() {
  var root = KM.mmNewNode('Central', '#fffa2a');
  var a = KM.mmNewNode('A', '#2f80ed');
  var b = KM.mmNewNode('B', '#27ae60');
  KM.mmAddChild(root, root.id, a);
  KM.mmAddChild(root, root.id, b);
  var a1 = KM.mmNewNode('A1', '#2f80ed');
  KM.mmAddChild(root, a.id, a1);
  return { root: root, a: a, b: b, a1: a1 };
}

test('mmNewNode cria no com id, children vazio e collapsed false', () => {
  var n = KM.mmNewNode('Oi', '#db0808');
  assert.strictEqual(n.text, 'Oi');
  assert.strictEqual(n.color, '#db0808');
  assert.strictEqual(n.collapsed, false);
  assert.deepStrictEqual(n.children, []);
  assert.ok(n.id && typeof n.id === 'string');
});

test('mmAddChild e mmFind/mmFindParent', () => {
  var s = sampleTree();
  assert.strictEqual(KM.mmFind(s.root, s.a1.id).text, 'A1');
  assert.strictEqual(KM.mmFindParent(s.root, s.a1.id).id, s.a.id);
  assert.strictEqual(KM.mmFindParent(s.root, s.root.id), null);
});

test('mmAddSibling insere depois do irmao; raiz = no-op', () => {
  var s = sampleTree();
  var novo = KM.mmNewNode('A2', '#2f80ed');
  KM.mmAddSibling(s.root, s.a.id, novo);
  var kids = s.root.children.map(function (k) { return k.text; });
  assert.deepStrictEqual(kids, ['A', 'A2', 'B']);
  var antes = JSON.stringify(s.root);
  KM.mmAddSibling(s.root, s.root.id, KM.mmNewNode('X', '#000'));
  assert.strictEqual(JSON.stringify(s.root), antes);
});

test('mmRemove tira o galho; raiz = no-op', () => {
  var s = sampleTree();
  KM.mmRemove(s.root, s.a.id);
  assert.strictEqual(KM.mmFind(s.root, s.a.id), null);
  assert.strictEqual(KM.mmFind(s.root, s.a1.id), null);
  var antes = JSON.stringify(s.root);
  KM.mmRemove(s.root, s.root.id);
  assert.strictEqual(JSON.stringify(s.root), antes);
});

test('mmIsDescendant', () => {
  var s = sampleTree();
  assert.strictEqual(KM.mmIsDescendant(s.root, s.a.id, s.a1.id), true);
  assert.strictEqual(KM.mmIsDescendant(s.root, s.b.id, s.a1.id), false);
});

test('mmMove reparent e reordena; guards viram no-op', () => {
  var s = sampleTree();
  KM.mmMove(s.root, s.a1.id, s.b.id, 0);
  assert.strictEqual(KM.mmFindParent(s.root, s.a1.id).id, s.b.id);
  assert.strictEqual(s.a.children.length, 0);
  KM.mmMove(s.root, s.b.id, s.root.id, 0);
  assert.strictEqual(s.root.children[0].id, s.b.id);
  var antes = JSON.stringify(s.root);
  KM.mmMove(s.root, s.root.id, s.a.id, 0);
  assert.strictEqual(JSON.stringify(s.root), antes);
  var antes2 = JSON.stringify(s.root);
  KM.mmMove(s.root, s.b.id, s.a1.id, 0);
  assert.strictEqual(JSON.stringify(s.root), antes2);
});

test('mmUpdate aplica patch', () => {
  var s = sampleTree();
  KM.mmUpdate(s.root, s.a.id, { text: 'Novo', color: '#9b51e0', collapsed: true });
  var n = KM.mmFind(s.root, s.a.id);
  assert.strictEqual(n.text, 'Novo');
  assert.strictEqual(n.color, '#9b51e0');
  assert.strictEqual(n.collapsed, true);
});

test('mmDefaultChildColor herda a cor do pai', () => {
  var s = sampleTree();
  assert.strictEqual(KM.mmDefaultChildColor(s.root, s.b.id), '#27ae60');
});

test('mmSafeColor aceita hex e rejeita lixo', () => {
  assert.strictEqual(KM.mmSafeColor('#fffa2a'), '#fffa2a');
  assert.strictEqual(KM.mmSafeColor('#abc'), '#abc');
  assert.strictEqual(KM.mmSafeColor('red; background:url(x)'), '#8a8f99');
  assert.strictEqual(KM.mmSafeColor(null), '#8a8f99');
});

test('mmLayout da x por profundidade e y de slot; respeita collapsed', () => {
  var s = sampleTree();
  var pos = KM.mmLayout(s.root, { colW: 200, gap: 40, startY: 20 });
  var byId = {};
  pos.forEach(function (p) { byId[p.id] = p; });
  assert.strictEqual(byId[s.root.id].x, 0);
  assert.strictEqual(byId[s.a.id].x, 200);
  assert.strictEqual(byId[s.a1.id].x, 400);
  KM.mmUpdate(s.root, s.a.id, { collapsed: true });
  var pos2 = KM.mmLayout(s.root, { colW: 200, gap: 40, startY: 20 });
  assert.ok(!pos2.some(function (p) { return p.id === s.a1.id; }));
});
