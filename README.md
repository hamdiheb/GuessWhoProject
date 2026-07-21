# Guess Who

A multiplayer party game where players answer questions about themselves, and everyone else tries to guess who wrote each answer. Host a game, share a join code or QR code, and play in real time with friends.

## How it works

1. A host creates a game and gets a shareable game code / QR code.
2. Players join using the code from their own device.
3. The host adds questions manually or generates them with AI.
4. Each round, players answer a question anonymously.
5. Everyone guesses who wrote which answer, and scores are tracked based on how well players know each other.

## Tech stack

- **Frontend:** React 19, Vite, React Router, Tailwind CSS, `qrcode.react`
- **Backend:** Node.js, Express
- **Database/Auth:** Supabase
- **AI question generation:** OpenRouter (via the OpenAI SDK)

## Project structure

```
GuessWho/
├── backend/     # Express API (routes, controllers, services, Supabase repository)
└── frontend/    # React + Vite client
```

## Getting started

### Prerequisites

- Node.js
- A [Supabase](https://supabase.com) project (URL + API key)
- An [OpenRouter](https://openrouter.ai) API key (optional, only needed for AI-generated questions)

### Backend setup

```bash
cd GuessWho/backend
npm install
cp .env.example .env   # fill in SUPABASE_URL, SUPABASE_KEY, and OPENROUTER_API_KEY
npm start
```

The API runs on `http://localhost:3000` by default.

### Frontend setup

```bash
cd GuessWho/frontend
npm install
cp .env.example .env   # set VITE_API_URL to the backend URL
npm run dev
```

## Deployment

The frontend is configured to deploy on Netlify (see `netlify.toml`), building from `GuessWho/frontend`.
