import 'dotenv/config'
import XMLBuilder from 'fast-xml-builder'
import { XMLParser } from 'fast-xml-parser'
import fs from 'node:fs'
import { Item } from './model/collect-result'
import { Logger } from '@book000/node-utils'
import { Scraper } from '@the-convocation/twitter-scraper'
import { cycleTLSExit } from '@the-convocation/twitter-scraper/cycletls'
import { TwitterOpenApi } from 'twitter-openapi-typescript'
import initCycleTLS, { CycleTLSClient } from 'cycletls'
import { Headers } from 'headers-polyfill'

// Exit quietly on EPIPE (broken pipe).
// The uncaughtException handler of @book000/node-utils writes a log line, which raises
// EPIPE again and loops forever; handling it here prevents that.
process.stdout.on('error', (err: NodeJS.ErrnoException) => {
  // eslint-disable-next-line unicorn/no-process-exit
  if (err.code === 'EPIPE') process.exit(0)
})
process.stderr.on('error', (err: NodeJS.ErrnoException) => {
  // eslint-disable-next-line unicorn/no-process-exit
  if (err.code === 'EPIPE') process.exit(0)
})
process.on('uncaughtException', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EPIPE') process.exit(0)
})

interface HeadersLike {
  entries?: () => IterableIterator<[string, string]>
  [Symbol.iterator]?: () => Iterator<[string, string]>
}

// Shared CycleTLS instance. Holding the Promise (not the resolved client) prevents concurrent initialization.
let cycleTLSInstancePromise: Promise<CycleTLSClient> | null = null

async function initCycleTLSWithProxy(): Promise<CycleTLSClient> {
  cycleTLSInstancePromise ??= initCycleTLS()
  return cycleTLSInstancePromise
}

/**
 * `fetch` replacement for twitter-scraper that sends requests through CycleTLS
 * to spoof the TLS fingerprint. Uses the proxy from the `PROXY_*` environment
 * variables when set (see README).
 *
 * @throws {Error} If `PROXY_SERVER` is not a valid URL while `PROXY_USERNAME` and `PROXY_PASSWORD` are set
 */
async function cycleTLSFetchWithProxy(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const instance = await initCycleTLSWithProxy()
  const url =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : input.url

  const method = (init?.method ?? 'GET').toUpperCase()

  const headers: Record<string, string> = {}
  if (init?.headers) {
    const h = init.headers as HeadersLike
    if (h.entries && typeof h.entries === 'function') {
      for (const [key, value] of h.entries()) {
        headers[key] = value
      }
    } else if (Array.isArray(init.headers)) {
      for (const [key, value] of init.headers) {
        headers[key] = value
      }
    } else if (typeof h[Symbol.iterator] === 'function') {
      for (const [key, value] of init.headers as unknown as Iterable<
        [string, string]
      >) {
        headers[key] = value
      }
    } else {
      Object.assign(headers, init.headers as Record<string, string>)
    }
  }

  const requestUserAgent = Object.entries(headers).find(
    ([key, value]) => key.toLowerCase() === 'user-agent' && value !== '',
  )?.[1]

  let body: string | undefined
  if (init?.body) {
    if (typeof init.body === 'string') {
      body = init.body
    } else if (init.body instanceof URLSearchParams) {
      body = init.body.toString()
    } else {
      body = JSON.stringify(init.body)
    }
  }

  let proxy: string | undefined
  const proxyServer = process.env.PROXY_SERVER
  if (proxyServer) {
    const normalizedProxyServer =
      proxyServer.startsWith('http://') || proxyServer.startsWith('https://')
        ? proxyServer
        : `http://${proxyServer}`

    const proxyUsername = process.env.PROXY_USERNAME
    const proxyPassword = process.env.PROXY_PASSWORD
    if (proxyUsername && proxyPassword) {
      try {
        const proxyUrl = new URL(normalizedProxyServer)
        proxyUrl.username = proxyUsername
        proxyUrl.password = proxyPassword
        proxy = proxyUrl.href
      } catch {
        throw new Error(
          'Invalid PROXY_SERVER URL. Expected format: host:port, http://host:port or https://host:port',
        )
      }
    } else {
      proxy = normalizedProxyServer
    }
  }

  // Omit `proxy` when unset: passing `proxy: undefined` may change CycleTLS behavior
  const options: Record<string, unknown> = {
    body,
    headers,
    // ja3 and userAgent intentionally come from different Chrome versions:
    // JA3 describes the TLS handshake, not the User-Agent.
    ja3: '771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27-17513,29-23-24,0',
    userAgent:
      requestUserAgent ??
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
    ...(proxy && { proxy }),
  }

  const response = await instance(
    url,
    options,
    method.toLowerCase() as
      | 'head'
      | 'get'
      | 'post'
      | 'put'
      | 'delete'
      | 'trace'
      | 'options'
      | 'connect'
      | 'patch',
  )

  const responseHeaders = new Headers()
  for (const [key, value] of Object.entries(response.headers)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        responseHeaders.append(key, v)
      }
    } else if (typeof value === 'string') {
      responseHeaders.set(key, value)
    }
  }

  let responseBody: string
  if (response.data === undefined || response.data === null) {
    responseBody = ''
  } else {
    responseBody =
      typeof response.data === 'string'
        ? response.data
        : JSON.stringify(response.data)
  }

  return new Response(responseBody, {
    status: response.status,
    statusText: '',
    headers: responseHeaders,
  })
}

const COOKIE_CACHE_FILE = './data/twitter-cookies.json'
// The workflow refreshes savedAt on every run, so the effective expiry is 90 days after the last successful run.
// A session invalidated server-side is not detected here: the cache is kept, and each search
// fails with an API error (401 etc.) that is only logged, so the job still exits 0.
const COOKIE_EXPIRY_DAYS = 90

interface CachedCookies {
  auth_token: string
  ct0: string
  savedAt: number
}

/**
 * Turns a `data/searches.json` key into a file name that cannot escape `output/`.
 *
 * @throws {Error} If nothing usable remains after sanitization
 */
function sanitizeFileName(fileName: string): string {
  let sanitized = fileName.replaceAll(/[ "*/:<>?\\|/]/g, '').trim()

  // One pass is enough (a run of n dots becomes n % 2 dots, and surviving dots are never adjacent); the loop is defensive.
  while (sanitized.includes('..')) {
    sanitized = sanitized.replaceAll('..', '')
  }

  if (!sanitized || sanitized === '.' || sanitized === '..') {
    throw new Error('Invalid file name after sanitization')
  }

  return sanitized
}

function isValidCachedCookies(data: unknown): data is CachedCookies {
  if (typeof data !== 'object' || data === null) {
    return false
  }
  const obj = data as Record<string, unknown>
  return (
    typeof obj.auth_token === 'string' &&
    typeof obj.ct0 === 'string' &&
    typeof obj.savedAt === 'number'
  )
}

function loadCachedCookies(): CachedCookies | null {
  const logger = Logger.configure('loadCachedCookies')
  try {
    if (!fs.existsSync(COOKIE_CACHE_FILE)) {
      return null
    }
    const data: unknown = JSON.parse(fs.readFileSync(COOKIE_CACHE_FILE, 'utf8'))
    if (!isValidCachedCookies(data)) {
      logger.warn('Invalid cookie cache structure')
      return null
    }
    const expiryMs = COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    return Date.now() - data.savedAt > expiryMs ? null : data
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error : new Error(String(error))
    logger.warn('Failed to load cached cookies', errorMessage)
    return null
  }
}

function saveCookies(authToken: string, ct0: string): void {
  const dir = './data'
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  const data: CachedCookies = {
    auth_token: authToken,
    ct0,
    savedAt: Date.now(),
  }
  fs.writeFileSync(COOKIE_CACHE_FILE, JSON.stringify(data, null, 2))
}

async function loginWithRetry(
  scraper: Scraper,
  username: string,
  password: string,
  email?: string,
  twoFactorSecret?: string,
  maxRetries = 5,
): Promise<void> {
  const logger = Logger.configure('loginWithRetry')
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Login attempt ${attempt}/${maxRetries}...`)
      await scraper.login(username, password, email, twoFactorSecret)
      return
    } catch (error: unknown) {
      const is503 =
        error instanceof Error &&
        (error.message.includes('503') ||
          error.message.includes('Service Unavailable'))

      // error 399: Twitter blocked the login as suspicious activity; wait, then retry.
      // The word-boundary match avoids false positives such as "3990".
      const is399 = error instanceof Error && /\b399\b/.test(error.message)

      if (is503 && attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30_000)
        logger.warn(`503 error, retrying in ${delay / 1000}s...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      } else if (is399 && attempt < maxRetries) {
        // Twitter recommends waiting 15 minutes, but retry every 2 minutes to fit the workflow (bounded by maxRetries)
        const delay = 120_000
        logger.warn(
          `🚫 error 399 (suspicious activity), retrying in ${delay / 1000}s... (attempt ${attempt}/${maxRetries})`,
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      } else {
        throw error
      }
    }
  }
}

async function getAuthCookies(): Promise<{ authToken: string; ct0: string }> {
  const logger = Logger.configure('getAuthCookies')

  const cached = loadCachedCookies()
  if (cached) {
    logger.info('Using cached cookies')
    return { authToken: cached.auth_token, ct0: cached.ct0 }
  }

  const username = process.env.TWITTER_USERNAME
  const password = process.env.TWITTER_PASSWORD
  if (!username || !password) {
    throw new Error('TWITTER_USERNAME or TWITTER_PASSWORD is not set')
  }

  logger.info('Logging in with twitter-scraper + CycleTLS...')
  const scraper = new Scraper({
    fetch: cycleTLSFetchWithProxy,
  })

  await loginWithRetry(
    scraper,
    username,
    password,
    process.env.TWITTER_EMAIL_ADDRESS,
    process.env.TWITTER_AUTH_CODE_SECRET,
  )

  if (!(await scraper.isLoggedIn())) {
    throw new Error('Login failed')
  }

  const cookies = await scraper.getCookies()
  const authToken = cookies.find((c) => c.key === 'auth_token')?.value
  const ct0 = cookies.find((c) => c.key === 'ct0')?.value

  if (!authToken || !ct0) {
    throw new Error('Failed to get auth_token or ct0 from cookies')
  }

  saveCookies(authToken, ct0)
  logger.info('Login successful, cookies saved')

  return { authToken, ct0 }
}

interface TweetData {
  fullText: string
  screenName: string
  username: string
  createdAt: string
  idStr: string
  mediaUrls: string[]
}

/** Escapes `& < > " '` so the result is safe in HTML text and quoted attribute values. */
function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function getContent(tweet: TweetData): string {
  const tweetText = escapeHtml(tweet.fullText)
  const mediaUrls = tweet.mediaUrls

  return [
    tweetText.trim(),
    mediaUrls.length > 0 ? '<hr>' : '',
    mediaUrls.map((url) => `<img src="${escapeHtml(url)}"><br>`).join('\n'),
  ].join('\n')
}

async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    baseDelayMs?: number
    maxDelayMs?: number
    logger?: ReturnType<typeof Logger.configure>
    operationName?: string
  } = {},
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 30_000,
    logger,
    operationName = 'operation',
  } = options

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: unknown) {
      const isLastAttempt = attempt >= maxRetries

      if (isLastAttempt) {
        throw error
      }

      const delay = Math.min(baseDelayMs * Math.pow(2, attempt - 1), maxDelayMs)
      logger?.warn(
        `${operationName} failed (attempt ${attempt}/${maxRetries}), retrying in ${delay / 1000}s...`,
      )
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  // Unreachable: loop always returns on success or throws on last attempt
  // This satisfies TypeScript's control flow analysis
  throw new Error(`${operationName} failed after ${maxRetries} attempts`)
}

async function generateRSS() {
  const logger = Logger.configure('generateRSS')
  logger.info('Generating RSS...')

  if (!process.env.TWITTER_USERNAME || !process.env.TWITTER_PASSWORD) {
    throw new Error('TWITTER_USERNAME, TWITTER_PASSWORD is not set')
  }

  const { authToken, ct0 } = await getAuthCookies()

  logger.info('Creating twitter-openapi client...')
  const api = new TwitterOpenApi()
  const client = await api.getClientFromCookies({
    auth_token: authToken,
    ct0,
  })

  const rssLanguage = process.env.RSS_LANGUAGE ?? 'ja'

  const searchWordPath = process.env.SEARCH_WORD_PATH ?? 'data/searches.json'
  type SearchesModel = Record<string, string>
  let searchWords: SearchesModel
  try {
    if (!fs.existsSync(searchWordPath)) {
      throw new Error(`Search word file not found: ${searchWordPath}`)
    }
    searchWords = JSON.parse(fs.readFileSync(searchWordPath, 'utf8'))
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error : new Error(String(error))
    logger.error(
      `Failed to load search words from ${searchWordPath}`,
      errorMessage,
    )
    throw errorMessage
  }

  const failedKeys: string[] = []
  for (const key in searchWords) {
    const searchWord = searchWords[key]
    const startAt = new Date()
    logger.info(`Searching: ${searchWord}`)

    const builder = new XMLBuilder({
      ignoreAttributes: false,
      suppressBooleanAttributes: false,
      format: true,
    })

    try {
      const results = await withRetry(
        () =>
          client.getTweetApi().getSearchTimeline({
            rawQuery: searchWord,
            product: 'Latest',
          }),
        {
          maxRetries: 3,
          baseDelayMs: 2000,
          logger,
          operationName: `Search "${searchWord}"`,
        },
      )

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const tweets = results.data.data ?? []
      // Filter out promoted tweets (advertisements)
      const organicTweets = tweets.filter(
        (tweetResult) => !tweetResult.promotedMetadata,
      )
      const items: Item[] = organicTweets.map((tweetResult) => {
        const tweet = tweetResult.tweet
        const user = tweetResult.user
        const legacy = tweet.legacy
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const userLegacy = user?.legacy

        const fullText = legacy?.fullText ?? ''
        const screenName = userLegacy?.screenName ?? ''
        const username = userLegacy?.name ?? ''
        const createdAt = legacy?.createdAt ?? ''
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const idStr = legacy?.idStr ?? tweet.restId ?? ''

        const mediaUrls: string[] = []
        const extendedEntities = legacy?.extendedEntities
        if (extendedEntities?.media) {
          for (const media of extendedEntities.media) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            const mediaUrl = media.mediaUrlHttps ?? ''
            if (mediaUrl) {
              mediaUrls.push(mediaUrl)
            }
          }
        }

        const tweetData: TweetData = {
          fullText,
          screenName,
          username,
          createdAt,
          idStr,
          mediaUrls,
        }

        // The title is the post time in JST (fixed UTC+9 offset, no DST handling)
        const title = createdAt
          ? new Date(new Date(createdAt).getTime() + 9 * 60 * 60 * 1000)
              .toISOString()
              .replace(/T/, ' ')
              .replace(/Z/, '')
              .replace(/\.\d+$/, '')
          : ''

        const content = getContent(tweetData)

        const tweetUrl = `https://twitter.com/${screenName}/status/${idStr}`
        return {
          title,
          link: tweetUrl,
          guid: {
            '@_isPermaLink': true,
            '#text': tweetUrl,
          },
          'content:encoded': content,
          author: `${username} (@${screenName})`,
          pubDate: createdAt ? new Date(createdAt).toUTCString() : '',
        }
      })

      const obj = {
        '?xml': {
          '@_version': '1.0',
          // eslint-disable-next-line unicorn/text-encoding-identifier-case
          '@_encoding': 'UTF-8',
        },
        rss: {
          '@_version': '2.0',
          '@_xmlns:dc': 'https://purl.org/dc/elements/1.1/',
          '@_xmlns:content': 'https://purl.org/rss/1.0/modules/content/',
          '@_xmlns:atom': 'https://www.w3.org/2005/Atom',
          channel: {
            title: key,
            description: searchWord,
            link:
              'https://twitter.com/search?q=' +
              encodeURIComponent(searchWord) +
              '&f=live',
            generator: 'book000/twitter-rss',
            language: rssLanguage,
            item: items,
          },
        },
      }

      const feed: {
        toString: () => string
      } = builder.build(obj)

      const filename = sanitizeFileName(key)
      fs.writeFileSync('output/' + filename + '.xml', feed.toString())
      const endAt = new Date()
      logger.info(
        `Generated: ${filename}.xml. Found ${items.length} items (${
          endAt.getTime() - startAt.getTime()
        }ms)`,
      )
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error : new Error(String(error))
      logger.error(`Error searching for "${searchWord}"`, errorMessage)
      failedKeys.push(key)
    }
  }

  if (failedKeys.length > 0) {
    throw new Error(
      `Failed to generate ${failedKeys.length} of ${Object.keys(searchWords).length} feeds: ${failedKeys.join(', ')}`,
    )
  }
}

function generateList() {
  const logger = Logger.configure('generateList')
  logger.info('Generating list...')
  const files = fs.readdirSync('output')
  const template = fs.readFileSync('template.html', 'utf8')
  const list = files
    .map((file) => {
      if (!file.endsWith('.xml')) {
        return null
      }
      const parser = new XMLParser({
        ignoreAttributes: false,
      })

      const feed: {
        rss: {
          channel: {
            title: string
            description: string
          }
        }
      } = parser.parse(fs.readFileSync('output/' + file, 'utf8'))
      const title = feed.rss.channel.title
      const description = feed.rss.channel.description
      return `<li><a href='${encodeURIComponent(
        file,
      )}'>${escapeHtml(title)}</a>: <code>${escapeHtml(description)}</code></li>`
    })
    .filter((s) => s !== null)
  fs.writeFileSync(
    'output/index.html',
    template.replace(
      '{{ RSS-FILES }}',
      () => '<ul>' + list.join('\n') + '</ul>',
    ),
  )
  logger.info(`Generated`)
}

async function cleanup(): Promise<void> {
  if (cycleTLSInstancePromise) {
    try {
      const instance = await cycleTLSInstancePromise
      await instance.exit()
    } catch {
      // Best-effort cleanup; the process exits right after
    }
  }
  // twitter-scraper keeps its own CycleTLS instance
  try {
    cycleTLSExit()
  } catch {
    // Ignore the error when it was never initialized
  }
}

async function main() {
  const logger = Logger.configure('main')

  if (!fs.existsSync('output')) {
    fs.mkdirSync('output')
  }

  let exitCode = 0
  try {
    await generateRSS()
    generateList()
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error : new Error(String(error))
    logger.error('Fatal error occurred', errorMessage)
    exitCode = 1
  } finally {
    await cleanup()
  }

  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(exitCode)
}

;(async () => {
  await main()
})()
