<template>
  <section class="player-panel l--stack -g:10">
    <div class="video-input-row l--flex -ai:center -g:10">
      <img class="brand-logo" src="/logo.png" alt="mkstamper" />
      <div class="input-action-row l--flex -ai:center -g:10">
        <input
          :value="videoInput"
          type="text"
          placeholder="YouTubeのURLまたはvideoId"
          class="video-input"
          @input="emitVideoInput"
          @keyup.enter="$emit('load-video')"
        />
        <button type="button" class="action-button" @click="$emit('load-video')">読み込み</button>
      </div>
    </div>

    <div class="player-frame">
      <div id="player" class="player-mount"></div>
    </div>

    <div class="current-time-row l--flex -ai:center -g:8">
      <div class="player-controls l--flex -ai:center -g:5">
        <button
          type="button"
          class="icon-button player-control-button"
          title="5秒戻る"
          @click="$emit('seek-backward')"
        >
          -5
        </button>
        <button
          type="button"
          class="icon-button player-control-button"
          title="再生・停止"
          @click="$emit('toggle-play-pause')"
        >
          再生
        </button>
        <button
          type="button"
          class="icon-button player-control-button"
          title="5秒進む"
          @click="$emit('seek-forward')"
        >
          +5
        </button>
        <button
          type="button"
          class="icon-button player-control-button"
          title="ミュート切り替え"
          @click="$emit('toggle-mute')"
        >
          音
        </button>
        <span class="player-volume-indicator status-line" :title="isMuted ? 'ミュート中' : `音量 ${volume}`">
          {{ isMuted ? '×' : volume }}
        </span>
      </div>

      <div class="current-time status-line">
        現在の再生時間: {{ formattedCurrentTime }} ({{ currentTime }} sec)
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  defineProps<{
    videoInput: string
    currentTime: number
    formattedCurrentTime: string
    volume: number
    isMuted: boolean
  }>()

  const emit = defineEmits<{
    'update:videoInput': [value: string]
    'load-video': []
    'seek-backward': []
    'toggle-play-pause': []
    'seek-forward': []
    'toggle-mute': []
  }>()

  const emitVideoInput = (event: Event) => {
    emit('update:videoInput', (event.target as HTMLInputElement).value)
  }
</script>

<style scoped>
  .video-input-row {
    flex-wrap: wrap;
  }

  .brand-logo {
    width: auto;
    height: 36px;
    flex: 0 0 auto;
    display: block;
    object-fit: contain;
  }

  .input-action-row {
    flex: 1 1 20rem;
    min-width: 0;
  }

  .video-input {
    flex: 1 1 auto;
    min-width: 0;
  }

  .player-frame {
    width: 100%;
    aspect-ratio: 16 / 9;
    min-height: min(58svh, 25rem);
    height: var(--player-frame-size, auto);
    overflow: hidden;
    background: #000;
  }

  .player-mount,
  .player-frame :deep(iframe) {
    display: block;
    width: 100%;
    height: 100%;
  }

  .current-time-row {
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .player-controls {
    flex: 0 0 auto;
  }

  .current-time {
    flex: 1 1 auto;
    min-width: 14rem;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .player-control-button {
    min-width: 2.5rem;
    padding: 0.16rem 0.38rem;
    font-size: 0.78rem;
  }

  .player-volume-indicator {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.5rem;
    padding: 0;
    color: var(--text-2);
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .action-button {
    flex: 0 0 auto;
    min-width: 5.5rem;
  }

  @media (max-width: 639px) {
    .video-input-row {
      align-items: stretch;
      gap: 0.45rem;
    }

    .brand-logo {
      height: 32px;
    }

    .input-action-row {
      width: 100%;
      gap: 0.45rem;
    }

    .action-button {
      width: auto;
      min-width: 4.75rem;
    }

    .player-frame {
      min-height: min(52svh, 18rem);
    }

    .current-time {
      min-width: 0;
      text-align: left;
    }
  }
</style>
