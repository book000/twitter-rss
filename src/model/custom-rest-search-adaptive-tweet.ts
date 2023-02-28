export interface CustomRestSearchAdaptiveTweet {
  created_at: string
  id: number
  id_str: string
  full_text: string
  truncated: boolean
  display_text_range: number[]
  entities: {
    hashtags: {
      text: string
      indices: number[]
    }[]
    symbols: unknown[]
    user_mentions: {
      screen_name: string
      name: string
      id: number
      id_str: string
      indices: number[]
    }[]
    urls: {
      url: string
      expanded_url: string
      display_url: string
      indices: number[]
    }[]
    media?: {
      id: number
      id_str: string
      indices: number[]
      media_url: string
      media_url_https: string
      url: string
      display_url: string
      expanded_url: string
      type: string
      original_info: {
        width: number
        height: number
        focus_rects?: {
          x: number
          y: number
          h: number
          w: number
        }[]
      }
      sizes: {
        thumb: {
          w: number
          h: number
          resize: string
        }
        small: {
          w: number
          h: number
          resize: string
        }
        large: {
          w: number
          h: number
          resize: string
        }
        medium: {
          w: number
          h: number
          resize: string
        }
      }
      features: {
        small?: {
          faces: {
            x: number
            y: number
            h: number
            w: number
          }[]
        }
        large?: {
          faces: {
            x: number
            y: number
            h: number
            w: number
          }[]
        }
        medium?: {
          faces: {
            x: number
            y: number
            h: number
            w: number
          }[]
        }
        orig?: {
          faces: {
            x: number
            y: number
            h: number
            w: number
          }[]
        }
      }
      source_status_id?: number
      source_status_id_str?: string
      source_user_id?: number
      source_user_id_str?: string
    }[]
  }
  source: string
  in_reply_to_status_id: null | number
  in_reply_to_status_id_str: null | string
  in_reply_to_user_id: null | number
  in_reply_to_user_id_str: null | string
  in_reply_to_screen_name: null | string
  user_id: number
  user_id_str: string
  geo: null
  coordinates: null
  place: null | {
    id: string
    url: string
    place_type: string
    name: string
    full_name: string
    country_code: string
    country: string
    contained_within: unknown[]
    bounding_box: {
      type: string
      coordinates: number[][][]
    }
    attributes: unknown
  }
  contributors: null | number[]
  is_quote_status: boolean
  retweet_count: number
  favorite_count: number
  reply_count: number
  quote_count: number
  conversation_id: number
  conversation_id_str: string
  favorited: boolean
  retweeted: boolean
  lang: string
  supplemental_language: null
  ext_views: {
    state: string
    count?: string
  }
  ext_edit_control: {
    initial: {
      edit_tweet_ids: string[]
      editable_until_msecs: string
      edits_remaining: string
      is_edit_eligible: boolean
    }
  }
  ext: {
    superFollowMetadata: {
      r: {
        ok: unknown
      }
      ttl: number
    }
    editControl: {
      r: {
        ok: {
          initial: {
            editTweetIds: string[]
            editableUntilMsecs: string
            editsRemaining: string
            isEditEligible: boolean
          }
        }
      }
      ttl: number
    }
    unmentionInfo: {
      r: {
        ok: unknown
      }
      ttl: number
    }
  }
  extended_entities?: {
    media: {
      id: number
      id_str: string
      indices: number[]
      media_url: string
      media_url_https: string
      url: string
      display_url: string
      expanded_url: string
      type: string
      original_info: {
        width: number
        height: number
        focus_rects?: {
          x: number
          y: number
          h: number
          w: number
        }[]
      }
      sizes: {
        thumb: {
          w: number
          h: number
          resize: string
        }
        small: {
          w: number
          h: number
          resize: string
        }
        large: {
          w: number
          h: number
          resize: string
        }
        medium: {
          w: number
          h: number
          resize: string
        }
      }
      features: {
        small?: {
          faces: {
            x: number
            y: number
            h: number
            w: number
          }[]
        }
        large?: {
          faces: {
            x: number
            y: number
            h: number
            w: number
          }[]
        }
        medium?: {
          faces: {
            x: number
            y: number
            h: number
            w: number
          }[]
        }
        orig?: {
          faces: {
            x: number
            y: number
            h: number
            w: number
          }[]
        }
      }
      media_key: string
      ext_sensitive_media_warning: null
      ext_media_availability: {
        status: string
      }
      ext_alt_text: null
      ext_media_color: {
        palette: {
          rgb: {
            red: number
            green: number
            blue: number
          }
          percentage: number
        }[]
      }
      ext: {
        mediaStats: {
          r:
            | string
            | {
                ok: {
                  viewCount: string
                }
              }
          ttl: number
        }
      }
      source_status_id?: number
      source_status_id_str?: string
      source_user_id?: number
      source_user_id_str?: string
      video_info?: {
        aspect_ratio: number[]
        duration_millis: number
        variants: {
          bitrate?: number
          content_type: string
          url: string
        }[]
      }
      additional_media_info?: {
        title: string
        description: string
        monetizable: boolean
        source_user: {
          id: number
          id_str: string
          name: string
          screen_name: string
          location: string
          description: string
          url: string
          entities: {
            url: {
              urls: {
                url: string
                expanded_url: string
                display_url: string
                indices: number[]
              }[]
            }
            description: {
              urls: unknown[]
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
          profile_background_image_url: string
          profile_background_image_url_https: string
          profile_background_tile: boolean
          profile_image_url: string
          profile_image_url_https: string
          profile_banner_url: string
          profile_image_extensions_sensitive_media_warning: null
          profile_image_extensions_media_availability: null
          profile_image_extensions_alt_text: null
          profile_image_extensions_media_color: {
            palette: {
              rgb: {
                red: number
                green: number
                blue: number
              }
              percentage: number
            }[]
          }
          profile_image_extensions: {
            mediaStats: {
              r: {
                missing: null
              }
              ttl: number
            }
          }
          profile_banner_extensions_sensitive_media_warning: null
          profile_banner_extensions_media_availability: null
          profile_banner_extensions_alt_text: null
          profile_banner_extensions_media_color: {
            palette: {
              rgb: {
                red: number
                green: number
                blue: number
              }
              percentage: number
            }[]
          }
          profile_banner_extensions: {
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
          ext_verified_type: string
          ext_has_nft_avatar: boolean
          ext_is_blue_verified: boolean
          ext: {
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
          }
          require_some_consent: boolean
        }
      }
    }[]
  }
  possibly_sensitive?: boolean
  possibly_sensitive_editable?: boolean
  scopes?: {
    followers: boolean
  }
  card?: {
    name: string
    url: string
    card_type_url: string
    binding_values: {
      unified_card?: {
        type: string
        string_value: string
      }
      card_url: {
        type: string
        string_value: string
        scribe_key: string
      }
      vanity_url?: {
        type: string
        string_value: string
        scribe_key: string
      }
      app_is_free?: {
        type: string
        string_value: string
      }
      app_price_currency?: {
        type: string
        string_value: string
      }
      app_price_amount?: {
        type: string
        string_value: string
      }
      domain?: {
        type: string
        string_value: string
      }
      app_num_ratings?: {
        type: string
        string_value: string
      }
      app_star_rating?: {
        type: string
        string_value: string
      }
      app_country?: {
        type: string
        string_value: string
      }
      app_name?: {
        type: string
        string_value: string
      }
      creator?: {
        type: string
        user_value: {
          id_str: string
          path: unknown[]
        }
      }
      site?: {
        type: string
        user_value: {
          id_str: string
          path: unknown[]
        }
        scribe_key: string
      }
      title?: {
        type: string
        string_value: string
      }
      description?: {
        type: string
        string_value: string
      }
      thumbnail_image_small?: {
        type: string
        image_value: {
          url: string
          width: number
          height: number
          alt: null
        }
      }
      thumbnail_image?: {
        type: string
        image_value: {
          url: string
          width: number
          height: number
          alt: null
        }
      }
      thumbnail_image_large?: {
        type: string
        image_value: {
          url: string
          width: number
          height: number
          alt: null
        }
      }
      thumbnail_image_x_large?: {
        type: string
        image_value: {
          url: string
          width: number
          height: number
          alt: null
        }
      }
      thumbnail_image_color?: {
        type: string
        image_color_value: {
          palette: {
            percentage: number
            rgb: {
              red: number
              green: number
              blue: number
            }
          }[]
        }
      }
      thumbnail_image_original?: {
        type: string
        image_value: {
          url: string
          width: number
          height: number
          alt: null
        }
      }
      summary_photo_image_small?: {
        type: string
        image_value: {
          url: string
          width: number
          height: number
          alt: null
        }
      }
      summary_photo_image?: {
        type: string
        image_value: {
          url: string
          width: number
          height: number
          alt: null
        }
      }
      summary_photo_image_large?: {
        type: string
        image_value: {
          url: string
          width: number
          height: number
          alt: null
        }
      }
      summary_photo_image_x_large?: {
        type: string
        image_value: {
          url: string
          width: number
          height: number
          alt: null
        }
      }
      summary_photo_image_color?: {
        type: string
        image_color_value: {
          palette: {
            percentage: number
            rgb: {
              red: number
              green: number
              blue: number
            }
          }[]
        }
      }
      summary_photo_image_original?: {
        type: string
        image_value: {
          url: string
          width: number
          height: number
          alt: null
        }
      }
      photo_image_full_size_small?: {
        type: string
        image_value: {
          url: string
          width: number
          height: number
          alt: null
        }
      }
      photo_image_full_size?: {
        type: string
        image_value: {
          url: string
          width: number
          height: number
          alt: null
        }
      }
      photo_image_full_size_large?: {
        type: string
        image_value: {
          url: string
          width: number
          height: number
          alt: null
        }
      }
      photo_image_full_size_x_large?: {
        type: string
        image_value: {
          url: string
          width: number
          height: number
          alt: null
        }
      }
      photo_image_full_size_color?: {
        type: string
        image_color_value: {
          palette: {
            percentage: number
            rgb: {
              red: number
              green: number
              blue: number
            }
          }[]
        }
      }
      photo_image_full_size_original?: {
        type: string
        image_value: {
          url: string
          width: number
          height: number
          alt: null
        }
      }
    }
    card_platform: {
      platform: {
        device: {
          name: string
          version: string
        }
        audience: {
          name: string
          bucket: null
        }
      }
    }
    users?: {
      '1712134879'?: {
        id: number
        id_str: string
        name: string
        screen_name: string
        location: string
        description: string
        url: string
        entities: {
          url: {
            urls: {
              url: string
              expanded_url: string
              display_url: string
              indices: number[]
            }[]
          }
          description: {
            urls: unknown[]
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
        profile_background_image_url: string
        profile_background_image_url_https: string
        profile_background_tile: boolean
        profile_image_url: string
        profile_image_url_https: string
        profile_banner_url: string
        profile_image_extensions_sensitive_media_warning: null
        profile_image_extensions_media_availability: null
        profile_image_extensions_alt_text: null
        profile_image_extensions_media_color: {
          palette: {
            rgb: {
              red: number
              green: number
              blue: number
            }
            percentage: number
          }[]
        }
        profile_image_extensions: {
          mediaStats: {
            r: {
              missing: null
            }
            ttl: number
          }
        }
        profile_banner_extensions_sensitive_media_warning: null
        profile_banner_extensions_media_availability: null
        profile_banner_extensions_alt_text: null
        profile_banner_extensions_media_color: {
          palette: {
            rgb: {
              red: number
              green: number
              blue: number
            }
            percentage: number
          }[]
        }
        profile_banner_extensions: {
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
        ext_verified_type: string
        ext_has_nft_avatar: boolean
        ext_is_blue_verified: boolean
        ext: {
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
        }
        require_some_consent: boolean
      }
      '4174180574'?: {
        id: number
        id_str: string
        name: string
        screen_name: string
        location: string
        description: string
        url: string
        entities: {
          url: {
            urls: {
              url: string
              expanded_url: string
              display_url: string
              indices: number[]
            }[]
          }
          description: {
            urls: unknown[]
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
        profile_background_image_url: string
        profile_background_image_url_https: string
        profile_background_tile: boolean
        profile_image_url: string
        profile_image_url_https: string
        profile_banner_url: string
        profile_image_extensions_sensitive_media_warning: null
        profile_image_extensions_media_availability: null
        profile_image_extensions_alt_text: null
        profile_image_extensions_media_color: {
          palette: {
            rgb: {
              red: number
              green: number
              blue: number
            }
            percentage: number
          }[]
        }
        profile_image_extensions: {
          mediaStats: {
            r: {
              missing: null
            }
            ttl: number
          }
        }
        profile_banner_extensions_sensitive_media_warning: null
        profile_banner_extensions_media_availability: null
        profile_banner_extensions_alt_text: null
        profile_banner_extensions_media_color: {
          palette: {
            rgb: {
              red: number
              green: number
              blue: number
            }
            percentage: number
          }[]
        }
        profile_banner_extensions: {
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
        ext_verified_type: string
        ext_has_nft_avatar: boolean
        ext_is_blue_verified: boolean
        ext: {
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
        }
        require_some_consent: boolean
      }
    }
  }
  conversation_control?: {
    policy: string
    conversation_owner: {
      screen_name: string
    }
  }
  limited_actions?: string
  retweeted_status_id?: number
  retweeted_status_id_str?: string
  self_thread?: {
    id: number
    id_str: string
  }
  quoted_status_id?: number
  quoted_status_id_str?: string
  quoted_status_permalink?: {
    url: string
    expanded: string
    display: string
  }
}
