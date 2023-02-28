import { Page } from 'puppeteer-core'
import { Status } from 'twitter-d'
import { RSSBrowser } from './browser'
import { RestResponse } from './rest-response'
import { CustomRestSearchAdaptiveUser } from '@/model/custom-rest-search-adaptive-user'
import { CustomRestSearchAdaptiveTweet } from '@/model/custom-rest-search-adaptive-tweet'
import { RestSearchAdaptiveResponse } from '@/model/search-adaptive'

export class Twitter {
  private readonly browser: RSSBrowser

  constructor(browser: RSSBrowser) {
    this.browser = browser
  }

  public async getUserScreenName(userId: string): Promise<string> {
    const url = `https://twitter.com/i/user/${userId}`
    const page = await this.browser.newPage()

    await page.goto(url)

    await new Promise<void>((resolve) => {
      const interval = setInterval(async () => {
        const href = await page.evaluate(() => {
          return document.location.href
        })
        if (href !== url) {
          clearInterval(interval)
          resolve()
        }
      }, 1000)
      setTimeout(() => {
        clearInterval(interval)
        resolve()
      }, 10_000)
    })

    const screenName = await page.evaluate(() => {
      return document.location.href.split('/').pop()
    })
    await page.close()

    if (!screenName || screenName === userId) {
      throw new Error('Failed to get screen name.')
    }
    if (screenName === '404') {
      throw new Error('User not found.')
    }

    return screenName
  }

  public async searchTweets(q: string, limit: number): Promise<Status[]> {
    const url = `https://twitter.com/search?q=${encodeURIComponent(
      q
    )}&src=typed_query&f=live`
    const page = await this.browser.newPage()

    const restResponse = new RestResponse(page, 'SearchAdaptive')
    await page.goto(url, { waitUntil: 'networkidle2' })
    const scrollInterval = setInterval(async () => {
      await this.pageScroll(page)
    }, 1000)

    const tweets = []
    while (tweets.length < limit) {
      try {
        tweets.push(...(await this.waitTweet(restResponse)))
      } catch (error) {
        break
      }
    }

    clearInterval(scrollInterval)
    await page.close()

    return tweets
  }

  waitTweet(
    graphqlResponse: RestResponse<'SearchAdaptive'>
  ): Promise<Status[]> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('TIMEOUT'))
      }, 10_000)
      const interval = setInterval(async () => {
        const response = graphqlResponse.shiftResponse()
        if (!response) {
          return
        }

        const tweets = this.getTweet(response)
        if (tweets.length > 0) {
          clearInterval(interval)
          resolve(tweets)
        }
      }, 1000)
    })
  }

  getTweet(response: RestSearchAdaptiveResponse): Status[] {
    const result = Object.values(response.globalObjects.tweets)
    const users = Object.values(response.globalObjects.users)
    return result.map((tweet) => {
      return this.createStatusObject(users, tweet)
    })
  }

  createStatusObject(
    users: CustomRestSearchAdaptiveUser[],
    tweet: CustomRestSearchAdaptiveTweet
  ): Status {
    const user = users.find((user) => user.id_str === tweet.user_id_str)
    if (!user) {
      throw new Error('User not found')
    }
    return {
      ...tweet,
      user: {
        ...user,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        following: undefined,
        followed_by: undefined,
        follow_request_sent: undefined,
        muting: undefined,
        blocking: undefined,
        blocked_by: undefined,
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      contributors: tweet.contributors,
      display_text_range: tweet.display_text_range
        ? [tweet.display_text_range[0], tweet.display_text_range[1]]
        : null,
    }
  }

  private async pageScroll(page: Page) {
    await page.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    })
  }
}
