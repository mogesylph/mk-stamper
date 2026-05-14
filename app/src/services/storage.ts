import type { RecordItem, VideoState } from '../types'

const RECORDS_STORAGE_KEY = 'mkstamper_records'
const VIDEO_STATE_STORAGE_KEY = 'mkstamper_video'

export const loadRecords = (): RecordItem[] => {
  try {
    const saved = localStorage.getItem(RECORDS_STORAGE_KEY)
    if (!saved) return []

    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const saveRecords = (records: RecordItem[]) => {
  try {
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records))
  } catch {
    // Ignore storage failures to keep the editor usable.
  }
}

export const clearRecords = () => {
  try {
    localStorage.removeItem(RECORDS_STORAGE_KEY)
  } catch {
    // Ignore storage failures to keep the editor usable.
  }
}

export const loadVideoState = (): VideoState | null => {
  try {
    const saved = localStorage.getItem(VIDEO_STATE_STORAGE_KEY)
    if (!saved) return null

    const parsed = JSON.parse(saved)
    if (
      parsed &&
      typeof parsed.videoId === 'string' &&
      typeof parsed.currentTime === 'number'
    ) {
      return parsed
    }

    return null
  } catch {
    return null
  }
}

export const saveVideoState = (state: VideoState) => {
  try {
    localStorage.setItem(VIDEO_STATE_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage failures to keep the editor usable.
  }
}

export const clearVideoState = () => {
  try {
    localStorage.removeItem(VIDEO_STATE_STORAGE_KEY)
  } catch {
    // Ignore storage failures to keep the editor usable.
  }
}
