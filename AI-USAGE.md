# AI Usage — GradePulse

This is a retrospective disclosure prepared on October 11, 2026 from the development conversation and public repository history. It was not maintained consistently across all three weeks. I used AI heavily, and I cannot claim that 20% of the application code was independently written by me.

Earlier versions contained claims that I personally wrote or customized code and links to `commit/main` in a different repository. Those claims and links should not be treated as verified authorship evidence. This update replaces them with specific evidence and an honest account.

## 1. How I used AI

The entries below describe distinct uses, not separate commits for every interaction. Several changes were copied and committed together. A shared commit proves that the files landed, not that every request had its own development commit. Dates below are the documented October 11 integration/disclosure date; earlier unverified dates are not reconstructed.

### 1. Grade forecasting

- **Date:** October 11, 2026.
- **Tool:** OpenAI ChatGPT / Codex.
- **Request:** I asked for working forecasting features to integrate into my existing Supabase-connected system.
- **Output:** Forecast calculations, score management, targets, what-if scenarios, CSV export, and database completion flags.
- **What I kept or changed, and why:** I copied the integrated update into my existing project and retained the existing system connection rather than replacing the entire project. The implementation was AI-written.
- **Commit:** https://github.com/nickmorata07/gradepulse-fullstack/commit/0d0d40235c41ffb6281fcb724f045a0b04a28dc3

### 2. Real account login

- **Date:** October 11, 2026.
- **Tool:** OpenAI ChatGPT / Codex.
- **Request:** I asked for a login system similar to the account-based system I had seen.
- **Output:** Supabase signup, email confirmation, login, recovery, session handling and logout.
- **What I kept or changed, and why:** I kept the supplied AuthGate and configuration, added my actual public settings locally, and tried registration and email confirmation. Configuration and testing do not make the generated Auth code my own.
- **Commit:** https://github.com/nickmorata07/gradepulse-fullstack/commit/0d0d40235c41ffb6281fcb724f045a0b04a28dc3

### 3. Lavender dashboard and mobile layout

- **Date:** October 11, 2026.
- **Tool:** OpenAI ChatGPT / Codex.
- **Request:** I asked for a lavender-white dashboard and phone accessibility.
- **Output:** Updated CSS, responsive forms and dashboard layout, and mobile navigation.
- **What I kept or changed, and why:** I kept the generated styling and opened the published login screen on my phone. I selected the desired style; I did not independently write the CSS.
- **Commit:** https://github.com/nickmorata07/gradepulse-fullstack/commit/0d0d40235c41ffb6281fcb724f045a0b04a28dc3

### 4. Authenticated API and private records

- **Date:** October 11, 2026.
- **Tool:** OpenAI ChatGPT / Codex.
- **Request:** I asked for the system to function with Supabase and account-based features.
- **Output:** Bearer-token verification, account ownership checks in Express routes, and an additive ownership/RLS migration.
- **What I kept or changed, and why:** I integrated the generated server files and ran the supplied SQL. The existing-course assignment initially failed because I had left the email placeholder unchanged; that was my setup mistake, not an AI-code defect.
- **Commit:** https://github.com/nickmorata07/gradepulse-fullstack/commit/0d0d40235c41ffb6281fcb724f045a0b04a28dc3

### 5. Deployment configuration

- **Date:** October 11, 2026.
- **Tool:** OpenAI ChatGPT / Codex.
- **Request:** I asked how to put the working system on GitHub and make it publicly accessible.
- **Output:** GitHub Pages workflow configuration, Render deployment settings, environment guidance and authentication redirect setup.
- **What I kept or changed, and why:** I used the workflow and configured GitHub variables/Render settings. Render first failed because I pasted NAME=value into value fields; I removed those prefixes with guidance. The hosted configuration changes are not Git commits; this link records the workflow code only.
- **Commit:** https://github.com/nickmorata07/gradepulse-fullstack/commit/0d0d40235c41ffb6281fcb724f045a0b04a28dc3

### 6. Setup and API documentation

- **Date:** October 11, 2026.
- **Tool:** OpenAI ChatGPT / Codex.
- **Request:** I asked to finish the README for M8A7 after publishing the app.
- **Output:** A README with live links, fresh installation steps, environment tables, API routes, screenshot guidance, and known limitations.
- **What I kept or changed, and why:** I copied the documentation, compiled additional screenshots and pushed updates. The original documentation text was AI-assisted; I should review the explanations in my own words.
- **Commit:** https://github.com/nickmorata07/gradepulse-fullstack/commit/d511974ef094d205a7502a30f5c464d35d8c529d

### 7. Security review

- **Date:** October 11, 2026.
- **Tool:** OpenAI ChatGPT / Codex.
- **Request:** I asked to complete the M8A7 security checklist.
- **Output:** All 31 rows with code evidence and honest No/N/A answers where provider settings or live tests were unverified.
- **What I kept or changed, and why:** I kept the revised review instead of claiming every control passed. I still need to verify outstanding settings and record actual results before changing any No to Yes.
- **Commit:** https://github.com/nickmorata07/gradepulse-fullstack/commit/d511974ef094d205a7502a30f5c464d35d8c529d

## 2. Where the AI got it wrong

These are specific problems in the earlier supplied documentation and instructions that were corrected with AI assistance. I do not claim I independently discovered or coded every correction. Local setup mistakes, such as pasting a variable name into Render's value field, are not counted as AI mistakes.

### Case 1: Outdated environment examples

- **Earlier output:** The older client/.env.example said demo mode was the default and used VITE_USE_MOCK_API=true; the old server example omitted the new Auth settings.
- **Problem:** The current client/src/api/index.js always uses the authenticated API, and server/server.js requires Supabase configuration. Following the examples alone no longer described a working setup.
- **What I did instead:** I adopted the corrected client/server examples and README supplied during the documentation review. The new examples contain the Auth variables and explain the obsolete mock-mode setting.
- **Correction commit:** https://github.com/nickmorata07/gradepulse-fullstack/commit/d511974ef094d205a7502a30f5c464d35d8c529d

### Case 2: Incorrect security claim about action pinning

- **Earlier output:** The previous checklist marked action pinning Yes while citing actions/checkout@v4 and other version tags.
- **Problem:** A version tag is moveable and is not a full immutable commit SHA. Using an official action does not satisfy the wording of that check.
- **What I did instead:** I used the revised checklist that marks this No and describes the actual tags. This is a documentation correction; the workflow has not been converted to SHA pinning.
- **Correction commit:** https://github.com/nickmorata07/gradepulse-fullstack/commit/d511974ef094d205a7502a30f5c464d35d8c529d

### Case 3: Stale local-only access-control and submission documentation

- **Earlier output:** Older project documentation linked a different repository/site, left the hosted API as a placeholder, and described access control/RLS as not applicable to a local prototype.
- **Problem:** The updated app has Supabase accounts, authenticated routes and a Render backend. Those claims no longer match the implementation and would mislead a reviewer.
- **What I did instead:** I replaced the project links and checklist with the actual GradePulse URLs, explained the Auth middleware, and left live RLS testing unverified rather than claiming it passed.
- **Correction commit:** https://github.com/nickmorata07/gradepulse-fullstack/commit/d511974ef094d205a7502a30f5c464d35d8c529d

## 3. Who wrote what

### My independently written application code

I have not independently written meaningful application code for this version. I therefore cannot provide an honest self-authored route, SQL query, or component with commit evidence, and I have not met the required one-fifth self-authored-code rule. I do not count copying generated files, changing environment values, testing, deployment, screenshots, or selecting a design as independently writing the application code.

My actual work included specifying requirements, integrating supplied updates, configuring Supabase/Render/GitHub, running migrations, troubleshooting with assistance, checking the app and preparing screenshots. These are real project activities, but they do not satisfy the code-authorship requirement by themselves.

The original implementation's AI-tool attribution is not independently established by this record. The earlier AI-USAGE.md named Gemini, but its dates, request history, and old commit links have not been verified here. I should confirm that earlier use from my own records rather than invent details.

### AI-written code explanation to study and rewrite in my own words

**Files:** server/server.js and server/app.js. **Commit:** https://github.com/nickmorata07/gradepulse-fullstack/commit/0d0d40235c41ffb6281fcb724f045a0b04a28dc3

The Express application protects the /api route group before its data routes run. It extracts the bearer token from the Authorization header and calls the verifier supplied by server/server.js. That verifier asks Supabase auth.getUser to validate the token; a missing or invalid user produces an unauthorized response. It stores the verified user on the request, rather than accepting a user ID from the submitted JSON.

Course queries then include the authenticated user's ID as a SQL parameter, alongside record IDs where necessary. Category and assessment operations join through the parent course to check ownership. This matters because successful login alone does not authorize someone to read another account's records. Parameters also keep user values separate from SQL syntax. The public health/readiness endpoints report limited availability information and do not expose grades.

This explanation was drafted with AI help. I should explain the control flow myself and demonstrate it before presenting it as my own understanding. Reading an explanation is not evidence that I authored the implementation.

## Submission status

The supported AI-use entries, documented corrections, and README credit are provided. The meaningful self-authored-code requirement is unmet. The course lesson says that no meaningful personal code contribution makes section 3 score zero and puts the 75-point badge out of reach. This disclosure does not claim the badge has been earned or guarantee a grade.
