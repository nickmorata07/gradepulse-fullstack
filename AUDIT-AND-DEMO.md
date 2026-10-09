# GradePulse code audit and demo guide

## What was wrong in the original archive

1. `client/src/App.jsx` hard-coded `http://localhost:5000/api/courses` instead of using the API adapter and its environment configuration.
2. `client/src/api/index.js` imported the mock and HTTP adapters but always selected `httpApi`, so the advertised browser demo mode did not actually use the mock adapter.
3. `client/src/api/httpApi.js`, `client/src/api/mockApi.js`, `client/src/api/seed.json`, and `client/src/components/DemoNotice.jsx` were still the sightings-reporting template, not GradePulse.
4. `server/server.js` was a partial GradePulse API, but there were duplicate legacy server entry points (`server/index.js`, `server/db.js`, `server/sightingsRepo.js`) using a different module style or older template architecture.
5. The original `client/src/styles.css` was starter styling and included a global `z-index: 9999` / `pointer-events` override on every form control, which can create layering bugs.
6. The frontend, environment examples, deployment documentation, and database setup did not agree on the API port and data model.
7. Course data could be created, but there were no complete client/server flows for categories, assessment scores, deleting courses, or grade forecasting.

## Updated implementation

- `client/src/App.jsx`: dashboard, course management, grade categories, assessment entry, and forecast screen.
- `client/src/styles.css`: responsive visual system, cards, progress bars, modal forms, empty/loading/error states, mobile layout, and keyboard focus styles.
- `client/src/api/index.js`: chooses the mock API by default and the real API only when `VITE_USE_MOCK_API=false`.
- `client/src/api/mockApi.js`: browser-local demo implementation.
- `client/src/api/httpApi.js`: requests to the GradePulse Express API.
- `client/src/api/seed.json`: sample GradePulse course data.
- `server/server.js`: course, category, and assessment endpoints with input validation.
- `server/db/schema.sql` and `server/db/seed.sql`: aligned PostgreSQL schema and demo seed data.
- `server/db/pool.js`: database connection configuration.
- `client/src/components/DemoNotice.jsx`: honest notice when using browser-only sample data.

## Start the easiest presentation mode

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Keep `VITE_USE_MOCK_API=true` in `client/.env` to present the app without needing a database. The app stores data in the current browser's local storage.

## Start the full stack

1. Start PostgreSQL and create the `gradepulse_db` database.
2. In `server/`, run `npm install`, copy `.env.example` to `.env`, and set `DATABASE_URL` to your PostgreSQL connection string.
3. Run `npm run db:reset` and then `npm run dev` from `server/`.
4. In `client/.env`, set `VITE_USE_MOCK_API=false` and `VITE_API_BASE_URL=http://localhost:5000`.
5. Restart the Vite dev server after changing environment variables.

## Suggested video flow

1. Introduce GradePulse and show the overview dashboard.
2. Open a course and explain the target grade, categories, and recorded scores.
3. Add a course, then add a grade category and an assessment score.
4. Open Grade Forecaster and explain the required-average estimate.
5. Explain that the forecast treats categories with scores as completed and categories without scores as remaining. It is a planning estimate, not an official HAU grade computation.

## Verification note

The API JavaScript files passed `node --check`. A full Vite production build could not be confirmed in this environment because the package installation did not complete and Vite was not available locally. Run `npm install && npm run build` inside `client/` on your computer before recording or deploying. The PostgreSQL endpoints also need a real database to be integration-tested.
