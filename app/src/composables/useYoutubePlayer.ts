import { nextTick, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import type { YouTubePlayer } from '../types'
import { loadYouTubeIframeApi } from '../services/youtube'

type UseYoutubePlayerOptions = {
  elementId?: string
  pollIntervalMs?: number
}

export const useYoutubePlayer = (options: UseYoutubePlayerOptions = {}) => {
  const elementId = options.elementId ?? 'player'
  const pollIntervalMs = options.pollIntervalMs ?? 500

  const player = shallowRef<YouTubePlayer | null>(null)
  const videoId = ref('')
  const currentTime = ref(0)
  const volume = ref(100)
  const isMuted = ref(false)
  const isReady = ref(false)

  let currentTimeIntervalId: number | null = null
  let pendingVideoId: string | null = null
  let pendingSeekTime: number | null = null
  let playerSizeObserver: ResizeObserver | null = null

  const getPlayerHostElement = () => document.getElementById(elementId)

  const getPlayerFrameElement = () => getPlayerHostElement()?.parentElement ?? null

  const getPlayerFrameSize = () => {
    const frame = getPlayerFrameElement()
    if (!frame) return { width: 640, height: 360 }

    const { width, height } = frame.getBoundingClientRect()
    return {
      width: Math.max(1, Math.round(width)),
      height: Math.max(1, Math.round(height))
    }
  }

  const syncPlayerSize = () => {
    if (!player.value?.setSize) return

    const { width, height } = getPlayerFrameSize()
    player.value.setSize(width, height)
  }

  const startPlayerSizeSync = () => {
    if (playerSizeObserver) return

    const frame = getPlayerFrameElement()
    if (!frame) return

    playerSizeObserver = new ResizeObserver(syncPlayerSize)
    playerSizeObserver.observe(frame)
    syncPlayerSize()
  }

  const stopPlayerSizeSync = () => {
    playerSizeObserver?.disconnect()
    playerSizeObserver = null
  }

  const syncVolumeState = () => {
    if (!player.value?.getVolume || !player.value?.isMuted) return

    volume.value = Math.round(player.value.getVolume())
    isMuted.value = player.value.isMuted()
  }

  const startCurrentTimePolling = () => {
    if (currentTimeIntervalId !== null) return

    currentTimeIntervalId = window.setInterval(() => {
      if (player.value?.getCurrentTime) {
        currentTime.value = Math.floor(player.value.getCurrentTime())
      }

      syncVolumeState()
    }, pollIntervalMs)
  }

  const stopCurrentTimePolling = () => {
    if (currentTimeIntervalId === null) return

    window.clearInterval(currentTimeIntervalId)
    currentTimeIntervalId = null
  }

  const loadVideoById = (id: string) => {
    videoId.value = id

    if (!player.value || !isReady.value) {
      pendingVideoId = id
      return
    }

    player.value.loadVideoById(id)
    syncVolumeState()
  }

  const seekTo = (sec: number) => {
    player.value?.seekTo(sec, true)
    player.value?.playVideo()
  }

  const seekBy = (deltaSec: number) => {
    const nextTime = Math.max(0, Math.floor(getCurrentTime() + deltaSec))
    seekTo(nextTime)
  }

  const togglePlayPause = () => {
    if (!player.value?.getPlayerState) return

    if (player.value.getPlayerState() === 1) {
      player.value.pauseVideo()
      return
    }

    player.value.playVideo()
  }

  const toggleMute = () => {
    if (!player.value?.isMuted) return

    if (player.value.isMuted()) {
      player.value.unMute()
      syncVolumeState()
      return
    }

    player.value.mute()
    syncVolumeState()
  }

  const adjustVolume = (delta: number) => {
    if (!player.value?.getVolume) return

    const nextVolume = Math.min(100, Math.max(0, player.value.getVolume() + delta))
    player.value.setVolume(nextVolume)
    if (nextVolume > 0 && player.value.isMuted?.()) {
      player.value.unMute()
    }
    syncVolumeState()
  }

  const stop = () => {
    player.value?.stopVideo()
    player.value?.cueVideoById('')
    videoId.value = ''
    currentTime.value = 0
    volume.value = 100
    isMuted.value = false
    pendingVideoId = null
    pendingSeekTime = null
  }

  const getCurrentTime = () => {
    if (!player.value?.getCurrentTime) return currentTime.value

    return player.value.getCurrentTime()
  }

  const restoreVideo = (id: string, restoredCurrentTime = 0) => {
    loadVideoById(id)

    if (player.value && isReady.value) {
      player.value.seekTo(restoredCurrentTime, true)
      return
    }

    pendingSeekTime = restoredCurrentTime
  }

  onMounted(async () => {
    await nextTick()
    const Player = await loadYouTubeIframeApi()
    const initialSize = getPlayerFrameSize()

    player.value = new Player(elementId, {
      height: String(initialSize.height),
      width: String(initialSize.width),
      videoId: '',
      events: {
        onReady: () => {
          isReady.value = true
          syncPlayerSize()
          startPlayerSizeSync()
          syncVolumeState()

          if (pendingVideoId) {
            player.value?.loadVideoById(pendingVideoId)
            pendingVideoId = null
          }

          if (pendingSeekTime !== null) {
            player.value?.seekTo(pendingSeekTime, true)
            pendingSeekTime = null
          }
        }
      }
    })

    startCurrentTimePolling()
  })

  onUnmounted(() => {
    stopCurrentTimePolling()
    stopPlayerSizeSync()
  })

  return {
    player,
    videoId,
    currentTime,
    volume,
    isMuted,
    isReady,
    loadVideoById,
    seekTo,
    seekBy,
    togglePlayPause,
    toggleMute,
    adjustVolume,
    stop,
    getCurrentTime,
    restoreVideo
  }
}
