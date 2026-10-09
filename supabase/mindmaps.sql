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
