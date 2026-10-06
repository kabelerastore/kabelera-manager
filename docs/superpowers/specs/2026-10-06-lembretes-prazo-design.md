# Lembretes de prazo (robozinho diário via pg_cron) — Design

Data: 2026-10-06
Projeto: Kabelera Manager
Relacionado: fluxo de notificação por e-mail (notifications → webhook `notif-email` → Edge Function `send-email` → Resend), concluído em 2026-10-06.

## Problema

Hoje o app só avisa por e-mail em reação a uma ação humana (criar tarefa, trocar responsável, menção em comentário). Não existe nenhum aviso proativo de prazo: ninguém é lembrado de que uma tarefa está prestes a vencer. A equipe teria que ficar olhando o quadro manualmente.

## Objetivo

Um job automático que roda todo dia e, para cada tarefa com prazo chegando, cria uma notificação para o responsável. Essa notificação aparece no sininho do app e, pelo webhook já existente, vira e-mail automaticamente.

## Decisões (confirmadas com a Patrícia)

- **Antecedência:** avisa no dia anterior ao prazo ("vence amanhã") e no próprio dia ("vence hoje").
- **Atrasadas:** NÃO avisar. Tarefas que já passaram do prazo não geram lembrete.
- **Horário:** todo dia às 08h de Brasília (= 11h UTC), incluindo fins de semana.
- **Destinatário:** apenas o responsável da tarefa (`responsible_id`). Participantes ficam de fora por ora (possível extensão futura).
- **Reaproveitar o pipeline existente:** o job só INSERE em `notifications`; o envio de e-mail continua a cargo do webhook `notif-email` + `send-email`. Nada de envio de e-mail novo, nada de alteração no app/site.

## Abordagem escolhida

pg_cron agenda uma função SQL que insere notificações. O resto da cadeia (webhook → Resend) já existe e funciona.

Alternativa descartada: o cron chamar a Edge Function / mandar e-mail direto por fora. Rejeitada porque duplicaria a lógica de envio e a pessoa não receberia o aviso no sininho do app.

## Dados existentes usados (sem alteração de schema)

Tabela `public.tasks`:
- `title` text — nome da tarefa (vai no texto do aviso)
- `due_date` date — o prazo
- `responsible_id` uuid — quem recebe o aviso
- `completed_at` date — se preenchido, tarefa concluída (não avisar)
- `is_active` boolean (adicionada na migração 2026-10-05) — se false, tarefa excluída logicamente (não avisar)

Tabela `public.notifications`:
- `user_id` uuid — o responsável
- `text` text — mensagem do aviso
- `task_id` uuid (adicionada na migração 2026-10-05) — pra notificação abrir a tarefa ao clicar
- `read` boolean default false

Nenhuma coluna nova é necessária.

## Componentes a construir

Tudo dentro do Supabase. Um único arquivo de migração na bancada: `supabase/cron-prazos.sql`, para a Patrícia rodar no SQL Editor.

### 1. Extensões
- `pg_cron` — ligar (pode exigir habilitar em Database → Extensions).
- `pg_net` — já instalada (usada pelos webhooks).

### 2. Função `public.notificar_prazos()`
`security definer`, sem argumentos. Lógica:

1. Calcula a data "hoje" no fuso de Brasília: `(now() at time zone 'America/Sao_Paulo')::date`.
2. Seleciona tarefas onde:
   - `is_active = true`
   - `completed_at is null`
   - `responsible_id is not null`
   - `due_date` = hoje OU `due_date` = hoje + 1 dia
3. Para cada tarefa, insere uma linha em `notifications`:
   - `user_id` = `responsible_id`
   - `task_id` = id da tarefa
   - `text`:
     - se `due_date` = hoje: `⏰ A tarefa "<title>" vence hoje (DD/MM).`
     - se `due_date` = amanhã: `⏰ A tarefa "<title>" vence amanhã (DD/MM).`

A data no texto é formatada como DD/MM (pt-BR).

### 3. Agendamento (cron job)
`cron.schedule('lembretes-prazo', '0 11 * * *', $$ select public.notificar_prazos(); $$)`
- `0 11 * * *` = 11h UTC todo dia = 08h de Brasília.
- Nome fixo `lembretes-prazo` para permitir reagendar/remover sem duplicar.

## Fluxo de dados

```
pg_cron (11h UTC / 08h BRT)
  → public.notificar_prazos()
     → INSERT em public.notifications (1 linha por tarefa que vence hoje/amanhã)
        → webhook notif-email dispara (INSERT)
           → Edge Function send-email
              → Resend → e-mail para o responsável (avisos@kabelera.com.br)
  e em paralelo: a notificação aparece no sininho do app.
```

## Casos de borda e como são tratados

- **E-mail duplicado:** não acontece. O job roda 1x/dia e cada tarefa cai em "hoje" OU "amanhã", nunca nos dois no mesmo dia. Em dias diferentes são avisos legitimamente diferentes (véspera e dia).
- **Tarefa sem responsável:** filtrada fora (`responsible_id is not null`), ninguém pra avisar.
- **Tarefa concluída ou excluída:** filtrada fora (`completed_at is null`, `is_active = true`).
- **Fuso horário:** o agendador roda em UTC, mas a conta de hoje/amanhã usa `America/Sao_Paulo`, evitando erro de um dia a mais/menos perto da meia-noite.
- **Sem tarefas no dia:** a função roda, não seleciona nada, não insere nada. Silenciosa.

## Fora de escopo (YAGNI)

- Avisar participantes além do responsável.
- Avisar tarefas atrasadas.
- Resumo diário agregado (um e-mail com todas as tarefas) em vez de uma notificação por tarefa.
- Configuração de horário/antecedência pela interface do app.

## Como verificar

1. Rodar `supabase/cron-prazos.sql` no SQL Editor.
2. Conferir que o job existe: `select * from cron.job;`.
3. Teste manual imediato (sem esperar as 08h): criar/editar uma tarefa com `due_date` = hoje e um responsável com e-mail real, depois rodar `select public.notificar_prazos();` à mão e conferir: (a) nova linha em `notifications`, (b) e-mail chegou ao responsável, (c) aviso no sininho.
4. Conferir que uma tarefa concluída (`completed_at` preenchido) NÃO gera aviso.
