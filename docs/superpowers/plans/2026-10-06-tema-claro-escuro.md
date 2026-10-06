# Tema claro/escuro (sol/lua) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Um botão sol/lua na barra superior que alterna entre tema claro e escuro, com a escolha lembrada por aparelho (localStorage), sem flash ao abrir.

**Architecture:** Reaproveita o sistema de temas por atributo `data-theme` já existente no CSS. Um bloco novo `:root[data-theme="light"]` define a paleta clara da marca (botões escuros + detalhe amarelo). Um script inline no `<head>` aplica o tema salvo antes da pintura. O `app.js` liga o botão (troca `data-theme`, grava no localStorage, troca o ícone). A lógica pura de validar o tema vive em `lib.js` e tem teste unitário.

**Tech Stack:** HTML/CSS/JS vanilla (sem build), `node --test` para os testes unitários, localStorage.

## Global Constraints

- Sem banco, sem schema: persistência só em `localStorage`, chave `km-theme`, valores `'light'` | `'dark'`.
- Padrão (sem escolha salva ou valor inválido): `'dark'`.
- Tema escuro inalterado (amarelo `#FFFA2A` sobre fundo escuro).
- Tema claro: fundo branco/claro, textos escuros, botão primário escuro (`--accent:#151824`, texto `--accent-contrast:#FFFFFF`), amarelo Kabelera só como detalhe/realce (`--accent-soft:rgba(255,250,42,.22)`), nunca amarelo como texto sobre branco.
- Botão na `.topbar-actions`, id `#themeToggleBtn`, antes do `#refreshBtn`.
- Toda alteração de asset exige subir o `?v=N` no `index.html` (hoje `?v=8` → `?v=9`) pra furar cache.
- Idioma pt-BR nos textos visíveis; sem travessão.
- lib.js é UMD: funções novas entram no objeto retornado no `return { ... }` e viram `KM.<nome>` no navegador e `require('../lib.js')` nos testes.

---

### Task 1: Helper puro `normalizeTheme` em lib.js (com teste)

**Files:**
- Modify: `lib.js` (adicionar função + export no `return`)
- Test: `test/lib.test.js` (adicionar casos)

**Interfaces:**
- Produces: `KM.normalizeTheme(raw) -> 'light' | 'dark'` — retorna `'light'` só quando `raw === 'light'`; qualquer outra coisa (`'dark'`, `null`, `undefined`, lixo) retorna `'dark'`.

- [ ] **Step 1: Escrever o teste que falha**

Adicionar ao fim de `test/lib.test.js`:
```js
test('normalizeTheme retorna light so para "light", senao dark', () => {
  assert.strictEqual(KM.normalizeTheme('light'), 'light');
  assert.strictEqual(KM.normalizeTheme('dark'), 'dark');
  assert.strictEqual(KM.normalizeTheme(null), 'dark');
  assert.strictEqual(KM.normalizeTheme(undefined), 'dark');
  assert.strictEqual(KM.normalizeTheme('xpto'), 'dark');
  assert.strictEqual(KM.normalizeTheme(''), 'dark');
});
```

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `npm test`
Expected: FALHA em `normalizeTheme` ("KM.normalizeTheme is not a function").

- [ ] **Step 3: Implementar o mínimo**

Em `lib.js`, antes do `return { ... }`, adicionar:
```js
  function normalizeTheme(raw) { return raw === 'light' ? 'light' : 'dark'; }
```
E no objeto do `return { ... }`, adicionar a entrada:
```js
    normalizeTheme: normalizeTheme,
```

- [ ] **Step 4: Rodar o teste e ver passar**

Run: `npm test`
Expected: PASSA (todos os testes, incluindo o novo).

- [ ] **Step 5: Commit**

```bash
git add lib.js test/lib.test.js
git commit -m "feat: helper normalizeTheme com teste"
```

---

### Task 2: Paleta do tema claro da marca no CSS

**Files:**
- Modify: `styles.css` (adicionar bloco `:root[data-theme="light"]`)

**Interfaces:**
- Consumes: variáveis de cor já existentes no `:root` base (bg, surface, text, border, cores de área e status).
- Produces: tema visual ativado quando `<html data-theme="light">`.

- [ ] **Step 1: Adicionar o bloco de tema claro**

Em `styles.css`, logo depois do bloco `:root[data-theme="dark"]{ ... }` (termina por volta da linha 62), adicionar:
```css
:root[data-theme="light"]{
  color-scheme:light;
  --accent:#151824; --accent-strong:#000000; --accent-contrast:#FFFFFF;
  --accent-soft:rgba(255,250,42,.22);
}
```
(As demais variáveis claras — bg branco, textos escuros, bordas, área/status — herdam do `:root` base, que já é a paleta clara polida.)

- [ ] **Step 2: Conferir visualmente no navegador (claro)**

Rodar `npm run serve`, abrir `http://localhost:5173`, e no DevTools (Console) rodar:
```js
document.documentElement.setAttribute('data-theme','light')
```
Expected: fundo fica branco/claro, botão "Nova tarefa" (primário) fica escuro com texto branco, item de menu ativo com realce amarelo suave, textos legíveis, nada de amarelo como texto sobre branco. Voltar com `setAttribute('data-theme','dark')` e confirmar que o escuro está idêntico ao de antes.

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "feat: paleta do tema claro da marca (botoes escuros, detalhe amarelo)"
```

---

### Task 3: Botão na topbar + script anti-flash no head

**Files:**
- Modify: `index.html`

**Interfaces:**
- Produces: elemento `#themeToggleBtn` na topbar; `data-theme` aplicado no `<html>` antes da pintura, a partir de `localStorage['km-theme']`.

- [ ] **Step 1: Adicionar o botão na barra superior**

Em `index.html`, dentro de `<div class="topbar-actions">` (linha ~38), ANTES do `<button ... id="refreshBtn" ...>`, inserir:
```html
        <button class="icon-btn" id="themeToggleBtn" aria-label="Alternar tema" title="Alternar tema claro/escuro"></button>
```

- [ ] **Step 2: Adicionar o script anti-flash no `<head>`**

Em `index.html`, logo depois da linha `<link rel="stylesheet" href="styles.css?v=...">` (linha 8), inserir:
```html
<script>
  (function(){
    var t = 'dark';
    try { if (localStorage.getItem('km-theme') === 'light') t = 'light'; } catch(e){}
    document.documentElement.setAttribute('data-theme', t);
  })();
</script>
```
(É um snippet mínimo e independente de propósito: roda antes do CSS pintar, por isso não pode depender do `lib.js`/`KM`, que só carrega no fim do body. O `data-theme="dark"` fixo no `<html>` fica como fallback se o JS não rodar.)

- [ ] **Step 3: Subir o cache-busting dos assets**

Em `index.html`, trocar todas as ocorrências de `?v=8` por `?v=9` (styles.css, lib.js, config.js, supabase-client.js, app.js).

- [ ] **Step 4: Conferir no navegador**

Com `npm run serve` aberto: a barra superior mostra o novo botão (ainda sem ícone desenhado, vem na Task 4) ao lado do ⟳. Abrir o app não mostra flash branco quando o tema salvo é escuro.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: botao de tema na topbar + aplicacao anti-flash no head"
```

---

### Task 4: Ícones sol/lua + toggle no app.js

**Files:**
- Modify: `app.js` (registro `icon()`, funções `applyTheme`/`currentTheme`, caso no handler de clique, init do ícone)

**Interfaces:**
- Consumes: `KM.normalizeTheme` (Task 1), `#themeToggleBtn` (Task 3), paleta `data-theme="light"` (Task 2).
- Produces: `applyTheme(tema)`, `currentTheme()`; clique no `#themeToggleBtn` alterna o tema.

- [ ] **Step 1: Adicionar os ícones sun e moon no registro `icon()`**

Em `app.js`, dentro do objeto `paths` da função `icon()` (começa na linha ~46), adicionar duas entradas:
```js
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/>',
    moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
```

- [ ] **Step 2: Adicionar `currentTheme()` e `applyTheme()`**

Em `app.js`, perto das outras funções utilitárias (ex.: depois de `function icon(...)` ou junto do topo), adicionar:
```js
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
}
```

- [ ] **Step 3: Ligar o clique no handler delegado**

Em `app.js`, no `document.addEventListener('click', ...)` (linha ~979), adicionar junto dos outros botões da topbar (ex.: depois da linha do `#refreshBtn`):
```js
  if(e.target.closest('#themeToggleBtn')){ applyTheme(currentTheme()==='dark'?'light':'dark'); return; }
```

- [ ] **Step 4: Inicializar o ícone do botão ao montar o app**

Em `app.js`, na função `init()` (linha ~1206) — depois que o shell do app já está visível — chamar:
```js
  applyTheme(currentTheme());
```
(Isso não muda o tema, só garante que o ícone sol/lua do botão reflita o tema vigente logo que o app aparece.)

- [ ] **Step 5: Rodar os testes unitários (garantir que nada quebrou)**

Run: `npm test`
Expected: PASSA (as mudanças em app.js não têm teste próprio, mas o `normalizeTheme` continua verde).

- [ ] **Step 6: Commit**

```bash
git add app.js
git commit -m "feat: icones sol/lua e alternancia de tema no app.js"
```

---

### Task 5: Verificação de ponta a ponta no navegador

**Files:** nenhum (teste manual).

**Interfaces:**
- Consumes: tudo das Tasks 1-4.

- [ ] **Step 1: Servir e abrir limpo**

Run: `npm run serve`. Abrir `http://localhost:5173` numa aba anônima (sem `km-theme` salvo).
Expected: app abre ESCURO (igual hoje), botão mostra ícone de LUA.

- [ ] **Step 2: Alternar pra claro**

Clicar no botão sol/lua.
Expected: vira CLARO na hora (fundo branco, botões escuros, detalhe amarelo), botão passa a mostrar o SOL.

- [ ] **Step 3: Persistência**

Recarregar (F5).
Expected: continua CLARO, sem flash escuro, botão mostra SOL.

- [ ] **Step 4: Voltar e persistir**

Clicar de novo (volta escuro), recarregar.
Expected: continua ESCURO, botão mostra LUA.

- [ ] **Step 5: Legibilidade no claro**

No tema claro, percorrer: Visão Geral, uma área, abrir uma tarefa (drawer), o sininho, a tela de admin.
Expected: tudo legível, nenhum texto amarelo sumindo sobre branco, botões primários escuros com texto branco.

- [ ] **Step 6: Mobile**

Reduzir a janela pra largura de celular (ou DevTools responsivo).
Expected: o botão sol/lua cabe na barra e funciona igual.

- [ ] **Step 7: Deploy (quando a Patrícia aprovar)**

```bash
git push
```
Expected: o GitHub Pages republica sozinho em alguns minutos; abrir `https://gerenciador.kabelera.com.br` e repetir os Steps 1-4 no ar. Lembrar que o `?v=9` garante que o navegador pegue a versão nova.

---

## Self-review

- Cobertura do spec: botão na topbar (T3), tema claro branded (T2), persistência localStorage (T3/T4), default dark (constraint + T4), sem flash (T3 script inline), ícones sol/lua (T4), verificação incl. mobile e legibilidade (T5). YAGNI respeitado (sem banco, sem seguir SO, sem temas extras).
- Sem placeholders: todo passo tem o código/comando concreto.
- Consistência de nomes: `km-theme`, `#themeToggleBtn`, `KM.normalizeTheme`, `applyTheme`, `currentTheme`, `?v=9` usados igual em todas as tasks.
