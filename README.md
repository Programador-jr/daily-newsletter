<div align="center">

# King's Newsletter

### The news that matters, with the context behind it.

Daily coverage of Brazil and the world, presented with concise summaries, curated sources, and a growing guide to Brazilian history.

<br>

[![Visit the website](https://img.shields.io/badge/Visit_the_website-dailynewsletter.vercel.app-0B766B?style=for-the-badge&logo=vercel&logoColor=white)](https://dailynewsletter.vercel.app)

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](./LICENSE)
[![Tests](https://github.com/Programador-jr/daily-newsletter/actions/workflows/tests.yml/badge.svg)](https://github.com/Programador-jr/daily-newsletter/actions/workflows/tests.yml)
[![GitHub stars](https://img.shields.io/github/stars/Programador-jr/daily-newsletter?style=flat-square)](https://github.com/Programador-jr/daily-newsletter/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/Programador-jr/daily-newsletter?style=flat-square)](https://github.com/Programador-jr/daily-newsletter/issues)

</div>

---

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
| Server | Node.js 18+, Express 5 |
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

- [Node.js 18 or newer](https://nodejs.org/)
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
| `EMAIL_USER` | SMTP account used by Nodemailer. |
| `EMAIL_PASS` | SMTP password or provider-specific app password. |
| `EMAIL_FROM` | Optional sender name and address; defaults to `EMAIL_USER`. |
| `APP_URL` | Public base URL used to generate confirmation and unsubscribe links. |
| `NOTIFY_SECRET` | Secret used to authorize protected news publishing and notification requests. |
| `PORT` | Optional local server port; defaults to `3000`. |

Keep `.env` private. Never publish credentials or commit them to the repository. For Gmail, use an app password rather than your account password.

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

This project is licensed under the [ISC License](./LICENSE).

---

<div align="center">

Made with coffee and JavaScript by **Daniel Melo**.

</div>
