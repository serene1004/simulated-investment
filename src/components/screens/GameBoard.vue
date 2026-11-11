<script setup lang="ts">
import { computed } from 'vue';


import MarketInformationView from './MarketInformationView.vue';
import CompanyDirectoryView from './CompanyDirectoryView.vue';
import StockDetailView from './StockDetailView.vue';
import OrderView from './OrderView.vue';
import PortfolioView from './PortfolioView.vue';
import type { GameBoardState, GameView } from '../../types/game';

const props = defineProps<{ state: GameBoardState }>();

const emit = defineEmits<{
  selectStock: [code: string]
  setTradeQuantity: [value: number]
  nudgeTradeQuantity: [delta: number]
  buy: []
  sell: []
  createLimitOrder: [order: { side: 'buy' | 'sell'; quantity: number; limitPrice: number }]
  cancelLimitOrder: [id: number]
  setMarketSpeed: [speed: 1 | 2 | 4 | 8]
  navigate: [target: { view: GameView; code?: string; replace?: boolean }]
}>();

const marketSpeeds = [1, 2, 4, 8] as const;
const marketClock = computed(() => `${String(Math.floor(props.state.marketMinute / 60)).padStart(2, '0')}:${String(props.state.marketMinute % 60).padStart(2, '0')}`);
const maintenance = computed(() => props.state.marketMinute >= 15 * 60 + 30 && props.state.marketMinute < 16 * 60);
const afterMarket = computed(() => props.state.marketMinute >= 16 * 60 && props.state.marketOpen);
const marketSessionRange = computed(() => maintenance.value ? '15:30 — 16:00' : props.state.marketMinute >= 16 * 60 ? '16:00 — 20:00' : '09:00 — 15:30');
const dailyReturn = computed(() => props.state.dayOpeningAssets ? ((props.state.totalAssets - props.state.dayOpeningAssets) / props.state.dayOpeningAssets) * 100 : 0);
const navigate = (view: GameView, code?: string, replace = false) => emit('navigate', { view, code, replace });
const navigateTarget = (target: { view: GameView; code?: string; replace?: boolean }) => navigate(target.view, target.code, target.replace);
const openStockDetails = (code: string) => {
  emit('selectStock', code); navigate('chart', code);
};
const selectStock = (code: string) => emit('selectStock', code);
const setTradeQuantity = (value: number) => emit('setTradeQuantity', value);
const nudgeTradeQuantity = (delta: number) => emit('nudgeTradeQuantity', delta);
</script>

<template>
  <section class="market-terminal">
    <header class="market-terminal-header">
      <button class="market-brand-lockup" type="button" aria-label="LEXIP 증권 종목 시세로 이동" @click="navigate('market', undefined, true)">
        <span class="pixel-mark" aria-hidden="true"><i></i><i></i><i></i></span>
        <div><p>DAY {{ String(props.state.currentPhase).padStart(2, '0') }}</p><h1>LEXIP 증권</h1></div>
      </button>
      <div class="market-session-status">
        <i :class="{ open: props.state.marketOpen, after: afterMarket, maintenance }"></i>
        <strong>{{ maintenance ? '장 정비 시간' : afterMarket ? '애프터마켓 거래 중' : props.state.marketOpen ? '정규장 거래 중' : '오늘의 거래 종료' }}</strong>
        <b>{{ marketClock }}</b><span>{{ marketSessionRange }}</span>
        <em :class="dailyReturn >= 0 ? 'up' : 'down'">{{ dailyReturn > 0 ? '+' : '' }}{{ dailyReturn.toFixed(2) }}%</em>
        <div class="market-speed-controls" role="group" aria-label="게임 시간 배속">
          <span>속도</span><button v-for="speed in marketSpeeds" :key="speed" type="button" :aria-label="`게임 속도 ${speed}배`" :aria-pressed="props.state.marketSpeed === speed" @click="$emit('setMarketSpeed', speed)">{{ speed }}x</button>
        </div>
      </div>
    </header>

    <p v-if="props.state.flashMessage" class="trade-feedback" role="status" aria-live="polite">{{ props.state.flashMessage }}</p>

    <MarketInformationView v-if="props.state.view === 'market'" :market-minute="props.state.marketMinute" :market-open="props.state.marketOpen" :market-index-value="props.state.marketIndexValue" :market-index-change="props.state.marketIndexChange" :market-index-change-rate="props.state.marketIndexChangeRate" :stocks="props.state.stocks" @navigate="navigate($event)" @select-stock="openStockDetails" />

    <CompanyDirectoryView v-else-if="props.state.view === 'companies'" :stocks="props.state.stocks" @back="navigate('market', undefined, true)" @select-stock="openStockDetails" />

    <StockDetailView v-else-if="props.state.view === 'chart'" :current-phase="props.state.currentPhase" :market-minute="props.state.marketMinute" :selected-code="props.state.selectedCode" :selected-stock="props.state.selectedStock" @back="navigate('market', undefined, true)" @order="navigate('orders', $event)" />

    <OrderView v-else-if="props.state.view === 'orders'" :current-phase="props.state.currentPhase" :market-minute="props.state.marketMinute" :market-open="props.state.marketOpen" :available-cash="props.state.availableCash" :selected-code="props.state.selectedCode" :selected-stock="props.state.selectedStock" :stocks="props.state.stocks" :trade-quantity="props.state.tradeQuantity" :max-affordable-quantity="props.state.maxAffordableQuantity" :selected-holding-quantity="props.state.selectedHoldingQuantity" :pending-orders="props.state.pendingOrders" :can-buy-selected="props.state.canBuySelected" :can-sell-selected="props.state.canSellSelected" @navigate="navigateTarget" @select-stock="selectStock" @set-trade-quantity="setTradeQuantity" @nudge-trade-quantity="nudgeTradeQuantity" @buy="emit('buy')" @sell="emit('sell')" @create-limit-order="emit('createLimitOrder', $event)" @cancel-limit-order="emit('cancelLimitOrder', $event)" />

    <PortfolioView v-else :cash="props.state.cash" :available-cash="props.state.availableCash" :day-opening-assets="props.state.dayOpeningAssets" :total-assets="props.state.totalAssets" :selected-code="props.state.selectedCode" :holdings="props.state.holdings" :stocks="props.state.stocks" :pending-order-count="props.state.pendingOrders.length" @back="navigate('market', undefined, true)" @select-stock="openStockDetails" @view-orders="navigate('orders', $event)" />
  </section>
</template>
