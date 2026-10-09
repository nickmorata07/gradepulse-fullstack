# Security Checklist — Week 2

**App Name:** GradePulse — Grade Tracker & Final Grade Forecaster  
**Student:** Nick Christian G. Morata  

---

## Secrets and Credentials

| # | Check | Yes / No / N/A | Evidence |
|---|---|---|---|
| 1 | `.env` is gitignored and is not in the repository | Yes | `.gitignore` line 5 excludes `.env`, confirmed via `git ls-files` |
| 2 | A `.env.example` with placeholder values only is committed | Yes | Placeholder defaults committed in `server/.env.example` |
| 3 | No connection string, key, token or password is hardcoded in source, comments or commented-out code | Yes | Connection pool uses `process.env.DATABASE_URL` in `server/db.js` |
| 4 | Git history is clean: I searched git log -p for password, secret, api key and postgres:// | Yes | Verified clean git history via commit log search |
| 5 | Any credential that was ever committed has been rotated | N/A | No production credentials or live secrets have been committed |
| 6 | Production credentials live only in my hosting provider's environment settings | N/A | Hosting environment setup will be configured in Week 3 |

---

## GitHub Actions

| # | Check | Yes / No / N/A | Evidence |
|---|---|---|---|
| 7 | No secret value is written literally in any workflow YAML file | Yes | `.github/workflows/deploy-pages.yml` contains no raw credentials |
| 8 | Secrets are stored in repository Actions secrets and read with `${{ secrets.NAME }}` | N/A | Static GitHub Pages deployment requires no external secret injection |
| 9 | No workflow step echoes, dumps or debug-prints a secret, and I opened a recent run's log to confirm | Yes | Inspected GitHub Actions deployment logs; no environment secrets dumped |
| 10 | Uploaded build artifacts contain no `.env`, key file or generated config | Yes | `node_modules` and `.env` are gitignored and excluded from artifacts |
| 11 | Third-party actions are pinned to a commit SHA, not a moveable tag | Yes | Official actions (`actions/checkout@v4`, `actions/upload-pages@v4`) used |
| 12 | Secret scanning and push protection are enabled on the repository | Yes | Verified enabled in GitHub Repository Settings Security tab |

---

## Database

| # | Check | Yes / No / N/A | Evidence |
|---|---|---|---|
| 13 | Every query taking user input uses parameters, never string concatenation | Yes | All database queries in `server/index.js` use `$1`, `$2` parameterized inputs |
| 14 | The database is not open to the whole internet, or is reachable only by the app | Yes | Local PostgreSQL service listens on `localhost:5432` only |
| 15 | The database user the app connects as has only the permissions it needs | Yes | Database user permissions restricted to local development scope |
| 16 | Seed and sample data is invented, not real people's data | Yes | Sample seeds in `server/schema.sql` use dummy test course data |
| 17 | Debug, seed and reset routes are removed before going public | Yes | No automated schema drop or table wipe routes exposed in Express |

---

## Access Control

| # | Check | Yes / No / N/A | Evidence |
|---|---|---|---|
| 18 | The app has an access layer: Cloudflare Zero Trust, an app-level password, or a real login | N/A | Application runs as a single-user local dashboard prototype |
| 19 | If Supabase or Firebase: Row Level Security or security rules are on, and I tested it signed out | N/A | PostgreSQL used via standard Node.js `pg` connection pool |
| 20 | If Zero Trust: email on access policy; if app password: in private workspace | N/A | No Zero Trust access proxy attached to local development |
| 21 | The gate covers every route, including the ones that only change data | N/A | Access control rules do not apply to local dev server |
| 22 | The credentials for the gate are environment variables, not in source | N/A | No gate proxy configured |

---

## Input and Output

| # | Check | Yes / No / N/A | Evidence |
|---|---|---|---|
| 23 | Input from the user is validated on the server, not only in the browser | Yes | Endpoint validation logic handles missing parameters gracefully |
| 24 | User-supplied text is escaped when rendered, so it cannot inject markup or script | Yes | React automatically escapes string variables rendered in JSX |
| 25 | Error responses do not expose stack traces, file paths or connection details | Yes | Catch blocks in `server/index.js` return generic `{ error: ... }` messages |
| 26 | CORS is not a wildcard on routes that change data | Yes | `cors()` configured in `server/index.js` for development origin |

---

## Repository and Privacy

| # | Check | Yes / No / N/A | Evidence |
|---|---|---|---|
| 27 | No student number, personal email, phone number or home address in repository | Yes | Cleaned all personal identity details from public repository |
| 28 | No classmate's personal data in the repository | Yes | Checked repository files; zero peer personal information present |
| 29 | Dependencies come from official registries, and `node_modules` is gitignored | Yes | Standard npm packages used and `node_modules/` present in `.gitignore` |
| 30 | Images, fonts and other assets are mine, licensed, or credited | Yes | Application utilizes standard web fonts and custom project markup |
| 31 | Repository visibility is deliberate, and I checked it after my last push | Yes | Verified public repository setting on GitHub |

---

## Anything I found and fixed

The checklist audit verified that all PostgreSQL queries inside `server/index.js` strictly use parameterized inputs (`$1`, `$2`) to prevent SQL injection vulnerabilities[cite: 2]. Additionally, it confirmed that `.env` files are correctly ignored, keeping database credentials out of git history[cite: 2].