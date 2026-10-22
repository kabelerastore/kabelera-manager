# Design — Status novos nos fluxos (Iniciado / Em Andamento / Adiado)

Data: 2026-10-22

## Objetivo
Adicionar os status **Iniciado**, **Em Andamento** e **Adiado** em todas as áreas
do Kabelera Manager, mantendo o fluxo próprio de cada uma (decisão da Patrícia:
"adicionar aos fluxos atuais", "em absolutamente todas", "com o nome Em Andamento mesmo").

## Decisões
- **Grafia única "Em Andamento"** (a mesma que o fluxo `admin` já usa), pra manter
  consistência e NÃO precisar migrar tarefas existentes. O `admin` já tem essa coluna,
  então não ganha duplicata; as outras áreas ganham.
- **"Iniciado"** entra em todas (nenhum fluxo tinha).
- **"Adiado"** é a última coluna de cada fluxo (um "estacionamento"). Enquanto a tarefa
  estiver em "Adiado", ela **não é cobrada como atrasada / vencendo / da semana** (pausa
  intencional). Ao sair de "Adiado", volta a contar o prazo normalmente.
- **Sem mexer no banco:** a coluna `tasks.status` é `text` livre (sem CHECK). Adicionar
  status novos é só front-end. Tarefas existentes mantêm o status atual; colunas novas
  nascem vazias.
- **"Adiado" não é status final** (não marca `completedAt`).

## Fluxos resultantes (negrito = novo)
- creative:   Backlog, Planejamento, **Iniciado**, **Em Andamento**, Em produção, Revisão, Aprovação, Programado, Concluído, **Adiado**
- admin:      Solicitado, A Fazer, **Iniciado**, Em Andamento, Aguardando Terceiro, Revisão, Concluído, **Adiado**
- comercial:  Novo Lead, **Iniciado**, **Em Andamento**, Contato, Qualificação, Proposta, Negociação, Fechado, Pós-venda, **Adiado**
- financeiro: Pendente, **Iniciado**, **Em Andamento**, Programado, Aguardando, Pago/Recebido, Conciliado, **Adiado**

## Mudanças técnicas
1. `lib.js` → `FLOWS`: inserir as colunas novas nas posições acima.
2. `app.js` → regras de prazo (`isOverdue`, `isDueToday`, `isDueThisWeek`, `isStalled`):
   tratar `status === 'Adiado'` como fora de cobrança (igual a status final).
3. `app.js` → ao mover p/ "Adiado", não marcar `completedAt` (já coberto por não ser final).
4. CSS: a coluna "Adiado" pode ganhar um tom neutro/apagado pra sinalizar "pausado"
   (opcional, visual).

## Fora de escopo (peças seguintes, specs próprios)
- Bug "muda status e o quadro geral não atualiza" (investigar com systematic-debugging; anda junto desta entrega).
- Comentários + marcar pessoas nas tarefas (feature grande, spec separado).
- "Ver atrasado/hoje/semana" já existe (dashboard) — só demonstrar.

## Testes
- Unit (lib.js): os novos status aparecem em cada fluxo; `isFinalStatus` continua certo
  (Adiado NÃO é final).
- Comportamento (app.js): tarefa vencida em "Adiado" não entra em `isOverdue`.
