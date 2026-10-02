# King's Newsletter

Daily news platform focused on relevant events in Brazil and around the world, organized into editions with summaries, context, history and email notifications.

[Production](https://dailynewsletter.vercel.app)

## Overview

King's Newsletter collects and presents relevant news across politics, economics, investments, technology, Brazil and international affairs.

The project combines a responsive web interface with a Node.js API, MongoDB persistence and an email subscription system.

## Features

- Daily news editions
- Featured news
- Edition history
- Search and filtering
- Responsive interface
- Light and dark themes
- Email subscriptions with double opt-in
- Confirmation and unsubscribe flows
- Automatic notifications for new stories
- Delivery tracking to prevent duplicate notifications

## Tech Stack

- HTML5
- CSS3
- JavaScript
- Node.js
- Express
- MongoDB
- Mongoose
- Nodemailer
- Vercel

## Project Structure

```text
public/
├── index.html
├── editions.html
├── about.html
├── css/
└── js/

api/
├── news.js
├── subscribe.js
├── confirm.js
├── unsubscribe.js
└── notify-news.js

lib/
├── news.js
├── subscriber.js
├── news-delivery.js
└── email.js

data/
└── news.schema.json
```

## Getting Started

### Requirements

- Node.js
- MongoDB
- Gmail account with an App Password for email delivery

### Installation

```bash
git clone https://github.com/Programador-jr/daily-newsletter.git
cd daily-newsletter
npm install
```

### Configuration

Create a `.env` file based on `.env.example`:

```env
MONGODB_URI=
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=
APP_URL=
NOTIFY_SECRET=
```

Do not commit credentials or other secrets to the repository.

### Development

Start the application with:

```bash
npm start
```

For development with automatic restart:

```bash
npm run dev
```

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/news` | Returns the latest edition |
| GET | `/api/news?date=dd/mm/yyyy` | Returns a specific edition |
| GET | `/api/news?history=true` | Returns the edition history |
| POST | `/api/news` | Creates or updates news |
| POST | `/api/subscribe` | Creates an email subscription |
| GET | `/api/confirm` | Confirms an email subscription |
| GET | `/api/unsubscribe` | Cancels an email subscription |
| GET | `/api/notify-news` | Checks for pending notifications |
| POST | `/api/notify-news` | Sends pending notifications |

Protected endpoints require the appropriate environment configuration.

## Data

MongoDB is the primary data store for news, subscribers and delivery records.

Edition dates use the `dd/mm/yyyy` format.

News documents include:

- Edition date
- Category
- Title
- Summary
- Context
- Source
- Publication date
- URL
- Highlight status

Subscriber data is stored privately in MongoDB and is not committed to the repository.

## Email Delivery

Subscriptions use a double opt-in flow. A subscriber must confirm their email before receiving news updates.

Email delivery uses Gmail SMTP through Nodemailer. A Gmail App Password is required for local development and production email delivery.

## Deployment

The project is deployed on Vercel. Production deployments are connected to the `main` branch.

Environment variables must be configured in the deployment environment before using database or email features.

## Contributing

Contributions, bug reports and suggestions are welcome.

For larger changes, open an issue first to discuss the proposed implementation.

## License

This project is licensed under the ISC License.

---

Feito com café e JavaScript por Daniel Melo.
