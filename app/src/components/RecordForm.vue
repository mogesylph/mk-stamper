<template>
  <section class="record-form l--flex -g:10 -ai:center" @keydown.esc="hideSuggestions">
    <div class="field compact-field l--flex -ai:center -g:8">
      <label for="start-time">開始(秒):</label>
      <input
        id="start-time"
        :value="startTime ?? ''"
        type="number"
        class="time-input"
        @input="emitStartTime"
      />
      <button
        type="button"
        class="icon-button"
        title="現在時刻を開始に設定"
        @click="$emit('set-start')"
      >
        🕒
      </button>
    </div>

    <div class="field compact-field l--flex -ai:center -g:8">
      <label for="end-time">終了(秒):</label>
      <input
        id="end-time"
        :value="endTime ?? ''"
        type="number"
        class="time-input"
        @input="emitEndTime"
      />
      <button
        type="button"
        class="icon-button"
        title="現在時刻を終了に設定"
        @click="$emit('set-end')"
      >
        🕒
      </button>
    </div>

    <div class="field text-field suggestion-field l--flex -ai:center -g:8">
      <label for="song-title">曲名:</label>
      <div class="suggestion-input">
        <input
          id="song-title"
          ref="songTitleInput"
          :value="songTitle"
          type="text"
          @focus="showTitleList = true"
          @blur="hideTitleListLater"
          @input="emitSongTitle"
        />
        <ul v-if="showTitleList && filteredTitleSuggestions.length" class="suggestion-list">
          <li
            v-for="item in filteredTitleSuggestions"
            :key="item"
            @mousedown.prevent="selectTitle(item)"
          >
            {{ item }}
          </li>
        </ul>
      </div>
    </div>

    <div class="field text-field suggestion-field l--flex -ai:center -g:8">
      <label for="artist">歌手名:</label>
      <div class="suggestion-input">
        <input
          id="artist"
          ref="artistInput"
          :value="artist"
          type="text"
          @focus="showArtistList = true"
          @blur="hideArtistListLater"
          @input="emitArtist"
        />
        <ul v-if="showArtistList && filteredArtistSuggestions.length" class="suggestion-list">
          <li
            v-for="item in filteredArtistSuggestions"
            :key="item"
            @mousedown.prevent="selectArtist(item)"
          >
            {{ item }}
          </li>
        </ul>
      </div>
    </div>

    <button type="button" class="submit-button" @click="$emit('add-record')">登録</button>
  </section>

  <p class="shortcut-hint status-line">
    <span>K 再生/停止 / M ミュート / J -5秒 / L +5秒</span>
    <span>Shift+↑ 音量UP / Shift+↓ 音量DOWN / Cmd/Ctrl+Enter 登録</span>
    <span>Cmd/Ctrl+Shift+1-4 開始・終了・曲名・歌手名</span>
  </p>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  defineProps<{
    startTime: number | null
    endTime: number | null
    songTitle: string
    artist: string
    filteredTitleSuggestions: string[]
    filteredArtistSuggestions: string[]
  }>()

  const emit = defineEmits<{
    'update:startTime': [value: number | null]
    'update:endTime': [value: number | null]
    'update:songTitle': [value: string]
    'update:artist': [value: string]
    'set-start': []
    'set-end': []
    'add-record': []
    'select-title': [value: string]
    'select-artist': [value: string]
  }>()

  const showTitleList = ref(false)
  const showArtistList = ref(false)
  const songTitleInput = ref<HTMLInputElement | null>(null)
  const artistInput = ref<HTMLInputElement | null>(null)

  const getNumberValue = (event: Event) => {
    const value = (event.target as HTMLInputElement).value
    return value === '' ? null : Number(value)
  }

  const getTextValue = (event: Event) => (event.target as HTMLInputElement).value

  const emitStartTime = (event: Event) => {
    emit('update:startTime', getNumberValue(event))
  }

  const emitEndTime = (event: Event) => {
    emit('update:endTime', getNumberValue(event))
  }

  const emitSongTitle = (event: Event) => {
    emit('update:songTitle', getTextValue(event))
    showTitleList.value = true
  }

  const emitArtist = (event: Event) => {
    emit('update:artist', getTextValue(event))
    showArtistList.value = true
  }

  const hideTitleListLater = () => {
    window.setTimeout(() => {
      showTitleList.value = false
    }, 200)
  }

  const hideArtistListLater = () => {
    window.setTimeout(() => {
      showArtistList.value = false
    }, 200)
  }

  const hideSuggestions = () => {
    showTitleList.value = false
    showArtistList.value = false
  }

  const selectTitle = (title: string) => {
    emit('select-title', title)
    showTitleList.value = false
  }

  const selectArtist = (artist: string) => {
    emit('select-artist', artist)
    showArtistList.value = false
  }

  const focusTitle = () => {
    songTitleInput.value?.focus()
    showTitleList.value = true
  }

  const focusArtist = () => {
    artistInput.value?.focus()
    showArtistList.value = true
  }

  defineExpose({
    focusTitle,
    focusArtist
  })
</script>

<style scoped>
  .record-form {
    flex-wrap: wrap;
    align-items: stretch;
    gap: 0.5rem;
    padding: 7px 8px;
    border: 1px solid var(--divider);
    border-radius: var(--bdrs--20);
    background: var(--base-2);
  }

  .field {
    flex: 0 1 auto;
    min-width: 0;
  }

  .compact-field {
    flex: 0 0 auto;
  }

  .text-field {
    flex: 1 1 14rem;
    min-width: 14rem;
  }

  .suggestion-field {
    position: relative;
  }

  .field label {
    flex: 0 0 auto;
    color: var(--text-2);
    font-size: 0.78rem;
    line-height: 1;
  }

  .suggestion-input {
    flex: 1;
    min-width: 0;
    position: relative;
  }

  .text-field input,
  .suggestion-input input {
    width: 100%;
  }

  .time-input {
    width: 4.25rem;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .icon-button {
    padding: 0.22em 0.42em;
  }

  .suggestion-list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 10;
    max-height: 200px;
    overflow-y: auto;
    margin: 0;
    padding: 0;
    list-style: none;
    border: 1px solid var(--divider);
    border-radius: 0 0 var(--bdrs--20) var(--bdrs--20);
    background: var(--base);
    box-shadow: 0 12px 24px rgba(47, 42, 50, 0.12);
  }

  .suggestion-list li {
    padding: 3px 6px;
    cursor: pointer;
  }

  .suggestion-list li:hover {
    background-color: var(--base-3);
  }

  .submit-button {
    flex: 0 0 auto;
    margin-left: auto;
    min-width: 4.8rem;
  }

  .shortcut-hint {
    display: grid;
    gap: 0.15rem;
    margin: 0;
    padding-inline: 0.15rem;
    text-align: left;
    line-height: 1.35;
  }

  @media (max-width: 1120px) {
    .record-form {
      align-items: flex-start;
    }

    .submit-button {
      margin-left: 0;
    }

  }

  @media (max-width: 719px) {
    .record-form {
      display: grid;
      grid-template-columns: 1fr;
    }

    .field,
    .text-field,
    .compact-field {
      width: 100%;
    }

    .field {
      display: grid;
      grid-template-columns: 4.5rem minmax(0, 1fr) auto;
      align-items: center;
      gap: 0.45rem;
    }

    .text-field {
      grid-template-columns: 4.5rem minmax(0, 1fr);
    }

    .submit-button {
      width: 100%;
    }

    .shortcut-hint {
      gap: 0.25rem;
    }
  }
</style>
