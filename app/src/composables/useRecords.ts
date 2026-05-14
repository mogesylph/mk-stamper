import { ref } from 'vue'
import type { RecordInput, RecordItem } from '../types'

export const useRecords = () => {
  const records = ref<RecordItem[]>([])

  const addRecord = (input: RecordInput) => {
    const title = input.title.trim()
    const artist = input.artist.trim()

    if (!title || !artist) return false

    records.value.push({
      start: input.start ?? 0,
      end: input.end ?? 0,
      title,
      artist
    })

    return true
  }

  const removeRecord = (index: number) => {
    records.value.splice(index, 1)
  }

  const sortByStart = () => {
    records.value.sort((a, b) => a.start - b.start)
  }

  const resetRecords = () => {
    records.value = []
  }

  return {
    records,
    addRecord,
    removeRecord,
    sortByStart,
    resetRecords
  }
}
