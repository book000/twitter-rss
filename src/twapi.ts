import axios, { AxiosInstance } from 'axios'
import { Status } from 'twitter-d'

export interface TwApiOptions {
  baseUrl: string
  username: string
  password: string
}

export class TwApi {
  private twApiAxios: AxiosInstance

  constructor(options: TwApiOptions) {
    this.twApiAxios = axios.create({
      baseURL: options.baseUrl,
      auth: {
        username: options.username,
        password: options.password,
      },
    })
  }

  async search(query: string, limit: number): Promise<Status[]> {
    const response = await this.twApiAxios.get(`/search/${encodeURIComponent(query)}`, {
      params: {
        limit,
      },
    })
    return response.data
  }
}
