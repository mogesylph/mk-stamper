export interface SongEntry {
  title: string
  artist: string
  length: number
}

export interface RecordItem {
  start: number
  end: number
  title: string
  artist: string
}

export interface RecordInput {
  start: number | null
  end: number | null
  title: string
  artist: string
}

export interface VideoState {
  videoId: string
  currentTime: number
}

export interface YouTubePlayer {
  loadVideoById(videoId: string): void
  cueVideoById(videoId: string): void
  seekTo(seconds: number, allowSeekAhead: boolean): void
  playVideo(): void
  pauseVideo(): void
  stopVideo(): void
  mute(): void
  unMute(): void
  isMuted(): boolean
  getVolume(): number
  setVolume(volume: number): void
  getPlayerState(): number
  getCurrentTime(): number
  setSize(width: number, height: number): void
}

export interface YouTubePlayerConstructor {
  new (
    element: string | HTMLElement,
    options: {
      height: string
      width: string
      videoId: string
      events: {
        onReady: () => void
      }
    }
  ): YouTubePlayer
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void
    YT?: {
      Player: YouTubePlayerConstructor
    }
  }
}
