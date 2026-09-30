# King's Newsletter

Newsletter diária com notícias relevantes de política, economia, investimentos, tecnologia, Brasil e mundo.

## Estrutura

- `public/index.html` — página inicial e inscrição por e-mail
- `public/editions.html` — edição atual, busca, filtros e histórico
- `public/about.html` — informações do projeto
- `public/css/styles.css` — identidade visual e responsividade
- `public/js/script.js` — carregamento, filtros, busca, tema e histórico
- `public/js/subscribe.js` — formulário de inscrição
- `data/news.schema.json` — schema de referência dos documentos de notícias
- `api/news.js` — leitura e gravação das notícias no MongoDB
- `api/subscribe.js` — cadastro e envio do e-mail de confirmação
- `api/confirm.js` — confirmação da inscrição
- `api/unsubscribe.js` — cancelamento da inscrição
- `api/notify-news.js` — envio protegido das novas notícias
- `api/migrate-news.js` — migração única dos antigos JSONs para o MongoDB
- `lib/` — conexão com MongoDB, modelos, tokens e envio SMTP

## MongoDB

O MongoDB é a fonte única das notícias. O projeto não usa mais arquivos JSON como banco de conteúdo.

Cada notícia é armazenada com:

- `editionDate` — edição no formato YYYY-MM-DD
- `category`
- `title`
- `summary`
- `context`
- `source`
- `publishedAt`
- `url`

O modelo está em `lib/news.js` e o schema de referência em `data/news.schema.json`.

A API:

- `GET /api/news` — retorna a edição mais recente
- `GET /api/news?date=YYYY-MM-DD` — retorna uma edição específica
- `GET /api/news?history=true` — retorna o histórico com a quantidade real de notícias
- `POST /api/news` — insere ou atualiza notícias de uma edição, protegido por `NOTIFY_SECRET`

A coleção de notícias pode ser criada automaticamente pelo MongoDB quando a primeira gravação ocorrer; não é necessário criá-la manualmente.

### Migração inicial

Enquanto os arquivos antigos ainda estiverem presentes, a rota protegida `POST /api/migrate-news` importa todas as edições para o MongoDB.

Depois de confirmar a migração, os arquivos antigos de `data/news.json` e `data/archive/` podem ser removidos. O único arquivo mantido em `data/` será `news.schema.json`.

## Inscrição por e-mail

O cadastro utiliza double opt-in:

1. O visitante informa o e-mail.
2. O sistema salva o cadastro no MongoDB com status pendente.
3. Um token de confirmação com validade de 24 horas é enviado por e-mail.
4. O visitante confirma a inscrição.
5. O endereço passa a receber as novas atualizações.
6. Cada e-mail possui um link de cancelamento.

Os e-mails dos inscritos não ficam no repositório nem em arquivos públicos.

### Gmail

O envio utiliza o Gmail via SMTP com **Senha de App**.

No desenvolvimento local:

1. Use uma conta Gmail com a verificação em duas etapas ativada.
2. Gere uma Senha de App na Conta Google.
3. Coloque o e-mail da conta em `EMAIL_USER`.
4. Coloque a Senha de App em `EMAIL_PASS`.
5. Não coloque a Senha de App diretamente no código nem no GitHub.

## Variáveis de ambiente

Copie `.env.example` para `.env` no desenvolvimento local e configure as mesmas variáveis na Vercel:

- `MONGODB_URI`
- `EMAIL_USER`
- `EMAIL_PASS` — Senha de App do Gmail
- `EMAIL_FROM`
- `APP_URL`
- `NOTIFY_SECRET`

## Envio de novas notícias

A rota `POST /api/notify-news` é protegida por `NOTIFY_SECRET`.

Ela consulta o MongoDB, identifica notícias da edição mais recente que ainda não foram enviadas e manda um único e-mail com todas as novidades encontradas.

A automação que publica novas notícias deve primeiro usar `POST /api/news` e, depois, chamar `POST /api/notify-news`.

## Desenvolvimento local

```bash
npm install
npm start
```

O servidor local expõe as rotas de notícias, inscrição, confirmação, descadastro, migração e notificação.
