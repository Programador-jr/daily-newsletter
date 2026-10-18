<div align="center">

<img src="https://cdn.shardcloud.app/4d7d8031-4b99-4759-afbc-1e01575b29d6/kingsNewsletter.png" alt="King's Newsletter" width="320">


### The news that matters, with the context behind it.

Daily coverage of Brazil and the world, with concise summaries, curated sources, and guides to Brazilian history and civic education.

**English** · [Português (Brasil)](./README.pt-BR.md)

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

## Contents

- [About](#about)
- [Features](#features)
- [Civic education](#civic-education)
- [Technology stack](#technology-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Administration panel](#administration-panel)
- [API reference](#api-reference)
- [Testing](#testing)
- [Email operations](#email-operations)
- [Security and production operations](#security-and-production-operations)
- [Runtime diagnostics and performance benchmarks](#runtime-diagnostics-and-performance-benchmarks)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## About

King's Newsletter is a responsive news platform for following current events and exploring the history and context behind them. It brings daily editions, searchable archives, email subscriptions, and a Brazilian History section together in one place.

**Explore:** [Live website](https://dailynewsletter.vercel.app) · [Source code](https://github.com/Programador-jr/daily-newsletter) · [Report an issue](https://github.com/Programador-jr/daily-newsletter/issues)

## Features

- **Daily editions** — stories with summaries, context, publication dates, and source links.
- **Searchable archive** — browse previous editions and filter stories.
- **Brazilian History** — an interactive timeline, historical milestones, presidents, governments, constitutions, and topic guides.
- **Civic education** — reference guides to political ideologies, public policy, public spending, and the constitutional roles of the three branches of government.
- **Responsive interface** — desktop and mobile layouts, with light and dark themes.
- **Email subscriptions** — confirmation flow, unsubscribe links, and notifications when new editions are published.
- **Delivery tracking** — records sent stories to help prevent duplicate notifications.
- **Administration panel** — subscriber, email delivery, news edition, and worker metrics, with controls for pending deliveries and worker scheduling.

## Technology stack

| Area | Technologies |
| --- | --- |
| Frontend | HTML, CSS, vanilla JavaScript |
| Server | Node.js 20+, Express 5 |
| Data | MongoDB, Mongoose |
| Email | Nodemailer |
| Hosting | Vercel |
| Testing | Node.js test runner, ESLint, Playwright |

## Project structure

```text
.
├── api/                  # News, subscription, confirmation, and notification handlers
├── data/                 # Example news data and schema
├── lib/                  # Database connection, models, email, and token helpers
├── test/                 # API and utility tests
├── public/
│   ├── css/              # Site and page styles
│   ├── js/               # Browser-side behavior
│   └── *.html             # Newsletter, editions, history, and president pages
├── scripts/              # Diagnostic and benchmark scripts
├── .github/workflows/    # Automated checks on pushes and pull requests
├── server.js             # Local Express server and routes
├── vercel.json           # Vercel configuration
└── package.json
```

## Getting started

### Prerequisites

- [Node.js 20 or newer](https://nodejs.org/)
- A MongoDB connection string for database-backed features
- SMTP credentials for sending subscription and edition emails

### Installation

```bash
git clone https://github.com/Programador-jr/daily-newsletter.git
cd daily-newsletter
npm install
```

Create a local environment file from the example:

```bash
cp .env.example .env
```

Add the required values to `.env` (see [Environment variables](#environment-variables)), then start the application:

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
| `APP_URL` | Canonical public base URL used to generate confirmation and unsubscribe links. |
| `NOTIFY_SECRET` | Secret used to authorize protected news publishing and notification requests. |
| `WORKER_CONTROL_SECRET` | Separate secret of at least 32 characters shared by the site and worker control channel. |
| `ADMIN_USERNAME` | Username for the private administration panel. |
| `ADMIN_PASSWORD` | Strong password for the private administration panel. |
| `ADMIN_SESSION_SECRET` | Random signing key of at least 32 characters for administrator sessions. |
| `PORT` | Optional local server port; defaults to `3000`. |

Keep `.env` private. Never publish credentials or commit them to the repository. For Gmail, use an app password rather than your account password.

## Administration panel

The administration panel is available at `/admin` and requires a username and password. Configure `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` in your local environment and in Vercel. The session signing key must be random and at least 32 characters long. The panel uses the site's `MONGODB_URI`; without it, the panel cannot load data.

The panel displays confirmed and pending subscribers, the latest edition's story count, delivered and pending stories, SMTP-accepted or rejected messages, failures, and worker executions. **Dispatch pending news** asks for confirmation and sends only stories not already recorded as delivered. Delivery and worker execution records are stored from the implementation that introduced these metrics; older console logs are not imported. Times are shown in `America/Rio_Branco`. “Accepted” means the SMTP server accepted the message for processing, not that it reached the recipient's inbox.

The panel also configures the worker interval (1–168 hours), lets administrators pause or resume scheduling, and shows a countdown and the latest status reported by the worker. Configure the same `WORKER_CONTROL_SECRET` in the site's environment and the worker's `.env`, and keep it separate from `NOTIFY_SECRET`. The worker fetches configuration and reports its status over outbound HTTPS every 30 seconds. It does not require a public port or fixed IP address. Set this variable in Vercel's production environment and redeploy to enable remote control in production.

On startup, the server warns when MongoDB, email, or protected publishing is not configured. Partial SMTP configuration, an invalid `PORT`, or a non-HTTP `APP_URL` stops startup with a message identifying the setting without printing its value.

## API reference

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

## Testing

Run the test suite with Node.js's built-in test runner:

```bash
npm test
npm run lint
```

Unit tests use stubs for MongoDB and email delivery, so they do not require external services or production credentials. The browser suite uses Playwright and Chromium. GitHub Actions runs unit tests on Node.js 20 and 22 and runs lint and browser checks for pushes and pull requests. Browser traces and reports are uploaded when browser checks fail.

Run browser tests locally after installing Chromium:

```bash
npx playwright install chromium
npm run test:e2e
```

## Email operations

Email is sent through Gmail SMTP using Nodemailer. For local or production use, configure `EMAIL_USER` and `EMAIL_PASS`; Gmail accounts should use a Google app password, not the account password. `EMAIL_FROM` is optional and changes the displayed sender.

The server emits structured `email.delivery.succeeded` and `email.delivery.failed` log events. Success logs include the SMTP message ID and accepted-recipient count; failure logs include a safe error code. Recipient addresses, message bodies, and credential values are intentionally excluded. In Vercel, inspect project and function logs around the time an email was requested, then use the mail provider's delivery or security logs to investigate SMTP rejection, bounce, or spam-folder issues. SMTP acceptance confirms the provider accepted a message for processing; it does not guarantee inbox delivery.

If email delivery fails, verify that both SMTP variables are configured, that the account permits SMTP/app-password access, and that the deployment uses the expected `APP_URL`. Do not paste credentials or full email payloads into issue reports.

## Security and production operations

- Set `APP_URL` to the canonical site origin (for example, `https://your-domain.com`), without a path, query string, or fragment. Email links must not depend on the incoming `Host` header.
- In production, `APP_URL` and `MONGODB_URI` are required; startup reports missing required configuration clearly.
- Unsubscribe uses GET only to display the confirmation page and POST to complete the action. Security headers are configured in Vercel.
- Câmara dos Deputados and Transferegov queries use time and size limits, bounded local caching, and shared CDN caching for successful public responses. Deputy and spending lists use `s-maxage=300` (5 minutes), CEAP uses `s-maxage=1800` (30 minutes), and Transferegov amendments use `s-maxage=600` (10 minutes). `stale-while-revalidate` allows temporarily stale data while the CDN refreshes it. Error responses do not receive these cache headers, and the news API is not placed in shared CDN cache to avoid delaying newly published editions.
- The application code does not directly call `url.parse()`. To identify the source of a `DEP0169` warning, reproduce it with `NODE_OPTIONS=--trace-deprecation` and inspect the runtime/deployment stack trace rather than updating dependencies blindly.

## Runtime diagnostics and performance benchmarks

### Trace Node.js deprecations

The application code does not directly call `url.parse()`; the warning may originate in a transitive dependency or an unusual request path. CI runs unit and browser tests with `NODE_OPTIONS=--trace-deprecation`, so warnings exercised by those tests include their call stack. If the warning appears only in Vercel, temporarily set `NODE_OPTIONS=--trace-deprecation` in the Preview environment, redeploy, reproduce the affected request, and use the first non-Node.js frame in the log to identify the responsible package. Remove the temporary setting after collecting the trace.

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

With a read-only-capable `MONGODB_URI` pointing to a representative `kings_newsletter` database, run:

```bash
node scripts/benchmark-news-queries.js
```

The script verifies that current aggregation results match the Node-side baseline, records median timings, and reports MongoDB execution statistics when available. It is an opt-in diagnostic and is not run by CI because it requires a real database.

## Deployment

The project is configured for [Vercel](https://vercel.com/) and uses MongoDB for persistent data. Before deploying, add the required environment variables in the Vercel project settings. Set `APP_URL` to the public production URL so email links point to the correct site.

## Contributing

Bug reports, ideas, and improvements are welcome. Please [open an issue](https://github.com/Programador-jr/daily-newsletter/issues) to discuss larger changes before submitting a pull request. Run `npm test` and `npm run lint` before submitting changes.

## License

This project is licensed under the [MIT License](./LICENSE).

---

<div align="center">

Made with coffee and JavaScript by **Daniel Melo**.

</div>
