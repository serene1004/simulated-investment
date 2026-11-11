<script setup lang="ts">
import { computed } from 'vue';
import type { GameEnding } from '../../types/game';

const props = defineProps<{ ending: GameEnding | null; survivalDays: number; totalAssets: number }>();
defineEmits<{ restart: [] }>();

const result = computed(() => props.ending === 'broke'
  ? { title: '투자금이 바닥났다', line: '총 자산이 파산 기준인 100,000원 이하로 내려갔다.' }
  : props.ending === 'completed'
    ? { title: '30일 투자를 마쳤다', line: '한 달 동안의 투자 기록을 모두 확인했다.' }
    : { title: '투자 종료', line: '새로운 투자 전략으로 다시 시작해보세요.' });
</script>

<template>
  <div class="screen-shell screen-result">
    <section class="panel screen-panel result-screen-panel scene-panel summary-tone-drop">
      <div class="screen-stack result-panel-stack">
        <p class="eyebrow">TRADING HALTED</p>
        <div class="result-highlight result-assets"><div class="result-highlight-score"><strong>{{ result.title }}</strong><span>최종 자산 {{ totalAssets.toLocaleString() }}원</span></div></div>
        <p class="result-description">{{ result.line }} · {{ survivalDays }}거래일</p>
        <div class="screen-actions screen-actions-center"><button class="primary-button" @click="$emit('restart')">다시 투자하기</button></div>
      </div>
    </section>
  </div>
</template>
