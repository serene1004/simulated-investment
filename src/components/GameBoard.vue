<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';

import MiniChart from './MiniChart.vue';
import PanelHeader from './PanelHeader.vue';
import StockIcon from './StockIcon.vue';
import StockListItem from './StockListItem.vue';
import type {
  BriefingFeaturedStock,
  BriefingSignal,
  Holding,
  PhaseView,
  StockState,
} from '../types/game';

const props = defineProps({
  currentPhase: { type: Number, required: true },
  totalPhases: { type: Number, required: true },
  cash: { type: Number, required: true },
  totalAssets: { type: Number, required: true },
  score: { type: Number, required: true },
  stocks: { type: Array as PropType<StockState[]>, required: true },
  selectedCode: { type: String, required: true },
  selectedStock: { type: Object as PropType<StockState>, required: true },
  tradeQuantity: { type: Number, required: true },
  maxAffordableQuantity: { type: Number, required: true },
  selectedHoldingQuantity: { type: Number, required: true },
  holdings: { type: Array as PropType<Holding[]>, required: true },
  holdingsMap: { type: Object as PropType<Record<string, Holding>>, required: true },
  currentEventTitle: { type: String, required: true },
  currentEventDescription: { type: String, required: true },
  briefingSignals: { type: Array as PropType<BriefingSignal[]>, required: true },
  briefingFeaturedStocks: { type: Array as PropType<BriefingFeaturedStock[]>, required: true },
  phaseView: { type: String as PropType<PhaseView>, required: true },
  phaseTradeCount: { type: Number, required: true },
  phaseBuyCount: { type: Number, required: true },
  phaseSellCount: { type: Number, required: true },
  phaseTradeLocked: { type: Boolean, required: true },
  canBuyMaxSelected: { type: Boolean, required: true },
  canBuySelected: { type: Boolean, required: true },
  canSellAllSelected: { type: Boolean, required: true },
  canSellSelected: { type: Boolean, required: true },
});

const emit = defineEmits<{
  showBriefing: []
  showTrade: []
  quit: []
  selectStock: [code: string]
  setTradeQuantity: [value: number]
  nudgeTradeQuantity: [delta: number]
  buy: []
  buyMax: []
  sell: []
  sellAll: []
  advance: []
}>();

const updateTradeQuantity = (event: Event) => {
  emit('setTradeQuantity', Math.max(1, Math.floor(Number((event.target as HTMLInputElement).value) || 1)));
};

const selectHoldingFromDesk = (code: string) => {
  emit('selectStock', code);

  if (props.phaseView !== 'trade') {
    emit('showTrade');
  }
};

const getStockByCode = (code: string) => props.stocks.find((stock) => stock.code === code);

const quantityControlDisabled = computed(() => !props.canBuyMaxSelected && !props.canSellAllSelected);
const investedValue = computed(() => Math.max(0, props.totalAssets - props.cash));
const holdingCount = computed(() => props.holdings.length);
const totalHoldingQuantity = computed(() => props.holdings.reduce((sum, holding) => sum + holding.quantity, 0));

const deskHoldings = computed(() =>
  props.holdings
    .map((holding) => {
      const stock = getStockByCode(holding.code);

      return {
        ...holding,
        name: stock?.name ?? holding.code,
        currentValue: (stock?.price ?? 0) * holding.quantity,
      };
    })
    .sort((left, right) => right.currentValue - left.currentValue),
);

const phasePillLabel = computed(() => {
  if (props.phaseTradeLocked) {
    return '거래 완료';
  }

  if (props.phaseTradeCount > 0) {
    return `${props.phaseTradeCount}개 종목 거래했어요`;
  }

  return '거래 전 브리핑';
});
</script>

<template>
  <section class="board-layout scene-panel">
    <section class="panel board-header">
      <div class="board-header-row">
        <div class="board-header-copy">
          <p class="eyebrow">PHASE {{ currentPhase }}</p>
          <h1>{{ phaseView === 'briefing' ? '브리핑' : '투자 데스크' }}</h1>
          <p class="board-header-text">
            {{ phaseView === 'briefing'
              ? '개장 전 흐름을 먼저 보고 오늘 볼 종목을 빠르게 골라봐요.'
              : '선택한 종목 가격과 보유 현황을 같이 보면서 바로 사고팔 수 있어요.' }}
          </p>

          <div class="board-view-switch" aria-label="화면 전환">
            <button
              class="board-view-switch-button"
              :class="{ active: phaseView === 'briefing' }"
              @click="$emit('showBriefing')"
            >
              <span>브리핑</span>
              <strong>보러 가기</strong>
            </button>
            <button
              class="board-view-switch-button"
              :class="{ active: phaseView === 'trade' }"
              @click="$emit('showTrade')"
            >
              <span>투자</span>
              <strong>바로 하기</strong>
            </button>
          </div>
        </div>

        <aside class="holdings-panel">
          <PanelHeader eyebrow="PORTFOLIO" title="내 보유현황">
            <template #meta>
              <div class="holdings-panel-actions">
                <span class="stock-count-chip">{{ holdingCount }}종목</span>
              <span class="holdings-phase-chip">PHASE {{ currentPhase }} / {{ totalPhases }}</span>
              <strong class="score-chip">{{ score.toLocaleString() }} pt</strong>
              <button class="surface-button board-exit-button" @click="$emit('quit')">
                <svg class="board-exit-icon" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    d="M8.5 4.25a.75.75 0 0 1 .75-.75h5a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5h-5a.75.75 0 0 1 0-1.5h5V5h-5a.75.75 0 0 1-.75-.75Zm-.72 2.22a.75.75 0 0 1 1.06 0l2.75 2.75a.75.75 0 0 1 0 1.06L8.84 13.03a.75.75 0 1 1-1.06-1.06l1.47-1.47H4.75a.75.75 0 0 1 0-1.5h4.5L7.78 7.53a.75.75 0 0 1 0-1.06Z"
                    fill="currentColor"
                  />
                </svg>
                <span>그만하기</span>
              </button>
              </div>
            </template>
          </PanelHeader>

          <div class="holdings-metric-grid">
            <article>
              <span>투입 금액</span>
              <strong>{{ investedValue.toLocaleString() }}원</strong>
            </article>
            <article>
              <span>보유 수량</span>
              <strong>{{ totalHoldingQuantity.toLocaleString() }}주</strong>
            </article>
            <article>
              <span>보유 현금</span>
              <strong>{{ cash.toLocaleString() }}원</strong>
            </article>
            <article>
              <span>총 자산</span>
              <strong>{{ totalAssets.toLocaleString() }}원</strong>
            </article>
          </div>

          <Transition name="detail-fade" mode="out-in">
            <div v-if="deskHoldings.length > 0" key="holdings-list" class="holdings-list">
              <button
                v-for="holding in deskHoldings"
                :key="holding.code"
                type="button"
                class="holdings-item"
                :class="{ selected: selectedCode === holding.code }"
                @click="selectHoldingFromDesk(holding.code)"
              >
                <div class="holding-name-line">
                  <StockIcon :code="holding.code" size="sm" />
                  <strong>{{ holding.name }}</strong>
                </div>
                <span>{{ holding.quantity }}주 · {{ holding.currentValue.toLocaleString() }}원</span>
              </button>
            </div>

            <div v-else key="holdings-empty" class="holdings-empty">
              <strong>아직 담아 둔 종목이 없어요.</strong>
              <span>브리핑 보고 이번 페이즈 첫 포지션을 잡아봐요.</span>
            </div>
          </Transition>
        </aside>
      </div>
    </section>

    <div class="phase-stage">
      <Transition name="phase-panel" mode="out-in">
        <section v-if="phaseView === 'briefing'" key="briefing" class="phase-stage-panel phase-stage-briefing">
          <div class="briefing-grid">
            <section class="panel briefing-signal-panel">
              <PanelHeader eyebrow="PRE-MARKET SIGNAL" :title="currentEventTitle">
                <template #meta>
                  <span class="event-pill">{{ phasePillLabel }}</span>
                </template>
              </PanelHeader>

              <p class="briefing-description">{{ currentEventDescription }}</p>

              <div class="briefing-signal-list">
                <article
                  v-for="signal in briefingSignals"
                  :key="signal.id"
                  class="briefing-signal-item"
                  :class="`tone-${signal.tone}`"
                >
                  <span>{{ signal.label }}</span>
                  <div v-if="signal.stocks" class="briefing-signal-stocks">
                    <div v-for="stock in signal.stocks" :key="stock.code" class="briefing-signal-stock">
                      <StockIcon :code="stock.code" size="sm" />
                      <strong>
                        {{ stock.name }}
                        <small>{{ stock.changeRate > 0 ? '+' : '' }}{{ stock.changeRate.toFixed(1) }}%</small>
                      </strong>
                    </div>
                  </div>
                  <strong v-if="!signal.stocks">{{ signal.value }}</strong>
                </article>
              </div>
            </section>

            <section class="panel briefing-watch-panel">
              <PanelHeader eyebrow="WATCHLIST PICKS" title="핵심 종목 후보">
                <template #meta>
                  <span class="stock-count-chip">{{ briefingFeaturedStocks.length }}개 포인트</span>
                </template>
              </PanelHeader>

              <div class="feature-market-list">
                <StockListItem
                  v-for="stock in briefingFeaturedStocks"
                  :key="stock.code"
                  :stock="stock"
                  :history="getStockByCode(stock.code)?.history ?? []"
                  variant="watchlist"
                  show-description
                />
              </div>
            </section>
          </div>
        </section>

        <section v-else key="trade" class="phase-stage-panel phase-stage-trading">
          <div class="main-grid enhanced-grid">
            <section class="panel market-panel board-panel">
              <PanelHeader eyebrow="MARKET BOARD" title="오늘의 종목">
                <template #meta>
                  <span class="stock-count-chip">{{ stocks.length }}개 종목</span>
                </template>
              </PanelHeader>

              <div class="market-list market-list-compact">
                <StockListItem
                  v-for="stock in stocks"
                  :key="stock.code"
                  :stock="stock"
                  interactive
                  :active="selectedCode === stock.code"
                  @select="$emit('selectStock', $event)"
                />
              </div>
            </section>

            <section class="panel detail-panel board-panel trade-workspace" :class="{ locked: phaseTradeLocked }">
              <PanelHeader eyebrow="TRADE WORKSPACE" :title="selectedStock.name">
                <template #meta>
                  <div class="section-header-meta">
                    <span class="risk-badge">{{ selectedStock.riskLabel }}</span>
                    <div class="trade-slot-mini">
                      <span :class="{ used: phaseBuyCount > 0 }">BUY {{ phaseBuyCount }}</span>
                      <span :class="{ used: phaseSellCount > 0 }">SELL {{ phaseSellCount }}</span>
                    </div>
                  </div>
                </template>
              </PanelHeader>

              <div class="trade-workspace-layout">
                <section class="trade-summary-panel">
                  <Transition name="detail-fade" mode="out-in">
                    <div :key="selectedStock.code" class="trade-summary-card">
                      <div
                        class="price-card focus-price-panel trade-price-card"
                        :class="selectedStock.changeRate > 0 ? 'tone-rise' : selectedStock.changeRate < 0 ? 'tone-fall' : 'tone-neutral'"
                      >
                        <div class="focus-price-header">
                          <div class="focus-price-copy">
                            <span>현재 가격</span>
                            <strong>{{ selectedStock.price.toLocaleString() }}원</strong>
                          </div>
                          <em :class="selectedStock.changeRate >= 0 ? 'up' : 'down'">
                            {{ selectedStock.changeRate > 0 ? '+' : '' }}{{ selectedStock.changeRate.toFixed(1) }}%
                          </em>
                        </div>

                        <div class="focus-price-chart">
                          <MiniChart :values="selectedStock.history" :positive="selectedStock.changeRate >= 0" />
                        </div>
                      </div>

                      <div class="trade-stats-grid">
                        <article>
                          <span>보유 수량</span>
                          <strong>{{ holdingsMap[selectedStock.code]?.quantity ?? 0 }}주</strong>
                        </article>
                        <article>
                          <span>평균 단가</span>
                          <strong>{{ (holdingsMap[selectedStock.code]?.averagePrice ?? 0).toLocaleString() }}원</strong>
                        </article>
                        <article>
                          <span>가능 매수</span>
                          <strong>{{ maxAffordableQuantity }}주</strong>
                        </article>
                      </div>
                    </div>
                  </Transition>
                </section>

                <section class="trade-control-panel trade-control-panel-side">
                  <div class="trade-control-group">
                    <div class="trade-control-section">
                      <span class="trade-control-label">거래 수량</span>
                      <div class="quantity-stepper-control">
                        <button class="stepper-button" :disabled="quantityControlDisabled || tradeQuantity <= 1" @click="$emit('nudgeTradeQuantity', -1)">-</button>
                        <input id="quantity" :value="tradeQuantity" type="number" min="1" :disabled="quantityControlDisabled" @input="updateTradeQuantity" />
                        <button class="stepper-button" :disabled="quantityControlDisabled" @click="$emit('nudgeTradeQuantity', 1)">+</button>
                      </div>
                    </div>
                    <div class="trade-control-section">
                      <span class="trade-control-label">주문 실행</span>
                      <div class="trade-action-row trade-action-grid">
                        <button class="action-button buy-button" :disabled="!canBuySelected" @click="$emit('buy')">매수</button>
                        <button class="action-button sell-button" :disabled="!canSellSelected" @click="$emit('sell')">매도</button>
                      </div>
                    </div>
                    <button class="primary-button full-width phase-advance-cta" @click="$emit('advance')">
                      {{ phaseTradeCount > 0 ? '가격 움직임 보기' : '이번 페이즈 넘기기' }}
                    </button>
                  </div>
                </section>
              </div>
            </section>
          </div>
        </section>
      </Transition>
    </div>
  </section>
</template>

