<template>
  <div class="button-row l--flex -g:8">
    <button type="button" @click="$emit('sort-records')">開始順 ↕</button>
    <button type="button" @click="$emit('copy-records')">リスト ⧉</button>
    <button type="button" @click="$emit('copy-setlist')">セトリ ⧉</button>
    <button type="button" @click="$emit('copy-unknown-songs')">未登録 ⧉</button>
    <button type="button" class="danger-button" @click="$emit('reset-all')">リセット</button>
  </div>
</template>

<script setup lang="ts">
  defineEmits<{
    'sort-records': []
    'copy-records': []
    'copy-setlist': []
    'copy-unknown-songs': []
    'reset-all': []
  }>()
</script>

<style scoped>
  .button-row {
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 4px;
  }

  .button-row button {
    flex: 0 0 auto;
  }

  @media (max-width: 719px) {
    .button-row button {
      width: 100%;
    }
  }
</style>
