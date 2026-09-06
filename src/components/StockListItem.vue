<script setup lang="ts">
import type { PropType } from 'vue';

import MiniChart from './MiniChart.vue';
import StockIcon from './StockIcon.vue';
import type { BriefingFeaturedStock, StockState } from '../types/game';

type StockItem = StockState | BriefingFeaturedStock;

defineProps({
  stock: { type: Object as PropType<StockItem>, required: true },
  variant: { type: String as PropType<'market' | 'watchlist'>, default: 'market' },
  interactive: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  showDescription: { type: Boolean, default: false },
  history: { type: Array as PropType<number[]>, default: () => [] },
});

defineEmits<{
  select: [code: string]
}>();
</script>

<template>
  <component
    :is="interactive ? 'button' : 'article'"
    :type="interactive ? 'button' : undefined"
    class="stock-list-item"
    :class="[
      variant === 'market' ? 'market-list-item' : 'feature-stock-item',
      { selected: active, [`tone-${'tone' in stock ? stock.tone : 'neutral'}`]: variant === 'watchlist' },
    ]"
    @click="interactive && $emit('select', stock.code)"
  >
    <div v-if="variant === 'market'" class="market-list-copy">
      <div class="stock-name-line">
        <StockIcon :code="stock.code" size="sm" />
        <strong>{{ stock.name }}</strong>
      </div>
      <small>{{ stock.theme }} · {{ stock.riskLabel }}</small>
    </div>

    <template v-else>
      <div class="feature-stock-head">
        <div class="feature-stock-copy">
          <div class="stock-name-line">
            <StockIcon :code="stock.code" size="sm" />
            <strong>{{ stock.name }}</strong>
          </div>
          <small>{{ stock.theme }} · {{ stock.riskLabel }}</small>
        </div>
        <em :class="stock.changeRate >= 0 ? 'up' : 'down'">
          {{ stock.changeRate > 0 ? '+' : '' }}{{ stock.changeRate.toFixed(1) }}%
        </em>
      </div>
      <div v-if="showDescription" class="feature-stock-foot">
        <small>{{ 'reason' in stock ? stock.reason : '' }}</small>
        <MiniChart :values="history.length > 1 ? history : ('history' in stock ? stock.history : [stock.price, stock.price])" :positive="stock.changeRate >= 0" />
      </div>
    </template>

    <div v-if="variant === 'market'" class="market-list-side">
      <MiniChart :values="history.length > 1 ? history : ('history' in stock ? stock.history : [stock.price, stock.price])" :positive="stock.changeRate >= 0" />
      <div class="market-list-metrics">
        <strong>{{ stock.price.toLocaleString() }}원</strong>
        <span :class="stock.changeRate >= 0 ? 'up' : 'down'">
          {{ stock.changeRate > 0 ? '+' : '' }}{{ stock.changeRate.toFixed(1) }}%
        </span>
      </div>
    </div>
  </component>
</template>