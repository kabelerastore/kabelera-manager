-- Afiliados Salão: pipeline de parceria (prospecção + venda), estilo do painel protótipo.
-- Rodar UMA vez no SQL Editor do Supabase. A carga (seed) insere os 42 perfis do dossiê.

create table if not exists public.afiliados (
  id uuid primary key default gen_random_uuid(),
  categoria text not null default 'Salão cachos',
  regiao text default '',
  nome text not null,
  instagram text default '',
  bairro text default '',
  seguidores integer default 0,
  contato text default '',
  status text default 'A contatar',
  cupom text default '',
  pecas integer default 0,
  vendas numeric default 0,
  decisao text default '',
  obs text default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.afiliados enable row level security;

drop policy if exists afiliados_select on public.afiliados;
create policy afiliados_select on public.afiliados for select to authenticated using (true);
drop policy if exists afiliados_insert on public.afiliados;
create policy afiliados_insert on public.afiliados for insert to authenticated with check (true);
drop policy if exists afiliados_update on public.afiliados;
create policy afiliados_update on public.afiliados for update to authenticated using (true) with check (true);

-- ---- Carga inicial (42 perfis) ----
insert into public.afiliados (categoria, regiao, nome, instagram, bairro, seguidores) values
('Influencer + salão','Zona Leste','Diogo Barbosa','@diogobarbosa.cabelos','Cangaíba / Jd. Gonzaga',556000),
('Influencer + salão','Interior SP','Midyã Almeida','@midyacachos','Marília',693000),
('Influencer + salão','A confirmar (cidade/bairro)','Kenny Nascimento','@kennynascimento','? (atende SP e NY)',0),
('Salão cachos','ABC / Diadema / Mauá','Diva dos Cachos','@divadoscachos_pro','Santo André',41000),
('Salão cachos','ABC / Diadema / Mauá','Iara Oliveira','@_oliveira_iara','Santo André',3884),
('Salão cachos','ABC / Diadema / Mauá','Espaço Amanda Vitoriano','@amandacachoeterapia','Santo André',796),
('Salão cachos','ABC / Diadema / Mauá','Floreal Hair Salon','@florealhairsalon','S. Bernardo (Centro)',12000),
('Salão cachos','ABC / Diadema / Mauá','Espaço Toutes','@espacotoutes','Vila Curuçá, Santo André',0),
('Salão cachos','Zona Norte','Hair Company by Cachos','@studio_companybycachos','Jardim Brasil',20800),
('Salão cachos','Zona Norte','Armênia Cabelos Reais','@armenia.gomes','Jd. São Paulo',7365),
('Salão cachos','Zona Norte','Studio Cachos ao Vento','@studiocachosaovento','Tucuruvi',4122),
('Salão cachos','Zona Norte','Cassia Curly','@cassia.curly','Brasilândia',2903),
('Salão cachos','Zona Norte','Studio Andrea Rosa','@studioandrearosa','Parada Inglesa',2675),
('Salão cachos','Zona Norte','Entre Cachos e Curvas','@entrecachosecurvas','Tucuruvi',2491),
('Salão cachos','Zona Norte','Paula Sá Fios & Formas','@paulasafioseformas','Zona Norte',1079),
('Salão cachos','Zona Norte','Studio Fernando Fernandes','@studiofernandofernandes','Jd. São Paulo',22000),
('Salão cachos','Zona Norte','Mary Jayne','@maryjaynehair','Santana',0),
('Salão cachos','Zona Leste','Diversidade Hair','@diversidadehair_sp','Itaim Paulista',61800),
('Salão cachos','Zona Leste','Saynô Hair','@sayno_hair','Tatuapé',0),
('Salão cachos','Zona Leste','Meninas dos Cachos','@meninassdoscachos','Itaquera',0),
('Salão cachos','Zona Leste','Estúdio Meu Cabelo Crespo','@estudiomeucabelocrespo','Zona Leste',4085),
('Salão cachos','Zona Sul (SP)','Espaço Kalé','@espaco_kale','Santo Amaro',0),
('Salão cachos','Zona Sul (SP)','Loes Saúde e Beleza','@loesoficial','Interlagos',55000),
('Salão cachos','Fora de SP (RJ / PI)','Level Salão','@levelsalao','Rio de Janeiro',64000),
('Salão cachos','Fora de SP (RJ / PI)','Curly Space','@curlyspace.rj','Catete, Rio de Janeiro',0),
('Salão cachos','Fora de SP (RJ / PI)','Instituto M. Cachos (Michelle Glayse)','@espacomichelleglayse','Madureira, Rio de Janeiro',0),
('Salão cachos','A confirmar (cidade/bairro)','Caio Leonard Hair','@caio_leonardhair','?',0),
('Salão cachos','A confirmar (cidade/bairro)','Yohana Valério','@yohanavalerio_','?',0),
('Salão cachos','A confirmar (cidade/bairro)','Vinicius Cachos Hair','@vinicius_cachoshair','?',0),
('Trancista afro','Zona Norte','Erika Tranças','@erika.afrohair','Zona Norte',26000),
('Trancista afro','Centro','Fada Trancista','@fadatrancista','Santa Cecília',0),
('Trancista afro','Zona Leste','Afro Sant''s','@afrosnts','Zona Leste',2979),
('Trancista afro','Zona Leste','Afrobarcout','@afrobarcout','Jd. Iguatemi',2618),
('Trancista afro','Zona Leste','Barbie Afro Hair','@barbie.afrohair','Itaquera',0),
('Trancista afro','Zona Leste','Studio Bruna Jacaúna','@studiobrunajacauna','Itaquera',0),
('Trancista afro','Zona Sul (SP)','Lady Afro','@ladys_afro','Jabaquara / Conceição',0),
('Salão/afro','Zona Norte','Beleza Afro','@belezaafro','Vila Mazzei',0),
('Salão/afro','Zona Leste','Afro Brasil','@salaoafrobrasil','Guaianazes',1278),
('Salão/afro','Zona Sul (SP)','Salão The Black Hair','@salaotheblackhair','Jabaquara',0),
('Salão/afro','Zona Sul (SP)','Jô Black Power','@joblackpower','Santo Amaro',8121),
('Salão/afro','Zona Sul (SP)','Raízes Salão Afro','@salaoraizes','Jd. Umuarama',9625),
('Salão/afro','Fora de SP (RJ / PI)','Salão da Preta','@salao_da_preta','Parnaíba, PI',0);
