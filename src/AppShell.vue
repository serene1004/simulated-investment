<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import GameBoard from './components/GameBoard.vue';
import HomeScreen from './components/HomeScreen.vue';
import RankingScreen from './components/RankingScreen.vue';
import ResultScreen from './components/ResultScreen.vue';
import MarketTicker from './components/MarketTicker.vue';
import SummaryScreen from './components/SummaryScreen.vue';
import { useInvestmentGame } from './composables/useInvestmentGame';
import type { GameMode, Screen } from './types/game';
import { useRoute, useRouter } from 'vue-router';

const {
  advancePhase,
  briefingFeaturedStocks,
  briefingSignals,
  buyMaxStock,
  buyStock,
  canBuyMaxSelected,
  canBuySelected,
  canSellAllSelected,
  canSellSelected,
  cash,
  continueFromSummary,
  currentEventDescription,
  currentEventTitle,
  gameMode,
  currentPhase,
  currentScreen,
  goToResult,
  holdings,
  holdingsMap,
  isFinalSummary,
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
  registerRanking,
  resetGame,
  returnRate,
  score,
  selectStock,
  selectedCode,
  selectedHoldingQuantity,
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
} = useInvestmentGame();
const router = useRouter();
const route = useRoute();

const routeNameForState = (screen: Screen, mode: GameMode) => {
  if (screen === 'game') {
    return mode === 'ranking' ? 'ranking-game' : 'practice-game';
  }
  return screen;
};

const syncStateFromRoute = () => {
  if (route.name === 'practice-game') {
    if (currentScreen.value !== 'game' || gameMode.value !== 'practice') {
      startGame('practice');
    }
  } else if (route.name === 'ranking-game') {
    if (currentScreen.value !== 'game' || gameMode.value !== 'ranking') {
      startGame('ranking');
    }
  } else if (route.name === 'ranking') {
    openScreen('ranking');
  } else if (route.name === 'summary') {
    currentScreen.value = 'summary';
  } else if (route.name === 'result') {
    currentScreen.value = 'result';
  } else {
    openScreen('home');
  }
};

watch(() => route.name, syncStateFromRoute, { immediate: true });
watch([currentScreen, gameMode], ([screen, mode]) => {
  const targetName = routeNameForState(screen, mode);
  if (route.name !== targetName) {
    void router.push({ name: targetName });
  }
});

type TradeConfirmAction = 'buy' | 'buyMax' | 'sell' | 'sellAll';
const showQuitConfirm = ref(false);
const showTradeConfirm = ref(false);
const pendingTradeAction = ref<TradeConfirmAction | null>(null);
const formatWon = (value: number) => `${new Intl.NumberFormat('ko-KR').format(value)}원`;

const tradeConfirmMeta = computed(() => {
  const action = pendingTradeAction.value;

  if (!action) {
    return null;
  }

  const quantity = action === 'buyMax'
    ? maxAffordableQuantity.value
    : action === 'sellAll'
      ? selectedHoldingQuantity.value
      : tradeQuantity.value;
  const total = quantity * selectedStock.value.price;

  if (action === 'buy') {
    return {
      eyebrow: 'BUY ORDER',
      title: '매수할까요?',
      copy: `${selectedStock.value.name} ${quantity}주를 ${formatWon(total)}에 매수해요.`,
      buttonLabel: '매수하기',
      buttonClass: 'confirm-buy-button',
    };
  }

  if (action === 'buyMax') {
    return {
      eyebrow: 'MAX BUY',
      title: '풀 매수할까요?',
      copy: `${selectedStock.value.name} ${quantity}주를 한 번에 매수해요.`,
      buttonLabel: '풀 매수하기',
      buttonClass: 'confirm-buy-button',
    };
  }

  if (action === 'sell') {
    return {
      eyebrow: 'SELL ORDER',
      title: '매도할까요?',
      copy: `${selectedStock.value.name} ${quantity}주를 매도해요.`,
      buttonLabel: '매도하기',
      buttonClass: 'confirm-sell-button',
    };
  }

  return {
    eyebrow: 'SELL ALL',
    title: '풀 매도할까요?',
    copy: `${selectedStock.value.name} 보유 수량 ${quantity}주를 전부 매도해요.`,
    buttonLabel: '풀 매도하기',
    buttonClass: 'confirm-sell-button',
  };
});

const requestQuitGame = () => {
  showQuitConfirm.value = true;
};

const cancelQuitGame = () => {
  showQuitConfirm.value = false;
};

const confirmQuitGame = () => {
  showQuitConfirm.value = false;
  resetGame();
};

const requestTradeConfirm = (action: TradeConfirmAction) => {
  if (action === 'buy' && !canBuySelected.value) {
    return;
  }

  if (action === 'buyMax' && !canBuyMaxSelected.value) {
    return;
  }

  if (action === 'sell' && !canSellSelected.value) {
    return;
  }

  if (action === 'sellAll' && !canSellAllSelected.value) {
    return;
  }

  pendingTradeAction.value = action;
  showTradeConfirm.value = true;
};

const cancelTradeConfirm = () => {
  showTradeConfirm.value = false;
  pendingTradeAction.value = null;
};

const confirmTradeAction = () => {
  const action = pendingTradeAction.value;

  if (!action) {
    return;
  }

  showTradeConfirm.value = false;

  if (action === 'buy') {
    buyStock();
  } else if (action === 'buyMax') {
    buyMaxStock();
  } else if (action === 'sell') {
    sellStock();
  } else {
    sellAllStock();
  }

  pendingTradeAction.value = null;
};
</script>

<template>
  <div class="app-root">
    <div class="app-backdrop" aria-hidden="true">
      <div class="app-backdrop-grid"></div>
      <svg class="app-backdrop-wave app-backdrop-wave-a" viewBox="0 0 600 220" fill="none">
        <path class="app-backdrop-wave-path" d="M0 190 52 172 96 184 142 138 188 150 236 112 282 128 330 80 374 106 420 64 466 92 514 38 558 58 600 24" />
      </svg>
      <svg class="app-backdrop-wave app-backdrop-wave-b" viewBox="0 0 600 220" fill="none">
        <path class="app-backdrop-wave-path" d="M0 48 52 66 98 54 146 94 190 78 238 124 286 102 334 152 380 130 428 176 474 156 522 196 560 182 600 210" />
       </svg>
       <MarketTicker :stocks="stocks" />
        </div>
    <main class="app-frame">
      <Transition name="screen" mode="out-in">
        <HomeScreen
          v-if="currentScreen === 'home'"
          key="home"
          @start="startGame($event as GameMode)"
          @ranking="openScreen('ranking')"
        />

        <GameBoard
          v-else-if="currentScreen === 'game'"
          key="game"
          :cash="cash"
          :current-event-description="currentEventDescription"
          :current-event-title="currentEventTitle"
          :current-phase="currentPhase"
          :briefing-featured-stocks="briefingFeaturedStocks"
          :briefing-signals="briefingSignals"
          :can-buy-max-selected="canBuyMaxSelected"
          :can-buy-selected="canBuySelected"
          :can-sell-all-selected="canSellAllSelected"
          :can-sell-selected="canSellSelected"
          :holdings="holdings"
          :holdings-map="holdingsMap"
          :max-affordable-quantity="maxAffordableQuantity"
          :phase-buy-count="phaseBuyCount"
          :phase-sell-count="phaseSellCount"
          :phase-trade-count="phaseTradeCount"
          :phase-trade-locked="phaseTradeLocked"
          :phase-view="phaseView"
          :score="score"
          :selected-code="selectedCode"
          :selected-holding-quantity="selectedHoldingQuantity"
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
          @buy="requestTradeConfirm('buy')"
          @buy-max="requestTradeConfirm('buyMax')"
          @sell="requestTradeConfirm('sell')"
          @sell-all="requestTradeConfirm('sellAll')"
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
          :is-ranking-mode="gameMode === 'ranking'"
          @update:model-value="nickname = $event"
          @register="registerRanking()"
          @restart="resetGame()"
        />

        <RankingScreen
          v-else
          key="ranking"
          :ranking="ranking"
          @back="openScreen('home')"
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

    <Transition name="confirm-pop">
      <div v-if="showTradeConfirm && tradeConfirmMeta" class="confirm-overlay" @click.self="cancelTradeConfirm()">
        <section class="panel confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="trade-confirm-title">
          <p class="eyebrow">{{ tradeConfirmMeta.eyebrow }}</p>
          <h2 id="trade-confirm-title">{{ tradeConfirmMeta.title }}</h2>
          <p class="confirm-copy">{{ tradeConfirmMeta.copy }}</p>

          <div class="confirm-actions">
            <button class="secondary-button" @click="cancelTradeConfirm()">다시 보기</button>
            <button class="primary-button" :class="tradeConfirmMeta.buttonClass" @click="confirmTradeAction()">
              {{ tradeConfirmMeta.buttonLabel }}
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </div>
</template>

