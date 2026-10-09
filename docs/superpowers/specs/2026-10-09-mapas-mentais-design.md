# Mapas Mentais — Design

Data: 2026-10-09
Projeto: Kabelera Manager

## Problema

O time usa o MindMeister pra desenhar as campanhas do mês (tema central → canais → peças). É mais uma ferramenta fora do gestor. Queremos trazer essa função pra dentro do Kabelera Manager, como uma seção própria.

## Objetivo

Uma aba **"Mapas Mentais"** no menu, com mapas soltos (independentes de projeto/área/tarefa), salvos no Supabase e compartilhados com o time. Cada mapa é uma árvore: um tema central que abre em ramos, e cada ramo abre em mais ramos, sem limite de profundidade. Cada ramo tem **texto** e **cor livre**.

## Decisões (confirmadas com a Patrícia)

- **Onde mora:** seção própria no menu ("Mapas Mentais"), depois de Métricas. Mapas soltos, não ligados a projeto/tarefa/área.
- **Compartilhamento:** salvos no Supabase, visíveis e editáveis por qualquer pessoa logada — mesmo modelo de `tasks`/`projects`. Dois editando o mesmo mapa ao mesmo tempo: vale o último que salvou (last-write-wins, igual às tarefas hoje).
- **Exclusão:** lógica (`is_active=false`), igual tarefa/projeto. Nunca DELETE.
- **Estilo de edição:** árvore com **layout automático** (não é tela livre de arrastar). O usuário cria ramos; o app posiciona.
- **Formato:** árvore **horizontal** — tema central à esquerda, ramos abrindo pra direita em níveis. (Formato "sol" pros dois lados foi descartado por YAGNI/robustez; pode evoluir depois.)
- **Ramo:** texto + **cor livre** (`<input type="color">`), com atalhos de swatches da marca Kabelera ao lado. Ramo novo **herda a cor do pai** por padrão.
- **Recolher/expandir:** ramo com filhos tem um controle pra colapsar aquele galho.
- **Reorganizar (mover):** o usuário pode arrastar um ramo pra pendurar em OUTRO ramo (trocar de galho / reparent) e reordenar irmãos. O app continua fazendo o layout automático — não é posicionamento livre em tela branca. A raiz não pode ser movida; um ramo não pode ser solto dentro de um descendente dele (evita laço).
- **Aparência dos ramos:** fundo da cor **translúcido** (~20%), com bolinha e texto na cor — idêntico ao estilo de pílula que o gestor já usa (`.dep-pill`: `background:rgba(var(--dep-rgb),.22)`). Como a transparência já suaviza, a cor base pode ser viva (incluindo o amarelo `#fffa2a` e o vermelho `#db0808` da marca) — fica fosca na tela de qualquer jeito. **Sem grade no fundo** do canvas. Linhas conectoras com **contraste** (token próprio `--wire`, cinza claro visível no escuro e no claro), não na cor do fundo.
- **Autosave:** salva sozinho após cada mudança (debounce), sem botão de salvar.
- **Tema:** respeita claro/escuro do app.
- **Virar tarefa do gestor:** fora de escopo agora (pode plugar no futuro).

## Estado atual do código (ponto de partida)

- **`lib.js` (`KM`)** — helpers puros, cobertos por testes em `test/`. É onde entram as operações de árvore (testáveis sem DOM). Hoje tem `esc`, `FLOWS`, `priorityClass`, etc.
- **`supabase-client.js` (`KMDB`)** — mappers `*FromRow`/`*ToRow` + funções de acesso. `loadAll()` (linha 78) carrega areas/users/projects/tasks/notifications de uma vez no login. Padrão de escrita: `insertX`/`updateX`/`setXActive`.
- **`app.js`** (~90KB, arquivo único) — estado global em `state`, roteador por hash (`parseRoute`, `renderContent` linha ~461), navegação (`NAV_AFTER_AREAS` linha ~369 define os itens após as áreas; `AREA_ICON`/`icon()` pros ícones SVG), drawer e modais. As telas que não são área (ex.: Métricas, `viewMetrics()`) são o molde a seguir para "Mapas Mentais".
- **`styles.css`** — variáveis de tema por `:root` / `:root[data-theme="light"]`; usar `var(--...)` pra herdar claro/escuro.
- **`index.html`** — scripts versionados com `?v=N` pra cache-busting. Hoje: `app.js?v=14`, `lib.js?v=10`, `styles.css?v=12`.
- **Schema/RLS (`supabase/schema.sql`)** — `projects` usa RLS aberta pra autenticados: `projects_select using(true)`, `projects_insert with check(true)`, `projects_update using(true) with check(true)`. É o molde da nova tabela.
- **Lição de segurança (auditoria 2026-10-08):** todo campo editável pelo usuário renderizado na tela TEM que passar por `esc()`. Aqui isso vale pro texto do ramo **e** pra cor (cor entra em `style`, então precisa ser sanitizada).

## Abordagem escolhida

Três camadas, seguindo a arquitetura que já existe:

1. **Lógica pura da árvore em `lib.js` (`KM`)** — funções sem DOM, cobertas por testes unitários.
2. **Persistência em `supabase-client.js` (`KMDB`)** — nova tabela `mindmaps`, carregada **sob demanda** (quando a aba abre), não no `loadAll()` — pra não pesar o login/dashboard.
3. **Renderização e interação em `app.js`** — nova view `viewMindmaps()`, item no menu, estado no `state`.

**Alternativa descartada:** carregar os mapas no `loadAll()`. Rejeitada porque o mapa (jsonb da árvore) pode crescer e só é necessário quando a pessoa entra na aba; carregamento preguiçoso mantém o resto do app leve.

**Alternativa descartada:** tabela de nós (uma linha por ramo) com consulta recursiva. Rejeitada por YAGNI — a árvore inteira cabe num `jsonb` só; campanhas são pequenas, e salvar/carregar um documento é muito mais simples e robusto que montar árvore a partir de linhas.

## Modelo de dados

### Tabela `public.mindmaps`

```sql
create table if not exists public.mindmaps (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  data jsonb not null default '{}',   -- nó raiz da árvore (ver formato abaixo)
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

### Formato da árvore (`data`)

A coluna `data` guarda o **nó raiz** (o tema central). Cada nó:

```json
{
  "id": "n_abc123",
  "text": "Campanha Natal",
  "color": "#fffa2a",
  "collapsed": false,
  "children": [ { "...nó filho..." } ]
}
```

- O **nó raiz é o tema central** e não pode ser excluído. O `text` do raiz espelha o `title` do mapa: renomear o nó central renomeia o mapa (uma fonte de verdade só, mantida em sincronia).
- `color`: string hex (`#rgb`/`#rrggbb`). Sanitizada na renderização.
- `collapsed`: quando `true`, os filhos daquele nó ficam escondidos no editor (não afeta os dados).

## Camada 1 — `lib.js` (`KM`), lógica pura testável

Funções que operam sobre o objeto-árvore e **não tocam no DOM**. Convenção: mutam uma cópia passada pelo chamador (o `app.js` clona antes de persistir) e retornam a raiz.

- `newMindmapNode(text, color)` → `{ id, text, color, collapsed:false, children:[] }` (id via contador/uuid curto).
- `findNode(root, id)` → nó ou `null`.
- `findParent(root, id)` → nó pai ou `null` (raiz não tem pai).
- `addChild(root, parentId, node)` → empurra `node` em `children` do pai.
- `addSibling(root, nodeId, node)` → insere `node` logo depois de `nodeId` sob o mesmo pai (no-op se `nodeId` for a raiz → vira filho? **Decisão:** irmão da raiz não existe; a ação "irmão" fica desabilitada quando o selecionado é a raiz).
- `removeNode(root, id)` → remove o nó e todo o galho; **no-op se `id` for a raiz**.
- `moveNode(root, nodeId, newParentId, index)` → tira `nodeId` de onde está e insere como filho de `newParentId` na posição `index` (reparent + reordenar). **No-op se**: `nodeId` for a raiz, ou `newParentId` for descendente de `nodeId` (evita laço), ou `newParentId === nodeId`. Reordenar irmão = mover pro mesmo pai em outro `index`.
- `isDescendant(root, ancestorId, maybeDescId)` → auxiliar pro guard de laço do `moveNode`.
- `updateNode(root, id, patch)` → aplica `{text?, color?, collapsed?}`.
- `defaultChildColor(root, parentId)` → devolve a cor do pai (herança), com fallback.
- `safeColor(c)` → devolve `c` só se casar com `/^#[0-9a-fA-F]{3,8}$/`, senão uma cor padrão. **Usada tanto na renderização quanto antes de salvar.**
- `layoutTree(root)` → calcula posições pro layout horizontal: percorre a árvore (respeitando `collapsed`) e devolve uma lista de `{ id, x, y, parentId }`. `x = profundidade * PASSO_X`; `y` = slot vertical (folhas ganham slots sequenciais; nó interno recebe a média dos slots dos filhos). Função pura → testável sem desenhar nada.

Essas funções entram no objeto exportado do `KM` e ganham testes em `test/`.

## Camada 2 — `supabase-client.js` (`KMDB`), persistência

- `mindmapFromRow(r)` / `mindmapToRow(m)` — mappers (camelCase ↔ snake_case; `createdBy`/`created_by`, `data`, `title`, `isActive`).
- `listMindmaps()` → `select id,title,created_at,created_by` de mapas `is_active=true`, ordenado por `created_at desc` (lista leve, sem o `data`).
- `getMindmap(id)` → `select *` de um mapa (traz o `data`).
- `insertMindmap(title, data)` → insere e devolve o mapa.
- `updateMindmap(id, patch)` → `update {title?, data?, updated_at:now()}`.
- `setMindmapActive(id, active)` → soft delete.

Expostos no retorno do módulo `KMDB`. Não entram no `loadAll()`.

## Camada 3 — `app.js`, view e interação

### Navegação e estado

- Novo item no menu (`NAV_AFTER_AREAS`): `{ id:'mapas', label:'Mapas Mentais', icon:'<novo ícone>' }`, rota `#/mapas`. Novo ícone SVG tipo "sitemap/ramos" no registro `icon()`.
- `state.mindmaps` (lista leve, carregada sob demanda), `state.currentMapId` (null = tela de lista), `state.map` (o mapa aberto, com `data`), `state.mapSelectedNodeId`, `state.mapSaveState` ('salvo'|'salvando'|'erro').

### Tela de lista (`currentMapId == null`)

- Carrega `listMindmaps()` na primeira vez que a aba abre.
- Cards/linhas: nome do mapa + data + (quem criou). Clique abre o mapa (`getMindmap`, seta `state.map`, `currentMapId`).
- Botão **"+ Novo mapa"**: abre um **modal pequeno** pedindo o nome (mesmo padrão visual dos modais de projeto/tarefa — nunca `window.prompt`, que é bloqueante), cria com `insertMindmap(nome, { raiz com text=nome })`, abre direto.
- Cada card tem excluir (soft delete, com confirmação).

### Editor (`currentMapId != null`)

- **Topo:** nome do mapa + botão "voltar pra lista" + indicador de autosave ("salvo"/"salvando…"/"erro ao salvar").
- **Barra de ações do nó selecionado** (fixa no topo do editor, boa pra desktop e mobile): **+ ramo filho**, **+ ramo irmão** (desabilitado se raiz), **renomear**, **cor** (`input type=color` + swatches da marca), **excluir** (desabilitado se raiz; confirma antes, avisando que leva o galho junto).
- **Canvas:** área rolável (scroll horizontal e vertical), **fundo liso** (sem grade). Nós posicionados por `KM.layoutTree`: cada nó é uma pílula arredondada **delicada** (borda fina, texto leve) com fundo **translúcido** na cor (~14-20% de opacidade, bolinha pequena + texto na cor), no espírito do `.dep-pill` do gestor. A cor passa por `KM.safeColor(node.color)` e o texto por `esc(node.text)`.
- **Conectores (curvas delicadas, estilo MindMeister):** cada ligação pai→filho é um **path SVG com curva de Bézier** (não cotovelo reto), **fino** (~1.4px), **colorido com a cor do ramo-filho** (não `--wire`), com uma **bolinha pequena na junção** do filho. O SVG fica numa camada atrás dos nós (`pointer-events:none`). As posições vêm do `KM.layoutTree` (x por profundidade, y por slot) e das larguras medidas dos nós. Nada de grade nem de linha cinza reta — a referência é fina e orgânica.
- **Seleção:** clique seleciona o nó (destaque com contorno). **Duplo-clique** ou **F2** entra em modo renomear (input inline). **Enter** confirma.
- **Recolher/expandir:** nós com filhos mostram um controle (bolinha); alterna `collapsed` via `updateNode` e re-renderiza.
- **Mover (reorganizar):** no **desktop**, arrastar um ramo e soltar sobre outro → reparent (`moveNode`); soltar entre dois irmãos → reordena. Feedback visual de "pode soltar aqui". No **mobile** (arrasto fino é frágil), a barra de ações tem um botão **"mover"**: seleciona o ramo, toca "mover", e aí toca no ramo-destino pra pendurar nele. Os dois caminhos chamam o mesmo `moveNode` (com os guards de raiz/laço).
- **Atalhos (desktop):** com um nó selecionado — **Tab** = novo filho, **Enter** = novo irmão, **F2** = renomear, **Delete** = excluir. No mobile, tudo pelos botões.
- **Herança de cor:** novo ramo nasce com `KM.defaultChildColor` (cor do pai).

### Autosave

- Toda mudança (criar/renomear/cor/excluir/colapsar) atualiza `state.map.data` em memória, re-renderiza, e agenda um save com **debounce (~800ms)** via `updateMindmap`.
- Sucesso → `mapSaveState='salvo'`. Falha → `mapSaveState='erro'`, mostra toast "Não foi possível salvar — tente de novo." (sem reverter a tela, pra não perder digitação; o próximo autosave tenta de novo).
- Renomear o **nó raiz** também atualiza `title` no mesmo save.

## Segurança

- **Texto do ramo** sempre renderizado com `esc()` (regra da auditoria 2026-10-08).
- **Cor** sempre passada por `KM.safeColor()` antes de entrar em `style=`, pra impedir injeção de CSS via `data` adulterado no banco.
- RLS é a única proteção (a publishable key é pública por design) — por isso as policies acima são explícitas.

## Testes

- **Unitários (`test/`, `node --test`):** `addChild`/`addSibling` (incluindo irmão-da-raiz = no-op), `removeNode` (remove galho; raiz = no-op), `moveNode` (reparent, reordenar irmão, e no-op quando raiz / destino é descendente / destino == nó), `isDescendant`, `updateNode`, `defaultChildColor` (herança), `safeColor` (aceita hex, rejeita lixo), `layoutTree` (slots e x por profundidade; respeita `collapsed`), mappers `mindmapFromRow`/`mindmapToRow`.
- **Navegador (lição da sessão anterior — teste unitário não pega tela branca):** abrir a aba, criar mapa, adicionar/renomear/colorir/excluir ramos, recolher galho, confirmar autosave e recarregar vendo persistir; conferir claro e escuro; conferir no mobile (botões).

## Deploy

1. Rodar o SQL da tabela `mindmaps` + policies no SQL Editor do Supabase (arquivo `supabase/mindmaps.sql`).
2. Novos helpers no `lib.js`, novas funções no `supabase-client.js`, nova view no `app.js`.
3. Bump de cache-busting no `index.html` (`app.js`, `lib.js`, e `styles.css` se houver CSS novo).
4. Commit + push no `master` (GitHub Pages republica).
5. Teste no ar em `gerenciador.kabelera.com.br`.

## Fora de escopo (futuro)

- Formato "sol" (ramos pros dois lados).
- Posicionamento livre em tela branca (soltar o ramo em qualquer ponto x/y). O que entra é reorganizar a árvore (reparent + reordenar); o layout continua automático.
- Transformar um ramo em tarefa do gestor.
- Anexos/links/ícones dentro do ramo.
- Colaboração em tempo real (hoje é last-write-wins).
