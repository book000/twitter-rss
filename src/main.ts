import 'dotenv/config'
import { XMLBuilder, XMLParser } from 'fast-xml-parser'
import fs from 'node:fs'
import { Item } from './model/collect-result'
import { Logger } from '@book000/node-utils'
import { Scraper } from '@the-convocation/twitter-scraper'
// cycleTLSExit は twitter-scraper の内部インスタンスを終了させるために使用
import { cycleTLSExit } from '@the-convocation/twitter-scraper/cycletls'
import { TwitterOpenApi } from 'twitter-openapi-typescript'
import initCycleTLS, { CycleTLSClient } from 'cycletls'
import { Headers } from 'headers-polyfill'

type SearchesModel = Record<string, string>

// CycleTLS インスタンス（プロキシサポート付き）
// Promise ベースのシングルトンパターンで並行初期化を防止
let cycleTLSInstancePromise: Promise<CycleTLSClient> | null = null

async function initCycleTLSWithProxy(): Promise<CycleTLSClient> {
  cycleTLSInstancePromise ??= initCycleTLS()
  return cycleTLSInstancePromise
}

/**
 * プロキシサポート付きの CycleTLS fetch 関数
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
        ? input.toString()
        : input.url

  const method = (init?.method ?? 'GET').toUpperCase()

  const headers: Record<string, string> = {}
  if (init?.headers) {
    if (init.headers instanceof Headers) {
      for (const [key, value] of init.headers.entries()) {
        headers[key] = value
      }
    } else if (Array.isArray(init.headers)) {
      for (const [key, value] of init.headers) {
        headers[key] = value
      }
    } else {
      Object.assign(headers, init.headers)
    }
  }

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

  // プロキシ設定を構築
  let proxy: string | undefined
  const proxyServer = process.env.PROXY_SERVER
  if (proxyServer) {
    // プロトコルがない場合は http:// を追加
    const normalizedProxyServer = proxyServer.includes('://')
      ? proxyServer
      : `http://${proxyServer}`

    const proxyUsername = process.env.PROXY_USERNAME
    const proxyPassword = process.env.PROXY_PASSWORD
    if (proxyUsername && proxyPassword) {
      // http://username:password@host:port 形式
      try {
        const proxyUrl = new URL(normalizedProxyServer)
        proxyUrl.username = proxyUsername
        proxyUrl.password = proxyPassword
        proxy = proxyUrl.toString()
      } catch {
        throw new Error(
          `Invalid PROXY_SERVER URL: ${proxyServer}. Expected format: host:port or http://host:port`,
        )
      }
    } else {
      proxy = normalizedProxyServer
    }
  }

  const options = {
    body,
    headers,
    proxy,
    // Chrome 120 on Windows 10
    ja3: '771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27-17513,29-23-24,0',
    userAgent:
      headers['user-agent'] ||
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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

  let responseBody = ''
  if (typeof response.text === 'function') {
    responseBody = await response.text()
  } else if (response.data) {
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
const COOKIE_EXPIRY_DAYS = 7

interface CachedCookies {
  auth_token: string
  ct0: string
  savedAt: number
}

function sanitizeFileName(fileName: string) {
  // Windows / Linuxで使えない文字列をアンダーバーに置き換える
  // スペースをアンダーバーに置き換える
  return fileName.replaceAll(/[ "*/:<>?\\|]/g, '').trim()
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
    if (Date.now() - data.savedAt > expiryMs) {
      return null
    }
    return data
  } catch (error) {
    logger.warn('Failed to load cached cookies', error as Error)
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

      if (is503 && attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30_000)
        logger.warn(`503 error, retrying in ${delay / 1000}s...`)
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
  userName: string
  createdAt: string
  idStr: string
  mediaUrls: string[]
}

function getContent(tweet: TweetData): string {
  const tweetText = tweet.fullText
  const mediaUrls = tweet.mediaUrls

  return [
    tweetText.trim(),
    mediaUrls.length > 0 ? '<hr>' : '',
    mediaUrls.map((url) => `<img src="${url}"><br>`).join('\n'),
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
  let searchWords: SearchesModel
  try {
    if (!fs.existsSync(searchWordPath)) {
      throw new Error(`Search word file not found: ${searchWordPath}`)
    }
    searchWords = JSON.parse(fs.readFileSync(searchWordPath, 'utf8'))
  } catch (error) {
    logger.error(
      `Failed to load search words from ${searchWordPath}`,
      error as Error,
    )
    throw error
  }

  for (const key in searchWords) {
    const searchWord = searchWords[key]
    const startAt = new Date()
    logger.info(`Searching: ${searchWord}`)

    const builder = new XMLBuilder({
      ignoreAttributes: false,
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
      const items: Item[] = tweets.map((tweetResult) => {
        const tweet = tweetResult.tweet
        const user = tweetResult.user
        const legacy = tweet.legacy
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const userLegacy = user?.legacy

        const fullText = legacy?.fullText ?? ''
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const screenName = userLegacy?.screenName ?? ''
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const userName = userLegacy?.name ?? ''
        const createdAt = legacy?.createdAt ?? ''
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const idStr = legacy?.idStr ?? tweet.restId ?? ''

        const mediaUrls: string[] = []
        const extendedEntities = legacy?.extendedEntities
        if (extendedEntities?.media) {
          for (const media of extendedEntities.media) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            const mediaUrl = media.mediaUrlHttps ?? ''
            // 空文字列のURLはスキップする
            if (mediaUrl) {
              mediaUrls.push(mediaUrl)
            }
          }
        }

        const tweetData: TweetData = {
          fullText,
          screenName,
          userName,
          createdAt,
          idStr,
          mediaUrls,
        }

        // タイトルは投稿日にする
        // 微妙だけど、とりあえず9時間足す（JST変換）
        const title = createdAt
          ? new Date(new Date(createdAt).getTime() + 9 * 60 * 60 * 1000)
              .toISOString()
              .replace(/T/, ' ')
              .replace(/Z/, '')
              .replace(/\.\d+$/, '')
          : ''

        const content = getContent(tweetData)

        return {
          title,
          link: `https://twitter.com/${screenName}/status/${idStr}`,
          'content:encoded': content,
          author: `${userName} (@${screenName})`,
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
          '@_xmlns:dc': 'http://purl.org/dc/elements/1.1/',
          '@_xmlns:content': 'http://purl.org/rss/1.0/modules/content/',
          '@_xmlns:atom': 'http://www.w3.org/2005/Atom',
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
      logger.error(`Error searching for "${searchWord}"`, error as Error)
    }
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
      )}'>${title}</a>: <code>${description}</code></li>`
    })
    .filter((s) => s !== null)
  fs.writeFileSync(
    'output/index.html',
    template.replace('{{ RSS-FILES }}', '<ul>' + list.join('\n') + '</ul>'),
  )
  logger.info(`Generated`)
}

async function cleanup(): Promise<void> {
  // CycleTLS インスタンスのクリーンアップ（初期化されている場合のみ）
  if (cycleTLSInstancePromise) {
    try {
      const instance = await cycleTLSInstancePromise
      await instance.exit()
    } catch {
      // インスタンスの終了に失敗しても無視
    }
  }
  // twitter-scraper の内部 CycleTLS インスタンスも終了
  try {
    cycleTLSExit()
  } catch {
    // 初期化されていない場合のエラーを無視
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
    logger.error('Fatal error occurred', error as Error)
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
