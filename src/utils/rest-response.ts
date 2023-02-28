import { Page } from 'puppeteer-core'
import { RestSearchAdaptiveResponse } from '@/model/search-adaptive'

type RestEndPoint = 'SearchAdaptive'

type Return<T extends RestEndPoint> = T extends 'SearchAdaptive'
  ? RestSearchAdaptiveResponse
  : never

interface Errors {
  RATE_LIMIT_EXCEEDED: number
  [key: string]: number
}

export class RestResponse<T extends RestEndPoint> {
  private errors: Errors = {
    RATE_LIMIT_EXCEEDED: 0,
  }

  private responses: Return<T>[] = []

  constructor(page: Page, endpoint?: T) {
    this.init(page, endpoint)
  }

  public getSingleResponse(timeout: number): Promise<Return<T> | null> {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (this.responses.length > 0) {
          clearInterval(interval)
          resolve(this.responses[0])
        }
      }, 100)
      setTimeout(() => {
        clearInterval(interval)
        resolve(null)
      }, timeout)
    })
  }

  public shiftResponse(): Return<T> | null {
    return this.responses.shift() ?? null
  }

  public getResponses(): Return<T>[] {
    return this.responses
  }

  public getErrors(): Errors {
    return this.errors
  }

  private init(page: Page, endpoint?: T) {
    const regex = /https:\/\/api\.twitter\.com\/2\/(.+?)\.json/
    page.on('response', async (response) => {
      if (response.request().method() === 'OPTIONS') {
        return
      }
      const match = response.url().match(regex)
      if (!match || match.length !== 2) {
        return
      }
      if (response.status() !== 200) {
        return
      }
      // search/adaptive -> SearchAdaptive
      const resultEndpoint = match[1]
        .split('/')
        .map((s) => s[0].toUpperCase() + s.slice(1))
        .join('')

      let text
      try {
        text = await response.text()
      } catch {
        return
      }

      if (endpoint && endpoint !== resultEndpoint) {
        return
      }

      if (response.status() === 429) {
        this.errors.RATE_LIMIT_EXCEEDED += 1
        return
      }
      if (response.status() !== 200) {
        this.errors[`HTTP_STATUS_${response.status()}`] += 1
        return
      }

      const json = JSON.parse(text) as Return<T>
      this.responses.push(json)
    })
  }
}
