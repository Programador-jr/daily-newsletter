# King's Newsletter

Newsletter diária com notícias relevantes de política, economia, investimentos, tecnologia, Brasil e mundo.

## Estrutura

- `public/index.html` — página inicial e inscrição por e-mail
- `public/editions.html` — edição atual, busca, filtros e histórico
- `public/about.html` — informações do projeto
- `public/css/styles.css` — identidade visual e responsividade
- `public/js/script.js` — carregamento, filtros, busca, tema e histórico
- `public/js/subscribe.js` — formulário de inscrição
- `data/news.json` — edição atual
- `data/archive/YYYY-MM-DD.json` — uma edição histórica por dia
- `api/subscribe.js` — cadastro e envio do e-mail de confirmação
- `api/confirm.js` — confirmação da inscrição
- `api/unsubscribe.js` — cancelamento da inscrição
- `api/notify-news.js` — envio protegido das novas notícias
- `lib/` — conexão com MongoDB, modelos, tokens e envio SMTP

## Inscrição por e-mail

O cadastro utiliza double opt-in:

1. O visitante informa o e-mail.
2. O sistema salva o cadastro no MongoDB com status pendente.
3. Um token de confirmação com validade de 24 horas é enviado por e-mail.
4. O visitante confirma a inscrição.
5. O endereço passa a receber as novas atualizações.
6. Cada e-mail possui um link de cancelamento.

Os e-mails dos inscritos não ficam no repositório nem em arquivos públicos.

## Variáveis de ambiente

Copie `.env.example` para `.env` no desenvolvimento local e configure as mesmas variáveis na Vercel:

- `MONGODB_URI`
- `EMAIL_USER`
- `EMAIL_PASS` — use uma Senha de app do Gmail, não a senha normal da conta.
- `EMAIL_FROM`
- `APP_URL`
- `NOTIFY_SECRET`

## Envio de novas notícias

A rota `POST /api/notify-news` é protegida por `NOTIFY_SECRET`.

Exemplo:

```bash
curl -X POST https://seu-projeto.vercel.app/api/notify-news \
  -H "Authorization: Bearer $NOTIFY_SECRET"
```

Ela lê `data/news.json`, identifica notícias ainda não registradas como enviadas e manda um único e-mail com todas as novidades encontradas.

A automação que atualiza o `news.json` pode chamar essa rota depois de publicar uma nova atualização.

## Desenvolvimento local

```bash
npm install
npm start
```

O servidor local também expõe as rotas de inscrição, confirmação, descadastro e notificação.
