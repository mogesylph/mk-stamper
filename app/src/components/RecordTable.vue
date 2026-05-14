<template>
  <section class="record-table surface-card">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>開始</th>
          <th>終了</th>
          <th>曲名</th>
          <th>歌手名</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in records"
          :key="index"
          :class="{ 'unknown-song': isUnknownSong(item.title, item.artist) }"
        >
          <td>{{ index + 1 }}</td>
          <td>
            <div class="time-cell l--flex -ai:center -g:5">
              <button
                type="button"
                class="icon-button"
                title="開始時刻から再生"
                @click="$emit('seek-to', item.start)"
              >
                ▶
              </button>
              <input v-model.number="item.start" type="number" class="time-input" />
              <button
                type="button"
                class="icon-button"
                title="現在時刻を開始に設定"
                @click="item.start = currentTime"
              >
                🕒
              </button>
            </div>
          </td>
          <td>
            <div class="time-cell l--flex -ai:center -g:5">
              <button
                type="button"
                class="icon-button"
                title="終了時刻から再生"
                @click="$emit('seek-to', item.end)"
              >
                ▶
              </button>
              <input v-model.number="item.end" type="number" class="time-input" />
              <button
                type="button"
                class="icon-button"
                title="現在時刻を終了に設定"
                @click="item.end = currentTime"
              >
                🕒
              </button>
            </div>
          </td>
          <td>
            <input v-model="item.title" type="text" />
          </td>
          <td>
            <input v-model="item.artist" type="text" />
          </td>
          <td>
            <button
              type="button"
              class="delete-button"
              title="削除"
              aria-label="削除"
              @click="$emit('remove-record', index)"
            >
              ✕
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup lang="ts">
  import type { RecordItem } from '../types'

  defineProps<{
    records: RecordItem[]
    currentTime: number
    isUnknownSong: (title: string, artist: string) => boolean
  }>()

  defineEmits<{
    'seek-to': [sec: number]
    'remove-record': [index: number]
  }>()
</script>

<style scoped>
  .record-table {
    flex: 1;
    overflow: auto;
    min-height: 0;
    padding: 4px 6px;
  }

  table {
    width: 100%;
    min-width: 44rem;
    border-collapse: collapse;
  }

  th,
  td {
    padding: 6px 5px;
    border-bottom: 1px solid var(--divider);
    text-align: left;
    vertical-align: middle;
    white-space: nowrap;
  }

  th {
    color: var(--text-2);
    font-size: 0.75rem;
    font-weight: 700;
  }

  tr:hover {
    background-color: var(--base-2);
  }

  .unknown-song,
  .unknown-song:hover {
    background-color: color-mix(in srgb, var(--accent) 10%, white);
  }

  input {
    width: 100%;
  }

  .time-input {
    width: 4.8rem;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  td input[type='text'] {
    min-width: 8rem;
  }

  .icon-button {
    padding: 0.18em 0.32em;
  }

  .delete-button {
    padding: 0.18em 0.38em;
    min-width: 2rem;
    color: #fffaf8;
    background: color-mix(in srgb, #b7655a 64%, white);
    border-color: color-mix(in srgb, #b7655a 72%, white);
    font-weight: 700;
  }

  .delete-button:hover {
    color: #fffdfc;
    background: #b7655a;
    border-color: #b7655a;
  }

  .time-cell {
    min-width: max-content;
  }

  @media (max-width: 959px) {
    table {
      min-width: 42rem;
    }
  }
</style>
