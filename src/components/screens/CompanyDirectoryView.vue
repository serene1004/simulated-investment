<script setup lang="ts">
import StockIcon from '../shared/StockIcon.vue';
import type { StockState } from '../../types/game';

defineProps<{ stocks: StockState[] }>();
const emit = defineEmits<{ selectStock: [code: string]; back: [] }>();
</script>

<template>
  <main class="company-directory-view">
    <header class="market-view-toolbar"><div><span>COMPANY DIRECTORY</span><strong>기업 정보</strong></div><button type="button" class="return-market-link" @click="emit('back')">종목 시세로 돌아가기</button></header>
    <section class="company-directory-grid" aria-label="기업 정보 목록">
      <button v-for="stock in stocks" :key="stock.code" class="company-directory-card" type="button" @click="emit('selectStock', stock.code)">
        <span class="company-directory-heading"><StockIcon :code="stock.code" size="md"/><span><strong>{{ stock.name }}</strong><small>{{ stock.code }} · {{ stock.theme }}</small></span><i :class="stock.changeRate >= 0 ? 'up' : 'down'">{{ stock.changeRate > 0 ? '+' : '' }}{{ stock.changeRate.toFixed(2) }}%</i></span>
        <span class="company-directory-metrics"><span>현재가<strong>{{ stock.price.toLocaleString() }}원</strong><small v-if="stock.halted" class="stock-limit-tag">{{ stock.price > stock.previousClose ? '상한가 · 거래 정지' : '하한가 · 거래 정지' }}</small></span><span>시가총액<strong>{{ (stock.price * stock.sharesOutstanding / 1e12).toFixed(1) }}조원</strong></span><span>평균 거래량<strong>{{ stock.averageVolume.toLocaleString() }}주</strong></span></span>
      </button>
    </section>
  </main>
</template>
