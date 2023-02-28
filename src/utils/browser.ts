import puppeteer, { Browser, Page } from 'puppeteer-core'
import fs from 'node:fs'
import { authenticator } from 'otplib'
import { Logger } from './logger'

interface TwitterAccount {
  username: string
  password: string
  authCodeSecret?: string
}

export class RSSBrowser {
  private browser: Browser
  private readonly account: TwitterAccount

  constructor(browser: Browser, account: TwitterAccount) {
    const logger = Logger.configure('WTLBrowser')
    this.browser = browser
    this.account = account

    this.browser.on('disconnected', () => {
      RSSBrowser.getBrowser(`data/userdata/`, this.account).then((browser) => {
        this.browser = browser

        logger.info('🔌 Browser restarted.')
      })
    })

    setInterval(() => {
      if (this.browser.isConnected()) {
        return
      }

      RSSBrowser.getBrowser(`data/userdata/`, this.account).then((browser) => {
        this.browser = browser

        logger.info('🔌 Browser restarted.')
      })
    }, 10_000)
  }

  public static async init(account: TwitterAccount) {
    const userDataDirectory = 'data/userdata/'
    if (!fs.existsSync(userDataDirectory)) {
      fs.mkdirSync(userDataDirectory, { recursive: true })
    }

    const browser = await RSSBrowser.getBrowser(userDataDirectory, account)
    return new RSSBrowser(browser, account)
  }

  public async newPage() {
    return RSSBrowser.newPage(this.browser)
  }

  public async close() {
    await this.browser.close()
  }

  private static async newPage(browser: Browser) {
    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(120 * 1000)

    await page.evaluateOnNewDocument(() => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      Object.defineProperty(navigator, 'webdriver', () => {})
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line no-proto
      delete navigator.__proto__.webdriver
    })

    return page
  }

  private static async getBrowser(
    userDataDirectory: string,
    account: TwitterAccount
  ) {
    if (!fs.existsSync(userDataDirectory)) {
      fs.mkdirSync(userDataDirectory, { recursive: true })
    }

    const puppeteerArguments = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--lang=ja',
      '--window-size=600,1000',
    ]

    if (process.env.ENABLE_DEVTOOLS)
      puppeteerArguments.push('--auto-open-devtools-for-tabs')

    const browser = await puppeteer.launch({
      headless: false,
      executablePath: process.env.CHROMIUM_PATH,
      args: puppeteerArguments,
      defaultViewport: {
        width: 600,
        height: 1000,
      },
      userDataDir: userDataDirectory,
    })

    process.on('SIGINT', async () => {
      await browser.close()
      process.exit(0)
    })

    const loginPage = await this.newPage(browser)
    await this.login(loginPage, account)
    await loginPage.close()

    return browser
  }

  private static async login(page: Page, account: TwitterAccount) {
    const logger = Logger.configure('WTLBrowser.login')
    logger.info(`✨ Login to twitter`)
    await page.goto('https://twitter.com', {
      waitUntil: ['load', 'networkidle2'],
    })
    await new Promise<void>((resolve) => setTimeout(resolve, 3000))

    const href = await page.evaluate(() => {
      return document.location.href
    })
    if (href !== 'https://twitter.com/home') {
      logger.warn('❗ You need to login again.')

      await page.goto('https://twitter.com/i/flow/login', {
        waitUntil: ['load', 'networkidle2'],
      })

      await page
        .waitForSelector('input[autocomplete="username"]')
        .then((element) => element?.type(account.username, { delay: 100 }))

      // next button
      await page
        .waitForSelector('div[role="button"]:not([data-testid])')
        .then((element) => element?.click())

      const password = account.password
      // password
      await page
        .waitForSelector('input[autocomplete="current-password"]')
        .then((element) => element?.type(password, { delay: 100 }))

      // login button
      await page
        .waitForSelector(
          'div[role="button"][data-testid="LoginForm_Login_Button"]'
        )
        .then((element) => element?.click())

      // need auth code ?
      try {
        const authCodeInput = await page.waitForSelector(
          'input[data-testid="ocfEnterTextTextInput"]',
          { timeout: 3000 }
        )
        if (authCodeInput) {
          logger.info('🔒 Need OTP.')
          const authCode = this.getOneTimePassword(account.authCodeSecret)
          await authCodeInput.type(authCode, { delay: 100 })
          await page
            .waitForSelector(
              'div[role="button"][data-testid="ocfEnterTextNextButton"]'
            )
            .then((element) => element?.click())
        }
      } catch {}

      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Login timeout.'))
        }, 10_000)
        const interval = setInterval(() => {
          if (page.url() === 'https://twitter.com/home') {
            clearInterval(interval)
            resolve()
          }
        }, 500)
      })
    }
    logger.info(`✅ You have successfully logged in`)
  }

  private static getOneTimePassword(authCodeSecret: string | undefined) {
    if (!authCodeSecret) {
      throw new Error('authCodeSecret is not set.')
    }
    return authenticator.generate(authCodeSecret)
  }
}
