# Reflection Journal — Week 1

Week of: September 24, 2026

## My goal this week

Set up the core GitHub repository infrastructure for GradePulse, customize project branding, verify the Vite local development build, fix GitHub Pages deployment workflow issues, and submit initial week 1 reporting deliverables (M8A1, M8A2, M8A3).

## What I did

- Cloned and configured the public repository `fullstack-final-project` from the class template.
- Updated open-source licensing details in `LICENSE` and replaced app title/meta descriptions in `client/index.html` with GradePulse branding.
- Rewrote the root `README.md` to outline GradePulse features, prerequisites, setup instructions, and local dev execution steps.
- Configured GitHub Pages settings to deploy via GitHub Actions to fix a 404 deployment error.
- Initialized `AI-USAGE.md` following the required finals badge schema to log tool prompts, commits, and human vs. AI contributions.
- Created `project/README.md` to host the Week 1 Increment Report detailing completed tasks and upcoming milestones.

## What blocked me

- Ran into a terminal path navigation error (`cd client`) when executing commands from inside the `server/` directory in PowerShell. Resolved it by stepping back to the root folder using `cd ..\client`.
- Encountered a 404 "Site not found" error on GitHub Pages after configuring the repo. Fixed it by navigating to Repository Settings > Pages and changing the deployment source from "Deploy from a branch" to "GitHub Actions".

## What I learned

- Understood how monorepo directory structures require active tracking of shell working directory contexts when switching between client and server dependencies.
- Learned how GitHub Pages uses automated YAML workflows in `.github/workflows/deploy-pages.yml` to trigger static client builds directly from GitHub Actions upon pushing to `main`.