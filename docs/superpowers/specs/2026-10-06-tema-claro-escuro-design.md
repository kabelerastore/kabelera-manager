# Tema claro/escuro com botão sol/lua — Design

Data: 2026-10-06
Projeto: Kabelera Manager

## Problema

O app é escuro para todo mundo (`<html data-theme="dark">` fixo). Algumas pessoas preferem fundo claro. Queremos deixar cada usuário escolher entre claro (sol) e escuro (lua), com a escolha lembrada no aparelho.

## Objetivo

Um botão de alternância (ícone sol/lua) na barra superior que troca entre tema claro e escuro. A escolha é persistida por navegador (localStorage). Padrão para quem nunca escolheu: escuro (visual atual). Sem flash de cor errada ao abrir.

## Decisões (confirmadas com a Patrícia)

- **Aparência do tema claro:** fundo branco/claro, textos escuros, botões principais escuros (preto/grafite) com texto branco, amarelo Kabelera como detalhe (destaques, item de menu ativo, foco). Não usar o accent azul genérico que hoje é o padrão light do CSS.
- **Tema escuro:** inalterado (amarelo `#FFFA2A` sobre fundo escuro, como está hoje).
- **Lugar do botão:** barra superior (`.topbar-actions`), junto do atualizar (⟳) e do sininho.
- **Persistência:** por aparelho, via `localStorage` (chave `km-theme`). Sem banco.
- **Padrão:** escuro, quando não há escolha salva.
- **Sem flash:** aplicar o tema salvo antes da pintura da tela (script inline no `<head>`).

## Estado atual do código (ponto de partida)

- `index.html` linha 2: `<html lang="pt-BR" data-theme="dark">` (trava escuro).
- `styles.css`:
  - `:root` = paleta clara padrão (accent azul `#2A78D6`) com `color-scheme:light`.
  - `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ... } }` = paleta escura (accent amarelo).
  - `:root[data-theme="dark"] { ... }` = mesma paleta escura, forçada.
  - NÃO existe hoje um bloco explícito `:root[data-theme="light"]`.
- `app.js`:
  - `icon(name, size)` (linha 43): registro de ícones SVG com `stroke="currentColor"`. Não tem `sun` nem `moon` ainda.
  - Um único handler delegado: `document.addEventListener('click', function(e){ ... })` (linha 979) com checagens `e.target.closest('#id')`. É aí que os botões da topbar são ligados (ex.: `#refreshBtn` na linha 984).
  - Variáveis de assets versionadas com `?v=8` no `index.html` (lib.js, styles.css, config.js, supabase-client.js, app.js).

## Abordagem escolhida

Usar o sistema de temas por atributo `data-theme` que já existe. O toggle só grava `light`/`dark` em `localStorage` e no atributo `data-theme` do `<html>`. Criar um bloco explícito `:root[data-theme="light"]` com a paleta clara da marca (botões escuros + amarelo de detalhe), para o tema claro ser determinístico e não depender do accent azul padrão.

Alternativa descartada: guardar a preferência no banco (por conta). Rejeitada por YAGNI — a Patrícia escolheu "por aparelho", que não precisa de schema nem de round-trip.

## Componentes

### 1. CSS — bloco `:root[data-theme="light"]` (branded light)
Novo bloco em `styles.css` que sobrescreve, sobre a paleta clara base, só o necessário pra ficar "fundo claro + botões escuros + amarelo de detalhe":
- `--accent:#151824;` (botão primário escuro / grafite)
- `--accent-strong:#000000;` (hover do botão)
- `--accent-contrast:#FFFFFF;` (texto sobre o botão escuro)
- `--accent-soft:rgba(255,250,42,.22);` (detalhe amarelo: fundo de item ativo, realces)
- `color-scheme:light;`
- Demais variáveis (bg branco, textos escuros, bordas, cores de área/status) herdam da paleta clara base `:root`, que já é polida.

Observação de acessibilidade: links usam `a{color:var(--accent)}`; com `--accent` escuro, links ficam grafite sobre branco (legível). O amarelo nunca é usado como cor de texto sobre branco (contraste ruim), só como fundo/realce.

### 2. HTML — botão na topbar + script anti-flash
- Em `index.html`, dentro de `<div class="topbar-actions">`, antes do `#refreshBtn`, adicionar:
  `<button class="icon-btn" id="themeToggleBtn" aria-label="Alternar tema" title="Alternar tema claro/escuro"></button>`
  (o conteúdo/ícone é preenchido pelo JS.)
- No `<head>`, após o link do CSS, um script inline curto que lê `localStorage['km-theme']` (default `'dark'`) e faz `document.documentElement.setAttribute('data-theme', tema)` antes da pintura. Mantém o `data-theme="dark"` no `<html>` como fallback caso o JS não rode.

### 3. JS — ícones + toggle
- Em `app.js`, no registro de `icon()`, adicionar os paths `sun` e `moon` (SVG no mesmo estilo stroke).
- Uma função `applyTheme(tema)` que: seta `data-theme` no `<html>`, grava em `localStorage['km-theme']`, e atualiza o ícone do `#themeToggleBtn` (lua quando escuro, sol quando claro).
- Uma função `currentTheme()` que lê o `data-theme` atual (ou localStorage, default `'dark'`).
- No handler de clique delegado, um caso `if(e.target.closest('#themeToggleBtn')){ applyTheme(currentTheme()==='dark'?'light':'dark'); return; }`.
- Na inicialização (quando o app monta), chamar a atualização do ícone do botão pra refletir o tema vigente.

## Fluxo

```
Abrir app
  → script inline no <head> lê localStorage['km-theme'] (default 'dark')
     → seta <html data-theme="..."> antes de pintar (sem flash)
  → app.js monta e ajusta o ícone do botão (sol/lua) conforme o tema
Clicar no botão sol/lua
  → applyTheme(tema oposto): troca data-theme + salva no localStorage + troca o ícone
  → o CSS reage na hora (variáveis mudam), tela inteira muda de tema
```

## Casos de borda

- **Primeira visita (sem escolha salva):** default escuro. Idêntico ao app de hoje.
- **localStorage bloqueado/indisponível:** o `try/catch` na leitura/escrita evita quebrar; cai no default escuro e só não persiste.
- **Valor inválido salvo:** se `km-theme` não for `'light'` nem `'dark'`, tratar como `'dark'`.
- **Flash ao abrir:** evitado pelo script inline no head (roda antes do CSS pintar o body).

## Fora de escopo (YAGNI)

- Preferência de tema sincronizada entre aparelhos (precisaria de banco).
- Seguir automaticamente o tema do sistema operacional como padrão (o padrão é escuro, fixo).
- Temas além de claro/escuro, ou cores personalizáveis pelo usuário.

## Como verificar

1. Abrir o app: vem escuro (como hoje).
2. Clicar no botão: vira claro (fundo branco, botões escuros, detalhe amarelo); o ícone vira sol.
3. Recarregar a página (F5): continua claro (lembrou pelo localStorage).
4. Clicar de novo: volta escuro; recarregar: continua escuro.
5. Conferir no claro: textos legíveis, botão primário escuro com texto branco, item de menu ativo com realce amarelo, nada "sumindo" (ex.: amarelo sobre branco).
6. Testar no celular (largura pequena): o botão cabe na barra e funciona igual.
7. Abrir num navegador anônimo/sem escolha salva: vem escuro.
