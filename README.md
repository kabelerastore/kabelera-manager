# Kabelera Manager

Sistema de gestão de projetos, tarefas e equipe da Kabelera. Site estático
(HTML/CSS/JS, sem build) com backend no Supabase, publicado no GitHub Pages.

## Rodar localmente
1. `npm install` não é necessário (sem dependências de runtime).
2. Copie `config.example.js` para `config.js` e preencha `url` e `anonKey` do seu projeto Supabase.
3. `npm run serve` e abra http://localhost:5173
4. Testes das funções puras: `npm test`

## Configurar o Supabase (uma vez)
1. Crie um projeto em https://supabase.com
2. SQL Editor → cole e rode `supabase/schema.sql` (cria tabelas, RLS e as 5 áreas).
3. Authentication → Users → crie a conta da Patrícia (e-mail + senha).
4. SQL Editor → marque-a como admin:
   `update public.profiles set is_admin = true, name = 'Paty' where id = '<uuid-da-conta>';`
   (o uuid aparece em Authentication → Users). Se a linha de profile não existir,
   insira: `insert into public.profiles (id, name, is_admin) values ('<uuid>','Paty',true);`
5. Edge Function:
   - Instale a Supabase CLI e rode `supabase functions deploy create-user`.
   - Configure os secrets:
     `supabase secrets set SERVICE_ROLE_KEY=<service_role_key> SUPABASE_URL=<url_do_projeto>`
   - A `service_role key` está em Project Settings → API. NUNCA a coloque no `config.js`.
6. Em `config.js`, use a **anon key** (Project Settings → API → Project API keys → anon public).

## Publicar no GitHub Pages
1. Crie um repositório no github.com e dê push deste projeto.
2. Settings → Pages → Build and deployment → Deploy from a branch → `main` / `/root` → Save.
3. Aguarde o link `https://<usuario>.github.io/<repo>/`.
4. Como `config.js` é gitignored, crie-o no repositório para o Pages encontrá-lo:
   ou remova `config.js` do `.gitignore` e comite (a anon key pode ficar pública,
   protegida pelo RLS), ou gere o `config.js` no fluxo de publicação.

## Segurança
- A proteção dos dados vem do RLS no Supabase, não do segredo da anon key.
- Criação de usuário só funciona chamada por um admin (validado na Edge Function).
- Usuários e áreas são desativados (`is_active=false`), nunca apagados.
