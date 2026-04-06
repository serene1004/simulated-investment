<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'

import MiniChart from './MiniChart.vue'
import StockIcon from './StockIcon.vue'
import type {
  BriefingFeaturedStock,
  BriefingSignal,
  Holding,
  PhaseView,
  StockState,
} from '../types/game'

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
  recommendedTradeQuantity: { type: Number, required: true },
  maxAffordableQuantity: { type: Number, required: true },
  selectedHoldingQuantity: { type: Number, required: true },
  holdings: { type: Array as PropType<Holding[]>, required: true },
  holdingsMap: { type: Object as PropType<Record<string, Holding>>, required: true },
  lastAction: { type: String, required: true },
  flashMessage: { type: String, required: true },
  currentEventTitle: { type: String, required: true },
  currentEventDescription: { type: String, required: true },
  briefingSignals: { type: Array as PropType<BriefingSignal[]>, required: true },
  briefingFeaturedStocks: { type: Array as PropType<BriefingFeaturedStock[]>, required: true },
  phaseView: { type: String as PropType<PhaseView>, required: true },
  phaseTradeCount: { type: Number, required: true },
  phaseBuyCount: { type: Number, required: true },
  phaseSellCount: { type: Number, required: true },
  phaseTradeLocked: { type: Boolean, required: true },
  selectedStockLocked: { type: Boolean, required: true },
  canBuySelected: { type: Boolean, required: true },
  canSellSelected: { type: Boolean, required: true },
})

const emit = defineEmits<{
  showBriefing: []
  showTrade: []
  selectStock: [code: string]
  setTradeQuantity: [value: number]
  nudgeTradeQuantity: [delta: number]
  buy: []
  buyMax: []
  sell: []
  sellAll: []
  advance: []
}>()

const updateTradeQuantity = (event: Event) => {
  emit('setTradeQuantity', Math.max(1, Math.floor(Number((event.target as HTMLInputElement).value) || 1)))
}

const getStockByCode = (code: string) => props.stocks.find((stock) => stock.code === code)

const quantityControlDisabled = computed(() => !props.canBuySelected && !props.canSellSelected)
const investedValue = computed(() => Math.max(0, props.totalAssets - props.cash))
const holdingCount = computed(() => props.holdings.length)
const totalHoldingQuantity = computed(() => props.holdings.reduce((sum, holding) => sum + holding.quantity, 0))

const deskHoldings = computed(() =>
  props.holdings
    .map((holding) => {
      const stock = getStockByCode(holding.code)

      return {
        ...holding,
        name: stock?.name ?? holding.code,
        currentValue: (stock?.price ?? 0) * holding.quantity,
      }
    })
    .sort((left, right) => right.currentValue - left.currentValue)
    .slice(0, 3),
)

const phasePillLabel = computed(() => {
  if (props.phaseTradeLocked) {
    return '더 거래할 건 없어요'
  }

  if (props.phaseTradeCount > 0) {
    return `${props.phaseTradeCount}개 종목 거래했어요`
  }

  return '브리핑 보는 중'
})

const selectedStockTradeHint = computed(() => {
  if (props.phaseTradeLocked) {
    return '이번 페이즈에서는 더 거래할 수 없어요. 다음 페이즈로 넘어가서 가격이 어떻게 움직였는지 볼까요?'
  }

  if (props.selectedStockLocked) {
    return '이 종목은 이번 페이즈에서 이미 거래했어요. 다른 종목으로 이어서 가보면 돼요.'
  }

  if (!props.canBuySelected && props.canSellSelected) {
    return '지금은 매도만 할 수 있는 종목이에요.'
  }

  if (props.canBuySelected && !props.canSellSelected) {
    return '지금은 매수만 할 수 있는 종목이에요.'
  }

  if (quantityControlDisabled.value) {
    return '지금은 수량을 조정할 수 없어요. 다른 종목이나 보유 현황을 같이 봐보세요.'
  }

  return ''
})

const tradeStatusMessage = computed(() => {
  if (selectedStockTradeHint.value) {
    return selectedStockTradeHint.value
  }

  return props.flashMessage || props.lastAction
})
</script>

<template>
  <section class="game-layout scene-panel">
    <section class="panel market-hero">
      <div class="market-hero-top">
        <div class="market-hero-copy">
          <p class="eyebrow">PHASE {{ currentPhase }}</p>
          <h1>{{ phaseView === 'briefing' ? '브리핑' : '투자 데스크' }}</h1>
          <p class="market-hero-text">
            {{ phaseView === 'briefing'
              ? '개장 전 흐름을 먼저 보고 오늘 볼 종목을 빠르게 골라봐요.'
              : '선택한 종목 가격과 보유 현황을 같이 보면서 바로 사고팔 수 있어요.' }}
          </p>

          <div class="market-view-switch" aria-label="화면 전환">
            <button
              class="market-view-card"
              :class="{ active: phaseView === 'briefing' }"
              @click="$emit('showBriefing')"
            >
              <span>브리핑</span>
              <strong>보러 가기</strong>
            </button>
            <button
              class="market-view-card"
              :class="{ active: phaseView === 'trade' }"
              @click="$emit('showTrade')"
            >
              <span>투자</span>
              <strong>바로 하기</strong>
            </button>
          </div>
        </div>

        <aside class="desk-holdings">
          <div class="desk-holdings-head">
            <div>
              <span>내 보유현황</span>
              <strong>{{ holdingCount }}종목</strong>
            </div>
            <div class="desk-holdings-head-right">
              <span class="desk-phase-chip">PHASE {{ currentPhase }} / {{ totalPhases }}</span>
              <strong class="score-chip">{{ score.toLocaleString() }} pt</strong>
            </div>
          </div>

          <div class="desk-holdings-metrics">
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

          <div v-if="deskHoldings.length > 0" class="desk-holdings-list">
            <article v-for="holding in deskHoldings" :key="holding.code" class="desk-holding-row">
              <div class="holding-name-line">
                <StockIcon :code="holding.code" size="sm" />
                <strong>{{ holding.name }}</strong>
              </div>
              <span>{{ holding.quantity }}주 · {{ holding.currentValue.toLocaleString() }}원</span>
            </article>
          </div>

          <div v-else class="desk-holdings-empty">
            <strong>아직 담아 둔 종목이 없어요.</strong>
            <span>브리핑 보고 이번 페이즈 첫 포지션을 잡아봐요.</span>
          </div>
        </aside>
      </div>
    </section>

    <div class="phase-carousel">
      <Transition name="phase-panel" mode="out-in">
        <section v-if="phaseView === 'briefing'" key="briefing" class="phase-slide phase-slide-briefing">
          <div class="briefing-layout">
            <section class="panel briefing-spotlight">
              <div class="section-header">
                <div>
                  <p class="eyebrow">PRE-MARKET SIGNAL</p>
                  <h2>{{ currentEventTitle }}</h2>
                </div>
                <span class="event-pill">{{ phasePillLabel }}</span>
              </div>

              <p class="briefing-copy">{{ currentEventDescription }}</p>

              <div class="briefing-signal-grid">
                <article
                  v-for="signal in briefingSignals"
                  :key="signal.id"
                  class="briefing-signal-card"
                  :class="`tone-${signal.tone}`"
                >
                  <span>{{ signal.label }}</span>
                  <strong>{{ signal.value }}</strong>
                </article>
              </div>
            </section>

            <section class="panel briefing-watchlist">
              <div class="section-header">
                <div>
                  <p class="eyebrow">WATCHLIST PICKS</p>
                  <h3>핵심 종목 후보</h3>
                </div>
                <span class="stock-count-chip">{{ briefingFeaturedStocks.length }}개 포인트</span>
              </div>

              <div class="featured-stock-grid">
                <button
                  v-for="stock in briefingFeaturedStocks"
                  :key="stock.code"
                  class="featured-stock-card"
                  :class="[`tone-${stock.tone}`, { selected: stock.code === selectedCode }]"
                  @click="$emit('selectStock', stock.code)"
                >
                  <div class="featured-stock-top">
                    <div class="featured-stock-copy">
                      <div class="stock-name-line">
                        <StockIcon :code="stock.code" size="sm" />
                        <strong>{{ stock.name }}</strong>
                      </div>
                      <span>{{ stock.theme }} · {{ stock.riskLabel }}</span>
                    </div>
                    <em :class="stock.changeRate >= 0 ? 'up' : 'down'">
                      {{ stock.changeRate > 0 ? '+' : '' }}{{ stock.changeRate.toFixed(1) }}%
                    </em>
                  </div>
                  <div class="featured-stock-bottom">
                    <small>{{ stock.reason }}</small>
                    <MiniChart
                      :values="getStockByCode(stock.code)?.history ?? [stock.price, stock.price]"
                      :positive="stock.changeRate >= 0"
                    />
                  </div>
                </button>
              </div>
            </section>

            <section class="panel briefing-focus">
              <div class="section-header">
                <div>
                  <p class="eyebrow">FOCUS STOCK</p>
                  <div class="title-with-icon compact">
                    <StockIcon :code="selectedStock.code" size="sm" />
                    <h3>{{ selectedStock.name }}</h3>
                  </div>
                </div>
                <span class="stock-count-chip">{{ selectedStock.theme }}</span>
              </div>

              <Transition name="detail-fade" mode="out-in">
                <div :key="selectedStock.code" class="briefing-focus-card">
                  <div
                    class="price-card briefing-price-card"
                    :class="selectedStock.changeRate > 0 ? 'tone-rise' : selectedStock.changeRate < 0 ? 'tone-fall' : 'tone-neutral'"
                  >
                    <div class="briefing-price-top">
                      <div class="briefing-price-copy">
                        <span>현재 가격</span>
                        <strong>{{ selectedStock.price.toLocaleString() }}원</strong>
                      </div>
                      <em :class="selectedStock.changeRate >= 0 ? 'up' : 'down'">
                        {{ selectedStock.changeRate > 0 ? '+' : '' }}{{ selectedStock.changeRate.toFixed(1) }}%
                      </em>
                    </div>

                    <div class="briefing-price-bottom">
                      <MiniChart :values="selectedStock.history" :positive="selectedStock.changeRate >= 0" />
                    </div>
                  </div>

                  <div class="briefing-mini-grid">
                    <article>
                      <span>보유 수량</span>
                      <strong>{{ selectedHoldingQuantity }}주</strong>
                    </article>
                    <article>
                      <span>가능 매수</span>
                      <strong>{{ maxAffordableQuantity }}주</strong>
                    </article>
                    <article>
                      <span>추천 수량</span>
                      <strong>{{ recommendedTradeQuantity }}주</strong>
                    </article>
                  </div>
                </div>
              </Transition>
            </section>
          </div>
        </section>

        <section v-else key="trade" class="phase-slide phase-slide-trade">
          <div class="main-grid enhanced-grid">
            <section class="panel stock-panel board-panel">
              <div class="section-header">
                <div>
                  <p class="eyebrow">MARKET BOARD</p>
                  <h2>오늘의 종목</h2>
                </div>
                <span class="stock-count-chip">{{ stocks.length }}개 종목</span>
              </div>

              <div class="stock-list compact-stock-list">
                <button
                  v-for="stock in stocks"
                  :key="stock.code"
                  class="stock-row"
                  :class="{ selected: selectedCode === stock.code }"
                  @click="$emit('selectStock', stock.code)"
                >
                  <div class="stock-row-copy">
                    <div class="stock-name-line">
                      <StockIcon :code="stock.code" size="sm" />
                      <strong>{{ stock.name }}</strong>
                    </div>
                    <span>{{ stock.theme }} · {{ stock.riskLabel }}</span>
                  </div>
                  <div class="stock-row-right">
                    <MiniChart :values="stock.history" :positive="stock.changeRate >= 0" />
                    <div class="stock-metrics">
                      <strong>{{ stock.price.toLocaleString() }}원</strong>
                      <span :class="stock.changeRate >= 0 ? 'up' : 'down'">
                        {{ stock.changeRate > 0 ? '+' : '' }}{{ stock.changeRate.toFixed(1) }}%
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </section>

            <section class="panel detail-panel board-panel trade-workspace-panel" :class="{ locked: phaseTradeLocked }">
              <div class="detail-top trade-workspace-head">
                <div>
                  <p class="eyebrow">TRADE WORKSPACE</p>
                  <div class="title-with-icon">
                    <StockIcon :code="selectedStock.code" size="md" />
                    <h2>{{ selectedStock.name }}</h2>
                  </div>
                </div>
                <div class="detail-top-actions trade-workspace-meta">
                  <span class="risk-badge">{{ selectedStock.riskLabel }}</span>
                  <div class="trade-slot-mini">
                    <span :class="{ used: phaseBuyCount > 0 }">BUY {{ phaseBuyCount }}</span>
                    <span :class="{ used: phaseSellCount > 0 }">SELL {{ phaseSellCount }}</span>
                  </div>
                </div>
              </div>

              <div class="trade-workspace-grid">
                <section class="trade-detail-panel">
                  <Transition name="detail-fade" mode="out-in">
                    <div :key="selectedStock.code" class="detail-focus-card">
                      <div
                        class="price-card briefing-price-card trade-price-card"
                        :class="selectedStock.changeRate > 0 ? 'tone-rise' : selectedStock.changeRate < 0 ? 'tone-fall' : 'tone-neutral'"
                      >
                        <div class="briefing-price-top">
                          <div class="briefing-price-copy">
                            <span>현재 가격</span>
                            <strong>{{ selectedStock.price.toLocaleString() }}원</strong>
                          </div>
                          <em :class="selectedStock.changeRate >= 0 ? 'up' : 'down'">
                            {{ selectedStock.changeRate > 0 ? '+' : '' }}{{ selectedStock.changeRate.toFixed(1) }}%
                          </em>
                        </div>

                        <div class="briefing-price-bottom">
                          <MiniChart :values="selectedStock.history" :positive="selectedStock.changeRate >= 0" />
                        </div>
                      </div>

                      <div class="info-grid info-grid-wide trade-info-grid">
                        <article>
                          <span>테마</span>
                          <strong>{{ selectedStock.theme }}</strong>
                        </article>
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

                <section class="trade-panel trade-side-panel">
                  <div class="trade-control-stack">
                    <div class="quantity-stepper">
                      <button
                        class="stepper-button"
                        :disabled="quantityControlDisabled || tradeQuantity <= 1"
                        @click="$emit('nudgeTradeQuantity', -1)"
                      >
                        -
                      </button>
                      <input
                        id="quantity"
                        :value="tradeQuantity"
                        type="number"
                        min="1"
                        :disabled="quantityControlDisabled"
                        @input="updateTradeQuantity"
                      />
                      <button class="stepper-button" :disabled="quantityControlDisabled" @click="$emit('nudgeTradeQuantity', 1)">+</button>
                    </div>

                    <div class="quantity-chips">
                      <button
                        class="pill-button"
                        :disabled="quantityControlDisabled"
                        @click="$emit('setTradeQuantity', recommendedTradeQuantity)"
                      >
                        추천 {{ recommendedTradeQuantity }}주
                      </button>
                      <button
                        class="pill-button"
                        :disabled="quantityControlDisabled || selectedHoldingQuantity <= 0"
                        @click="$emit('setTradeQuantity', selectedHoldingQuantity)"
                      >
                        {{ selectedHoldingQuantity > 0 ? '보유 ' + selectedHoldingQuantity + '주' : '보유 없음' }}
                      </button>
                      <button
                        class="pill-button"
                        :disabled="quantityControlDisabled || maxAffordableQuantity <= 0"
                        @click="$emit('setTradeQuantity', maxAffordableQuantity)"
                      >
                        {{ maxAffordableQuantity > 0 ? '가능 ' + maxAffordableQuantity + '주' : '매수 여력 없음' }}
                      </button>
                    </div>

                    <div class="trade-actions trade-actions-primary">
                      <button class="action-button buy-button" :disabled="!canBuySelected" @click="$emit('buy')">매수 실행</button>
                      <button class="action-button sell-button" :disabled="!canSellSelected" @click="$emit('sell')">매도 실행</button>
                    </div>

                    <div class="trade-actions trade-actions-secondary">
                      <button class="utility-button" :disabled="!canBuySelected" @click="$emit('buyMax')">살 수 있는 만큼 매수</button>
                      <button class="utility-button" :disabled="!canSellSelected" @click="$emit('sellAll')">들고 있는 수량 전부 매도</button>
                    </div>

                    <div v-if="tradeStatusMessage" class="trade-inline-status">
                      <span>{{ tradeStatusMessage }}</span>
                    </div>

                    <button class="primary-button full-width pulse-cta" @click="$emit('advance')">
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
