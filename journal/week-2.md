# Reflection Journal — Week 2

Week of: September 27, 2026

## My goal this week

Transition GradePulse from a static UI prototype into a full-stack application by designing the database schema, creating Express API endpoints, configuring database connection pooling, running a security audit, and submitting Week 2 project reporting deliverables (M8A4, M8A5, M8A6).

## What I did

- Created `server/schema.sql` defining relational PostgreSQL tables for `courses`, `category_weights`, and `assessment_scores` with primary/foreign key relationships and seed test data.
- Configured PostgreSQL connection pooling in `server/db.js` using `pg.Pool` and `.env` environment variables.
- Implemented REST API endpoints in `server/index.js` (`GET /api/health`, `GET /api/courses`, `POST /api/courses`, and `GET /api/courses/:id`) utilizing parameterized SQL queries (`$1`, `$2`) to prevent SQL injection.
- Updated `server/.env.example` to provide template defaults for local database connections (`gradepulse_db`).
- Audited the repository for security vulnerabilities and completed `project/SECURITY-CHECKLIST.md` covering secrets management, SQL safety, and workflow integrity.
- Logged all generative AI interactions, prompts, and code adaptations in `AI-USAGE.md`.

## What blocked me

- **File Extension Syntax Errors:** Encountered red syntax errors in VS Code when creating `schema.sql` because the file was initially saved as `schema.js`. Resolved it by renaming the file extension to `.sql` so VS Code parses SQL syntax correctly.
- **Top-Level `npm install` Failure:** Ran into `ENOENT` errors when executing `npm install` at the workspace root due to separate `client` and `server` folder structures. Solved it by targeting commands inside `server/` or adding all workspace modifications at once using `git add .`.

## What I learned

- Understood how parameterized SQL queries protect backend applications by keeping SQL syntax separate from user-supplied data inputs.
- Learned how to manage PostgreSQL connection pools efficiently in Express using the `pg` library and environment variable fallbacks.
- Understood the importance of conducting systematic security audits using checklists before committing code to public repositories.