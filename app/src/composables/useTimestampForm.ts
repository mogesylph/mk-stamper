import { ref } from 'vue'
import type { RecordInput } from '../types'

export const useTimestampForm = () => {
  const startTime = ref<number | null>(null)
  const endTime = ref<number | null>(null)
  const songTitle = ref('')
  const artist = ref('')

  const setStartFrom = (sec: number) => {
    startTime.value = Math.floor(sec)
  }

  const setEndFrom = (sec: number) => {
    endTime.value = Math.ceil(sec)
  }

  const clearForm = () => {
    startTime.value = null
    endTime.value = null
    songTitle.value = ''
    artist.value = ''
  }

  const toRecordInput = (): RecordInput => ({
    start: startTime.value,
    end: endTime.value,
    title: songTitle.value,
    artist: artist.value
  })

  return {
    startTime,
    endTime,
    songTitle,
    artist,
    setStartFrom,
    setEndFrom,
    clearForm,
    toRecordInput
  }
}
