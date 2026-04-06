<script setup lang="ts">
import { computed, ref } from 'vue'
import GameBoard from './components/GameBoard.vue'
import HomeScreen from './components/HomeScreen.vue'
import RankingScreen from './components/RankingScreen.vue'
import ResultScreen from './components/ResultScreen.vue'
import SummaryScreen from './components/SummaryScreen.vue'
import { useInvestmentGame } from './composables/useInvestmentGame'

const {
  advancePhase,
  briefingFeaturedStocks,
  briefingSignals,
  buyMaxStock,
  buyStock,
  canBuySelected,
  canSellSelected,
  cash,
  clearRanking,
  continueFromSummary,
  currentEventDescription,
  currentEventTitle,
  currentPhase,
  currentScreen,
  flashMessage,
  goToResult,
  holdings,
  holdingsMap,
  isFinalSummary,
  lastAction,
  maxAffordableQuantity,
  nickname,
  nudgeTradeQuantity,
  openBriefingView,
  openScreen,
  openTradeView,
  phaseBuyCount,
  phaseSellCount,
  phaseTradeCount,
  phaseTradeLocked,
  phaseView,
  ranking,
  recommendedTradeQuantity,
  registerRanking,
  resetGame,
  returnRate,
  score,
  selectStock,
  selectedCode,
  selectedHoldingQuantity,
  selectedStockLocked,
  selectedStock,
  sellAllStock,
  sellStock,
  setTradeQuantity,
  startGame,
  stocks,
  strongestStock,
  summary,
  totalAssets,
  totalPhases,
  tradeQuantity,
  weakestStock,
} = useInvestmentGame()

type TickerTone = 'rise' | 'fall' | 'neutral'
type TickerItem = {
  id: string
  label: string
  value: string
  tone: TickerTone
}

const tickerCopies = [0, 1]
const numberFormatter = new Intl.NumberFormat('ko-KR')
const showQuitConfirm = ref(false)

const formatWon = (value: number) => `${numberFormatter.format(value)}원`
const formatSignedRate = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`

const toTickerTone = (value: number): TickerTone => {
  if (value > 0) {
    return 'rise'
  }

  if (value < 0) {
    return 'fall'
  }

  return 'neutral'
}

const sortedTickerStocks = computed(() =>
  [...stocks.value].sort((left, right) => {
    const changeGap = Math.abs(right.changeRate) - Math.abs(left.changeRate)

    if (changeGap !== 0) {
      return changeGap
    }

    return right.price - left.price
  }),
)

const rankedStocks = computed(() => [...stocks.value].sort((left, right) => right.changeRate - left.changeRate))

const bottomTickerStocks = computed(() => {
  const rising = rankedStocks.value.slice(0, 3)
  const falling = rankedStocks.value.slice(-3).reverse()
  const seen = new Set<string>()

  return [...rising, ...falling].filter((stock) => {
    if (seen.has(stock.code)) {
      return false
    }

    seen.add(stock.code)
    return true
  })
})

const tickerTopItems = computed<TickerItem[]>(() =>
  sortedTickerStocks.value.map((stock) => ({
    id: `ticker-top-${stock.code}`,
    label: `${stock.name} ${formatWon(stock.price)}`,
    value: formatSignedRate(stock.changeRate),
    tone: toTickerTone(stock.changeRate),
  })),
)

const tickerBottomItems = computed<TickerItem[]>(() =>
  bottomTickerStocks.value.map((stock) => ({
    id: `ticker-bottom-${stock.code}`,
    label: stock.name,
    value: `${formatSignedRate(stock.changeRate)} / ${formatWon(stock.price)}`,
    tone: toTickerTone(stock.changeRate),
  })),
)

const requestQuitGame = () => {
  showQuitConfirm.value = true
}

const cancelQuitGame = () => {
  showQuitConfirm.value = false
}

const confirmQuitGame = () => {
  showQuitConfirm.value = false
  resetGame()
}
</script>

<template>
  <div class="app-shell">
    <div class="market-backdrop" aria-hidden="true">
      <div class="market-grid"></div>
      <svg class="market-wave wave-a" viewBox="0 0 600 220" fill="none">
        <path class="market-wave-path" d="M0 190 52 172 96 184 142 138 188 150 236 112 282 128 330 80 374 106 420 64 466 92 514 38 558 58 600 24" />
      </svg>
      <svg class="market-wave wave-b" viewBox="0 0 600 220" fill="none">
        <path class="market-wave-path" d="M0 48 52 66 98 54 146 94 190 78 238 124 286 102 334 152 380 130 428 176 474 156 522 196 560 182 600 210" />
      </svg>

      <div class="ticker ticker-top">
        <div class="ticker-track">
          <div v-for="copy in tickerCopies" :key="`top-copy-${copy}`" class="ticker-group">
            <span
              v-for="item in tickerTopItems"
              :key="`${item.id}-${copy}`"
              :class="['ticker-item', `tone-${item.tone}`]"
            >
              <span class="ticker-label">{{ item.label }}</span>
              <strong class="ticker-value">{{ item.value }}</strong>
            </span>
          </div>
        </div>
      </div>

      <div class="ticker ticker-bottom">
        <div class="ticker-track">
          <div v-for="copy in tickerCopies" :key="`bottom-copy-${copy}`" class="ticker-group">
            <span
              v-for="item in tickerBottomItems"
              :key="`${item.id}-${copy}`"
              :class="['ticker-item', `tone-${item.tone}`]"
            >
              <span class="ticker-label">{{ item.label }}</span>
              <strong class="ticker-value">{{ item.value }}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>

    <main class="page-frame">
      <Transition name="screen" mode="out-in">
        <HomeScreen
          v-if="currentScreen === 'home'"
          key="home"
          @start="startGame()"
          @ranking="openScreen('ranking')"
        />

        <GameBoard
          v-else-if="currentScreen === 'game'"
          key="game"
          :cash="cash"
          :current-event-description="currentEventDescription"
          :current-event-title="currentEventTitle"
          :current-phase="currentPhase"
          :flash-message="flashMessage"
          :briefing-featured-stocks="briefingFeaturedStocks"
          :briefing-signals="briefingSignals"
          :can-buy-selected="canBuySelected"
          :can-sell-selected="canSellSelected"
          :holdings="holdings"
          :holdings-map="holdingsMap"
          :last-action="lastAction"
          :max-affordable-quantity="maxAffordableQuantity"
          :phase-buy-count="phaseBuyCount"
          :phase-sell-count="phaseSellCount"
          :phase-trade-count="phaseTradeCount"
          :phase-trade-locked="phaseTradeLocked"
          :phase-view="phaseView"
          :recommended-trade-quantity="recommendedTradeQuantity"
          :score="score"
          :selected-code="selectedCode"
          :selected-holding-quantity="selectedHoldingQuantity"
          :selected-stock-locked="selectedStockLocked"
          :selected-stock="selectedStock"
          :stocks="stocks"
          :total-assets="totalAssets"
          :total-phases="totalPhases"
          :trade-quantity="tradeQuantity"
          @show-briefing="openBriefingView()"
          @show-trade="openTradeView()"
          @quit="requestQuitGame()"
          @select-stock="selectStock($event)"
          @set-trade-quantity="setTradeQuantity($event)"
          @nudge-trade-quantity="nudgeTradeQuantity($event)"
          @buy="buyStock()"
          @buy-max="buyMaxStock()"
          @sell="sellStock()"
          @sell-all="sellAllStock()"
          @advance="advancePhase()"
        />

        <SummaryScreen
          v-else-if="currentScreen === 'summary' && summary"
          key="summary"
          :summary="summary"
          :strongest-stock="strongestStock"
          :weakest-stock="weakestStock"
          :is-last-phase="isFinalSummary"
          @next="continueFromSummary()"
          @result="goToResult()"
        />

        <ResultScreen
          v-else-if="currentScreen === 'result'"
          key="result"
          :model-value="nickname"
          :score="score"
          :total-assets="totalAssets"
          :return-rate="returnRate"
          @update:model-value="nickname = $event"
          @register="registerRanking()"
          @restart="resetGame()"
        />

        <RankingScreen
          v-else
          key="ranking"
          :ranking="ranking"
          @back="openScreen('home')"
          @clear="clearRanking()"
        />
      </Transition>
    </main>

    <Transition name="confirm-pop">
      <div v-if="showQuitConfirm" class="confirm-overlay" @click.self="cancelQuitGame()">
        <section class="panel confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="quit-title">
          <p class="eyebrow">QUIT GAME</p>
          <h2 id="quit-title">정말 그만할까요?</h2>
          <p class="confirm-copy">지금 그만하면 이번 플레이는 정리되고 홈으로 돌아가요.</p>

          <div class="confirm-actions">
            <button class="secondary-button" @click="cancelQuitGame()">계속하기</button>
            <button class="primary-button confirm-danger-button" @click="confirmQuitGame()">그만하기</button>
          </div>
        </section>
      </div>
    </Transition>
  </div>
</template>
