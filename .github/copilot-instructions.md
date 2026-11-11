# Copilot review instructions

See `AGENTS.md` for the project overview, commands, structure and conventions. Review pull requests against it, and check the following.

## What to check

- Type safety: no new `any`, unnecessary `as` assertions, or `skipLibCheck`.
- Error handling: no swallowed errors (empty `catch`) or unhandled Promises around scraping, network and file I/O. Error messages are English.
- Secrets: no credentials, cookies, proxy settings or webhook URLs in code, logs or commits (`.env`, `data/twitter-cookies.json`).
- File names: changes to file-name generation or path joining must keep `sanitizeFileName()` intact (no `..` or path separators).
- HTML output: tweet text, URLs, titles and descriptions must be escaped with `escapeHtml()`.
- Docs: environment variable, command, query format, workflow or layout changes must update the matching `README.md` and `README.ja.md` sections; command, workflow and layout changes must also update `AGENTS.md`.

## Do not flag (intentional)

- Missing tests: no test framework is used; quality relies on types, lint and CI.
- `yarn build` not compiling: it runs `src/main.ts` with ts-node to generate the RSS; compiling is `yarn compile`.
- The 90-day cookie cache (`COOKIE_EXPIRY_DAYS`), and the JA3 / User-Agent coming from different Chrome versions.
- CI targeting both `main` and `master`.
- The contents of `data/searches.json` and Renovate dependency PRs.

## Language

Write review comments in English. Deliverables (code comments, docs, commit messages, PR text) are English; runtime messages are English; `README.ja.md` is the only Japanese translation kept (`data/searches.json` is Japanese operational data).
