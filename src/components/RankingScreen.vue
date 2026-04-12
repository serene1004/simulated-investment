<script setup lang="ts">
import type { PropType } from 'vue'

import type { RankingEntry } from '../types/game'

const props = defineProps({
  ranking: { type: Array as PropType<RankingEntry[]>, required: true },
})

defineEmits<{
  back: []
  clear: []
}>()

const getToneClass = (index: number) => {
  if (index === 0) {
    return 'accent-gold'
  }

  if (index === 1) {
    return 'accent-red'
  }

  if (index === 2) {
    return 'accent-blue'
  }

  return ''
}
</script>

<template>
  <div class="screen-shell screen-ranking">
    <section class="panel screen-panel scene-panel">
      <div class="screen-stack">
        <p class="eyebrow">TOP 10</p>
        <h1>랭킹 보드</h1>
        <p class="screen-copy">좋은 성적으로 끝낸 플레이 기록을 여기서 볼 수 있어요.</p>

        <div class="screen-divider" aria-hidden="true"></div>

        <div v-if="props.ranking.length > 0" class="feature-stack ranking-list">
          <article
            v-for="(entry, index) in props.ranking"
            :key="`${entry.nickname}-${index}`"
            class="feature-panel ranking-list-item"
            :class="getToneClass(index)"
          >
            <div class="ranking-list-head">
              <span>#{{ index + 1 }} {{ entry.nickname }}</span>
              <strong>{{ entry.score.toLocaleString() }} pt</strong>
            </div>
            <p class="ranking-list-meta">{{ entry.assets.toLocaleString() }}원 · {{ entry.playedAt }}</p>
          </article>
        </div>

        <article v-else class="feature-panel accent-blue ranking-empty-panel">
          <span>아직 기록이 없어요</span>
          <strong>한 판 끝내고 첫 기록을 남겨보세요.</strong>
        </article>

        <div class="screen-divider" aria-hidden="true"></div>

        <div class="screen-actions">
          <button class="ranking-home-button" @click="$emit('back')">
            <svg class="ranking-home-icon" viewBox="0 0 20 20" aria-hidden="true">
              <path
                d="M3.5 8.4 10 3.3l6.5 5.1v7.1a1 1 0 0 1-1 1h-3.6v-4.3H8.1v4.3H4.5a1 1 0 0 1-1-1V8.4Z"
                fill="currentColor"
              />
            </svg>
            <span>홈으로</span>
          </button>
          <button class="secondary-button" :disabled="props.ranking.length === 0" @click="$emit('clear')">기록 비우기</button>
        </div>
      </div>
    </section>
  </div>
</template>
