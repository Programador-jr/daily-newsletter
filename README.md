<div align="center">

# King's Newsletter

### The news that matters, with the context behind it.

Daily coverage of Brazil and the world, presented with concise summaries, curated sources, and a growing guide to Brazilian history.

<br>

[![Visit the website](https://img.shields.io/badge/Visit_the_website-dailynewsletter.vercel.app-0B766B?style=for-the-badge&logo=vercel&logoColor=white)](https://dailynewsletter.vercel.app)

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](./LICENSE)
[![Tests](https://github.com/Programador-jr/daily-newsletter/actions/workflows/tests.yml/badge.svg)](https://github.com/Programador-jr/daily-newsletter/actions/workflows/tests.yml)
[![GitHub stars](https://img.shields.io/github/stars/Programador-jr/daily-newsletter?style=flat-square)](https://github.com/Programador-jr/daily-newsletter/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/Programador-jr/daily-newsletter?style=flat-square)](https://github.com/Programador-jr/daily-newsletter/issues)

</div>

---

The project also includes educational guides covering political ideologies, public policy, the three branches of government, and public offices.

## Contents

- [About](#about)
- [Features](#features)
- [Built with](#built-with)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API](#api)
- [Tests](#tests)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## About

King's Newsletter is a responsive news platform for following current events and exploring the history behind them. It brings daily editions, searchable archives, and a Brazilian History section together with an email subscription flow.

**Explore:** [Live website](https://dailynewsletter.vercel.app) · [Source code](https://github.com/Programador-jr/daily-newsletter) · [Report an issue](https://github.com/Programador-jr/daily-newsletter/issues)

## Features

- **Daily editions** — current stories with summaries, context, publication dates, and source links.
- **Searchable archive** — browse previous editions and filter stories.
- **Brazilian History** — an interactive timeline, historical milestones, presidents, governments, constitutions, and topic guides.
- **Responsive interface** — works across desktop and mobile layouts, with light and dark themes.
- **Email subscriptions** — double opt-in confirmation, unsubscribe links, and notifications when new editions are published.
- **Delivery tracking** — records sent stories to avoid duplicate notifications.

## Built with

| Area | Technologies |
| --- | --- |
| Frontend | HTML, CSS, vanilla JavaScript |
| Server | Node.js 20+, Express 5 |
| Data | MongoDB, Mongoose |
| Email | Nodemailer |
| Hosting | Vercel |

## Project structure

```text
.
├── api/                  # News, subscription, confirmation, and notification handlers
├── data/                 # Example news data and schema
├── lib/                  # Database connection, models, email, and token helpers
├── test/                 # API and utility tests (node:test)
├── public/
│   ├── css/              # Site and page styles
│   ├── js/               # Browser-side behavior
│   └── *.html            # Newsletter, editions, history, and president pages
├── server.js             # Local Express server and routes
├── .github/workflows/    # Automated checks on pushes and pull requests
├── vercel.json           # Vercel configuration
└── package.json
```

## Getting started

### Prerequisites

- [Node.js 20 or newer](https://nodejs.org/)
- A MongoDB connection string for database-backed features
- SMTP credentials for sending subscription and edition emails

### Install

```bash
git clone https://github.com/Programador-jr/daily-newsletter.git
cd daily-newsletter
npm install
```

Create a local environment file from the example:

```bash
cp .env.example .env
```

Add the required values to `.env` (see [Environment variables](#environment-variables)), then start the app:

```bash
# Development server with automatic restart
npm run dev

# Or start the server normally
npm start
```

Open [http://localhost:3000](http://localhost:3000).

> The site can start without database or SMTP configuration, but API features that use MongoDB or send email require their corresponding environment variables.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string. Required for news and subscription data. |
| `RATE_LIMIT_WINDOW_MS` | Rate-limit window in milliseconds (default: 900000, 15 minutes). |
| `RATE_LIMIT_SUBSCRIBE_IP_MAX` | Subscription requests per IP per window (default: 10). |
| `RATE_LIMIT_SUBSCRIBE_EMAIL_MAX` | Attempts per normalized email per window (default: 3). |
| `RATE_LIMIT_ADMIN_LOGIN_IP_MAX` | Admin login attempts per IP per window (default: 10). |
| `RATE_LIMIT_ADMIN_LOGIN_USER_MAX` | Attempts per normalized username per window (default: 5). |
| `EMAIL_USER` | SMTP account used by Nodemailer. |
| `EMAIL_PASS` | SMTP password or provider-specific app password. |
| `EMAIL_FROM` | Optional sender name and address; defaults to `EMAIL_USER`. |
| `APP_URL` | Public base URL used to generate confirmation and unsubscribe links. |
| `NOTIFY_SECRET` | Secret used to authorize protected news publishing and notification requests. |
| `WORKER_CONTROL_SECRET` | Separate secret of at least 32 characters shared only by the site and worker control channel. |
| `ADMIN_USERNAME` | Username for the private administration panel. |
| `ADMIN_PASSWORD` | Strong password for the private administration panel. |
| `ADMIN_SESSION_SECRET` | Random signing key of at least 32 characters for administrator sessions. |
| `PORT` | Optional local server port; defaults to `3000`. |

Keep `.env` private. Never publish credentials or commit them to the repository. For Gmail, use an app password rather than your account password.

### Painel administrativo

O painel fica em `/admin` e exige usuário e senha. Configure `ADMIN_USERNAME`, `ADMIN_PASSWORD` e `ADMIN_SESSION_SECRET` no ambiente local e na Vercel. A chave de sessão deve ter pelo menos 32 caracteres e ser aleatória. O painel utiliza a conexão `MONGODB_URI` já configurada pelo site; sem essa variável, não consegue carregar os dados.

O painel mostra inscritos confirmados e pendentes, quantidade de notícias da edição mais recente, notícias já entregues ou aguardando envio, mensagens aceitas ou rejeitadas pelo SMTP, falhas e execuções do worker. O botão **Disparar notícias pendentes** solicita confirmação e envia somente notícias ainda não registradas como entregues. Os novos registros de envio e execução passam a ser gravados a partir desta implementação; os logs antigos do console não são importados. Horários são exibidos em `America/Rio_Branco`. “Aceito” indica que o servidor SMTP recebeu a mensagem para processamento, não que ela chegou à caixa de entrada.

O painel também configura a frequência do worker (de 1 a 168 horas), permite pausar ou retomar o agendamento e mostra a contagem regressiva e o último estado informado pelo processo. Configure o mesmo `WORKER_CONTROL_SECRET` no ambiente do site e no `.env` do worker; mantenha-o separado de `NOTIFY_SECRET`. O worker busca a configuração e publica seu estado por HTTPS de saída, a cada 30 segundos. Nenhuma porta pública ou IP fixo do worker é necessário. Configure essa variável também no ambiente de produção da Vercel e publique uma nova implantação para habilitar o controle remoto em produção.

On startup, the server warns when MongoDB, email, or protected publishing is not configured. A partial SMTP configuration, an invalid `PORT`, or a non-HTTP `APP_URL` stops startup with a message that identifies the setting without printing its value.

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/news` | Get the latest edition. |
| `GET` | `/api/news?date=dd/mm/yyyy` | Get an edition by date. |
| `GET` | `/api/news?history=true` | List available edition dates. |
| `POST` | `/api/news` | Publish or update stories for an edition. Requires `NOTIFY_SECRET`. |
| `POST` | `/api/subscribe` | Request an email subscription confirmation. |
| `GET` | `/api/confirm?token=...` | Confirm a subscription. |
| `GET` | `/api/unsubscribe?token=...` | Unsubscribe from email updates. |
| `POST` | `/api/notify-news` | Send notifications for newly published stories. Requires `NOTIFY_SECRET`. |
| `POST` | `/api/admin/login` | Start an administrator session. |
| `POST` | `/api/admin/logout` | End an administrator session. |
| `GET` | `/api/admin/dashboard?days=7` | Read subscriber, email, and worker metrics. Requires an administrator session. |
| `GET`, `PUT` | `/api/admin/schedule` | Read or update the worker interval and enabled state. Requires an administrator session. |
| `POST` | `/api/admin/dispatch` | Immediately send pending news. Requires an administrator session. |
| `GET` | `/api/worker/config` | Read worker scheduling configuration. Requires `WORKER_CONTROL_SECRET`. |
| `POST` | `/api/worker/heartbeat` | Report the worker's status and next run time. Requires `WORKER_CONTROL_SECRET`. |

Edition dates use the `dd/mm/yyyy` format. Protected endpoints expect the configured secret in the `Authorization` header.

## Tests

Run the test suite with Node.js's built-in test runner:

```bash
npm test
npm run lint
```

Unit tests use stubs for MongoDB and email delivery, so they do not require external services or production credentials. The browser suite uses Playwright and Chromium. GitHub Actions runs unit tests on Node.js 18, 20, and 22, and runs lint and browser checks on Node.js 22 for every push and pull request. Browser traces and reports are uploaded when those checks fail.

Run browser tests locally after installing Chromium:

```bash
npx playwright install chromium
npm run test:e2e
```

## Email operations

Email is sent through Gmail SMTP using Nodemailer. For local or production use, configure `EMAIL_USER` and `EMAIL_PASS`; Gmail accounts should use a Google app password, not the account password. `EMAIL_FROM` is optional and changes the displayed sender.

The server emits structured `email.delivery.succeeded` and `email.delivery.failed` log events. Success logs include the SMTP message ID and accepted-recipient count; failure logs include a safe error code. Recipient addresses, message bodies, and credential values are intentionally excluded. In Vercel, inspect the project and function logs around the time an email was requested, then use the mail provider's delivery or security logs to investigate SMTP rejection, bounce, or spam-folder issues. SMTP acceptance confirms the provider accepted a message for processing; it does not guarantee inbox delivery.

If email delivery fails, verify that both SMTP variables are configured, that the account permits SMTP/app-password access, and that the deployment is using the expected `APP_URL`. Do not paste credentials or full email payloads into issue reports.

## Deployment

The project is configured for [Vercel](https://vercel.com/) and uses MongoDB for persistent data. Before deploying, add the required environment variables in the Vercel project settings. Set `APP_URL` to the public production URL so email links point to the correct site.

## Contributing

Bug reports, ideas, and improvements are welcome. Please [open an issue](https://github.com/Programador-jr/daily-newsletter/issues) to discuss larger changes before submitting a pull request. Run `npm test` before opening a pull request.

## License

This project is licensed under the [MIT License](./LICENSE).

---

<div align="center">

Made with coffee and JavaScript by **Daniel Melo**.

</div>
## Civic education

The project includes reference pages covering political ideologies and public policies, with an emphasis on concepts, institutional context, public spending, implementation and evidence-based evaluation.

The civic education area also includes a reference guide to the three branches of government and their constitutional roles.


### Segurança e operação em produção

- Configure `APP_URL` como origem canônica, por exemplo `https://seudominio.com`, sem caminho, query ou fragmento. Links enviados por e-mail não devem depender do cabeçalho `Host` recebido.
- Em produção, `APP_URL` e `MONGODB_URI` são obrigatórias; a inicialização local falha com mensagem clara quando a configuração obrigatória está ausente.
- O cancelamento de inscrição usa GET somente para exibir a confirmação e POST para efetivar a ação. Cabeçalhos de segurança são configurados no Vercel.
- As consultas da Câmara e do Transferegov têm limites de tempo/tamanho, cache local com capacidade limitada e cache compartilhado no CDN para respostas públicas bem-sucedidas. A listagem de deputados e despesas usa `s-maxage=300` (5 min), a CEAP usa `s-maxage=1800` (30 min) e as emendas do Transferegov usam `s-maxage=600` (10 min); `stale-while-revalidate` permite servir dados temporariamente antigos enquanto o CDN atualiza o cache. Respostas de erro não recebem esses cabeçalhos, e a API de notícias não é colocada no cache compartilhado para evitar atrasos após a publicação de uma edição.
- A busca no código da aplicação não encontrou uso direto de `url.parse()`. Como o aviso `DEP0169` precisa do stack trace do runtime/deploy para identificar sua dependência de origem, diagnostique com `NODE_OPTIONS=--trace-deprecation` no ambiente que reproduz o aviso; não atualize dependências às cegas sem identificar o emissor.


## Runtime diagnostics and performance benchmarks

### Trace Node.js deprecations

The application code does not directly call `url.parse()`; the warning may originate in a transitive dependency or an unusual request path. CI now runs unit and browser tests with `NODE_OPTIONS=--trace-deprecation`, so any warning exercised by those tests includes its call stack. If the warning appears only in Vercel, temporarily set `NODE_OPTIONS=--trace-deprecation` in the Preview environment, redeploy, reproduce the affected request, and use the first non-Node.js frame in the log to identify the responsible package. Remove the temporary setting after collecting the trace.

### Compare public API performance

Set `BASE_URL_BEFORE` and `BASE_URL_AFTER` to the old and candidate deployments, then set `BENCHMARK_PATHS` to the same comma-separated GET endpoints on both deployments. Run:

```sh
BASE_URL_BEFORE=https://old-preview.example.com \
BASE_URL_AFTER=https://new-preview.example.com \
BENCHMARK_PATHS='/api/camara-deputados,/api/transferegov-emendas?ano=2025&limite=25' \
BENCHMARK_RUNS=5 node scripts/benchmark-public-data.js
```

The script records HTTP status, response size, individual timings, and median latency. Run it against Preview deployments with the same data period; do not use it as a load test against production.

### Compare MongoDB edition queries

With a read-only-capable `MONGODB_URI` pointing to a representative `kings_newsletter` database, run `node scripts/benchmark-news-queries.js`. It verifies that the current aggregation results match the Node-side baseline, records median timings, and reports MongoDB execution statistics when available. It is an opt-in diagnostic and is not run by CI because it requires a real database.
