export interface Item {
  title: string
  link: string
  description?: string
  'content:encoded'?: string

  author?: string
  category?: string
  comments?: string
  enclosure?: string
  guid?: {
    '@_isPermaLink?': boolean
    '#text'?: string
  }
  pubDate?: string
  source?: string
}

export default interface CollectResult {
  status: boolean
  items: Item[]
}
