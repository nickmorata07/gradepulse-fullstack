# GradePulse Security Checklist — Final Project

before you make your project repository public.

your own words: what you checked, where, and what you found. "N/A" is a correct
answer when it is true, but it needs its reason. A blank row scores nothing, and
a Yes your repository contradicts scores nothing either.


## Secrets and credentials

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 1 | `.env` is gitignored and is not in the repository | Yes | The current public clone tracks only environment examples; .gitignore excludes .env and .env.* except .env.example. |
| 2 | A `.env.example` with placeholder values only is committed | Yes | client/.env.example and server/.env.example in this documentation update contain placeholders only, including the required Auth settings. |
| 3 | No connection string, key, token or password is hardcoded in source, comments or commented-out code | Yes | Reviewed server/server.js, server/db/pool.js, browser configuration and workflow: live settings are environment values; committed database strings are development examples/placeholders. |
| 4 | Git history is clean: I searched `git log -p` for password, secret, api key and `postgres://` | Yes | Searched the complete cloned git log -p history for password/secret/key/database URL patterns; matched database strings were localhost or placeholder examples, with no sb_secret key found. This is a review, not a guarantee against every secret format. |
| 5 | Any credential that was ever committed has been rotated | N/A | The history review did not find a committed production credential. A password appeared in setup screenshots; rotate that exposed credential separately. |
| 6 | Production credentials live only in my hosting provider's environment settings | No | Render supplies the hosted server variables, but the same production database credentials also exist in local server/.env for development; the literal hosting-only requirement is not met. |

## GitHub Actions


| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 7 | No secret value is written literally in any workflow YAML file | Yes | deploy-pages.yml references vars.VITE_* and contains no literal database password or private Auth key. |
| 8 | Secrets are stored in repository Actions secrets and read with `${{ secrets.NAME }}` | N/A | This Pages workflow needs only public browser configuration from Actions variables; private database credentials belong in Render and are not needed by Actions. |
| 9 | No workflow step echoes, dumps or debug-prints a secret, and I opened a recent run's log to confirm | No | Workflow review found no secret-dump commands, but only the successful Actions summary was supplied; the full recent build/deploy logs still need inspection. |
| 10 | Uploaded build artifacts contain no `.env`, key file or generated config | No | The workflow uploads client/dist only, but the deployed artifact contents have not been inspected directly. Confirm no .env or private key is packaged; public VITE configuration in JavaScript is expected. |
| 11 | Third-party actions are pinned to a commit SHA, not a moveable tag | No | Actions use moveable tags such as actions/checkout@v4 and actions/setup-node@v4, not full commit SHAs. |
| 12 | Secret scanning and push protection are enabled on the repository | No | Secret scanning and push protection settings have not been verified in this repository. Check GitHub Settings > security settings before changing this answer. |

## Database

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 13 | Every query taking user input uses parameters, never string concatenation | Yes | server/app.js uses $1/$2/etc. query parameters for course IDs, account IDs, names, scores and targets; dynamic user input is not interpolated into SQL. |
| 14 | The database is not open to the whole internet, or is reachable only by the app | No | Supabase is network-reachable; a database network restriction limiting access to the application has not been confirmed. Password authentication and RLS do not prove this network requirement. |
| 15 | The database user the app connects as has only the permissions it needs | No | The supplied setup uses a postgres database account; a separate application role with only required privileges has not been configured or demonstrated. |
| 16 | Seed and sample data is invented, not real people's data | Yes | server/db/seed.sql and the mock seed contain invented courses and assessment values, not student identity records. |
| 17 | Debug, seed and reset routes are removed before going public | Yes | server/app.js has no public reset/seed/debug routes. Database scripts run separately; healthz and readyz return limited operational status. |

## Access control

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 18 | The app has an access layer: Cloudflare Zero Trust, an app-level password, or a real login | Yes | AuthGate uses Supabase email/password login, and server/server.js verifies bearer tokens with auth.getUser. |
| 19 | If Supabase or Firebase: Row Level Security or security rules are on, and I tested it signed out | No | auth-mobile.sql enables owner RLS policies on the three grade tables, but a signed-out test against the deployed Supabase project has not been recorded. Automated local policy tests alone do not prove live configuration. |
| 20 | If Zero Trust: tjakoen.s@gmail.com is on the access policy. If an app password: the credentials are in my private workspace `project/README.md` | N/A | The app uses individual Supabase accounts, not Cloudflare Zero Trust or a shared app password; neither listed policy applies. |
| 21 | The gate covers every route, including the ones that only change data | Yes | The /api middleware precedes all data routes, including writes/deletes, and queries check ownership. Public health/readiness routes contain no personal grade data. |
| 22 | The credentials for the gate are environment variables, not in source | Yes | Auth service configuration is read from environment variables; account passwords are supplied at login and managed by Supabase, not embedded in source. |

## Input and output

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 23 | Input from the user is validated on the server, not only in the browser | Yes | server/app.js validates record IDs, nonempty bounded text, numeric ranges, scores versus maximum points, boolean completion and total category weights. |
| 24 | User-supplied text is escaped when rendered, so it cannot inject markup or script | Yes | User course/category/assessment text is rendered through React JSX; no dangerouslySetInnerHTML usage was found in client/src. CSV formatting also handles formula prefixes. |
| 25 | Error responses do not expose stack traces, file paths or connection details | Yes | The API error handler returns generic JSON messages rather than stack traces, connection strings or file paths; diagnostic messages remain in server logs. |
| 26 | CORS is not a wildcard on routes that change data | Yes | CORS checks CORS_ORIGINS plus explicit localhost development origins; no wildcard origin is configured. Bearer verification still protects requests without an Origin header. |

## Repository and privacy

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 27 | No student number, personal email, phone number or home address in the repository or in commit messages | No | The current public documentation contains personal author identity and contact text in older files, including AI-USAGE.md and docs/README.md. Remove unnecessary personal details and inspect commit messages before changing this answer. |
| 28 | No classmate's personal data in the repository | Yes | The reviewed grade seed and source files contain sample academic records; no classmate personal data was found in this review. |
| 29 | Dependencies come from official registries, and `node_modules` is gitignored | Yes | Package manifests/lockfiles use npm dependencies and .gitignore excludes node_modules/. Verify any future dependencies before adding them. |
| 30 | Images, fonts and other assets are mine, licensed, or credited | No | README credits Google Fonts DM Sans/Manrope and the submitted screenshot, but a complete asset/license inventory has not been recorded; retain required licenses and verify remaining assets. |
| 31 | Repository visibility is deliberate, and I checked it after my last push | Yes | The updated repository was cloned through its public GitHub URL after commit 0d0d402, and the supplied Actions screenshot shows the matching successful deployment. Recheck visibility after the documentation push. |

## Anything I found and fixed

finding.

Reviewed against public commit `0d0d402` on October 11, 2026, plus this documentation update. No means the stated requirement is unmet or has not yet been verified; it does not imply all other controls failed. Revisit those answers after performing the checks.

The review caught outdated file references, local-only authentication claims, and an incorrect assertion that tagged Actions were SHA-pinned. This update replaces those claims with evidence for the current API and explicitly records provider settings and live tests that still need checking. A database password exposed in setup screenshots must be rotated; rotation has not yet been confirmed.
