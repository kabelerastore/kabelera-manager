-- Migração 2026-10-05 — melhorias do bloco verde.
-- Rodar uma vez no SQL Editor do Supabase.

-- Notificação sabe de qual tarefa é (pra abrir a tarefa ao clicar).
alter table public.notifications add column if not exists task_id uuid;

-- Exclusão lógica de tarefas (a tabela de tasks não tinha is_active).
alter table public.tasks add column if not exists is_active boolean not null default true;

-- Armazenamento de anexos (fotos, materiais): bucket público "anexos".
insert into storage.buckets (id, name, public) values ('anexos', 'anexos', true)
on conflict (id) do nothing;

-- Quem está logado pode enviar e ler arquivos do bucket "anexos".
drop policy if exists "anexos upload" on storage.objects;
create policy "anexos upload" on storage.objects for insert to authenticated with check (bucket_id = 'anexos');
drop policy if exists "anexos read" on storage.objects;
create policy "anexos read" on storage.objects for select to authenticated using (bucket_id = 'anexos');
