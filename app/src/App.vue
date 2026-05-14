<template>
  <div id="app" class="app-root">
    <div class="app-shell l--stack -g:15">
      <div class="layout l--grid -g:15">
        <main class="video-area l--stack -g:10">
          <PlayerPanel
            v-model:video-input="videoInput"
            :current-time="currentTime"
            :formatted-current-time="formattedCurrentTime"
            :volume="volume"
            :is-muted="isMuted"
            @load-video="loadVideo"
            @seek-backward="seekBy(-5)"
            @toggle-play-pause="togglePlayPause"
            @seek-forward="seekBy(5)"
            @toggle-mute="toggleMute"
          />

          <RecordForm
            ref="recordFormRef"
            v-model:start-time="startTime"
            v-model:end-time="endTime"
            v-model:song-title="songTitle"
            v-model:artist="artist"
            :filtered-title-suggestions="filteredTitleSuggestions"
            :filtered-artist-suggestions="filteredArtistSuggestions"
            @set-start="setStart"
            @set-end="setEnd"
            @add-record="handleAddRecord"
            @select-title="selectTitle"
            @select-artist="selectArtist"
          />
        </main>

        <aside class="records-area l--stack -g:10">
          <RecordTable
            :records="records"
            :current-time="currentTime"
            :is-unknown-song="isUnknownSong"
            @seek-to="seekTo"
            @remove-record="removeRecord"
          />

          <ActionBar
            @sort-records="sortByStart"
            @copy-records="copyRecords"
            @copy-setlist="copySetlist"
            @copy-unknown-songs="copyUnknownSongs"
            @reset-all="resetAll"
          />
        </aside>
      </div>

      <footer class="app-footer">
        <span>© 2026 moge / 個人制作の非公式ツール</span>
        <button type="button" class="about-button" @click="showAbout = true">About</button>
      </footer>
    </div>

    <div v-if="showAbout" class="about-overlay" role="presentation" @click.self="showAbout = false">
      <section
        class="about-dialog surface-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
      >
        <div class="about-header">
          <h2 id="about-title">About mk-stamper</h2>
          <button
            type="button"
            class="icon-button about-close"
            aria-label="閉じる"
            @click="showAbout = false"
          >
            ×
          </button>
        </div>

        <div class="about-body l--stack -g:8">
          <p>
            mk-stamper は、柚羽まくらさんの歌枠のタイムスタンプを記録しやすくするために作った個人制作の非公式ツールです。
          </p>
          <p>Codex を使ったバイブコーディングの検証として制作しています。</p>
          <p>
            柚羽まくらさん本人、所属先、YouTube とは関係ありません。動画・楽曲の権利は各権利者に帰属します。
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
  import ActionBar from './components/ActionBar.vue'
  import PlayerPanel from './components/PlayerPanel.vue'
  import RecordForm from './components/RecordForm.vue'
  import RecordTable from './components/RecordTable.vue'
  import { useRecords } from './composables/useRecords'
  import { useSongCatalog } from './composables/useSongCatalog'
  import { useTimestampForm } from './composables/useTimestampForm'
  import { useYoutubePlayer } from './composables/useYoutubePlayer'
  import {
    formatRecordsForClipboard,
    formatSetlistForClipboard,
    formatUnknownSongsForClipboard,
    writeClipboard
  } from './services/clipboard'
  import {
    clearRecords,
    clearVideoState,
    loadRecords,
    loadVideoState,
    saveRecords,
    saveVideoState
  } from './services/storage'
  import { formatSeconds } from './services/time'
  import { extractVideoId } from './services/youtube'

  const videoInput = ref('')
  const showAbout = ref(false)
  const recordFormRef = ref<InstanceType<typeof RecordForm> | null>(null)
  const errorState = ref({
    hasError: false,
    message: ''
  })

  const {
    videoId,
    currentTime,
    volume,
    isMuted,
    loadVideoById,
    seekTo,
    seekBy,
    togglePlayPause,
    toggleMute,
    adjustVolume,
    stop,
    getCurrentTime,
    restoreVideo
  } = useYoutubePlayer({
    elementId: 'player'
  })
  const {
    startTime,
    endTime,
    songTitle,
    artist,
    setStartFrom,
    setEndFrom,
    clearForm,
    toRecordInput
  } = useTimestampForm()
  const { records, addRecord, removeRecord, sortByStart, resetRecords } = useRecords()
  const { loadSongCatalog, filterTitles, filterArtists, findArtistByTitle, isUnknownSong } =
    useSongCatalog()

  const formattedCurrentTime = computed(() => formatSeconds(currentTime.value))
  const filteredTitleSuggestions = computed(() => filterTitles(songTitle.value))
  const filteredArtistSuggestions = computed(() => filterArtists(artist.value))
  let isRestoringRecords = true

  const showError = (message: string) => {
    errorState.value = {
      hasError: true,
      message
    }

    alert(message)
  }

  const loadVideo = () => {
    if (!videoInput.value) {
      showError('YouTubeのURLまたはvideoIdを入力してください')
      return
    }

    const id = extractVideoId(videoInput.value)
    if (!id) {
      showError('無効なYouTube URLまたはvideoIdです')
      return
    }

    loadVideoById(id)
    videoInput.value = ''
  }

  const setStart = () => {
    setStartFrom(currentTime.value)
  }

  const setEnd = () => {
    setEndFrom(currentTime.value)
  }

  const handleAddRecord = () => {
    const added = addRecord(toRecordInput())
    if (added) clearForm()
  }

  const isModifierShortcut = (event: KeyboardEvent) => event.metaKey || event.ctrlKey

  const isEditableTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false
    if (target.isContentEditable) return true

    return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  }

  const handleGlobalKeydown = (event: KeyboardEvent) => {
    if (event.isComposing || event.keyCode === 229) return

    const key = event.key.toLowerCase()

    if (showAbout.value && key === 'escape') {
      event.preventDefault()
      showAbout.value = false
      return
    }

    const isModifier = isModifierShortcut(event)

    if (isModifier) {
      if (event.shiftKey && key === '1') {
        event.preventDefault()
        setStart()
        return
      }

      if (event.shiftKey && key === '2') {
        event.preventDefault()
        setEnd()
        return
      }

      if (event.shiftKey && key === '3') {
        event.preventDefault()
        recordFormRef.value?.focusTitle()
        return
      }

      if (event.shiftKey && key === '4') {
        event.preventDefault()
        recordFormRef.value?.focusArtist()
        return
      }

      if (key === 'enter') {
        event.preventDefault()
        handleAddRecord()
      }

      return
    }

    if (isEditableTarget(event.target)) return

    if (event.shiftKey && key === 'arrowup') {
      event.preventDefault()
      adjustVolume(5)
      return
    }

    if (event.shiftKey && key === 'arrowdown') {
      event.preventDefault()
      adjustVolume(-5)
      return
    }

    if (key === 'k') {
      event.preventDefault()
      togglePlayPause()
      return
    }

    if (key === 'j') {
      event.preventDefault()
      seekBy(-5)
      return
    }

    if (key === 'l') {
      event.preventDefault()
      seekBy(5)
      return
    }

    if (key === 'm') {
      event.preventDefault()
      toggleMute()
    }
  }

  const selectTitle = (title: string) => {
    songTitle.value = title
  }

  const selectArtist = (selectedArtist: string) => {
    artist.value = selectedArtist
  }

  watch(songTitle, (newTitle) => {
    const matchedArtist = findArtistByTitle(newTitle)
    if (matchedArtist) artist.value = matchedArtist
  })

  watch(
    records,
    (newRecords) => {
      if (isRestoringRecords) return
      saveRecords(newRecords)
    },
    { deep: true }
  )

  const saveCurrentVideoState = () => {
    if (!videoId.value) return

    saveVideoState({
      videoId: videoId.value,
      currentTime: getCurrentTime()
    })
  }

  const copyRecords = () => {
    writeClipboard(formatRecordsForClipboard(records.value)).catch(() => {
      showError('コピーに失敗しました')
    })
  }

  const copySetlist = () => {
    writeClipboard(formatSetlistForClipboard(records.value)).catch(() => {
      showError('コピーに失敗しました')
    })
  }

  const copyUnknownSongs = () => {
    const unknownRecords = records.value.filter((record) =>
      isUnknownSong(record.title, record.artist)
    )

    if (!unknownRecords.length) {
      alert('未登録の曲はありません')
      return
    }

    writeClipboard(formatUnknownSongsForClipboard(unknownRecords)).catch(() => {
      showError('コピーに失敗しました')
    })
  }

  const resetAll = () => {
    if (!confirm('すべてのデータを削除してリセットします。よろしいですか？')) return

    isRestoringRecords = true
    resetRecords()
    videoInput.value = ''
    clearForm()
    clearRecords()
    clearVideoState()
    stop()
    nextTick(() => {
      isRestoringRecords = false
    })
  }

  onMounted(() => {
    records.value = loadRecords()
    isRestoringRecords = false

    const savedVideoState = loadVideoState()
    if (savedVideoState?.videoId) {
      videoInput.value = savedVideoState.videoId
      restoreVideo(savedVideoState.videoId, savedVideoState.currentTime ?? 0)
    }

    loadSongCatalog().catch((error) => {
      console.error('Failed to load songlist:', error)
      showError('曲リストの読み込みに失敗しました')
    })

    window.addEventListener('keydown', handleGlobalKeydown)
    window.addEventListener('beforeunload', saveCurrentVideoState)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleGlobalKeydown)
    window.removeEventListener('beforeunload', saveCurrentVideoState)
  })
</script>

<style scoped>
  .app-root {
    min-height: 100svh;
  }

  .app-shell {
    width: 100%;
    min-height: 100svh;
    padding: 12px;
  }

  .layout {
    flex: 1;
    min-height: 0;
    grid-template-columns: 1fr;
  }

  .video-area,
  .records-area {
    min-width: 0;
  }

  .video-area {
    align-content: start;
  }

  .records-area {
    min-height: 0;
  }

  .app-footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: var(--text-2);
    font-size: 0.75rem;
    line-height: 1.3;
  }

  .about-button {
    border: 0;
    padding: 0;
    color: var(--brand);
    background: transparent;
    font-size: inherit;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .about-button:hover {
    color: #68402a;
    background: transparent;
  }

  .about-overlay {
    position: fixed;
    inset: 0;
    z-index: 10;
    display: grid;
    place-items: center;
    padding: 16px;
    background: rgba(36, 29, 26, 0.36);
  }

  .about-dialog {
    width: min(100%, 520px);
    padding: 14px;
  }

  .about-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .about-header h2 {
    margin: 0;
    font-size: 1rem;
  }

  .about-close {
    flex: 0 0 auto;
    width: 2rem;
    height: 2rem;
    padding: 0;
    font-size: 1.2rem;
    line-height: 1;
  }

  .about-body p {
    margin: 0;
    color: var(--text);
    font-size: 0.9rem;
  }

  @media (max-width: 959px) {
    .records-area {
      overflow: visible;
    }
  }

  @media (min-width: 960px) {
    .app-shell {
      padding: 14px 16px;
    }

    .layout {
      grid-template-columns: minmax(0, 6fr) minmax(0, 4fr);
      align-items: start;
    }

    .video-area {
      --player-frame-size: min(
        calc((100vw - 32px - 15px) * 0.6 * 0.5625),
        calc(100svh - 11rem)
      );
    }

    .records-area {
      overflow: hidden;
    }
  }
</style>
