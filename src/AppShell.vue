<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import GameBoard from './components/screens/GameBoard.vue';
import HomeScreen from './components/screens/HomeScreen.vue';
import ResultScreen from './components/screens/ResultScreen.vue';
import SummaryScreen from './components/screens/SummaryScreen.vue';
import TradeConfirmDialog from './components/shared/TradeConfirmDialog.vue';
import { useInvestmentGame } from './composables/useInvestmentGame';
import type { GameBoardState, GameView, Screen } from './types/game';
import { gameRouteNames, gameRouteViews } from './game/gameRoutes';
import { useRoute, useRouter } from 'vue-router';

const {
  advanceMarketClock,
  buyStock,
  canBuySelected,
  canSellSelected,
  cash,
  continueFromSummary,
  createLimitOrder,
  cancelLimitOrder,
  currentPhase,
  currentScreen,
  ending,
  flashMessage,
  holdings,
  maxAffordableQuantity,
  availableCash,
  pendingOrders,
  marketMinute,
  marketOpen,
  marketIndexValue,
  marketIndexChange,
  marketIndexChangeRate,
  marketDayOpeningAssets,
  nudgeTradeQuantity,
  openScreen,
  resetGame,
  selectStock,
  selectedCode,
  selectedHoldingQuantity,
  selectedStock,
  sellStock,
  setTradeQuantity,
  startGame,
  stocks,
  strongestStock,
  summary,
  totalAssets,
  tradeQuantity,
  weakestStock,
} = useInvestmentGame();
const router = useRouter();
const route = useRoute();
const gameView = computed(() => gameRouteViews[String(route.name)] ?? 'market');
const isGameRoute = (name: unknown) => typeof name === 'string' && name in gameRouteViews;
const marketRoomBackground = computed(() => {
  const scene = marketMinute.value < 12 * 60 ? 'market-room-morning-pixel.png' : marketMinute.value < 15 * 60 ? 'market-room-noon-pixel.png' : 'market-room-evening-pixel.png';
  return `url('${import.meta.env.BASE_URL}assets/${scene}')`;
});
const titleRoomBackground = `url('${import.meta.env.BASE_URL}assets/title-investor-room-pixel.png')`;
let marketTimer: number | undefined;
const marketSpeed = ref<1 | 2 | 4 | 8>(1);
const gameBoardState = computed<GameBoardState>(() => ({
  view: gameView.value,
  currentPhase: currentPhase.value,
  marketMinute: marketMinute.value,
  marketOpen: marketOpen.value,
  marketIndexValue: marketIndexValue.value,
  marketIndexChange: marketIndexChange.value,
  marketIndexChangeRate: marketIndexChangeRate.value,
  marketSpeed: marketSpeed.value,
  dayOpeningAssets: marketDayOpeningAssets.value,
  flashMessage: flashMessage.value,
  cash: cash.value,
  availableCash: availableCash.value,
  totalAssets: totalAssets.value,
  stocks: stocks.value,
  selectedCode: selectedCode.value,
  selectedStock: selectedStock.value,
  tradeQuantity: tradeQuantity.value,
  maxAffordableQuantity: maxAffordableQuantity.value,
  selectedHoldingQuantity: selectedHoldingQuantity.value,
  holdings: holdings.value,
  pendingOrders: pendingOrders.value,
  canBuySelected: canBuySelected.value,
  canSellSelected: canSellSelected.value,
}));

const startHomeGame = () => startGame();
const navigateGameView = ({ view, code, replace = false }: { view: GameView; code?: string; replace?: boolean }) => {
  if (code) {
    if (!stocks.value.some((stock) => stock.code === code)) return;
    selectStock(code);
  }
  const target = { name: gameRouteNames[view], ...(code ? { params: { code } } : {}) };
  if (route.name === target.name && (!code || route.params.code === code)) return;
  void router[replace ? 'replace' : 'push'](target);
};

onMounted(() => {
  marketTimer = window.setInterval(() => advanceMarketClock(marketSpeed.value), 1000);
});
onUnmounted(() => {
  if (marketTimer !== undefined) {
    window.clearInterval(marketTimer);
  }
});

const syncStateFromRoute = () => {
  if (isGameRoute(route.name)) {
    if (typeof route.params.code === 'string') {
      if (!stocks.value.some((stock) => stock.code === route.params.code)) {
        void router.replace({ name: gameRouteNames.market });
        return;
      }
      selectStock(route.params.code);
    }
    if (currentScreen.value !== 'game') openScreen('game');
  } else if (route.name === 'summary') {
    if (summary.value) {
      currentScreen.value = 'summary';
    } else {
      openScreen('home');
    }
  } else if (route.name === 'result') {
    if (ending.value) {
      currentScreen.value = 'result';
    } else {
      openScreen('home');
    }
  } else {
    openScreen('home');
  }
};

watch(() => route.fullPath, syncStateFromRoute, { immediate: true });
watch(currentScreen, (screen, previousScreen) => {
  if (screen === 'game' && isGameRoute(route.name)) return;
  const targetName: Screen | string = screen === 'game' ? gameRouteNames.market : screen;
  if (route.name === targetName) return;
  const shouldPush = (previousScreen === 'home' && screen === 'game')
    || (previousScreen === 'game' && (screen === 'summary' || screen === 'result'));
  void router[shouldPush ? 'push' : 'replace']({ name: targetName });
});

type TradeConfirmAction = 'buy' | 'sell';
const showTradeConfirm = ref(false);
const pendingTradeAction = ref<TradeConfirmAction | null>(null);

const requestTradeConfirm = (action: TradeConfirmAction) => {
  if (action === 'buy' && !canBuySelected.value) {
    return;
  }

  if (action === 'sell' && !canSellSelected.value) {
    return;
  }

  pendingTradeAction.value = action;
  showTradeConfirm.value = true;
};

const cancelTradeConfirm = () => {
  showTradeConfirm.value = false;
  pendingTradeAction.value = null;
};

watch([currentScreen, marketOpen], ([screen, isOpen]) => {
  if (screen !== 'game' || !isOpen) {
    cancelTradeConfirm();
  }
});

const confirmTradeAction = () => {
  const action = pendingTradeAction.value;

  if (!action) {
    return;
  }

  showTradeConfirm.value = false;

  if (action === 'buy') {
    buyStock();
  } else {
    sellStock();
  }

  pendingTradeAction.value = null;
};
</script>

<template>
  <div class="app-root pixel-market" :class="{ 'is-game-screen': currentScreen !== 'home' }" :style="{ '--market-room-background': marketRoomBackground, '--title-room-background': titleRoomBackground }">
    <div class="app-backdrop" aria-hidden="true"></div>
    <main class="app-frame">
      <Transition name="screen" mode="out-in">
        <HomeScreen
          v-if="currentScreen === 'home'"
          key="home"
          @start="startHomeGame()"
        />

        <GameBoard
          v-else-if="currentScreen === 'game'"
          key="game"
          :state="gameBoardState"
          @select-stock="selectStock($event)"
          @navigate="navigateGameView($event)"
          @set-market-speed="marketSpeed = $event"
          @set-trade-quantity="setTradeQuantity($event)"
          @nudge-trade-quantity="nudgeTradeQuantity($event)"
          @buy="requestTradeConfirm('buy')"
          @sell="requestTradeConfirm('sell')"
          @create-limit-order="createLimitOrder($event.side, $event.quantity, $event.limitPrice)"
          @cancel-limit-order="cancelLimitOrder($event)"
        />

        <SummaryScreen
          v-else-if="currentScreen === 'summary' && summary"
          key="summary"
          :summary="summary"
          :market-minute="marketMinute"
          :stocks="stocks"
          :holdings="holdings"
          :cash="cash"
          :strongest-stock="strongestStock"
          :weakest-stock="weakestStock"
          @next="continueFromSummary()"
        />

        <ResultScreen
          v-else-if="currentScreen === 'result'"
          key="result"
          :total-assets="totalAssets"
          :ending="ending"
          :survival-days="currentPhase"
          @restart="resetGame()"
        />

      </Transition>
    </main>

    <TradeConfirmDialog :open="showTradeConfirm" :action="pendingTradeAction" :stock="selectedStock" :quantity="tradeQuantity" @cancel="cancelTradeConfirm()" @confirm="confirmTradeAction()" />
  </div>
</template>

