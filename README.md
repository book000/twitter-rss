# twitter-rss

[![Node CI](https://github.com/book000/twitter-rss/actions/workflows/nodejs-ci.yml/badge.svg)](https://github.com/book000/twitter-rss/actions/workflows/nodejs-ci.yml)
[![Update RSS](https://github.com/book000/twitter-rss/actions/workflows/update-rss.yml/badge.svg)](https://github.com/book000/twitter-rss/actions/workflows/update-rss.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**twitter-rss** is a TypeScript tool that generates RSS feeds from Twitter (X.com) search results. It uses the Twitter internal API to fetch recent tweets matching your search queries and converts them into standard RSS 2.0 XML feeds, which can be consumed by any RSS reader.

> [!NOTE]
> A Japanese translation of this document is available at [README.ja.md](README.ja.md).

## Features

- **RSS 2.0 feeds from Twitter searches** — Converts Twitter search results into standard RSS XML files readable by any RSS reader.
- **Advanced Twitter query support** — Supports all Twitter advanced search operators (`from:`, `filter:images`, `exclude:retweets`, etc.).
- **Cookie caching** — Caches authentication cookies for up to 30 days to avoid repeated logins.
- **Login retry with backoff** — Automatically retries logins on transient failures (HTTP 503 with exponential backoff, error 399 with a fixed 120-second delay).
- **Two-factor authentication (TOTP)** — Supports TOTP-based 2FA via a secret key.
- **Proxy and TLS fingerprint spoofing** — Uses [CycleTLS](https://github.com/Danny-Dasilva/CycleTLS) to spoof TLS fingerprints (JA3) and route requests through an HTTP proxy.
- **Ad filtering** — Automatically removes promoted tweets from results.
- **XSS protection** — All user-generated content is HTML-escaped before being embedded in the RSS output.
- **Docker support** — Includes a `Dockerfile` and `docker-compose.yml` for containerized deployment.
- **GitHub Actions + GitHub Pages** — Automated hourly RSS generation and publishing via GitHub Pages.

## Requirements

- **Node.js** 24.x
- **Yarn** 1.22.x
- **Xvfb** (required at runtime; the underlying scraper requires a virtual display)
- A Twitter (X.com) account with username/password credentials

> [!WARNING]
> SSO (Single Sign-On) authentication is **not supported** and will not be supported due to technical constraints. You must use a username and password to authenticate.

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/book000/twitter-rss.git
cd twitter-rss
```

### 2. Install dependencies

```bash
yarn install
```

### 3. Configure environment variables

Create a `.env` file in the project root (this file is `.gitignore`-d):

```dotenv
TWITTER_USERNAME=your_twitter_username
TWITTER_PASSWORD=your_twitter_password

# Optional: required if your account uses email verification on login
TWITTER_EMAIL_ADDRESS=your_email@example.com

# Optional: TOTP secret key for 2FA (base32-encoded)
TWITTER_AUTH_CODE_SECRET=YOUR_TOTP_SECRET

# Optional: proxy settings
PROXY_SERVER=http://proxy.example.com:8080
PROXY_USERNAME=proxyuser
PROXY_PASSWORD=proxypass

# Optional: RSS feed language tag (default: ja)
RSS_LANGUAGE=en

# Optional: path to the search words JSON (default: data/searches.json)
SEARCH_WORD_PATH=data/searches.json
```

### 4. Configure search queries

Edit `data/searches.json`. Each key is the RSS filename (without `.xml`) and each value is a Twitter advanced search query:

```json
{
  "my-feed-name": "from:someuser filter:images exclude:retweets",
  "keyword-search": "some keyword -filter:retweets"
}
```

See [Twitter Advanced Search](https://twitter.com/search-advanced) for supported operators.

### 5. Run

Start Xvfb and then build/run the tool:

```bash
Xvfb :99 -ac -screen 0 600x1000x16 &
export DISPLAY=:99
yarn build
```

RSS XML files are saved to the `output/` directory. An `output/index.html` listing all feeds is also generated.

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `TWITTER_USERNAME` | ✅ | — | Twitter account username |
| `TWITTER_PASSWORD` | ✅ | — | Twitter account password |
| `TWITTER_EMAIL_ADDRESS` | — | — | Email address (required if Twitter prompts for email verification during login) |
| `TWITTER_AUTH_CODE_SECRET` | — | — | TOTP secret key for two-factor authentication |
| `PROXY_SERVER` | — | — | Proxy server URL (`host:port`, `http://host:port`, or `https://host:port`) |
| `PROXY_USERNAME` | — | — | Proxy authentication username |
| `PROXY_PASSWORD` | — | — | Proxy authentication password |
| `RSS_LANGUAGE` | — | `ja` | Language tag embedded in the RSS feed (e.g., `en`, `ja`) |
| `SEARCH_WORD_PATH` | — | `data/searches.json` | Path to the search query configuration file |
| `DISPLAY` | — | `:99` | X display for Xvfb |

## Search Configuration (`data/searches.json`)

The search configuration file is a JSON object where:

- **Key**: The output filename (used as `<filename>.xml`). Special characters, spaces, and path separators are stripped automatically.
- **Value**: The Twitter search query string, including any advanced search operators.

Example:

```json
{
  "my-feed": "from:myaccount filter:images exclude:retweets",
  "breaking-news": "#breakingnews lang:en -filter:retweets"
}
```

Supported Twitter search operators include:

| Operator | Example | Description |
|---|---|---|
| `from:` | `from:username` | Tweets from a specific user |
| `to:` | `to:username` | Tweets directed at a user |
| `filter:images` | `query filter:images` | Tweets containing images |
| `filter:videos` | `query filter:videos` | Tweets containing videos |
| `exclude:retweets` | `query exclude:retweets` | Exclude retweets |
| `lang:` | `query lang:en` | Filter by language |

## Docker

### Using Docker Compose (recommended)

1. Create a `data/` directory and add your `searches.json` (see [Search Configuration](#search-configuration-datasearchesjson)):

   ```bash
   mkdir -p data
   # Create data/searches.json with your queries (see Search Configuration section)
   ```

2. Create a `.env` file with your credentials (see [Environment Variables](#environment-variables)).

3. Start the container:

   ```bash
   docker compose up
   ```

   The container mounts `./data` into `/data` and runs Xvfb + x11vnc internally. A VNC server is exposed on port `5910` for debugging.

### Building the image manually

```bash
docker build -t twitter-rss .
docker run --env-file .env -v "$(pwd)/data:/data" twitter-rss
```

The Docker image is based on [`zenika/alpine-chrome:with-puppeteer-xvfb`](https://github.com/Zenika/alpine-chrome), which bundles Chromium and Xvfb.

## GitHub Actions (Automated RSS Generation)

The repository includes two GitHub Actions workflows:

### `nodejs-ci.yml` — Continuous Integration

Runs on every push to `main`/`master` and on pull requests. Executes build and lint checks using a [reusable workflow template](https://github.com/book000/templates).

### `update-rss.yml` — RSS Update and Deployment

| Trigger | Description |
|---|---|
| `schedule: '0 * * * *'` | Runs every hour at minute 0 |
| `workflow_dispatch` | Manual trigger via GitHub UI |
| `push` to `main`/`master` (`.ts` files) | Triggered when TypeScript source changes |

**Setup steps:**

1. **Configure repository secrets** in GitHub Settings → Secrets and variables → Actions:

   | Secret | Required | Description |
   |---|---|---|
   | `TWITTER_USERNAME` | ✅ | Twitter username |
   | `TWITTER_PASSWORD` | ✅ | Twitter password |
   | `TWITTER_EMAIL_ADDRESS` | — | Email address for login verification |
   | `TWITTER_AUTH_CODE_SECRET` | — | TOTP secret for 2FA |
   | `PROXY_SERVER` | — | Proxy server URL |
   | `PROXY_USERNAME` | — | Proxy username |
   | `PROXY_PASSWORD` | — | Proxy password |
   | `TWITTER_COOKIES_JSON` | — | Pre-existing cookies JSON (bootstraps the cache) |
   | `DISCORD_WEBHOOK` | — | Discord webhook URL for failure notifications |

2. **Enable GitHub Pages** in repository Settings → Pages → Source: GitHub Actions.

3. The workflow runs on a **self-hosted runner**. Ensure your runner has the following packages installed (listed in `.github/apt-packages.txt`): `chromium-browser`, `xvfb`, `xauth`, `fonts-noto-cjk`, `libnss3`, and others.

**Cookie caching:**

The workflow caches `data/twitter-cookies.json` using `actions/cache` with a per-run cache key (`twitter-cookies-v2-{repo}-{run_id}`). On cache miss, it falls back to the `TWITTER_COOKIES_JSON` secret to bootstrap the session. Cookies are valid for **30 days**.

To manually update the `TWITTER_COOKIES_JSON` secret after a fresh login:

```bash
gh secret set TWITTER_COOKIES_JSON --body "$(cat data/twitter-cookies.json)"
```

**Failure notifications:**

On failure, the workflow sends a Discord embed message to the configured webhook URL.

## Architecture

```
twitter-rss/
├── src/
│   ├── main.ts                 # Main application entry point
│   └── model/
│       └── collect-result.ts   # RSS Item interface definition
├── data/
│   └── searches.json           # Search query configuration (key: filename, value: query)
├── .github/
│   ├── apt-packages.txt        # apt dependencies for self-hosted runner
│   └── workflows/
│       ├── nodejs-ci.yml       # CI: build + lint check
│       └── update-rss.yml      # RSS update + GitHub Pages deployment
├── Dockerfile                  # Docker image (zenika/alpine-chrome based)
├── docker-compose.yml          # Docker Compose for local container usage
├── entrypoint.sh               # Docker entrypoint (Xvfb + x11vnc + yarn build)
├── template.html               # HTML template for output/index.html
├── tsconfig.json               # TypeScript compiler settings
├── eslint.config.mjs           # ESLint configuration
└── .prettierrc.yml             # Prettier configuration
```

**Data flow:**

1. `main.ts` reads `data/searches.json` to get search queries.
2. It authenticates with Twitter using cached cookies or fresh login via `@the-convocation/twitter-scraper` (with CycleTLS for TLS fingerprint spoofing).
3. For each query, it calls the Twitter search API via `twitter-openapi-typescript`.
4. Results are mapped to RSS 2.0 `<item>` elements (title = JST timestamp, content = tweet text + media images).
5. XML is written to `output/<filename>.xml` using `fast-xml-parser`.
6. `output/index.html` is generated from `template.html` listing all feeds.

## Development

```bash
# Install dependencies
yarn install

# Run with hot reload (development)
yarn dev

# Build and run (TypeScript via ts-node)
yarn build

# Compile TypeScript to dist/ (no execution)
yarn compile

# Run compiled output from dist/
yarn start

# Lint (Prettier + ESLint + TypeScript, runs in parallel)
yarn lint

# Auto-fix formatting and linting issues
yarn fix
```

**TypeScript configuration:**

- Strict mode enabled (`strict: true`)
- `noUnusedLocals` and `noUnusedParameters` enforced
- `skipLibCheck` is explicitly forbidden

## Security

- **No SSO**: Only username/password authentication is supported.
- **Credentials**: All secrets are managed via environment variables or `.env` files. Never commit `.env` or `data/twitter-cookies.json`.
- **XSS prevention**: All tweet text and media URLs are HTML-escaped before being embedded in RSS output.
- **Path traversal prevention**: RSS filenames derived from `data/searches.json` keys are sanitized (removes `..`, `/`, `\`, and other dangerous characters).
- **Cookie safety**: Authentication cookies are stored only in `data/twitter-cookies.json` (excluded from Git) and cached in GitHub Actions secrets/cache.

## License

MIT License — Copyright (c) 2023 Tomachi. See [LICENSE](LICENSE) for details.
