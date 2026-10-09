# AI usage

This project was built with AI assistance. This file is the record of it. It is
graded as the finals badge, and it is worth 100 points.

Start it in week 1 and keep it up as you go. The commit history of this file is
part of the evidence: a file written all at once the night before the deadline
looks exactly like what it is.

## 1. How I used AI

### 2026-09-24 - Repository setup and branding configuration

- **Tool:** Gemini
- **What I asked for:** Step-by-step guidance on customizing the template repository, including setting up `LICENSE`, editing `client/index.html` tags, and writing the root `README.md` for GradePulse.
- **What it gave back:** HTML header snippets, updated open-source license text, and structured Markdown for the main project README.
- **What I kept, what I changed, and why:** I kept the overall HTML meta tag layout but replaced the placeholder app titles with "GradePulse | Grade Tracker & Final Grade Forecaster" to reflect the actual HAU grade tracking application scope.
- **Commit:** https://github.com/nickmorata07/fullstack-final-project/commit/main

### 2026-09-24 - PowerShell terminal navigation debugging

- **Tool:** Gemini
- **What I asked for:** Diagnosis of directory errors encountered when attempting to run `cd client` commands while working inside the `server/` directory.
- **What it gave back:** Explanation of current working directory context in monorepo structures and navigation commands using relative paths (`cd ..\client`).
- **What I kept, what I changed, and why:** Kept the exact navigation steps to successfully run the local Vite development build (`npm run dev`) from the correct folder context.
- **Commit:** https://github.com/nickmorata07/fullstack-final-project/commit/main

### 2026-09-24 - Project Increment Report scaffolding

- **Tool:** Gemini
- **What I asked for:** Guidance on structuring the Week 1 increment report (`project/REPORT.md` / `project/README.md`) according to course rubrics.
- **What it gave back:** Markdown structure covering changes made, purpose, blockers encountered, and remaining tasks.
- **What I kept, what I changed, and why:** Kept the report headings and refined the specific accomplishments and blockers to accurately reflect my setup process in VS Code.
- **Commit:** https://github.com/nickmorata07/fullstack-final-project/commit/main

*(Entries 4 to 6 will be added in Weeks 2 and 3 as API routes and forecasting components are developed.)*

## 2. Where the AI got it wrong

### Case 1 - Incorrect directory path assumption

- **What it gave me:** Shell command steps instructing to execute `cd client` immediately after running package installations inside the `server/` folder.
- **What was wrong with it:** Executing `cd client` from inside `server/` resulted in a `PathNotFoundException` in PowerShell because `client` lives in the parent root directory, not inside `server/`.
- **What I did instead:** Executed `cd ..\client` to step back to the root level first before entering the client workspace.
- **Commit:** https://github.com/nickmorata07/fullstack-final-project/commit/main

*(Cases 2 and 3 will be logged during backend development and UI integration.)*

## 3. Who wrote what

### Written by me

- **File:** `client/index.html`
- **Commit:** https://github.com/nickmorata07/fullstack-final-project/commit/main
- **What it does and why it is built this way:** Configures the document head and title tag for the single-page application entry point, ensuring accurate branding and SEO meta descriptions when loaded in the browser.

### The AI-written part I understand best

- **File:** `README.md`
- **Commit:** https://github.com/nickmorata07/fullstack-final-project/commit/main
- **What it does and why we kept it:** Defines the project documentation structure (overview, installation, running instructions, features, and project structure) so external readers can run and evaluate the application from source code alone.

### 2026-09-27 - PostgreSQL schema and Express API endpoint generation

- **Tool:** Gemini
- **What I asked for:** Code templates for `server/schema.sql`, PostgreSQL `pg.Pool` connection pool (`server/db.js`), and Express API routes (`server/index.js`).
- **What it gave back:** SQL schema DDL scripts, pool connection code using `dotenv`, and REST endpoints (`GET /api/courses`, `POST /api/courses`, `GET /api/courses/:id`).
- **What I kept, what I changed, and why:** Kept the parameterized query structure (`$1`, `$2`) for security and added custom table definitions (`courses`, `category_weights`, `assessment_scores`) specific to HAU course grading rules.
- **Commit:** https://github.com/nickmorata07/fullstack-final-project/commit/main