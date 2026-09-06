<script setup lang="ts">
import { computed } from 'vue';
import type { StockState } from '../types/game';

const props = defineProps<{ stocks: StockState[] }>();
const copies = [0, 1];
const formatWon = (value: number) => `${new Intl.NumberFormat('ko-KR').format(value)}원`;
const formatRate = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
const tone = (value: number) => value > 0 ? 'rise' : value < 0 ? 'fall' : 'neutral';
const ranked = computed(() => [...props.stocks].sort((a, b) => b.changeRate - a.changeRate));
const top = computed(() => [...props.stocks].sort((a, b) => Math.abs(b.changeRate) - Math.abs(a.changeRate) || b.price - a.price));
const bottom = computed(() => {
  const seen = new Set<string>();
  return [...ranked.value.slice(0, 3), ...ranked.value.slice(-3).reverse()].filter((stock) => !seen.has(stock.code) && seen.add(stock.code));
});
const tickerRows = computed(() => [top.value, bottom.value]);
</script>

<template>
  <div v-for="(items, position) in tickerRows" :key="position" :class="['market-ticker', position === 0 ? 'market-ticker-top' : 'market-ticker-bottom']">
    <div class="market-ticker-track">
      <div v-for="copy in copies" :key="copy" class="market-ticker-group">
        <span v-for="stock in items" :key="`${stock.code}-${copy}`" :class="['market-ticker-item', `tone-${tone(stock.changeRate)}`]">
          <span class="market-ticker-label">{{ stock.name }}<template v-if="position === 0"> {{ formatWon(stock.price) }}</template></span>
          <strong class="market-ticker-value">{{ formatRate(stock.changeRate) }}<template v-if="position === 1"> / {{ formatWon(stock.price) }}</template></strong>
        </span>
      </div>
    </div>
  </div>
</template>
