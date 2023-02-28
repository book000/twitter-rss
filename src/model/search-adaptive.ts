import { CustomRestSearchAdaptiveTimeline } from './custom-rest-search-adaptive-timeline'
import { CustomRestSearchAdaptiveTweet } from './custom-rest-search-adaptive-tweet'
import { CustomRestSearchAdaptiveUser } from './custom-rest-search-adaptive-user'

export interface RestSearchAdaptiveResponse {
  globalObjects: {
    tweets: {
      [key: string]: CustomRestSearchAdaptiveTweet
    }
    users: {
      [key: string]: CustomRestSearchAdaptiveUser
    }
    /*
    moments: {
      [key: string]: CustomRestSearchAdaptiveMoment
    }
    cards: {
      [key: string]: CustomRestSearchAdaptiveCard
    }
    places: {
      [key: string]: CustomRestSearchAdaptivePlace
    }
    media: {
      [key: string]: CustomRestSearchAdaptiveMedia
    }
    broadcasts: {
      [key: string]: CustomRestSearchAdaptiveBroadcast
    }
    topics: {
      [key: string]: CustomRestSearchAdaptiveTopic
    }
    lists: {
      [key: string]: CustomRestSearchAdaptiveList
    }
    */
  }
  timeline: {
    [key: string]: CustomRestSearchAdaptiveTimeline
  }
}
