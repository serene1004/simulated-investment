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
  <div class="ranking-screen-shell">
    <section class="panel hero-panel ranking-panel scene-panel">
      <div class="hero-stack">
        <p class="eyebrow">TOP 10</p>
        <h1>랭킹 보드</h1>
        <p class="hero-copy">좋은 성적으로 끝낸 플레이 기록을 여기서 볼 수 있어요.</p>

        <div class="hero-divider" aria-hidden="true"></div>

        <div v-if="props.ranking.length > 0" class="hero-card-stack ranking-card-stack">
          <article
            v-for="(entry, index) in props.ranking"
            :key="`${entry.nickname}-${index}`"
            class="feature-card ranking-card"
            :class="getToneClass(index)"
          >
            <div class="ranking-card-head">
              <span>#{{ index + 1 }} {{ entry.nickname }}</span>
              <strong>{{ entry.score.toLocaleString() }} pt</strong>
            </div>
            <p class="ranking-card-meta">{{ entry.assets.toLocaleString() }}원 · {{ entry.playedAt }}</p>
          </article>
        </div>

        <article v-else class="feature-card accent-blue ranking-empty-card">
          <span>아직 기록이 없어요</span>
          <strong>한 판 끝내고 첫 기록을 남겨보세요.</strong>
        </article>

        <div class="hero-divider" aria-hidden="true"></div>

        <div class="hero-actions">
          <button class="ghost-button" @click="$emit('back')">홈으로</button>
          <button class="secondary-button" :disabled="props.ranking.length === 0" @click="$emit('clear')">기록 비우기</button>
        </div>
      </div>
    </section>
  </div>
</template>
