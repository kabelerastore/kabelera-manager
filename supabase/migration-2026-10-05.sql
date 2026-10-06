-- Migração 2026-10-05 — melhorias do bloco verde.
-- Rodar uma vez no SQL Editor do Supabase.

-- Notificação sabe de qual tarefa é (pra abrir a tarefa ao clicar).
alter table public.notifications add column if not exists task_id uuid;
