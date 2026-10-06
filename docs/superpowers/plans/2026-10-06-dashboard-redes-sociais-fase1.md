# Dashboard de Redes Sociais — Fase 1 (tela no app) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mostrar o relatório de redes sociais da Kabelera dentro do gerenciador, re-vestido com as cores e o tema (claro/escuro) do app, acessível por um botão "Métricas" no menu.

**Architecture:** Copiar o relatório atual (`Kabelera_Dashboard_JanJul.html`) pra dentro do repo como `relatorios/redes-sociais.html`, re-vestido com a paleta do app e theme-aware (lê `km-theme`). O app ganha uma rota `#/metricas` cuja view é um `<iframe>` que carrega esse arquivo. Como os gráficos (Chart.js) leem cores de variáveis CSS, trocar o `:root` recolore quase tudo.

**Tech Stack:** HTML/CSS/JS vanilla, Chart.js 4.5.1 (CDN jsdelivr, já permitido no app), iframe same-origin.

## Global Constraints

- Arquivo-alvo: `relatorios/redes-sociais.html` no repo do app (origem: `C:/Users/Patricia/Documents/Claude/Projects/Kabelera/Kabelera_Dashboard_JanJul.html`).
- Theme-aware: o relatório lê `localStorage['km-theme']` (default `'dark'`) e aplica `data-theme` no próprio `<html>`; tem paleta dark e light.
- Paleta do app (dark): `--bg:#12141A`, `--surface/#card:#1B1E27`, `--border:#2C3140`, texto `#F1F2F6`/secundário `#AEB4C4`, acento `#FFFA2A`. Light: `--bg:#F6F7FA`, `--card:#FFFFFF`, `--border:#E1E5EB`, texto `#151824`/secundário `#5B6172`, acento (botões/realce) `#151824` com detalhe amarelo `rgba(255,250,42,.22)`.
- Nova rota `#/metricas` → `state.route.name === 'metricas'` (parseHash já mapeia o primeiro segmento pro name).
- Subir cache-busting do `index.html` de `?v=9` pra `?v=10`.
- Idioma pt-BR; sem travessão em texto visível.
- Deploy = `git push` no master (GitHub Pages republica).

---

### Task 1: Criar `relatorios/redes-sociais.html` re-vestido e theme-aware

**Files:**
- Create: `relatorios/redes-sociais.html` (cópia editada do dashboard atual)

**Interfaces:**
- Produces: página de relatório hospedada no site, que respeita o tema do app.

- [ ] **Step 1: Copiar o arquivo pra dentro do repo**

```bash
cd /c/Users/Patricia/projetos/kabelera-manager
mkdir -p relatorios
cp "/c/Users/Patricia/Documents/Claude/Projects/Kabelera/Kabelera_Dashboard_JanJul.html" relatorios/redes-sociais.html
```

- [ ] **Step 2: Trocar o bloco `:root` pela paleta do app (dark como padrão) + variante light**

Localizar o `:root { ... }` do arquivo (tem `--brand`, `--accent`, `--bg`, `--card`, `--border`, `--muted`, `--dark`, `--positive`, `--negative`) e substituir por um mapeamento pros tokens do app, com light override:

```css
:root{
  --brand:#FFFA2A; --brand-dark:#E6D400; --accent:#FFFA2A; --accent-light:rgba(255,250,42,.16);
  --dark:#F1F2F6; --muted:#AEB4C4; --bg:#12141A; --card:#1B1E27; --border:#2C3140;
  --positive:#3FC23F; --negative:#E56464;
}
:root[data-theme="light"]{
  --brand:#151824; --brand-dark:#000000; --accent:#151824; --accent-light:rgba(255,250,42,.22);
  --dark:#151824; --muted:#5B6172; --bg:#F6F7FA; --card:#FFFFFF; --border:#E1E5EB;
  --positive:#0CA30C; --negative:#C93A3A;
}
```
(Os nomes das variáveis do relatório são mantidos; só os valores mudam, então todo o CSS e os gráficos que usam `var(--...)` acompanham.)

- [ ] **Step 3: Corrigir as poucas cores cravadas que não acompanham o tema**

Procurar no arquivo os literais `#F3EAE0` (fundo claro antigo) e `#fff`/`#FFFFFF` usados como fundo/borda de gráfico e trocar por variáveis do tema:
- `backgroundColor:'#F3EAE0'` → `backgroundColor:getCSS('--accent-light')` (ou `'var(--accent-light)'` se for em CSS).
- `borderColor:'#fff'` → `borderColor:getCSS('--card')`.

Onde já existir um helper que lê variável (ex.: `getComputedStyle`), reutilizar; se não, no bloco de script dos gráficos adicionar:
```js
function getCSS(v){ return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }
```

- [ ] **Step 4: Tornar a página theme-aware (ler km-theme antes de pintar)**

No `<head>` do arquivo, logo após abrir `<head>` (antes dos estilos), inserir:
```html
<script>
  (function(){
    var t = 'dark';
    try { if (localStorage.getItem('km-theme') === 'light') t = 'light'; } catch(e){}
    document.documentElement.setAttribute('data-theme', t);
  })();
</script>
```

- [ ] **Step 5: Conferir no navegador que recolore certo**

Rodar `npm run serve`, abrir `http://localhost:5173/relatorios/redes-sociais.html`. No Console:
```js
document.documentElement.setAttribute('data-theme','dark')
```
Expected: fundo escuro, texto claro, gráficos e cards nas cores do app (amarelo de acento). Depois `('data-theme','light')`: fundo branco, texto escuro, detalhe amarelo. Nenhuma área "estourada" de marrom/dourado antigo; números e gráficos intactos.

- [ ] **Step 6: Commit**

```bash
git add relatorios/redes-sociais.html
git commit -m "feat: relatorio de redes sociais re-vestido com o tema do app"
```

---

### Task 2: Rota, item de menu e view no app

**Files:**
- Modify: `app.js` (icon `chart`, NAV_AFTER_AREAS, pageTitleFor, renderContent, viewMetrics)

**Interfaces:**
- Consumes: rota `#/metricas` (parseHash já resolve pra name `metricas`).
- Produces: `viewMetrics()` que devolve o HTML do iframe; item de menu "Métricas".

- [ ] **Step 1: Adicionar um ícone `chart` no registro `icon()`**

No objeto `paths` de `icon()` (app.js), adicionar:
```js
    chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
```

- [ ] **Step 2: Adicionar o item no menu**

Em `app.js`, no array `NAV_AFTER_AREAS`, adicionar como primeiro item:
```js
  {route:'#/metricas', label:'Métricas', icon:'chart', match:'metricas'},
```

- [ ] **Step 3: Título da página pra rota nova**

Localizar `pageTitleFor` (perto da linha 399) e adicionar o caso de `metricas` retornando título e subtítulo, por exemplo `['Métricas','Redes sociais da Kabelera']`. Seguir o formato que a função já usa pras outras rotas.

- [ ] **Step 4: Registrar a view no `renderContent`**

Em `renderContent()`, adicionar antes do `else` final:
```js
  else if(r.name==='metricas') el.innerHTML = viewMetrics();
```

- [ ] **Step 5: Implementar `viewMetrics()`**

Adicionar a função (perto das outras `view...`):
```js
function viewMetrics(){
  return '<div class="metrics-wrap">' +
    '<iframe id="metricsFrame" class="metrics-frame" src="relatorios/redes-sociais.html?v=1" title="Relatório de redes sociais"></iframe>' +
    '</div>';
}
```

- [ ] **Step 6: Conferir no navegador**

Com `npm run serve`, abrir o app, logar, clicar em "Métricas" no menu.
Expected: a tela mostra o relatório dentro do app; o título da página vira "Métricas".

- [ ] **Step 7: Commit**

```bash
git add app.js
git commit -m "feat: rota e menu Metricas com o relatorio embutido"
```

---

### Task 3: Estilo do iframe + sincronizar o tema ao alternar

**Files:**
- Modify: `styles.css` (classe `.metrics-frame`)
- Modify: `app.js` (em `applyTheme`, recarregar o iframe se estiver aberto)

**Interfaces:**
- Consumes: `#metricsFrame` (Task 2), `applyTheme` (feature de tema já existente).

- [ ] **Step 1: CSS pra o iframe preencher a área**

Em `styles.css`, adicionar:
```css
.metrics-wrap{ padding:0; }
.metrics-frame{ width:100%; height:calc(100vh - 150px); min-height:560px; border:0; border-radius:var(--radius-md); background:var(--surface); }
@media (max-width:720px){ .metrics-frame{ height:calc(100vh - 180px); } }
```

- [ ] **Step 2: Recarregar o iframe quando trocar o tema**

Em `app.js`, dentro de `applyTheme(tema)`, depois de setar o `data-theme` e salvar, adicionar:
```js
  var mf = document.getElementById('metricsFrame');
  if (mf) { try { mf.contentWindow.location.reload(); } catch(e){ mf.src = mf.src; } }
```
(Assim, ao clicar no sol/lua com a tela de Métricas aberta, o relatório acompanha o tema na hora. O relatório lê `km-theme` no load, Task 1 Step 4.)

- [ ] **Step 3: Conferir a sincronia de tema**

Com o app aberto na tela Métricas: clicar no botão sol/lua da barra.
Expected: o relatório dentro do iframe troca de claro pra escuro (e vice-versa) junto com o resto do app.

- [ ] **Step 4: Commit**

```bash
git add styles.css app.js
git commit -m "feat: iframe de metricas ocupa a area e acompanha o tema"
```

---

### Task 4: Cache-busting, verificação final e deploy

**Files:**
- Modify: `index.html` (`?v=9` → `?v=10`)

- [ ] **Step 1: Subir a versão dos assets**

Em `index.html`, trocar todas as ocorrências de `?v=9` por `?v=10`.
```bash
cd /c/Users/Patricia/projetos/kabelera-manager
sed -i 's/?v=9/?v=10/g' index.html
grep -n "?v=" index.html
```

- [ ] **Step 2: Rodar os testes (garantir que nada quebrou)**

Run: `npm test`
Expected: PASSA (13 testes).

- [ ] **Step 3: Verificação de ponta a ponta (local)**

`npm run serve`, abrir o app:
- Menu mostra "Métricas"; clicar abre o relatório embutido.
- Alternar tema: o relatório acompanha claro/escuro.
- Percorrer o relatório (scroll): gráficos e seções nas cores do app, números intactos.
- Reduzir pra largura de celular: o relatório cabe e scrolla.

- [ ] **Step 4: Deploy (com o ok da Patrícia)**

```bash
git add index.html
git commit -m "chore: cache-busting v=10 para a tela de metricas"
git push
```
Expected: GitHub Pages republica; abrir `https://gerenciador.kabelera.com.br`, Ctrl+Shift+R, e repetir os checks no ar.

---

## Self-review

- Cobertura do spec (Fase 1): tela no app (T2), re-vestir com cores do app (T1), tema claro/escuro sincronizado (T1 Step 4 + T3), botão no menu (T2), verificação incl. mobile (T4). YAGNI: só o relatório atual, sem reconstruir gráficos nativos.
- Sem placeholders: cada passo tem código/comando concreto. O único ponto que depende do arquivo real é localizar os literais `#F3EAE0`/`#fff` (T1 Step 3), que são buscáveis na hora.
- Consistência: `relatorios/redes-sociais.html`, `#/metricas`, `metricas`, `#metricsFrame`, `?v=10` usados igual em todas as tasks.
