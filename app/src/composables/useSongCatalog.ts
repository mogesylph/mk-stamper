import { computed, ref } from 'vue'
import type { SongEntry } from '../types'

const normalizeForSearch = (value: string) => value.trim().toLowerCase()
const normalizeSongKey = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ')

export const useSongCatalog = () => {
  const songlist = ref<SongEntry[]>([])
  const isSongCatalogLoaded = ref(false)

  const titleSuggestions = computed(() =>
    Array.from(new Set(songlist.value.map((entry) => entry.title))).sort()
  )

  const artistSuggestions = computed(() =>
    Array.from(new Set(songlist.value.map((entry) => entry.artist))).sort()
  )

  const loadSongCatalog = async () => {
    const res = await fetch('/songlist.tsv')
    if (!res.ok) {
      throw new Error(`Failed to load songlist.tsv: ${res.status}`)
    }

    const text = await res.text()
    const lines = text.trim().split('\n').slice(1)

    songlist.value = lines
      .filter((line) => line.trim())
      .map((line) => {
        const [title, artist, length] = line.split('\t')
        return {
          title,
          artist,
          length: Number(length)
        }
      })
      .filter((entry) => entry.title && entry.artist)
    isSongCatalogLoaded.value = true
  }

  const filterTitles = (query: string) => {
    const normalizedQuery = normalizeForSearch(query)
    if (!normalizedQuery) return titleSuggestions.value

    return titleSuggestions.value.filter((title) =>
      normalizeForSearch(title).includes(normalizedQuery)
    )
  }

  const filterArtists = (query: string) => {
    const normalizedQuery = normalizeForSearch(query)
    if (!normalizedQuery) return artistSuggestions.value

    return artistSuggestions.value.filter((artist) =>
      normalizeForSearch(artist).includes(normalizedQuery)
    )
  }

  const findArtistByTitle = (title: string) => {
    const match = songlist.value.find((entry) => entry.title === title)
    return match?.artist ?? null
  }

  const isUnknownSong = (title: string, artist: string) => {
    const normalizedTitle = normalizeSongKey(title)
    const normalizedArtist = normalizeSongKey(artist)

    if (!normalizedTitle || !normalizedArtist) return true
    if (!isSongCatalogLoaded.value) return false

    return !songlist.value.some(
      (entry) =>
        normalizeSongKey(entry.title) === normalizedTitle &&
        normalizeSongKey(entry.artist) === normalizedArtist
    )
  }

  return {
    songlist,
    titleSuggestions,
    artistSuggestions,
    loadSongCatalog,
    filterTitles,
    filterArtists,
    findArtistByTitle,
    isUnknownSong
  }
}
