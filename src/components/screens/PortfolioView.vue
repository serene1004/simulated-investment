<script setup lang="ts">
import { computed } from 'vue';
import StockIcon from '../shared/StockIcon.vue';
import type { Holding, StockState } from '../../types/game';

const props = defineProps<{
  cash: number
  availableCash: number
  dayOpeningAssets: number
  totalAssets: number
  selectedCode: string
  holdings: Holding[]
  stocks: StockState[]
  pendingOrderCount: number
}>();
const emit = defineEmits<{ back: []; selectStock: [code: string]; viewOrders: [code: string] }>();
const investedValue = computed(() => Math.max(0, props.totalAssets - props.cash));
const dailyReturn = computed(() => props.dayOpeningAssets ? ((props.totalAssets - props.dayOpeningAssets) / props.dayOpeningAssets) * 100 : 0);
const deskHoldings = computed(() => props.holdings
  .map((holding) => {
    const stock = props.stocks.find((item) => item.code === holding.code);
    return { ...holding, name: stock?.name ?? holding.code, currentValue: (stock?.price ?? 0) * holding.quantity };
  })
  .sort((left, right) => right.currentValue - left.currentValue));
</script>

<template>
  <main class="market-portfolio-view">
    <header class="market-view-toolbar"><div><span>MY PORTFOLIO</span><strong>내 주식</strong></div><button type="button" class="return-market-link" @click="emit('back')">종목 시세로 돌아가기</button></header>
    <section class="portfolio-total"><div><span>현재 평가 자산</span><strong>{{ totalAssets.toLocaleString() }}<small>원</small></strong><p>현금 {{ cash.toLocaleString() }}원 <i>+</i> 주식 {{ investedValue.toLocaleString() }}원</p></div><aside><span>오늘 손익</span><strong :class="totalAssets >= dayOpeningAssets ? 'up' : 'down'">{{ totalAssets - dayOpeningAssets > 0 ? '+' : '' }}{{ (totalAssets - dayOpeningAssets).toLocaleString() }}원</strong><b>{{ dailyReturn > 0 ? '+' : '' }}{{ dailyReturn.toFixed(2) }}%</b></aside></section>
    <section class="portfolio-holdings"><header><h3>보유 종목</h3><span>{{ deskHoldings.length }}종목 · 주문 가능 현금 {{ availableCash.toLocaleString() }}원</span></header><div v-for="holding in deskHoldings" :key="holding.code" class="portfolio-holding-row"><button class="portfolio-holding-main" type="button" @click="emit('selectStock', holding.code)"><StockIcon :code="holding.code" size="md"/><span><strong>{{ holding.name }}</strong><small>{{ holding.quantity.toLocaleString() }}주 · 평균 {{ holding.averagePrice.toLocaleString() }}원</small></span><b>{{ holding.currentValue.toLocaleString() }}원</b><i>상세</i></button><span class="portfolio-holding-pnl" :class="(holding.currentValue - holding.averagePrice * holding.quantity) >= 0 ? 'up' : 'down'">평가 손익 {{ holding.currentValue - holding.averagePrice * holding.quantity > 0 ? '+' : '' }}{{ (holding.currentValue - holding.averagePrice * holding.quantity).toLocaleString() }}원</span></div><p v-if="!deskHoldings.length">보유 중인 종목이 없습니다. 시세 목록에서 종목을 골라 첫 거래를 시작해보세요.</p></section>
    <button class="portfolio-orders-link" type="button" @click="emit('viewOrders', selectedCode)"><span>미체결 지정가 주문</span><b>{{ pendingOrderCount }}건</b><span>주문 내역 보기</span></button>
  </main>
</template>
