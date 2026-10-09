# Mapas Mentais — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar uma seção "Mapas Mentais" ao Kabelera Manager — mapas soltos salvos no Supabase, editor em árvore horizontal com layout automático, ramos translúcidos coloridos, curvas SVG delicadas, e reorganização por arrasto.

**Architecture:** Três camadas seguindo a arquitetura existente: (1) lógica pura de árvore em `lib.js` (`KM`), coberta por testes `node --test`; (2) persistência em `supabase-client.js` (`KMDB`), nova tabela `mindmaps` carregada sob demanda (fora do `loadAll`); (3) view e interação em `app.js` (nova rota `#/mapas`, lista + editor), com estilos em `styles.css`.

**Tech Stack:** HTML/CSS/JS vanilla (sem framework), Supabase (Postgres + RLS), GitHub Pages. Testes: `node:test` + `node:assert`. Sem libs novas.

**Spec:** `docs/superpowers/specs/2026-10-09-mapas-mentais-design.md`

## Global Constraints

- Português brasileiro correto (acentuação completa) em tudo visível. Sem travessão (—) em copy de UI; usar hífen ou reescrever. Respeitar anti-termos do CLAUDE.md.
- Todo texto editável pelo usuário renderizado na tela passa por `KM.esc()` (regra da auditoria de segurança 2026-10-08).
- Cor sempre passa por `KM.safeColor()` antes de entrar em `style`/atributo SVG.
- Exclusão é lógica (`is_active=false`), nunca DELETE.
- RLS aberta pra autenticados (padrão `projects`): select/insert/update com `true`.
- Mapas NÃO entram no `loadAll()` — carregamento sob demanda quando a aba abre.
- Padrão de ids de nó no cliente: string curta única (ex.: `'n_'+contador`), gerada no cliente.
- Cache-busting: bump de `?v=N` no `index.html` pros arquivos alterados antes do deploy.

---

### Task 1: Tabela `mindmaps` + RLS

**Files:**
- Create: `supabase/mindmaps.sql`

**Interfaces:**
- Produces: tabela `public.mindmaps(id uuid, title text, data jsonb, created_by uuid, is_active bool, created_at timestamptz, updated_at timestamptz)` com RLS select/insert/update pra `authenticated`.

- [ ] **Step 1: Escrever o SQL da tabela e políticas**

Create `supabase/mindmaps.sql`:

```sql
-- Mapas mentais: mapas soltos, árvore inteira guardada em jsonb.
create table if not exists public.mindmaps (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  data jsonb not null default '{}',
  created_by uuid,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.mindmaps enable row level security;

drop policy if exists mindmaps_select on public.mindmaps;
create policy mindmaps_select on public.mindmaps for select to authenticated using (true);
drop policy if exists mindmaps_insert on public.mindmaps;
create policy mindmaps_insert on public.mindmaps for insert to authenticated with check (true);
drop policy if exists mindmaps_update on public.mindmaps;
create policy mindmaps_update on public.mindmaps for update to authenticated using (true) with check (true);
```

- [ ] **Step 2: Rodar no SQL Editor do Supabase**

Manual (Patrícia/Claude via painel): colar o conteúdo no SQL Editor do projeto `wlrkfgbusvpaexndsdse` e executar. Esperado: "Success. No rows returned". (Não há migração automática; o app depende da tabela existir antes de usar a aba.)

- [ ] **Step 3: Commit**

```bash
git add supabase/mindmaps.sql
git commit -m "feat(mapas): tabela mindmaps + RLS"
```

---

### Task 2: Operações puras de árvore em `lib.js`

**Files:**
- Modify: `lib.js` (adicionar funções e exportá-las no objeto de retorno)
- Test: `test/mindmap.test.js` (novo)

**Interfaces:**
- Produces (no `KM`):
  - `mmNewNode(text, color)` → `{ id, text, color, collapsed:false, children:[] }`
  - `mmFind(root, id)` → nó | `null`
  - `mmFindParent(root, id)` → nó | `null`
  - `mmAddChild(root, parentId, node)` → `root`
  - `mmAddSibling(root, nodeId, node)` → `root` (no-op se `nodeId` é a raiz)
  - `mmRemove(root, id)` → `root` (no-op se `id` é a raiz)
  - `mmIsDescendant(root, ancestorId, maybeId)` → bool
  - `mmMove(root, nodeId, newParentId, index)` → `root` (no-op se raiz / destino é descendente / destino == nó)
  - `mmUpdate(root, id, patch)` → `root` (aplica `{text?, color?, collapsed?}`)
  - `mmDefaultChildColor(root, parentId)` → string (cor do pai; fallback `'#2f80ed'`)
  - `mmSafeColor(c)` → string (devolve `c` se casar `/^#[0-9a-fA-F]{3,8}$/`, senão `'#8a8f99'`)
  - `mmLayout(root, opts)` → `[{ id, x, y, depth, parentId }]` (respeita `collapsed`; `x = depth*colW`; `y` = slot)

Convenção: funções que alteram mutam a árvore passada e retornam a raiz. O chamador clona antes se quiser imutabilidade.

- [ ] **Step 1: Escrever os testes que falham**

Create `test/mindmap.test.js`:

```javascript
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

test('mmNewNode cria nó com id, children vazio e collapsed false', () => {
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

test('mmAddSibling insere depois do irmão; raiz = no-op', () => {
  var s = sampleTree();
  var novo = KM.mmNewNode('A2', '#2f80ed');
  KM.mmAddSibling(s.root, s.a.id, novo);
  var kids = s.root.children.map(function(k){ return k.text; });
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
  // move A1 (de A) para B
  KM.mmMove(s.root, s.a1.id, s.b.id, 0);
  assert.strictEqual(KM.mmFindParent(s.root, s.a1.id).id, s.b.id);
  assert.strictEqual(s.a.children.length, 0);
  // reordena: move B para o índice 0 da raiz
  KM.mmMove(s.root, s.b.id, s.root.id, 0);
  assert.strictEqual(s.root.children[0].id, s.b.id);
  // no-op: mover raiz
  var antes = JSON.stringify(s.root);
  KM.mmMove(s.root, s.root.id, s.a.id, 0);
  assert.strictEqual(JSON.stringify(s.root), antes);
  // no-op: mover pra dentro de um descendente (B agora tem A1)
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

test('mmLayout dá x por profundidade e y de slot; respeita collapsed', () => {
  var s = sampleTree();
  var pos = KM.mmLayout(s.root, { colW: 200, gap: 40, startY: 20 });
  var byId = {};
  pos.forEach(function(p){ byId[p.id] = p; });
  assert.strictEqual(byId[s.root.id].x, 0);
  assert.strictEqual(byId[s.a.id].x, 200);
  assert.strictEqual(byId[s.a1.id].x, 400);
  // colapsar A some com A1 do layout
  KM.mmUpdate(s.root, s.a.id, { collapsed: true });
  var pos2 = KM.mmLayout(s.root, { colW: 200, gap: 40, startY: 20 });
  assert.ok(!pos2.some(function(p){ return p.id === s.a1.id; }));
});
```

- [ ] **Step 2: Rodar os testes pra ver falhar**

Run: `node --test test/mindmap.test.js`
Expected: FAIL (`KM.mmNewNode is not a function`).

- [ ] **Step 3: Implementar as funções no `lib.js`**

Dentro da factory do `lib.js` (antes do `return { ... }`), adicionar:

```javascript
  var MM_COLOR_RE = /^#[0-9a-fA-F]{3,8}$/;
  var MM_FALLBACK = '#8a8f99';
  var mmSeq = 0;
  function mmNewNode(text, color) {
    mmSeq += 1;
    return { id: 'n_' + Date.now().toString(36) + '_' + mmSeq, text: text || '', color: mmSafeColor(color), collapsed: false, children: [] };
  }
  function mmSafeColor(c) { return (typeof c === 'string' && MM_COLOR_RE.test(c)) ? c : MM_FALLBACK; }
  function mmFind(root, id) {
    if (!root) return null;
    if (root.id === id) return root;
    var kids = root.children || [];
    for (var i = 0; i < kids.length; i++) { var f = mmFind(kids[i], id); if (f) return f; }
    return null;
  }
  function mmFindParent(root, id) {
    var kids = root && root.children || [];
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
    return !!mmFind({ id: '__', children: a.children }, maybeId);
  }
  function mmMove(root, nodeId, newParentId, index) {
    if (nodeId === newParentId) return root;
    var p = mmFindParent(root, nodeId); if (!p) return root; // raiz => no-op
    if (mmIsDescendant(root, nodeId, newParentId)) return root; // laço => no-op
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
```

E adicionar ao objeto de `return`:

```javascript
    mmNewNode: mmNewNode, mmSafeColor: mmSafeColor, mmFind: mmFind, mmFindParent: mmFindParent,
    mmAddChild: mmAddChild, mmAddSibling: mmAddSibling, mmRemove: mmRemove, mmIsDescendant: mmIsDescendant,
    mmMove: mmMove, mmUpdate: mmUpdate, mmDefaultChildColor: mmDefaultChildColor, mmLayout: mmLayout,
```

- [ ] **Step 4: Rodar os testes pra ver passar**

Run: `node --test test/mindmap.test.js`
Expected: PASS (todos). Rodar também `node --test` (suite completa) pra garantir que nada quebrou.

- [ ] **Step 5: Commit**

```bash
git add lib.js test/mindmap.test.js
git commit -m "feat(mapas): operacoes puras de arvore em KM + testes"
```

---

### Task 3: Persistência `mindmaps` em `supabase-client.js`

**Files:**
- Modify: `supabase-client.js` (mappers + funções + export)
- Test: `test/mappers.test.js` (adicionar casos)

**Interfaces:**
- Consumes: `client()`, `must()` já existentes.
- Produces (no `KMDB`):
  - `mindmapFromRow(r)` → `{ id, title, data, createdBy, isActive, createdAt, updatedAt }`
  - `mindmapToRow(m)` → `{ title, data, ... }` (sem `id`)
  - `listMindmaps()` → Promise<[{ id, title, createdAt, createdBy }]> (sem `data`)
  - `getMindmap(id)` → Promise<mindmap com `data`>
  - `insertMindmap(title, data)` → Promise<mindmap>
  - `updateMindmap(id, patch)` → Promise<mindmap> (patch: `{title?, data?}`)
  - `setMindmapActive(id, active)` → Promise

- [ ] **Step 1: Escrever os testes de mapper que falham**

Adicionar em `test/mappers.test.js`:

```javascript
test('mindmapFromRow converte snake_case para camelCase', () => {
  const row = { id: 'm1', title: 'Campanha', data: { id: 'n_1', text: 'Campanha', children: [] },
    created_by: 'u1', is_active: true, created_at: '2026-10-09T10:00:00Z', updated_at: '2026-10-09T11:00:00Z' };
  const m = KMDB.mindmapFromRow(row);
  assert.strictEqual(m.id, 'm1');
  assert.strictEqual(m.title, 'Campanha');
  assert.strictEqual(m.data.text, 'Campanha');
  assert.strictEqual(m.createdBy, 'u1');
  assert.strictEqual(m.isActive, true);
});

test('mindmapToRow nao inclui id e leva title+data', () => {
  const m = { id: 'm1', title: 'X', data: { id: 'n_1', text: 'X', children: [] } };
  const row = KMDB.mindmapToRow(m);
  assert.strictEqual(row.id, undefined);
  assert.strictEqual(row.title, 'X');
  assert.strictEqual(row.data.text, 'X');
});
```

- [ ] **Step 2: Rodar pra ver falhar**

Run: `node --test test/mappers.test.js`
Expected: FAIL (`KMDB.mindmapFromRow is not a function`).

- [ ] **Step 3: Implementar no `supabase-client.js`**

Adicionar os mappers (perto dos outros `*FromRow`):

```javascript
  function mindmapFromRow(r) {
    return { id: r.id, title: r.title, data: r.data || {}, createdBy: r.created_by || null,
      isActive: r.is_active, createdAt: r.created_at, updatedAt: r.updated_at };
  }
  function mindmapToRow(m) {
    return { title: m.title, data: m.data || {} };
  }
```

Adicionar as funções de acesso (perto das de projeto):

```javascript
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
```

Adicionar ao `return { ... }`:

```javascript
    mindmapFromRow: mindmapFromRow, mindmapToRow: mindmapToRow,
    listMindmaps: listMindmaps, getMindmap: getMindmap, insertMindmap: insertMindmap,
    updateMindmap: updateMindmap, setMindmapActive: setMindmapActive,
```

- [ ] **Step 4: Rodar pra ver passar**

Run: `node --test`
Expected: PASS (suite inteira).

- [ ] **Step 5: Commit**

```bash
git add supabase-client.js test/mappers.test.js
git commit -m "feat(mapas): CRUD de mindmaps no KMDB + testes de mapper"
```

---

### Task 4: Navegação, estado e tela de LISTA de mapas em `app.js`

**Files:**
- Modify: `app.js` (ícone, `NAV_AFTER_AREAS`, roteador, `state`, `viewMindmaps` lista, modal de novo mapa, handlers)
- Modify: `styles.css` (estilos da lista)

**Interfaces:**
- Consumes: `KMDB.listMindmaps/insertMindmap/getMindmap/setMindmapActive`, `KM.mmNewNode`, helpers `icon()`, `esc()`, `showToast()`, `renderContent()`, roteador por hash.
- Produces: rota `#/mapas`; `state.mindmaps`, `state.mapLoaded`, `state.currentMapId`, `state.map`; funções `viewMindmaps()`, `openMap(id)`, `backToMapList()`, `createMapFlow()`.

- [ ] **Step 1: Adicionar ícone e item de menu**

No registro `icon()` (em `app.js`), adicionar um ícone `mapa` (sitemap/ramos), SVG com `stroke="currentColor"`:

```javascript
  mapa: '<circle cx="5" cy="12" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M7 12h5m0 0 4-5m-4 5 4 5"/>',
```

(adaptar ao formato exato do registro existente — mesma estrutura dos outros ícones).

Em `NAV_AFTER_AREAS`, acrescentar depois de Métricas:

```javascript
  { id:'mapas', hash:'#/mapas', label:'Mapas Mentais', icon:'mapa' },
```

(usar as mesmas chaves que os itens vizinhos de `NAV_AFTER_AREAS` usam; conferir o formato real do item de Métricas e espelhar.)

- [ ] **Step 2: Rota + estado**

No `parseRoute`, reconhecer `#/mapas` (e `#/mapas/<id>` opcional) retornando `{ name:'mapas', params:{...} }`. No `renderContent`, adicionar:

```javascript
  else if (r.name === 'mapas') el.innerHTML = viewMindmaps();
```

Inicializar no `state` (onde os outros campos são declarados):

```javascript
  mindmaps: [], mapLoaded: false, currentMapId: null, map: null,
  mapSelectedNodeId: null, mapSaveState: 'salvo', mapMoveMode: false,
```

No título da topbar (`pageTitle`/equivalente), tratar `r.name==='mapas'` → `['Mapas Mentais','Seus mapas de campanha']`.

- [ ] **Step 3: `viewMindmaps()` — lista**

Quando `currentMapId` é null, renderiza a lista. Carrega sob demanda: se `!state.mapLoaded`, dispara `KMDB.listMindmaps()` e re-renderiza.

```javascript
function viewMindmaps(){
  if(state.currentMapId) return viewMapEditor();
  if(!state.mapLoaded){
    KMDB.listMindmaps().then(function(list){ state.mindmaps=list; state.mapLoaded=true; renderContent(); })
      .catch(function(){ showToast('Não foi possível carregar os mapas.'); });
    return '<div class="empty-state" style="padding:40px 0;">Carregando mapas...</div>';
  }
  var cards = state.mindmaps.map(function(m){
    return '<div class="mapcard" data-open-map="'+m.id+'">'+
      '<div class="mapcard-thumb"></div>'+
      '<b>'+esc(m.title)+'</b>'+
      '<div class="mapcard-row"><small>'+fmtDateLong(m.createdAt)+'</small>'+
      '<span class="trash" data-del-map="'+m.id+'">excluir</span></div></div>';
  }).join('');
  return '<div class="mm-head"><h3>Mapas Mentais</h3><button class="btn btn-primary" id="newMapBtn">+ Novo mapa</button></div>'+
    '<div class="maps-grid">'+(cards || '<div class="empty-state">Nenhum mapa ainda. Crie o primeiro.</div>')+'</div>';
}
```

(`fmtDateLong` já existe no app.)

- [ ] **Step 4: Criar / abrir / excluir mapa**

```javascript
function createMapFlow(){
  openSimplePrompt('Novo mapa', 'Nome do mapa', function(nome){
    if(!nome || !nome.trim()) return;
    var root = KM.mmNewNode(nome.trim(), '#fffa2a');
    KMDB.insertMindmap(nome.trim(), root).then(function(m){
      state.mapLoaded=false; state.currentMapId=m.id; state.map=m; state.mapSelectedNodeId=root.id;
      location.hash='#/mapas'; renderContent();
    }).catch(function(){ showToast('Não foi possível criar o mapa.'); });
  });
}
function openMap(id){
  KMDB.getMindmap(id).then(function(m){
    state.currentMapId=m.id; state.map=m;
    state.mapSelectedNodeId = m.data && m.data.id ? m.data.id : null;
    renderContent();
  }).catch(function(){ showToast('Não foi possível abrir o mapa.'); });
}
function backToMapList(){ state.currentMapId=null; state.map=null; state.mapLoaded=false; renderContent(); }
function deleteMap(id){
  if(!confirm('Excluir este mapa? Ele sai da lista.')) return;
  KMDB.setMindmapActive(id,false).then(function(){ state.mapLoaded=false; renderContent(); })
    .catch(function(){ showToast('Não foi possível excluir.'); });
}
```

`openSimplePrompt(titulo, label, cb)`: criar um modal pequeno no padrão dos modais existentes (overlay + input + botões Cancelar/Criar). NÃO usar `window.prompt`. Reusar classes `.modal-overlay`/`.modal`/`.field-row`/`.modal-foot` já existentes.

- [ ] **Step 5: Ligar os eventos**

No handler delegado de `click` (`document.addEventListener('click', ...)`), adicionar:

```javascript
  if(e.target.closest('#newMapBtn')){ createMapFlow(); return; }
  var oc=e.target.closest('[data-open-map]'); if(oc && !e.target.closest('[data-del-map]')){ openMap(oc.getAttribute('data-open-map')); return; }
  var dm=e.target.closest('[data-del-map]'); if(dm){ e.stopPropagation(); deleteMap(dm.getAttribute('data-del-map')); return; }
```

- [ ] **Step 6: Estilos da lista no `styles.css`**

```css
.mm-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;gap:10px;flex-wrap:wrap;}
.maps-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;}
.mapcard{border:1px solid var(--border);border-radius:12px;padding:14px;background:var(--surface-2);display:flex;flex-direction:column;gap:10px;cursor:pointer;}
.mapcard-thumb{height:60px;border-radius:8px;background:var(--surface);border:1px solid var(--border);}
.mapcard b{font-size:13.5px;}
.mapcard-row{display:flex;align-items:center;justify-content:space-between;}
.mapcard small{color:var(--text-muted);font-size:11.5px;}
.mapcard .trash{color:var(--text-muted);font-size:11.5px;}
.mapcard .trash:hover{color:var(--danger,#db0808);}
```

(Conferir os nomes reais das variáveis CSS do projeto — `--border`, `--surface-2`, `--text-muted` — e ajustar aos tokens que existem.)

- [ ] **Step 7: Verificar no navegador**

Servir local (`npx --yes serve -l 5173 .`), logar, abrir aba Mapas Mentais, criar um mapa de teste, ver aparecer na lista, abrir, voltar, excluir. Conferir console sem erros. (Editor ainda não renderiza a árvore — Task 5.)

- [ ] **Step 8: Commit**

```bash
git add app.js styles.css
git commit -m "feat(mapas): aba, lista, criar/abrir/excluir mapa"
```

---

### Task 5: Editor — render da árvore (nós + curvas SVG)

**Files:**
- Modify: `app.js` (`viewMapEditor`, `renderMapStage`, `mapAutosave`)
- Modify: `styles.css` (nós, wires, actionbar, canvas)

**Interfaces:**
- Consumes: `KM.mmLayout/mmSafeColor/mmFind/esc`, `state.map`, `state.mapSelectedNodeId`.
- Produces: `viewMapEditor()` (HTML do editor), `renderMapStage()` (posiciona nós + desenha SVG — roda após o HTML estar no DOM), `mapAutosave()` (debounce → `KMDB.updateMindmap`), `mapColors` (paleta de atalho).

- [ ] **Step 1: `viewMapEditor()` + barra de ações**

```javascript
var MAP_SWATCHES = ['#fffa2a','#db0808','#2f80ed','#27ae60','#9b51e0','#e8590c'];
function viewMapEditor(){
  var m=state.map; var sel=state.mapSelectedNodeId; var isRoot = m.data && sel===m.data.id;
  var selNode = KM.mmFind(m.data, sel);
  var saveTxt = state.mapSaveState==='salvando'?'salvando...':state.mapSaveState==='erro'?'erro ao salvar':'salvo';
  var bar = '<div class="mm-actionbar">'+
    '<span class="mm-sel">Ramo: <b>'+(selNode?esc(selNode.text):'—')+'</b></span>'+
    '<button class="chip" data-mm="child">+ ramo filho</button>'+
    '<button class="chip" data-mm="sibling"'+(isRoot?' disabled':'')+'>+ ramo irmão</button>'+
    '<button class="chip" data-mm="rename">renomear</button>'+
    '<label class="chip">cor <input type="color" id="mmColor" value="'+(selNode?KM.mmSafeColor(selNode.color):'#2f80ed')+'">'+
      '<span class="mm-swatches">'+MAP_SWATCHES.map(function(c){return '<span class="mm-sw" data-mm-color="'+c+'" style="background:'+c+'"></span>';}).join('')+'</span></label>'+
    '<button class="chip" data-mm="move"'+(isRoot?' disabled':'')+'>mover</button>'+
    '<button class="chip chip-danger" data-mm="delete"'+(isRoot?' disabled':'')+'>excluir</button>'+
    '</div>';
  return '<div class="mm-top"><button class="btn btn-ghost btn-sm" id="mapBackBtn">voltar</button>'+
    '<span class="mm-name">'+esc(m.title)+'</span>'+
    '<span class="mm-save mm-save-'+state.mapSaveState+'">'+saveTxt+'</span></div>'+
    bar + (state.mapMoveMode?'<div class="mm-movehint">Toque no ramo-destino pra pendurar o ramo ali.</div>':'')+
    '<div class="mm-canvas"><div class="mm-stage" id="mmStage"></div></div>';
}
```

- [ ] **Step 2: `renderMapStage()` — posicionar nós e desenhar curvas**

Chamar sempre DEPOIS de `renderContent()` quando a rota é `mapas` e há `currentMapId`. Implementar hook: ao final de `renderContent`, `if(state.route.name==='mapas' && state.currentMapId) renderMapStage();`.

```javascript
function renderMapStage(){
  var stage=document.getElementById('mmStage'); if(!stage||!state.map) return;
  var root=state.map.data; stage.innerHTML='';
  var COLW=210, GAP=40, Y0=16;
  var pos={}; KM.mmLayout(root,{colW:COLW,gap:GAP,startY:Y0}).forEach(function(p){ pos[p.id]=p; });
  // nós
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
  // altura/largura do palco
  var maxY=0,maxX=0; nodes.forEach(function(n){ maxY=Math.max(maxY,pos[n.id].y); maxX=Math.max(maxX,pos[n.id].x+n._el.offsetWidth); });
  stage.style.height=(maxY+40)+'px'; stage.style.minWidth=(maxX+20)+'px';
  // curvas SVG
  var svgns='http://www.w3.org/2000/svg';
  var svg=document.createElementNS(svgns,'svg'); svg.setAttribute('class','mm-wires');
  (function wire(n){
    if(n.collapsed) return;
    (n.children||[]).forEach(function(k){
      if(!pos[k.id]) return;
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
```

- [ ] **Step 3: Estilos do editor no `styles.css`**

```css
.mm-top{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px;}
.mm-name{font-size:15px;font-weight:700;}
.mm-save{margin-left:auto;font-size:11.5px;color:var(--text-muted);}
.mm-save-salvando{color:var(--text-muted);} .mm-save-erro{color:var(--danger,#db0808);}
.mm-actionbar{display:flex;flex-wrap:wrap;gap:7px;align-items:center;padding:10px;border:1px solid var(--border);border-radius:11px;background:var(--surface-2);margin-bottom:8px;}
.mm-sel{font-size:11.5px;color:var(--text-muted);margin-right:4px;}
.mm-actionbar .chip{font:inherit;font-size:12px;font-weight:600;border:1px solid var(--border);background:var(--surface);color:var(--text);padding:6px 10px;border-radius:8px;display:inline-flex;align-items:center;gap:6px;cursor:pointer;}
.mm-actionbar .chip[disabled]{opacity:.4;cursor:default;}
.mm-actionbar .chip-danger{color:var(--danger,#db0808);}
.mm-swatches{display:inline-flex;gap:4px;margin-left:4px;}
.mm-sw{width:15px;height:15px;border-radius:5px;border:1px solid rgba(0,0,0,.2);cursor:pointer;}
.mm-movehint{font-size:12px;color:var(--text-muted);margin-bottom:8px;}
.mm-canvas{border:1px solid var(--border);border-radius:12px;background:var(--surface);padding:20px 18px;overflow:auto;max-height:70vh;}
.mm-stage{position:relative;}
.mm-wires{position:absolute;inset:0;overflow:visible;pointer-events:none;}
.mm-node{position:absolute;transform:translateY(-50%);padding:5px 12px 5px 19px;border-radius:999px;font-size:12px;font-weight:600;white-space:nowrap;cursor:pointer;
  --c:#8a8f99;background:color-mix(in srgb,var(--c) 16%,transparent);
  color:color-mix(in srgb,var(--c) 66%,var(--text));border:1px solid color-mix(in srgb,var(--c) 32%,transparent);}
.mm-node::before{content:"";position:absolute;left:9px;top:50%;transform:translateY(-50%);width:5px;height:5px;border-radius:50%;background:var(--c);}
.mm-node.sel{outline:1.5px solid var(--accent);outline-offset:2px;}
.mm-node.mm-drop{outline:2px dashed var(--accent);outline-offset:2px;}
.mm-collapse{position:absolute;right:-8px;top:50%;transform:translateY(-50%);width:14px;height:14px;border-radius:50%;background:var(--surface);border:1px solid var(--text-muted);color:var(--text-muted);font-size:9px;font-weight:700;display:grid;place-items:center;}
```

- [ ] **Step 4: Verificar no navegador**

Servir local, abrir um mapa que já tem só a raiz. Deve aparecer a bolha central. (Interações na Task 6.) Console sem erros; a raiz renderiza; claro/escuro ok.

- [ ] **Step 5: Commit**

```bash
git add app.js styles.css
git commit -m "feat(mapas): editor renderiza arvore com curvas SVG delicadas"
```

---

### Task 6: Interações do editor (criar, renomear, cor, excluir, colapsar, selecionar, mover) + autosave

**Files:**
- Modify: `app.js` (handlers de click/change/keydown/drag, `mapAutosave`, `mapMutate`)

**Interfaces:**
- Consumes: tudo do `KM.mm*`, `KMDB.updateMindmap`, `renderContent`.
- Produces: `mapMutate(fn)` (aplica mudança na árvore + re-render + autosave), `mapAutosave()`.

- [ ] **Step 1: Helper de mutação + autosave**

```javascript
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
  KMDB.updateMindmap(state.map.id,{ title: state.map.title, data: state.map.data })
    .then(function(){ state.mapSaveState='salvo'; if(state.route.name==='mapas'&&state.currentMapId) updateSaveBadge(); })
    .catch(function(){ state.mapSaveState='erro'; showToast('Não foi possível salvar o mapa.'); if(state.route.name==='mapas') updateSaveBadge(); });
}
function updateSaveBadge(){ var b=document.querySelector('.mm-save'); if(b){ b.className='mm-save mm-save-'+state.mapSaveState; b.textContent=state.mapSaveState==='salvando'?'salvando...':state.mapSaveState==='erro'?'erro ao salvar':'salvo'; } }
```

(Renomear a raiz atualiza `state.map.title` também — ver Step 3.)

- [ ] **Step 2: Selecionar nó + colapsar (click no palco)**

No handler de click delegado:

```javascript
  var cl=e.target.closest('[data-collapse]');
  if(cl){ var cid=cl.getAttribute('data-collapse'); var cn=KM.mmFind(state.map.data,cid); mapMutate(function(root){ KM.mmUpdate(root,cid,{collapsed:!cn.collapsed}); }); return; }
  var nd=e.target.closest('[data-node]');
  if(nd && state.map){
    var nid=nd.getAttribute('data-node');
    if(state.mapMoveMode && state.mapSelectedNodeId && nid!==state.mapSelectedNodeId){
      var moving=state.mapSelectedNodeId; state.mapMoveMode=false;
      mapMutate(function(root){ KM.mmMove(root, moving, nid); });
      return;
    }
    state.mapSelectedNodeId=nid; renderContent(); return;
  }
```

- [ ] **Step 3: Barra de ações (`data-mm`)**

```javascript
  var mm=e.target.closest('[data-mm]');
  if(mm && state.map){
    var act=mm.getAttribute('data-mm'); var sel=state.mapSelectedNodeId; var root=state.map.data;
    if(act==='child'){ var nc=KM.mmNewNode('Novo ramo', KM.mmDefaultChildColor(root,sel)); mapMutate(function(r){ KM.mmAddChild(r,sel,nc); }); state.mapSelectedNodeId=nc.id; renderContent(); return; }
    if(act==='sibling'){ var p=KM.mmFindParent(root,sel); if(!p) return; var ns=KM.mmNewNode('Novo ramo', KM.mmDefaultChildColor(root,p.id)); mapMutate(function(r){ KM.mmAddSibling(r,sel,ns); }); state.mapSelectedNodeId=ns.id; renderContent(); return; }
    if(act==='rename'){ mapRenameNode(sel); return; }
    if(act==='delete'){ if(root.id===sel) return; if(!confirm('Excluir este ramo e tudo que pendura nele?')) return; var par=KM.mmFindParent(root,sel); mapMutate(function(r){ KM.mmRemove(r,sel); }); state.mapSelectedNodeId=par?par.id:root.id; renderContent(); return; }
    if(act==='move'){ if(root.id===sel) return; state.mapMoveMode=!state.mapMoveMode; renderContent(); return; }
    return;
  }
  var sw=e.target.closest('[data-mm-color]');
  if(sw && state.map){ var col=sw.getAttribute('data-mm-color'); mapMutate(function(r){ KM.mmUpdate(r,state.mapSelectedNodeId,{color:col}); }); return; }
```

`mapRenameNode(id)`: abrir o mesmo `openSimplePrompt` com o texto atual, e no callback:

```javascript
function mapRenameNode(id){
  var n=KM.mmFind(state.map.data,id); if(!n) return;
  openSimplePrompt('Renomear ramo','Texto do ramo', function(novo){
    if(novo===null||novo===undefined) return; var txt=novo.trim(); if(!txt) return;
    mapMutate(function(root){ KM.mmUpdate(root,id,{text:txt}); if(root.id===id) state.map.title=txt; });
  }, n.text);
}
```

(Estender `openSimplePrompt(titulo,label,cb,valorInicial)` pra aceitar valor inicial.)

- [ ] **Step 4: Troca de cor pelo input nativo (`change`)**

No handler delegado de `change`:

```javascript
  if(e.target.id==='mmColor' && state.map){ var c=e.target.value; mapMutate(function(r){ KM.mmUpdate(r,state.mapSelectedNodeId,{color:c}); }); return; }
```

- [ ] **Step 5: Atalhos de teclado (desktop)**

Adicionar listener `keydown` (quando a rota é mapas, há mapa aberto, e o foco não está num input/textarea):

```javascript
document.addEventListener('keydown', function(e){
  if(state.route.name!=='mapas' || !state.currentMapId || !state.mapSelectedNodeId) return;
  if(/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
  var root=state.map.data, sel=state.mapSelectedNodeId;
  if(e.key==='Tab'){ e.preventDefault(); var nc=KM.mmNewNode('Novo ramo',KM.mmDefaultChildColor(root,sel)); mapMutate(function(r){KM.mmAddChild(r,sel,nc);}); state.mapSelectedNodeId=nc.id; renderContent(); }
  else if(e.key==='Enter'){ e.preventDefault(); var p=KM.mmFindParent(root,sel); if(!p) return; var ns=KM.mmNewNode('Novo ramo',KM.mmDefaultChildColor(root,p.id)); mapMutate(function(r){KM.mmAddSibling(r,sel,ns);}); state.mapSelectedNodeId=ns.id; renderContent(); }
  else if(e.key==='F2'){ e.preventDefault(); mapRenameNode(sel); }
  else if(e.key==='Delete'){ if(root.id===sel) return; var par=KM.mmFindParent(root,sel); mapMutate(function(r){KM.mmRemove(r,sel);}); state.mapSelectedNodeId=par?par.id:root.id; renderContent(); }
});
```

- [ ] **Step 6: Arrastar pra reorganizar (desktop)**

Nós têm `draggable="true"`. Adicionar listeners delegados de `dragstart`/`dragover`/`drop` no palco:

```javascript
var _mapDragId=null;
document.addEventListener('dragstart', function(e){ var n=e.target.closest('[data-node]'); if(n){ _mapDragId=n.getAttribute('data-node'); e.dataTransfer.effectAllowed='move'; } });
document.addEventListener('dragover', function(e){ var n=e.target.closest('[data-node]'); if(n && _mapDragId){ e.preventDefault(); document.querySelectorAll('.mm-node.mm-drop').forEach(function(x){x.classList.remove('mm-drop');}); if(n.getAttribute('data-node')!==_mapDragId) n.classList.add('mm-drop'); } });
document.addEventListener('drop', function(e){ var n=e.target.closest('[data-node]'); if(n && _mapDragId){ e.preventDefault(); var target=n.getAttribute('data-node'); var moving=_mapDragId; _mapDragId=null; document.querySelectorAll('.mm-node.mm-drop').forEach(function(x){x.classList.remove('mm-drop');}); if(target!==moving){ mapMutate(function(r){ KM.mmMove(r,moving,target); }); } } });
document.addEventListener('dragend', function(){ _mapDragId=null; document.querySelectorAll('.mm-node.mm-drop').forEach(function(x){x.classList.remove('mm-drop');}); });
```

- [ ] **Step 7: Ligar `mapBackBtn`**

No handler de click: `if(e.target.closest('#mapBackBtn')){ backToMapList(); return; }`

- [ ] **Step 8: Verificar no navegador (teste completo)**

Servir local. Num mapa: criar filho, criar irmão, renomear (inclusive a raiz → muda o nome na lista), trocar cor (swatch e input), colapsar/expandir, excluir ramo, arrastar um ramo pra outro (reparent), usar o botão "mover" no fluxo de toque. Recarregar a página e confirmar que persistiu (autosave). Conferir claro e escuro. Console sem erros.

- [ ] **Step 9: Commit**

```bash
git add app.js
git commit -m "feat(mapas): interacoes do editor (criar/renomear/cor/excluir/colapsar/mover) + autosave"
```

---

### Task 7: Deploy

**Files:**
- Modify: `index.html` (bump cache-busting)

- [ ] **Step 1: Bump de versão**

Em `index.html`, subir `?v=N` de `app.js`, `lib.js`, `styles.css` e `supabase-client.js` (os 4 mudaram) pro próximo número.

- [ ] **Step 2: Rodar a suíte completa**

Run: `node --test` → Expected: todos PASS. E `node -c app.js` sem erro.

- [ ] **Step 3: Confirmar a tabela no Supabase**

Garantir que o SQL da Task 1 já foi rodado no painel (sem isso a aba quebra ao salvar/listar).

- [ ] **Step 4: Commit + push**

```bash
git add index.html
git commit -m "chore(mapas): cache-busting para deploy dos Mapas Mentais"
git push origin master
```

- [ ] **Step 5: Teste no ar**

Abrir `https://gerenciador.kabelera.com.br` (Ctrl+F5), criar um mapa de verdade, desenhar uns ramos, recarregar, confirmar persistência. Conferir no celular.

---

## Notas de verificação (lição da sessão anterior)

Teste unitário não pega "tela branca". Para Tasks 4, 5 e 6, o passo "verificar no navegador" é obrigatório antes do commit final de cada uma — carregar a página de verdade e olhar o console, porque bugs de `ReferenceError` em runtime passam nos testes e quebram a tela.
