<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import StockIcon from '../shared/StockIcon.vue';
import type { GameView, PendingOrder, StockState } from '../../types/game';

const props = defineProps<{
  currentPhase: number; marketMinute: number; marketOpen: boolean; availableCash: number
  selectedCode: string; selectedStock: StockState; stocks: StockState[]; tradeQuantity: number
  maxAffordableQuantity: number; selectedHoldingQuantity: number; pendingOrders: PendingOrder[]
  canBuySelected: boolean; canSellSelected: boolean
}>();
const emit = defineEmits<{
  navigate: [target: { view: GameView; code?: string; replace?: boolean }]
  selectStock: [code: string]; setTradeQuantity: [value: number]; nudgeTradeQuantity: [delta: number]
  buy: []; sell: []; createLimitOrder: [order: { side: 'buy' | 'sell'; quantity: number; limitPrice: number }]
  cancelLimitOrder: [id: number]
}>();
const showStockPicker = ref(false);
const orderLimitPrice = ref(props.selectedStock.price);
const maintenance = computed(() => props.marketMinute >= 15 * 60 + 30 && props.marketMinute < 16 * 60);
const afterMarket = computed(() => props.marketMinute >= 16 * 60 && props.marketOpen);
const marketClock = computed(() => `${String(Math.floor(props.marketMinute / 60)).padStart(2, '0')}:${String(props.marketMinute % 60).padStart(2, '0')}`);
const orderDisabled = computed(() => !props.marketOpen || props.selectedStock.halted);
const quantityControlDisabled = computed(() => props.maxAffordableQuantity < 1 && props.selectedHoldingQuantity < 1);
const selectedChangeAmount = computed(() => props.selectedStock.price - props.selectedStock.previousClose);
watch([() => props.selectedStock.code, () => props.currentPhase], () => {
  orderLimitPrice.value = props.selectedStock.price; 
});
const navigate = (view: GameView, code?: string, replace = false) => emit('navigate', { view, code, replace });
const openStockPicker = () => {
  showStockPicker.value = true;
  void nextTick(() => document.querySelector<HTMLButtonElement>('#order-stock-options [aria-pressed="true"]')?.focus());
};
const closeStockPicker = () => {
  showStockPicker.value = false;
  void nextTick(() => document.querySelector<HTMLButtonElement>('#order-stock')?.focus());
};
const movePickerFocus = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault(); closeStockPicker(); return; 
  }
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
  const options = [...(event.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('button')];
  const index = options.indexOf((event.target as HTMLElement).closest('button') as HTMLButtonElement);
  const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1
    : index < 0 ? (event.key === 'ArrowUp' ? options.length - 1 : 0)
      : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
  event.preventDefault(); options[nextIndex]?.focus();
};
const chooseOrderStock = (code: string) => {
  emit('selectStock', code); showStockPicker.value = false; navigate('orders', code); 
};
const updateTradeQuantity = (event: Event) => emit('setTradeQuantity', Math.max(1, Math.floor(Number((event.target as HTMLInputElement).value) || 1)));
</script>

<template>
  <main class="market-order-view">
    <header class="order-view-heading"><div><span>ORDER DESK · DAY {{ String(currentPhase).padStart(2, '0') }}</span><h2>{{ selectedStock.name }} 주문</h2></div><button type="button" class="return-market-link" @click="navigate('chart', selectedCode, true)">종목 상세로 돌아가기</button></header>
    <section class="order-instrument-band" aria-label="주문 종목">
      <div class="order-stock-picker"><span class="order-stock-picker-label">주문 종목</span><button id="order-stock" class="order-stock-picker-trigger" type="button" aria-controls="order-stock-options" :aria-expanded="showStockPicker" @click="showStockPicker ? closeStockPicker() : openStockPicker()"><StockIcon :code="selectedStock.code" size="sm"/><span><strong>{{ selectedStock.name }}</strong><small>{{ selectedStock.code }} · {{ selectedStock.theme }}</small></span><b aria-hidden="true">{{ showStockPicker ? '▴' : '▾' }}</b></button><div v-if="showStockPicker" id="order-stock-options" class="order-stock-picker-menu" role="group" aria-label="주문 종목 선택" @keydown="movePickerFocus"><button v-for="stock in stocks" :key="stock.code" type="button" :aria-pressed="selectedCode === stock.code" @click="chooseOrderStock(stock.code)"><StockIcon :code="stock.code" size="sm"/><span><strong>{{ stock.name }}</strong><small>{{ stock.code }} · {{ stock.theme }}</small></span><i>{{ stock.price.toLocaleString() }}원</i></button></div></div>
      <strong>{{ selectedStock.price.toLocaleString() }}원</strong><span :class="selectedStock.changeRate > 0 ? 'up' : selectedStock.changeRate < 0 ? 'down' : ''">{{ selectedChangeAmount > 0 ? '+' : '' }}{{ selectedChangeAmount.toLocaleString() }}원 · {{ selectedStock.changeRate > 0 ? '+' : '' }}{{ selectedStock.changeRate.toFixed(2) }}%</span><span>전일 종가 {{ selectedStock.previousClose.toLocaleString() }}원</span>
    </section>
    <section class="order-ticket" :class="{ locked: orderDisabled }">
      <header><div><span>TRADE TICKET</span><h3>{{ selectedStock.name }} 주문</h3></div><b>{{ selectedStock.halted ? '상한가/하한가 · 오늘 거래 정지' : maintenance ? '장 정비 · 주문 불가' : marketOpen ? `${afterMarket ? '애프터마켓' : '정규장'} · ${marketClock}` : '장 마감 · 주문 불가' }}</b></header>
      <div class="order-ticket-controls"><label class="order-quantity-control" for="quantity"><span>주문 수량</span><div class="quantity-stepper-control"><button class="stepper-button" :disabled="orderDisabled || quantityControlDisabled || tradeQuantity <= 1" @click="emit('nudgeTradeQuantity', -1)">−</button><input id="quantity" :value="tradeQuantity" type="number" min="1" :disabled="orderDisabled || quantityControlDisabled" @input="updateTradeQuantity"/><button class="stepper-button" :disabled="orderDisabled || quantityControlDisabled" @click="emit('nudgeTradeQuantity', 1)">＋</button></div><small>가능 매수 {{ maxAffordableQuantity }}주 · 보유 {{ selectedHoldingQuantity }}주</small></label><div class="order-total-estimate"><span>주문 예상 금액</span><strong>{{ (tradeQuantity * selectedStock.price).toLocaleString() }}원</strong><small>주문 가능 현금 {{ availableCash.toLocaleString() }}원</small></div><div class="order-market-actions"><span>시장가 주문</span><div><button class="action-button buy-button" :disabled="!canBuySelected" @click="emit('buy')">매수 주문</button><button class="action-button sell-button" :disabled="!canSellSelected" @click="emit('sell')">매도 주문</button></div></div></div>
      <div class="limit-order-form"><label for="limit-price">지정가</label><input id="limit-price" v-model.number="orderLimitPrice" type="number" min="1000" step="1000" :disabled="orderDisabled"/><small>매수는 지정가 이하, 매도는 지정가 이상일 때 체결됩니다.</small><button class="secondary-button" :disabled="orderDisabled || tradeQuantity * orderLimitPrice > availableCash" @click="emit('createLimitOrder', { side: 'buy', quantity: tradeQuantity, limitPrice: orderLimitPrice })">지정가 매수 예약</button><button class="secondary-button" :disabled="orderDisabled || tradeQuantity > selectedHoldingQuantity" @click="emit('createLimitOrder', { side: 'sell', quantity: tradeQuantity, limitPrice: orderLimitPrice })">지정가 매도 예약</button></div>
    </section>
    <section class="order-activity-section"><header><div><span>ORDER ACTIVITY</span><h3>대기 중인 예약</h3></div><strong>{{ pendingOrders.length }}건</strong></header><div v-if="pendingOrders.length" class="pending-order-list"><article v-for="order in pendingOrders" :key="order.id"><StockIcon :code="order.code" size="sm"/><strong>{{ stocks.find((stock) => stock.code === order.code)?.name ?? order.code }}</strong><span>{{ order.side === 'buy' ? '매수 예약' : '매도 예약' }}</span><b>{{ order.quantity }}주 · {{ order.limitPrice.toLocaleString() }}원</b><button class="text-button" @click="emit('cancelLimitOrder', order.id)">취소</button></article></div><p v-else class="order-activity-empty">장중 지정가 주문이 여기에 표시됩니다.</p></section>
  </main>
</template>
