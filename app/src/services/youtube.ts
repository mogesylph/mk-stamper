import type { YouTubePlayerConstructor } from '../types'

const YOUTUBE_IFRAME_API_SRC = 'https://www.youtube.com/iframe_api'
const YOUTUBE_IFRAME_API_SCRIPT_ID = 'youtube-iframe-api'

let iframeApiPromise: Promise<YouTubePlayerConstructor> | null = null

export const extractVideoId = (input: string): string | null => {
  try {
    const url = new URL(input)
    const id = url.searchParams.get('v')
    if (id) return id
  } catch {
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input
  }

  return null
}

export const loadYouTubeIframeApi = (): Promise<YouTubePlayerConstructor> => {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT.Player)
  }

  if (iframeApiPromise) {
    return iframeApiPromise
  }

  iframeApiPromise = new Promise((resolve) => {
    const previousReady = window.onYouTubeIframeAPIReady

    window.onYouTubeIframeAPIReady = () => {
      previousReady?.()
      resolve(window.YT!.Player)
    }

    if (!document.getElementById(YOUTUBE_IFRAME_API_SCRIPT_ID)) {
      const tag = document.createElement('script')
      tag.id = YOUTUBE_IFRAME_API_SCRIPT_ID
      tag.src = YOUTUBE_IFRAME_API_SRC
      document.body.appendChild(tag)
    }
  })

  return iframeApiPromise
}
