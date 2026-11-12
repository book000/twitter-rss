# AGENTS.md

Guidance for AI coding agents and contributors. `CLAUDE.md` imports this file, and `.github/copilot-instructions.md` adds the review checklist.

## Language

- All deliverables are written in **English**: commit messages, PR/Issue titles and bodies, review comments, code comments and docstrings, and documentation (`README.md`, `AGENTS.md`, etc.). `README.ja.md` is an intentionally kept Japanese translation of `README.md`; update it together with `README.md`.
- Exceptions (keep as is): the search queries in `data/searches.json` (operational data), quotations, technical identifiers, generated files, and external source text.
- Runtime messages (logs, errors) are English.
- Do not rewrite Git history to change the language of past commits.

## Overview

Generates RSS 2.0 feeds from Twitter (X.com) search results. For every entry of `data/searches.json` (key = output file name, value = Twitter advanced search query) it writes `output/<name>.xml` plus an `output/index.html` list, and GitHub Actions publishes `output/` to GitHub Pages every hour.

- Login and search use `@the-convocation/twitter-scraper` and `twitter-openapi-typescript`; `cycletls` spoofs the TLS fingerprint. Authentication cookies are cached in `data/twitter-cookies.json`.
- SSO is not supported: only username and password (plus optional TOTP) authentication.

## Commands

```bash
yarn install        # install dependencies
yarn dev            # run src/main.ts with ts-node-dev (hot reload)
yarn build          # run src/main.ts with ts-node, i.e. generate the RSS; it does NOT compile
yarn compile        # tsc: compile to dist/
yarn compile:test   # tsc --noEmit
yarn start          # run the compiled dist/main.js
yarn lint           # prettier --check src + eslint + tsc, in parallel
yarn fix            # prettier --write src + eslint --fix
```

There is no test framework. Run `yarn lint` and `yarn compile` before committing. Running the tool needs Twitter credentials in environment variables or `.env`; see the README for the full list. Node.js is pinned in `.node-version` and Yarn in `package.json` (`packageManager`).

## Structure

- `src/main.ts`: the whole application (login with cookie cache, search, RSS generation, `output/` index).
  - `sanitizeFileName()` turns a `data/searches.json` key into a safe file name (path traversal defense). Do not weaken it.
  - Cookie cache expiry is `COOKIE_EXPIRY_DAYS` (90). CI refreshes `savedAt` on every run, so the effective expiry is 90 days after the last successful run. Cached cookies are probed once per run with a search request: an HTTP 401 discards the cache and triggers a fresh login, while any other probe error fails the run.
  - The JA3 fingerprint and the User-Agent are hard-coded in `cycleTLSFetchWithProxy` and intentionally come from different Chrome versions.
- `src/model/collect-result.ts`: RSS `Item` interface.
- `data/searches.json`: search queries (tracked in Git); other files under `data/` are git-ignored.
- `template.html`: template of `output/index.html`.
- `Dockerfile`, `docker-compose.yml`, `entrypoint.sh`: container run on `zenika/alpine-chrome:with-puppeteer-xvfb` with Xvfb and x11vnc (VNC port 5910).
- `.github/workflows/nodejs-ci.yml`: reusable Node.js CI from `book000/templates` (build and lint).
- `.github/workflows/update-rss.yml`: hourly RSS generation on a self-hosted runner, then GitHub Pages deployment; failures notify a Discord webhook. Corepack is installed explicitly (`corepack@0.36.0`) because Node.js 25+ does not bundle it.
- `.github/workflows/setup-check.yml`: on pull requests, checks the Node.js / Corepack / Yarn setup. Keep its setup steps in sync with `update-rss.yml` (including the Corepack version).

## Conventions

- TypeScript in strict mode (`noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`). Do not enable `skipLibCheck` to silence type errors, and avoid `any`.
- Prettier: no semicolons, single quotes. ESLint: `@book000/eslint-config`.
- Write JSDoc for functions and interfaces whose behavior is not obvious; comments explain constraints and intent, not what the code does.
- Error messages are English. Never hard-code credentials or paths; use environment variables or config files.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/) and branches follow [Conventional Branch](https://conventional-branch.github.io) short form (`feat/...`, `fix/...`).
- Do not commit to Renovate PRs.

## Environment variables and docs

When adding or changing an environment variable or the search query format, update the code and the matching `README.md` / `README.ja.md` sections. When a command changes, also update the Commands section of this file. When workflow behavior or the file layout changes, update the "GitHub Actions" and "Architecture" sections of the READMEs and the Overview / Structure sections of this file.

## Security

- Never commit `.env`, `data/twitter-cookies.json`, or any Twitter password, cookie, proxy credential or webhook URL. Do not log credentials or personal data.
- HTML-escape tweet text, media URLs, titles and descriptions before embedding them in HTML (`escapeHtml()`).
