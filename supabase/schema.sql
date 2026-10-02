-- Kabelera Manager — esquema, RLS e seed
-- Aplicar no Supabase: SQL Editor > New query > colar tudo > Run.

create extension if not exists pgcrypto;

-- PERFIS (espelham auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role_label text default '',
  area_ids uuid[] default '{}',
  is_admin boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.areas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  flow text not null check (flow in ('creative','comercial','financeiro','admin')),
  color text not null default '#2A78D6',
  subcats text[] not null default '{}',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  responsible_id uuid,
  participants uuid[] default '{}',
  start_date date,
  due_date date,
  status text default 'Planejamento',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  area_id uuid references public.areas(id),
  subcategory text default '',
  project_id uuid references public.projects(id),
  requester_id uuid,
  responsible_id uuid,
  participants uuid[] default '{}',
  priority text default 'Média',
  status text not null,
  due_date date,
  start_date date,
  completed_at date,
  checklist jsonb not null default '[]',
  subtasks jsonb not null default '[]',
  comments jsonb not null default '[]',
  attachments jsonb not null default '[]',
  links jsonb not null default '[]',
  dependencies jsonb not null default '[]',
  history jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  text text not null,
  created_at timestamptz not null default now(),
  read boolean not null default false
);

-- Função auxiliar: o usuário atual é admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.areas enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.notifications enable row level security;

-- Guarda: só admin altera is_admin / is_active em profiles (RLS não filtra por coluna).
create or replace function public.guard_profile_privileged_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.is_admin is distinct from old.is_admin
      or new.is_active is distinct from old.is_active)
     and not public.is_admin() then
    raise exception 'Apenas administradores podem alterar is_admin ou is_active.';
  end if;
  return new;
end;
$$;
drop trigger if exists trg_guard_profile_privileged on public.profiles;
create trigger trg_guard_profile_privileged
  before update on public.profiles
  for each row execute function public.guard_profile_privileged_fields();

-- profiles: todos autenticados leem; cada um edita o próprio perfil (campos privilegiados
-- bloqueados pelo trigger acima); admin edita/insere qualquer perfil. Sem DELETE.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated using (true);
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists profiles_admin_insert on public.profiles;
create policy profiles_admin_insert on public.profiles for insert to authenticated with check (public.is_admin());

-- areas: todos autenticados leem; só admin insere/edita. Sem DELETE.
drop policy if exists areas_select on public.areas;
create policy areas_select on public.areas for select to authenticated using (true);
drop policy if exists areas_admin_insert on public.areas;
create policy areas_admin_insert on public.areas for insert to authenticated with check (public.is_admin());
drop policy if exists areas_admin_update on public.areas;
create policy areas_admin_update on public.areas for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- projects e tasks: todos autenticados leem, inserem e editam. Sem DELETE (desativação é lógica).
drop policy if exists projects_select on public.projects;
create policy projects_select on public.projects for select to authenticated using (true);
drop policy if exists projects_insert on public.projects;
create policy projects_insert on public.projects for insert to authenticated with check (true);
drop policy if exists projects_update on public.projects;
create policy projects_update on public.projects for update to authenticated using (true) with check (true);

drop policy if exists tasks_select on public.tasks;
create policy tasks_select on public.tasks for select to authenticated using (true);
drop policy if exists tasks_insert on public.tasks;
create policy tasks_insert on public.tasks for insert to authenticated with check (true);
drop policy if exists tasks_update on public.tasks;
create policy tasks_update on public.tasks for update to authenticated using (true) with check (true);

-- notifications: cada um vê/edita só as suas; qualquer autenticado insere (para mencionar outro). Sem DELETE.
drop policy if exists notif_select_own on public.notifications;
create policy notif_select_own on public.notifications for select to authenticated using (user_id = auth.uid());
drop policy if exists notif_update_own on public.notifications;
create policy notif_update_own on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists notif_insert on public.notifications;
create policy notif_insert on public.notifications for insert to authenticated with check (true);

-- SEED das 5 áreas originais (idempotente por nome)
insert into public.areas (name, flow, color, subcats, sort_order)
select v.name, v.flow, v.color, v.subcats, v.sort_order
from (values
  ('Marketing','creative','marketing', array['Planejamento','Conteúdo','Social Media','Campanhas','Tráfego Pago','Influenciadores e Parcerias','Eventos','E-mail e WhatsApp','Análise de Resultados'], 1),
  ('Administração','admin','admin', array['Documentos','Contratos','Fornecedores','Estoque e Operação','Logística','Processos Internos','Reuniões','Jurídico','RH e Equipe'], 2),
  ('Design','creative','design', array['Social Media','Campanhas','E-commerce','Materiais Impressos','Embalagens','Produto','Identidade Visual','Foto e Vídeo','Aprovações'], 3),
  ('Financeiro','financeiro','financeiro', array['Contas a Pagar','Contas a Receber','Fluxo de Caixa','Cobranças','Impostos','Notas Fiscais','Orçamento','Conciliação','Relatórios'], 4),
  ('Comercial','comercial','comercial', array['Leads','Prospecção','Atendimento','Propostas','Negociação','Vendas','Pós-venda','CRM','Parcerias'], 5)
) as v(name,flow,color,subcats,sort_order)
where not exists (select 1 from public.areas a where a.name = v.name);
