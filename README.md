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
5. Edge Functions:
   - Instale a Supabase CLI e rode `supabase functions deploy create-user` e
     `supabase functions deploy send-email` (ou cole o código pelo editor do
     dashboard em Edge Functions → função → Code → Deploy).
   - Configure os secrets:
     `supabase secrets set SERVICE_ROLE_KEY=<service_role_key> SUPABASE_URL=<url_do_projeto>`
   - A `service_role key` está em Project Settings → API. NUNCA a coloque no `config.js`.
6. Notificações por e-mail (função `send-email`):
   - Configure os secrets `RESEND_API_KEY` e `WEBHOOK_SECRET` (um valor aleatório
     e forte) em Edge Functions → Secrets.
   - A `send-email` roda com **Verify JWT OFF** (o Database Webhook não manda JWT
     de usuário); quem tranca o acesso é o `WEBHOOK_SECRET`. A função rejeita (401)
     qualquer chamada sem o header `x-webhook-secret` igual a esse secret.
   - Database → Webhooks: o webhook `notif-email` (INSERT em `notifications` → função
     `send-email`) precisa enviar o header `x-webhook-secret` com o **mesmo** valor
     do `WEBHOOK_SECRET`. Se os dois não baterem, os e-mails param de sair.
7. Em `config.js`, use a **anon key** (Project Settings → API → Project API keys → anon public).

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
- A função `send-email` exige o header `x-webhook-secret` igual ao secret
  `WEBHOOK_SECRET` — sem isso, qualquer um com a URL poderia dispará-la.
- Todo dado vindo do usuário (nomes, títulos, comentários) é escapado com `esc()`
  antes de ir pro HTML. Qualquer campo editável pelo usuário renderizado na tela
  precisa passar por `esc()` — como o perfil é auto-editável (RLS
  `profiles_update_self`), um nome não escapado vira XSS armazenado.
