<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';

import type { PhaseSummary, StockState } from '../types/game';
import PanelHeader from './PanelHeader.vue';

const props = defineProps({
  summary: { type: Object as PropType<PhaseSummary>, required: true },
  strongestStock: { type: Object as PropType<StockState | null>, required: false, default: null },
  weakestStock: { type: Object as PropType<StockState | null>, required: false, default: null },
  isLastPhase: { type: Boolean, required: true },
});

defineEmits<{
  next: []
  result: []
}>();

const reaction = computed(() => {
  const rate = props.summary.phaseProfitRate;

  if (rate >= 10) {
    return {
      emoji: '🚀',
      title: '이번 페이즈, 제대로 터졌어요',
      message: '이번 선택이 시장 흐름이랑 아주 잘 맞았어요. 템포를 제대로 읽었네요.',
      tone: 'surge',
    };
  }

  if (rate >= 4) {
    return {
      emoji: '😎',
      title: '좋은 페이즈였어요',
      message: '꽤 괜찮은 수익 구간이에요. 다음 페이즈에서도 이 감각을 이어가봐요.',
      tone: 'gain',
    };
  }

  if (rate > 0) {
    return {
      emoji: '🙂',
      title: '무난하게 플러스였어요',
      message: '큰 폭은 아니어도 분명히 앞으로 나아갔어요.',
      tone: 'gain',
    };
  }

  if (rate === 0) {
    return {
      emoji: '😐',
      title: '변화는 크지 않았어요',
      message: '관망이었거나 변동이 작았어요. 다음 페이즈에서 더 큰 기회를 노려봐도 돼요.',
      tone: 'flat',
    };
  }

  if (rate <= -10) {
    return {
      emoji: '😵',
      title: '이번 변동은 꽤 거셌어요',
      message: '흔들림이 컸던 만큼 다음 페이즈에서는 리스크부터 가볍게 정리해봐요.',
      tone: 'drop',
    };
  }

  if (rate <= -4) {
    return {
      emoji: '😬',
      title: '조정이 세게 왔어요',
      message: '한 번의 결정이 꽤 크게 흔들렸어요. 다음 페이즈는 비중 조절이 중요해요.',
      tone: 'drop',
    };
  }

  return {
    emoji: '😕',
    title: '조금 아쉬운 마감이었어요',
    message: '손실이 크진 않지만 흐름은 좋지 않았어요. 다음 브리핑은 조금 더 천천히 읽어봐요.',
    tone: 'drop',
  };
});
</script>

<template>
  <div class="screen-shell screen-summary">
    <section class="panel screen-panel summary-screen-panel scene-panel" :class="`summary-tone-${reaction.tone}`">
      <div class="screen-stack summary-screen-panel-stack">
        <PanelHeader eyebrow="PHASE RESULT" :title="`${summary.phaseNumber}페이즈 요약`">
          <template #meta>
            <strong class="score-chip">{{ summary.phaseProfitRate > 0 ? '+' : '' }}{{ summary.phaseProfitRate.toFixed(1) }}%</strong>
          </template>
        </PanelHeader>

        <div class="summary-highlight">
          <div class="summary-highlight-emoji">{{ reaction.emoji }}</div>
          <div>
            <h3>{{ reaction.title }}</h3>
            <p>{{ reaction.message }}</p>
          </div>
        </div>

        <div class="summary-grid summary-grid-wide">
          <article>
            <span>총 자산</span>
            <strong>{{ summary.totalAssets.toLocaleString() }}원</strong>
          </article>
          <article>
            <span>이번 결정</span>
            <strong>{{ summary.decisionLabel }}</strong>
          </article>
          <article>
            <span>가장 강한 종목</span>
            <strong>{{ strongestStock?.name ?? '-' }}</strong>
          </article>
          <article>
            <span>가장 아쉬운 종목</span>
            <strong>{{ weakestStock?.name ?? '-' }}</strong>
          </article>
        </div>

        <div class="summary-event-panel hover-lift">
          <span>{{ summary.eventTitle }}</span>
          <p>{{ summary.eventDescription }}</p>
        </div>

        <div class="screen-divider" aria-hidden="true"></div>

        <div class="screen-actions">
          <button v-if="isLastPhase" class="primary-button" @click="$emit('result')">최종 결과 보러 가기</button>
          <button v-else class="primary-button" @click="$emit('next')">다음 페이즈로 가기</button>
        </div>
      </div>
    </section>
  </div>
</template>
