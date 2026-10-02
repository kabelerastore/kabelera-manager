# Kabelera Manager — Persistência, Login, Áreas/Usuários Dinâmicos, Gantt e Timeline

Data: 2026-10-02
Autora do produto: Patrícia Lamirrer (Kabelera)

## Contexto

O Kabelera Manager é um sistema de gestão de projetos, tarefas e equipe para a
Kabelera. Hoje existe um protótipo funcional em arquivo único
(`kabelera-manager.html`, ~1400 linhas) com: 5 áreas de trabalho (Marketing,
Administração, Design, Financeiro, Comercial), projetos que cruzam áreas, Kanban
com arrastar e soltar, views de Lista e Calendário, um Dashboard com indicadores,
um drawer de tarefa completo (checklist, subtarefas, comentários com menção,
anexos, links, dependências, histórico), modal de nova tarefa e notificações.

Todo o estado vive em memória (arrays `TASKS`, `PROJECTS`, `NOTIFICATIONS`): ao
atualizar a página, tudo é perdido. O "usuário atual" é escolhido num seletor,
sem senha. As views Timeline e Gantt são apenas um placeholder "v2".

A equipe inicial tem 3 pessoas: Paty (Marketing, Design e Gestão de Marca), Caio
(Administração, Financeiro e Operações) e Calebe (Comercial e Estratégia), mas o
sistema precisa suportar novos usuários e novas áreas ao longo do tempo.

## Objetivo deste ciclo

Transformar o protótipo em memória num app real, compartilhado e seguro, pronto
para a equipe usar no dia a dia por um link público, cobrindo:

1. Persistência compartilhada em banco de dados (os 3+ veem e editam os mesmos
   dados).
2. Login com e-mail e senha de verdade.
3. Áreas criáveis além das 5 existentes.
4. Logins de novos usuários criáveis (a equipe não será sempre Paty, Caio e
   Calebe).
5. As views Gantt e Timeline funcionando.
6. Deploy como página web acessível por um link (GitHub Pages).
7. Correções de segurança e correção identificadas na revisão do protótipo.

Fora de escopo neste ciclo: atualização em tempo real (ver a mudança de outra
pessoa aparecer sem atualizar), upload real de arquivos para os anexos (segue
como nome/placeholder por enquanto), app mobile nativo, relatórios avançados,
fluxos de status customizados por área (novas áreas escolhem um dos 4 fluxos
prontos).

## Decisões tomadas no brainstorming

- Persistência: banco de dados compartilhado (não localStorage por pessoa).
- Backend: Supabase (Auth + Postgres + Edge Function). Sem servidor próprio.
- Hospedagem: GitHub Pages (site 100% estático).
- Autenticação: login com e-mail e senha, sem cadastro aberto.
- Sincronização: otimista com rollback em erro; rebusca ao navegar + botão
  "Atualizar". Sem polling automático. Tempo real fica para depois.
- Áreas: dinâmicas, guardadas em banco; novas áreas escolhem um dos 4 fluxos
  prontos (Criativo, Comercial, Financeiro, Administrativo), não definem colunas
  do zero.
- Usuários: dinâmicos, com papel de admin. Só admin cria/desativa usuários e
  áreas e promove/rebaixa admins.
- Dados iniciais: banco começa vazio (sem as tarefas e projetos fictícios do
  protótipo).
- Estrutura de arquivos: dividir o HTML único em `index.html`, `styles.css`,
  `app.js`, `supabase-client.js`. Continua sem build step.
- Exclusões: usuários e áreas são desativados, não apagados, para preservar
  histórico e referências.

## Arquitetura

```
Navegador (Paty / Caio / Calebe / futuros)
  │
  ├── index.html + styles.css           (UI, estática)
  ├── app.js                            (lógica da aplicação, render, estado)
  └── supabase-client.js                (wrapper das chamadas ao Supabase)
        │  via @supabase/supabase-js (CDN, sem build)
        ▼
  Supabase
    ├── Auth               (login e-mail/senha, sessão)
    ├── Postgres           (tabelas profiles, areas, projects, tasks, notifications)
    │     protegido por Row Level Security (RLS)
    └── Edge Function: create-user
          (roda no servidor do Supabase, guarda a service_role key em segredo,
           só executa se o chamador autenticado for admin)
```

Nenhum servidor próprio. O "backend" é inteiramente o Supabase. O plano gratuito
cobre com folga o volume de uma equipe pequena. O site é estático e pode ser
servido pelo GitHub Pages.

### Configuração fixa no código (não vai para o banco)

`FLOWS`, `FINAL_STATUSES` e `RETURN_RULES` continuam como constantes no `app.js`,
exatamente como no protótipo. São os 4 fluxos de status prontos:

- `creative`: Backlog → Planejamento → Em produção → Revisão → Aprovação →
  Programado → Concluído (final: Concluído; regra de retorno: Aprovação →
  Em produção).
- `comercial`: Novo Lead → Contato → Qualificação → Proposta → Negociação →
  Fechado → Pós-venda (final: Fechado, Pós-venda).
- `financeiro`: Pendente → Programado → Aguardando → Pago/Recebido → Conciliado
  (final: Pago/Recebido, Conciliado).
- `admin`: Solicitado → A Fazer → Em Andamento → Aguardando Terceiro → Revisão →
  Concluído (final: Concluído).

A equipe não edita fluxos neste ciclo; ao criar uma área, escolhe qual desses 4
ela usa.

## Modelo de dados (Postgres / Supabase)

Chaves primárias são `uuid` geradas pelo banco (`gen_random_uuid()`), não mais
`Math.random()` no cliente. Campos de data pura (`due_date`, `start_date`,
`completed_at`, `created_at` quando data) usam tipo `date`; carimbos com hora
(`created_at` de comentários/histórico) usam `timestamptz`.

### Tabela `profiles`
Espelha os usuários do Supabase Auth. Uma linha por pessoa.

| coluna | tipo | notas |
|---|---|---|
| id | uuid (PK) | igual ao `auth.users.id` |
| name | text | nome de exibição (ex: "Paty") |
| role_label | text | descrição livre (ex: "Marketing, Design & Gestão de Marca") |
| area_ids | uuid[] | áreas às quais a pessoa pertence (informativo/filtros) |
| is_admin | boolean | default false |
| is_active | boolean | default true; desativar = false (não apaga) |
| created_at | timestamptz | default now() |

O primeiro admin (Patrícia) é marcado com `is_admin = true` uma única vez pelo
painel do Supabase. Depois disso, admins promovem/rebaixam pela tela de
Configurações.

### Tabela `areas`
Substitui o array fixo `AREAS` do protótipo.

| coluna | tipo | notas |
|---|---|---|
| id | uuid (PK) | |
| name | text | ex: "Marketing" |
| flow | text | um de: creative, comercial, financeiro, admin |
| color | text | token de cor (ex: "marketing", "design", ou um hex para áreas novas) |
| subcats | text[] | subcategorias da área |
| sort_order | int | ordem no menu lateral |
| is_active | boolean | default true |
| created_at | timestamptz | default now() |

As 5 áreas originais entram via migration de seed (script SQL de criação), com os
mesmos nomes, fluxos, cores e subcategorias do protótipo, para o visual não
mudar. Desativar uma área só é permitido se ela não tiver tarefas ativas.

### Tabela `projects`

| coluna | tipo | notas |
|---|---|---|
| id | uuid (PK) | |
| name | text | |
| description | text | |
| responsible_id | uuid | FK lógica para profiles.id |
| participants | uuid[] | ids de profiles |
| start_date | date | |
| due_date | date | |
| status | text | ex: "Em andamento", "Planejamento", "Concluído" |
| is_active | boolean | default true |
| created_at | timestamptz | default now() |

### Tabela `tasks`
Campos usados em filtros/Kanban/listas são colunas de verdade; os detalhes
aninhados são `jsonb`, fiéis ao formato do protótipo.

| coluna | tipo | notas |
|---|---|---|
| id | uuid (PK) | |
| title | text | |
| description | text | |
| area_id | uuid | FK lógica para areas.id |
| subcategory | text | |
| project_id | uuid | FK lógica para projects.id, nulável |
| requester_id | uuid | |
| responsible_id | uuid | |
| participants | uuid[] | |
| priority | text | Baixa, Média, Alta, Urgente |
| status | text | uma coluna do fluxo da área |
| due_date | date | nulável |
| start_date | date | nulável |
| completed_at | date | nulável |
| checklist | jsonb | `[{id,text,done}]` |
| subtasks | jsonb | `[{id,title,done,responsible_id}]` |
| comments | jsonb | `[{id,author_id,text,created_at}]` |
| attachments | jsonb | `[{id,name,size,uploaded_by,created_at}]` |
| links | jsonb | `[{id,url,label}]` |
| dependencies | jsonb | `[task_id,...]` |
| history | jsonb | `[{id,field,from,to,at,by}]` |
| created_at | timestamptz | default now() |

### Tabela `notifications`

| coluna | tipo | notas |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid | destinatário |
| text | text | |
| created_at | timestamptz | default now() |
| read | boolean | default false |

Notificações passam a ser linhas no banco: ao mencionar alguém num comentário, o
cliente insere uma linha de notificação para o mencionado, que a vê no próximo
carregamento.

## Segurança

### Row Level Security (RLS)
Com a chave pública (anon key) visível no código (comportamento esperado e seguro
do Supabase), o RLS é a única barreira dos dados. Políticas:

- Todas as tabelas: RLS ligado.
- `profiles`, `areas`, `projects`, `tasks`, `notifications`: SELECT, INSERT,
  UPDATE permitidos apenas para usuários autenticados (`auth.role() =
  'authenticated'`).
- `notifications`: SELECT restrito ao próprio destinatário
  (`user_id = auth.uid()`).
- Escritas administrativas — INSERT/UPDATE em `areas`, e UPDATE de `is_admin`,
  `is_active` em `profiles` — permitidas apenas se o chamador for admin
  (verificação via função SQL que lê `profiles.is_admin` do `auth.uid()`).
- DELETE: não exposto ao cliente (usamos `is_active = false`).

### Criação de usuário (Edge Function `create-user`)
Criar um usuário no Supabase Auth exige a `service_role` key, que NÃO pode ficar
no cliente. Fluxo:

1. Admin preenche o formulário de novo usuário (e-mail, nome, role_label, áreas,
   is_admin) e uma senha inicial.
2. O cliente chama a Edge Function `create-user`, autenticado com a sessão do
   admin.
3. A função valida que o chamador é admin (lendo `profiles`), e só então usa a
   `service_role` key (guardada como secret da função, nunca no cliente) para
   criar o usuário no Auth e inserir a linha em `profiles`.
4. Retorna sucesso/erro para o cliente.

### Endurecimentos de código (da revisão do protótipo)
- `esc()`: passa a escapar também aspa simples (`'`) e demais caracteres de
  atributo, pois conteúdo de um usuário é renderizado na tela de outro.
- `mentionify()`: escapar caracteres especiais de regex no nome do usuário antes
  de montar a `RegExp` (nomes agora são texto livre).
- Validação básica de entrada no cliente: limite de tamanho de título e
  comentário, campos obrigatórios no modal.

## Correções de correção (da revisão do protótipo)

- `TODAY` deixa de ser fixo (`new Date(2026,8,22)`) e passa a ser a data real
  (`new Date()`), para "atrasada"/"vence hoje" calcularem certo.
- Datas: `iso()` e `fmtDateTime()` não usam mais `toISOString()` (UTC), que no
  fuso do Brasil (UTC-3) desloca o dia. Passam a formatar/comparar no fuso local.
- `approveTask()`: remover a variável `target` morta e acertar a lógica de
  aprovação por fluxo, para que aprovar uma tarefa de qualquer fluxo tenha efeito
  coerente (avança para o próximo status esperado do fluxo), não só no fluxo
  creative.
- IDs de todas as entidades vêm do banco (uuid), não de `Math.random()`.

## Views novas (por área)

Ambas reaproveitam as funções existentes `tasksForArea()` e `matchesFilters()` e
respeitam a barra de filtros da área (responsável, subcategoria, prioridade,
prazo). Clicar em qualquer item abre o drawer da tarefa.

### Gantt
- Barras horizontais de `start_date` → `due_date` por tarefa.
- Linhas agrupadas por subcategoria da área.
- Escala de dias em largura fixa, com rolagem horizontal (mesmo padrão do
  board Kanban).
- Linha vertical marcando "hoje" (mesmo destaque do Calendário).
- Tarefa sem `start_date` usa `due_date` menos 3 dias como início estimado, só
  para ter barra visível.
- Dependências aparecem como ícone de link na barra; clicar abre a tarefa da qual
  depende.
- Construído com CSS/grid, sem biblioteca externa, reusando as variáveis visuais
  existentes (`--dep-*`, `--radius-*`).

### Timeline
- Feed cronológico de atividade da área inteira (não de uma tarefa só).
- Junta `history` e `comments` de todas as tarefas da área, do mais recente ao
  mais antigo.
- Cada item: quem fez o quê, em qual tarefa, quando (mesmo estilo visual do
  histórico que já existe dentro do drawer).

## Sincronização e estados de erro

- **Carregamento inicial:** após o login, buscar áreas, perfis, projetos, tarefas
  e notificações do Supabase e preencher os arrays (`AREAS`, `USERS`, `TASKS`,
  `PROJECTS`, `NOTIFICATIONS`) que o resto do código já consome. O código de
  render/filtro/Kanban continua igual.
- **Ao salvar (mover card, criar tarefa, comentar, checklist, etc.):** atualizar
  a tela na hora (otimista) e enviar ao Supabase em paralelo. Se falhar: desfazer
  a mudança na tela, mostrar toast de erro, e preservar o texto digitado em
  formulários.
- **Ver mudanças de outra pessoa:** rebuscar os dados ao navegar para outra
  página do menu, mais um botão "Atualizar" na barra de topo. Sem polling.
- **Falha no carregamento inicial:** tentar de novo uma vez automaticamente; se
  falhar de novo, mostrar tela de erro com botão "Tentar de novo", nunca abrir o
  app com dados vazios/errados.
- **Carregando:** indicador simples no lugar do conteúdo entre o login e os dados
  chegarem.

## Autenticação (fluxo)

- Tela de login (e-mail + senha) antes de qualquer tela do app. Substitui o
  seletor "ver como".
- Supabase Auth nativo (email/password). Sessão persistida pelo Supabase (não
  loga de novo a cada visita).
- Sem cadastro aberto: contas só nascem via Edge Function chamada por admin.
- Botão "Sair" no rodapé da barra lateral, onde ficava o seletor de usuário.
- `state.currentUserId` passa a vir do usuário logado.
- "Esqueci minha senha": fluxo padrão do Supabase (e-mail com link de
  redefinição), sem tela customizada.
- Erro de login: mensagem genérica "e-mail ou senha incorretos".

## Administração (tela de Configurações)

Visível apenas para admins. Adiciona à tela de Configurações atual:

- **Usuários:** listar, criar (via Edge Function), desativar/reativar,
  promover/rebaixar admin, editar nome/role_label/áreas.
- **Áreas:** listar, criar (nome, cor, fluxo escolhido entre os 4, subcategorias),
  desativar/reativar (desativar só se não houver tarefa ativa), reordenar.

Usuário comum vê a tela de Configurações em modo leitura (áreas, fluxos, próprio
perfil), sem as ações de administração.

## Estrutura de arquivos

```
kabelera-manager/
  index.html              # markup base + telas de login/erro/carregando
  styles.css              # todo o CSS (hoje embutido no HTML)
  app.js                  # lógica, estado, render, eventos (hoje embutido)
  supabase-client.js      # init do Supabase + wrapper das queries e da auth
  supabase/
    schema.sql            # criação das tabelas, RLS, seed das 5 áreas
    functions/create-user # Edge Function de criação de usuário
  docs/superpowers/specs/  # este documento e futuros
  README.md               # setup (Supabase, contas, deploy)
```

Continua sem build step: `@supabase/supabase-js` entra por CDN; os arquivos são
servidos como estáticos.

## Deploy (GitHub Pages)

Feito por mim (local):
1. Criar repositório git local em `C:\Users\Patricia\projetos\kabelera-manager`.
2. Commit inicial com todos os arquivos + README.
3. Após o repo remoto existir, conectar e dar push.

Feito pela Patrícia (com meu passo a passo):
1. Criar repositório vazio no github.com e me passar a URL.
2. Após o push, ativar GitHub Pages (Settings → Pages → Deploy from branch →
   `main` → `/root`). Gera o link público
   (`https://<usuario>.github.io/kabelera-manager/`).
3. Criar projeto gratuito no supabase.com; rodar o `schema.sql`; criar a conta de
   admin (Patrícia) e marcá-la `is_admin = true`; configurar a Edge Function e seu
   secret `service_role`; me passar a URL do projeto + a anon key (segura para o
   código).

Nota: o link do GitHub Pages é acessível a quem o tiver (natureza do Pages), mas
sem login válido só se vê a tela de login; os dados são protegidos pelo RLS.

## Critérios de sucesso

- Os 3 (e novos usuários) fazem login com e-mail e senha e veem os mesmos dados.
- Criar, mover, editar, comentar e aprovar tarefas persiste no banco e aparece
  para os outros ao atualizar/navegar.
- Admin cria uma nova área com um dos 4 fluxos e ela aparece no menu, no Kanban,
  nos filtros e no modal de nova tarefa.
- Admin cria um novo login, que consegue entrar e usar o sistema.
- Gantt e Timeline funcionam em cada área, respeitando filtros.
- Erros de rede não corrompem a tela (rollback + aviso).
- O app está publicado e acessível por um link.
- Datas e "atrasada/hoje" calculam corretamente no fuso do Brasil.
