<script setup lang="ts">
import StockIcon from './StockIcon.vue';
import type { StockState } from '../../types/game';

defineProps<{ stock: StockState; watched: boolean; watchDisabled: boolean }>();
defineEmits<{ select: [code: string]; toggleWatch: [code: string] }>();
</script>

<template>
  <div class="market-stock-row">
    <button type="button" class="stock-list-item market-list-item" @click="$emit('select', stock.code)">
      <span class="list-stock-name"><StockIcon :code="stock.code" size="sm" /><span><strong>{{ stock.name }}</strong><small>{{ stock.theme }} · {{ stock.code }}</small></span></span>
      <span class="list-stock-price"><small class="list-stock-meta-label">현재가</small><strong>{{ stock.price.toLocaleString() }}원</strong><small v-if="stock.halted" class="stock-limit-tag">{{ stock.price > stock.previousClose ? '상한가 · 거래 정지' : '하한가 · 거래 정지' }}</small></span>
      <span class="list-stock-close"><small class="list-stock-meta-label">전일 종가</small><strong>{{ stock.previousClose.toLocaleString() }}원</strong></span>
      <span class="list-stock-change" :class="stock.changeRate > 0 ? 'up' : stock.changeRate < 0 ? 'down' : ''">
        <small class="list-stock-meta-label">전일 대비</small>
        <span><strong>{{ stock.price - stock.previousClose > 0 ? '▲ +' : stock.price - stock.previousClose < 0 ? '▼ ' : '' }}{{ (stock.price - stock.previousClose).toLocaleString() }}원</strong><em>{{ stock.changeRate > 0 ? '+' : '' }}{{ stock.changeRate.toFixed(2) }}%</em></span>
      </span>
    </button>
    <button type="button" class="market-watch-toggle" :aria-pressed="watched" :aria-label="`${stock.name} ${watched ? '관심 해제' : '관심 등록'}`" :title="watchDisabled ? '관심 종목은 최대 5개까지 등록할 수 있습니다.' : undefined" :disabled="watchDisabled" @click="$emit('toggleWatch', stock.code)">{{ watched ? '★' : '☆' }}</button>
  </div>
</template>
