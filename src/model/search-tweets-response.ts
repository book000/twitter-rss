interface Url {
  url: string
  expanded_url: string
  display_url: string
  indices: number[]
}
interface Size {
  w: number
  h: number
  resize: string
}

interface Sizes {
  thumb: Size
  medium: Size
  small: Size
  large: Size
}

interface Media {
  id: number
  id_str: string
  indices: number[]
  media_url: string
  media_url_https: string
  url: string
  display_url: string
  expanded_url: string
  type: string
  sizes: Sizes
  source_status_id?: number
  source_status_id_str?: string
  source_user_id?: number
  source_user_id_str?: string
}

interface EntitySymbol {
  text: string
  indices: number[]
}

interface UserMention {
  screen_name: string
  name: string
  id: number
  id_str: string
  indices: number[]
}

interface StatusEntities {
  hashtags: unknown[]
  symbols: EntitySymbol[]
  user_mentions: UserMention[]
  urls: Url[]
  media?: Media[]
}

interface Urls {
  urls: Url[]
}

interface UserEntities {
  url: Urls
  description: Urls
}

interface User {
  id: number
  id_str: string
  name: string
  screen_name: string
  location: string
  description: string
  url: string
  entities: UserEntities
  protected: boolean
  followers_count: number
  friends_count: number
  listed_count: number
  created_at: string
  favourites_count: number
  utc_offset?: unknown
  time_zone?: unknown
  geo_enabled?: unknown
  verified: boolean
  statuses_count: number
  lang: string
  contributors_enabled?: unknown
  is_translator?: unknown
  is_translation_enabled?: unknown
  profile_background_color: string
  profile_background_image_url: string
  profile_background_image_url_https: string
  profile_background_tile?: unknown
  profile_image_url: string
  profile_image_url_https: string
  profile_banner_url: string
  profile_link_color: string
  profile_sidebar_border_color: string
  profile_sidebar_fill_color: string
  profile_text_color: string
  profile_use_background_image?: unknown
  has_extended_profile?: unknown
  default_profile: boolean
  default_profile_image: boolean
  following?: unknown
  follow_request_sent?: unknown
  notifications?: unknown
  translator_type: string
}

/**
 * ツイート
 */
export interface Tweet {
  /**
   * ツイートの作成日時
   */
  created_at: string

  /**
   * ツイートのID
   */
  id: number

  /**
   * ツイートのID (文字列)
   */
  id_str: string

  /**
   * ツイートの本文
   *
   * 切り捨てられている可能性がある。tweet_mode=extendedで取得すると、切り捨てられない
   */
  text?: string

  /**
   * ツイートの本文
   *
   * tweet_mode=extendedの場合に取得可能
   */
  full_text?: string

  /**
   * ツイートの本文が切り捨てられたかどうか
   */
  truncated: boolean

  /**
   * ツイートのエンティティ
   */
  entities: StatusEntities

  /**
   * ツイートの投稿元情報 (aタグ)
   */
  source: string

  /**
   * リプライ先のツイートID
   */
  in_reply_to_status_id?: unknown

  /**
   * リプライ先のツイートID (文字列)
   */
  in_reply_to_status_id_str?: unknown

  /**
   * リプライ先のユーザーID
   */
  in_reply_to_user_id?: unknown

  /**
   * リプライ先のユーザーID (文字列)
   */
  in_reply_to_user_id_str?: unknown

  /**
   * リプライ先のユーザー名
   */
  in_reply_to_screen_name?: unknown

  /**
   * 投稿者情報
   */
  user: User

  /**
   * Geoデータ (lat, long)
   */
  geo?: unknown

  /**
   * 場所データ (long. lat)
   */
  coordinates?: unknown

  /**
   * 場所情報
   */
  place?: unknown

  /**
   * ツイートのコントリビューター
   */
  contributors?: unknown

  /**
   * 引用ツイートであるか
   */
  is_quote_status: boolean

  /**
   * リツイート数
   */
  retweet_count: number

  /**
   * いいね数
   */
  favorite_count: number
}

/**
 * ツイート検索メタデータ
 */
interface SearchMetadata {
  /**
   * 完了までの時間
   */
  completed_in: number

  /**
   * 検索結果の最大ID
   */
  max_id: number

  /**
   * 検索結果の最大ID (文字列)
   */
  max_id_str: string

  /**
   * 次の検索結果のURLクエリ
   */
  next_results: string

  /**
   * 検索クエリ
   */
  query: string

  /**
   * 更新用のURLクエリ
   */
  refresh_url: string

  /**
   * 検索結果アイテム数
   */
  count: number

  /**
   * 検索結果の最小ID
   */
  since_id: number

  /**
   * 検索結果の最小ID (文字列)
   */
  since_id_str: string
}

/**
 * GET /search/tweets.json のレスポンス
 */
export interface SearchTweetsResponse {
  /**
   * ツイート一覧
   */
  statuses: Tweet[]

  /**
   * 検索メタデータ
   */
  search_metadata: SearchMetadata
}
