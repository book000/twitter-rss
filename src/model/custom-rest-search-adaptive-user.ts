export interface CustomRestSearchAdaptiveUser {
  id: number
  id_str: string
  name: string
  screen_name: string
  location: string
  description: string
  url: null | string
  entities: {
    url?: {
      urls: {
        url: string
        expanded_url: string
        display_url: string
        indices: number[]
      }[]
    }
    description: {
      urls: {
        url: string
        expanded_url: string
        display_url: string
        indices: number[]
      }[]
    }
  }
  protected: boolean
  followers_count: number
  fast_followers_count: number
  normal_followers_count: number
  friends_count: number
  listed_count: number
  created_at: string
  favourites_count: number
  utc_offset: null
  time_zone: null
  geo_enabled: boolean
  verified: boolean
  statuses_count: number
  media_count: number
  lang: null
  contributors_enabled: boolean
  is_translator: boolean
  is_translation_enabled: boolean
  profile_background_color: string
  profile_background_image_url: null | string
  profile_background_image_url_https: null | string
  profile_background_tile: boolean
  profile_image_url: string
  profile_image_url_https: string
  profile_banner_url?: string
  profile_image_extensions_sensitive_media_warning?: null
  profile_image_extensions_media_availability?: null
  profile_image_extensions_alt_text?: null
  profile_image_extensions_media_color?: null | {
    palette: {
      rgb: {
        red: number
        green: number
        blue: number
      }
      percentage: number
    }[]
  }
  profile_image_extensions?: {
    mediaStats: {
      r: {
        missing: null
      }
      ttl: number
    }
  }
  profile_banner_extensions_sensitive_media_warning?: null
  profile_banner_extensions_media_availability?: null
  profile_banner_extensions_alt_text?: null
  profile_banner_extensions_media_color?: null | {
    palette: {
      rgb: {
        red: number
        green: number
        blue: number
      }
      percentage: number
    }[]
  }
  profile_banner_extensions?: {
    mediaStats: {
      r: {
        missing: null
      }
      ttl: number
    }
  }
  profile_link_color: string
  profile_sidebar_border_color: string
  profile_sidebar_fill_color: string
  profile_text_color: string
  profile_use_background_image: boolean
  has_extended_profile: boolean
  default_profile: boolean
  default_profile_image: boolean
  pinned_tweet_ids: number[]
  pinned_tweet_ids_str: string[]
  has_custom_timelines: boolean
  can_dm: boolean
  can_media_tag: boolean
  following: boolean
  follow_request_sent: boolean
  notifications: boolean
  muting: boolean
  blocking: boolean
  blocked_by: boolean
  want_retweets: boolean
  advertiser_account_type: string
  advertiser_account_service_levels: string[]
  profile_interstitial_type: string
  business_profile_state: string
  translator_type: string
  withheld_in_countries: unknown[]
  followed_by: boolean
  ext_is_blue_verified: boolean
  ext_has_nft_avatar: boolean
  ext: {
    superFollowMetadata: {
      r: {
        ok: {
          superFollowEligible: boolean
          superFollowing: boolean
          superFollowedBy: boolean
          exclusiveTweetFollowing: boolean
          privateSuperFollowing: boolean
        }
      }
      ttl: number
    }
    highlightedLabel: {
      r: {
        ok: unknown
      }
      ttl: number
    }
    hasNftAvatar: {
      r: {
        ok: boolean
      }
      ttl: number
    }
  }
  require_some_consent: boolean
  ext_verified_type?: string
}
