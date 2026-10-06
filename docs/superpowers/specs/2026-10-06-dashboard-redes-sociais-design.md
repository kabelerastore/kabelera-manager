# Dashboard de Redes Sociais no app + atualização mensal (Windsor.ai) — Design

Data: 2026-10-06
Projeto: Kabelera Manager

## Problema / objetivo

A Patrícia tem um relatório de métricas de redes sociais da Kabelera (hoje um HTML estático e isolado: `Documents/Claude/Projects/Kabelera/Kabelera_Dashboard_JanJul.html`, feito com Chart.js, paleta marrom/dourado). Ela quer:
1. Acessar esse dashboard **dentro do gerenciador**, com as **cores e o tema do app** (claro/escuro), por um botão.
2. Que ele **atualize sozinho todo mês**, lendo as métricas e refazendo as análises, sem ela montar do zero toda vez.

## Decisões confirmadas

- **Fonte dos dados:** Windsor.ai (já usado pela Patrícia). Ele conecta no Instagram e entrega os dados por Google Sheets (auto-atualizado) ou por link/API (`_renderer=json|csv`). Isso evita a API do Meta direta.
- **Aparência:** o relatório fica **integrado ao app**, re-vestido com a paleta do app (preto/amarelo no escuro; branco/botão escuro/detalhe amarelo no claro) e respeitando o tema (`km-theme`).
- **Natureza:** é uma foto do período que é **regenerada mensalmente** (não é streaming ao vivo; é um relatório atualizado 1x/mês).
- **Privacidade:** ok ficar no site público (a Patrícia confirmou). O arquivo é acessível por link direto, não listado publicamente.

## Arquitetura em 2 fases

As duas fases compartilham um único artefato: o arquivo `relatorios/redes-sociais.html` dentro do repositório do app. A Fase 1 o exibe; a Fase 2 o reescreve todo mês.

### Fase 1 — Tela do dashboard no app (entregável imediato)
- Criar `relatorios/redes-sociais.html`: cópia do dashboard atual, re-vestida com as cores/fontes do app e **theme-aware** (lê `km-theme` do localStorage; mesma origem do site, então consegue). Charts do Chart.js recolorados pros tokens do app.
- Adicionar um item de menu "Métricas" (ou "Redes Sociais") na sidebar.
- Nova view no app: ao navegar pra "metricas", o content area mostra um `<iframe>` que carrega `relatorios/redes-sociais.html`, preenchendo a área.
- Sincronizar tema: quando o usuário troca claro/escuro no app, o iframe é recarregado (ou avisado) pra acompanhar.

### Fase 2 — Atualização mensal automática (depois)
- Uma **rotina agendada mensal** (cloud, via skill `schedule`, ou cron) que roda um Claude Code com um prompt fixo.
- O que a rotina faz:
  1. Busca os números do mês no Windsor.ai (pelo link/API `_renderer=json` com a API key da Patrícia, OU lendo a Google Sheet que o Windsor alimenta).
  2. Atualiza os dados numéricos e os datasets dos gráficos em `relatorios/redes-sociais.html`.
  3. Reescreve as seções de análise (Análise estratégica, Formatos, Sugestões, Plano de ação, Foco do mês) com base nos novos números, no tom da Patrícia (respeitando o CLAUDE.md: sem travessão, sem anti-termos, português correto).
  4. Publica (`git commit` + `git push`) — o botão da Fase 1 passa a mostrar o mês novo.
- Mantém o período no título e um histórico simples (opcional: guardar versões anteriores em `relatorios/arquivo/`).

## O que o dashboard contém hoje (pra mapear na Fase 2)

Seções do relatório atual: Visão geral por mês; Alcance diário e interações; Taxa de engajamento por formato; Engajamento médio por dia da semana; Perfil da audiência; Publicações no período; e as seções de análise (Análise estratégica, Análise aprofundada, Formatos, Sugestões estratégicas, Plano de ação, Foco do mês). 7 gráficos (Chart.js), 1 tabela. Os campos do Windsor (Instagram Insights: 73 métricas, 55 dimensões) serão mapeados pra esses pontos na Fase 2.

## Inputs necessários da Patrícia pra fechar o plano da Fase 2

1. O **link/API do Windsor** com os campos e o período (ela gera na conta Windsor: fonte Instagram, campos de alcance/engajamento/formato/dia/audiência, saída JSON ou CSV), OU o endereço da **Google Sheet** que o Windsor alimenta.
2. Confirmar **quais métricas** entram (as que já aparecem no relatório atual bastam como ponto de partida).

## Onde a rotina mensal roda (a definir na Fase 2)

A skill `schedule` cria rotinas de Claude Code na nuvem por cron. Uma rotina mensal (ex.: dia 1, de manhã) executaria o prompt de regeneração. Precisa de acesso ao repositório (pra publicar) e ao link do Windsor. Detalhes e trade-offs ficam no plano da Fase 2.

## Fora de escopo (YAGNI)

- Streaming ao vivo das métricas (atualização em tempo real).
- Reconstruir os 7 gráficos como componentes nativos do app (o caminho "re-vestir o relatório existente" entrega o mesmo visual com muito menos risco).
- Conectar direto na API do Meta/Instagram (o Windsor já faz essa ponte).
- Múltiplos dashboards/redes além do Instagram da Kabelera (dá pra estender depois).

## Como verificar

- Fase 1: abrir o app, clicar em "Métricas", ver o relatório com as cores do app; alternar tema e confirmar que o relatório acompanha; conferir no celular.
- Fase 2: rodar a rotina manualmente uma vez (sem esperar o mês), conferir que os números batem com o Windsor, que as análises foram reescritas com sentido, e que publicou; depois conferir que o agendamento mensal está ativo.
