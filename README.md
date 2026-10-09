# GradePulse — Student Grade Tracker & Final Grade Forecaster

GradePulse helps students organize their courses, record assessment scores, monitor category averages, and estimate what average they need on remaining categories to reach a target grade.

## Features

- Course dashboard with target grades and grade summaries
- Create and delete courses
- Add weighted grade categories and record assessment scores
- Automatic category averages and current course estimates
- Grade forecaster for remaining category weights
- Responsive desktop and mobile interface
- Browser demo mode for presentations without a running database
- Express API and PostgreSQL persistence when configured

## Tech stack

React 18, Vite, plain CSS, Node.js, Express, and PostgreSQL.

## Run the interactive demo

Requirements: Node.js 20 or newer.

```bash
cd client
npm install
cp .env.example .env
# Keep VITE_USE_MOCK_API=true for the browser demo
npm run dev
```

Open the URL Vite prints, usually `http://localhost:5173`. Demo data is stored in this browser's local storage; it is not shared with other visitors and is not a substitute for a deployed API/database.

## Run the full stack locally

1. Start PostgreSQL and create a database named `gradepulse_db`.
2. Configure the API:

```bash
cd server
npm install
cp .env.example .env
# Edit DATABASE_URL if your local PostgreSQL username/password differs
npm run db:reset
npm run dev
```

3. In another terminal, configure and run the client:

```bash
cd client
npm install
cp .env.example .env
# Set VITE_USE_MOCK_API=false and VITE_API_BASE_URL=http://localhost:5000
npm run dev
```

API checks:

- `http://localhost:5000/healthz` — server is running
- `http://localhost:5000/readyz` — database connection is healthy
- `http://localhost:5000/api/courses` — course data

## Environment variables

| Variable | Location | Purpose |
|---|---|---|
| `DATABASE_URL` | `server/.env` | PostgreSQL connection string; keep private |
| `CORS_ORIGINS` | `server/.env` | Comma-separated allowed frontend origins |
| `PORT` | server host | API port; defaults to `5000` |
| `VITE_USE_MOCK_API` | `client/.env` / build variables | `true` uses local demo data; `false` uses the API |
| `VITE_API_BASE_URL` | client build variables | Public API base URL, e.g. `https://your-api.example.com` |

Never put database credentials or private secrets in any `VITE_` variable.

## Grade calculation note

For planning purposes, GradePulse calculates each category's average from total points earned divided by total possible points. The forecaster treats any category with at least one recorded assessment as completed at that category's current average, then estimates the average needed across category weights without scores. Actual grading policies vary by instructor and institution; this forecast is an estimate, not an official grade.

## Deployment

The React client can be hosted on GitHub Pages, while the Express API and PostgreSQL database must be hosted separately. Set `VITE_USE_MOCK_API=false` and `VITE_API_BASE_URL` in the GitHub Actions variables only after the API is deployed and accessible. Set `CORS_ORIGINS` on the server to the exact frontend origin. GitHub Pages cannot host a Node.js server or PostgreSQL database.

## AI use

If AI assistance was used to write or revise code, document the tools used and the scope of assistance in `AI-USAGE.md` in accordance with your course's disclosure policy.
