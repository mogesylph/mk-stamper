import type { RecordItem } from '../types'
import { formatSeconds } from './time'

export const formatRecordsForClipboard = (records: RecordItem[]) =>
  records
    .map((record, index) =>
      [
        String(index + 1),
        formatSeconds(record.start),
        formatSeconds(record.end),
        record.title,
        record.artist
      ].join('\t')
    )
    .join('\n')

const normalizeSongText = (value: string) => value.trim().replace(/\s+/g, ' ')

const formatSetlistTime = (seconds: number) => {
  const wholeSeconds = Math.floor(seconds)
  const hours = Math.floor(wholeSeconds / 3600)
  const minutes = Math.floor((wholeSeconds % 3600) / 60)
  const secs = wholeSeconds % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return `${minutes}:${String(secs).padStart(2, '0')}`
}

export const formatSetlistForClipboard = (records: RecordItem[]) =>
  records
    .map((record) =>
      [
        formatSetlistTime(record.start),
        normalizeSongText(record.title),
        '/',
        normalizeSongText(record.artist)
      ].join(' ')
    )
    .join('\n')

export const formatUnknownSongsForClipboard = (records: RecordItem[]) =>
  records
    .map((record) =>
      [normalizeSongText(record.title), normalizeSongText(record.artist)].join('\t')
    )
    .join('\n')

export const writeClipboard = (text: string) => navigator.clipboard.writeText(text)
