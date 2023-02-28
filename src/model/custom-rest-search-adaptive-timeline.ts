export type CustomRestSearchAdaptiveTimeline =
  | string
  | {
      addEntries?: {
        entries: {
          entryId: string
          sortIndex: string
          content: {
            item?: {
              content: {
                tweet?: {
                  id: string
                  displayType: string
                  highlights?: {
                    textHighlights: {
                      startIndex: number
                      endIndex: number
                    }[]
                  }
                  promotedMetadata?: {
                    advertiserId: string
                    impressionId: string
                    disclosureType: string
                    experimentValues: {
                      website_card_variation?: string
                    }
                    impressionString?: string
                    clickTrackingInfo: {
                      urlParams: {
                        twclid: string
                      }
                    }
                    promotedTrendId?: string
                  }
                }
                user?: {
                  id: string
                  displayType: string
                }
              }
              clientEventInfo: {
                component: string
                element: string
                details: {
                  timelinesDetails: {
                    controllerData: string
                  }
                }
              }
              feedbackInfo?: {
                feedbackKeys: string[]
              }
            }
            operation?: {
              cursor: {
                value: string
                cursorType: string
              }
            }
            timelineModule?: {
              items: {
                entryId: string
                item: {
                  content: {
                    user: {
                      id: string
                      displayType: string
                    }
                  }
                  clientEventInfo: {
                    component: string
                    element: string
                    details: {
                      timelinesDetails: {
                        controllerData: string
                      }
                    }
                  }
                }
              }[]
              displayType: string
              header: {
                text: string
                sticky: boolean
                displayType: string
              }
              footer: {
                text: string
                landingUrl: {
                  urlType: string
                  url: string
                }
                displayType: string
              }
              clientEventInfo: {
                component: string
                element: string
              }
            }
          }
        }[]
      }
      replaceEntry?: {
        entryIdToReplace: string
        entry: {
          entryId: string
          sortIndex: string
          content: {
            operation: {
              cursor: {
                value: string
                cursorType: string
              }
            }
          }
        }
      }
      clearCache?: unknown
      terminateTimeline?: {
        direction: string
      }
    }[]
  | {
      feedbackActions: {
        '976059420': {
          feedbackType: string
          prompt: string
          confirmation: string
          hasUndoAction: boolean
          confirmationDisplayType: string
          clientEventInfo: {
            component: string
            element: string
            action: string
          }
        }
        '-106689315': {
          feedbackType: string
          prompt: string
          confirmation: string
          childKeys: string[]
          hasUndoAction: boolean
          confirmationDisplayType: string
          clientEventInfo: {
            component: string
            element: string
            action: string
          }
          icon: string
        }
        '-1987183989': {
          feedbackType: string
          prompt: string
          confirmation: string
          hasUndoAction: boolean
          confirmationDisplayType: string
          clientEventInfo: {
            component: string
            element: string
            action: string
          }
        }
      }
    }
