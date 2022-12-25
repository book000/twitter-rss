export default interface ServiceInformation {
  title: string
  link: string
  description: string

  language?: string
  copyright?: string
  managingEditor?: string
  webMaster?: string
  pubDate?: string
  lastBuildDate?: string
  category?: string
  generator?: string
  docs?: string
  cloud?: string
  ttl?: string
  image?: {
    url: string
    title: string
    link: string
    width?: number
    height?: number
  }
  textInput?: string
  skipHours?: string
  skipDays?: string
}
