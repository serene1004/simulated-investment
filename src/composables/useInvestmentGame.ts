import { computed, ref, watch } from 'vue';
import { maxGameDays } from '../data/gameData';
import type { GameEnding, Holding, PendingOrder, PersistedGameState, PhaseEvent, PhaseSummary, PhaseTradeAction, Screen, StockState, TradeSide } from '../types/game';
import {
  afterMarketOpenMinute, bankruptcyFloor, calculateStockMoveRate, clamp, clonePhaseEvent, dailyPriceLimitRate,
  getMarketCapitalization, getPriceRoundingUnit, marketCloseMinute, marketHistorySamplesPerDay, marketOpenMinute,
  marketTicksPerDay, pickRandomPhaseEvent, regularMarketCloseMinute, suggestTradeQuantity, toRoundedPrice,
} from '../game/marketModel';
import { createInitialPersistedState, createSummaryFromStocks, gameStorageKey, normalizePersistedState, readJson } from '../game/gamePersistence';


export const useInvestmentGame = () => {
  const fallbackState = createInitialPersistedState();
  const persistedState = normalizePersistedState(readJson<Partial<PersistedGameState>>(gameStorageKey, fallbackState));

  const currentScreen = ref<Screen>(persistedState.currentScreen);
  const currentPhase = ref(persistedState.currentPhase);
  const ending = ref<GameEnding | null>(persistedState.ending);
  const cash = ref(persistedState.cash);
  const tradeQuantity = ref(persistedState.tradeQuantity);
  const selectedCode = ref(persistedState.selectedCode);
  const stocks = ref<StockState[]>(persistedState.stocks);
  const holdings = ref<Holding[]>(persistedState.holdings);
  const summary = ref<PhaseSummary | null>(persistedState.summary);
  const currentPhaseEvent = ref<PhaseEvent>(clonePhaseEvent(persistedState.currentPhaseEvent));
  const phaseTradeActions = ref<PhaseTradeAction[]>(persistedState.phaseTradeActions);
  const pendingOrders = ref<PendingOrder[]>(persistedState.pendingOrders);
  const marketMinute = ref(persistedState.marketMinute);
  const marketIndexBaseCapitalization = ref(persistedState.marketIndexBaseCapitalization);
  const marketIndexPreviousClose = ref(persistedState.marketIndexPreviousClose);
  const marketDayOpeningAssets = ref(persistedState.marketDayOpeningAssets);
  const marketDayAssetHistory = ref(persistedState.marketDayAssetHistory);
  const flashMessage = ref('');

  const currentEventTitle = computed(() => currentPhaseEvent.value.title);
  const currentEventDescription = computed(() => currentPhaseEvent.value.description);
  const selectedStock = computed(() => stocks.value.find((stock) => stock.code === selectedCode.value) ?? stocks.value[0]);

  const holdingsMap = computed(() =>
    holdings.value.reduce<Record<string, Holding>>((accumulator, holding) => {
      accumulator[holding.code] = holding;
      return accumulator;
    }, {}),
  );

  const portfolioValue = computed(() =>
    holdings.value.reduce((sum, holding) => {
      const stock = stocks.value.find((item) => item.code === holding.code);
      return sum + (stock?.price ?? 0) * holding.quantity;
    }, 0),
  );

  const totalAssets = computed(() => cash.value + portfolioValue.value);
  const marketOpen = computed(() => currentScreen.value === 'game' && marketMinute.value < marketCloseMinute && !(marketMinute.value >= regularMarketCloseMinute && marketMinute.value < afterMarketOpenMinute) && ending.value === null);
  const marketIndexValue = computed(() => Number((getMarketCapitalization(stocks.value) / marketIndexBaseCapitalization.value * 1000).toFixed(2)));
  const marketIndexChange = computed(() => Number((marketIndexValue.value - marketIndexPreviousClose.value).toFixed(2)));
  const marketIndexChangeRate = computed(() => marketIndexPreviousClose.value ? (marketIndexChange.value / marketIndexPreviousClose.value) * 100 : 0);
  const reservedCash = computed(() => pendingOrders.value.reduce((sum, order) => sum + (order.side === 'buy' ? order.quantity * order.limitPrice : 0), 0));
  const availableCash = computed(() => Math.max(0, cash.value - reservedCash.value));
  const strongestStock = computed(() => stocks.value.find((stock) => stock.code === summary.value?.strongestStockCode) ?? null);
  const weakestStock = computed(() => stocks.value.find((stock) => stock.code === summary.value?.weakestStockCode) ?? null);
  const reservedShares = computed(() => pendingOrders.value.filter((order) => order.code === selectedCode.value && order.side === 'sell').reduce((sum, order) => sum + order.quantity, 0));
  const selectedHoldingQuantity = computed(() => Math.max(0, (holdingsMap.value[selectedCode.value]?.quantity ?? 0) - reservedShares.value));
  const maxAffordableQuantity = computed(() => Math.max(0, Math.floor(availableCash.value / (selectedStock.value?.price ?? Number.MAX_SAFE_INTEGER))));
  const canBuyMaxSelected = computed(() => maxAffordableQuantity.value > 0);
  const canSellAllSelected = computed(() => selectedHoldingQuantity.value > 0);
  const canBuySelected = computed(() => marketOpen.value && !selectedStock.value?.halted && canBuyMaxSelected.value && tradeQuantity.value <= maxAffordableQuantity.value);
  const canSellSelected = computed(() => marketOpen.value && !selectedStock.value?.halted && canSellAllSelected.value && tradeQuantity.value <= selectedHoldingQuantity.value);
  const saveGameState = () => {
    if (typeof window === 'undefined') return;
    const payload: PersistedGameState = {
      currentScreen: currentScreen.value, currentPhase: currentPhase.value,
      ending: ending.value, cash: cash.value, tradeQuantity: tradeQuantity.value, selectedCode: selectedCode.value,
      stocks: stocks.value, holdings: holdings.value, summary: summary.value, currentPhaseEvent: currentPhaseEvent.value,
      phaseTradeActions: phaseTradeActions.value, pendingOrders: pendingOrders.value, marketMinute: marketMinute.value,
      marketDayOpeningAssets: marketDayOpeningAssets.value, marketDayAssetHistory: marketDayAssetHistory.value,
      marketIndexBaseCapitalization: marketIndexBaseCapitalization.value, marketIndexPreviousClose: marketIndexPreviousClose.value,
    };
    try {
      window.localStorage.setItem(gameStorageKey, JSON.stringify(payload));
    } catch {
      // Keep the current session playable when browser storage is unavailable or full.
    }
  };

  watch(
    [currentScreen, currentPhase, ending, cash, tradeQuantity, selectedCode, stocks, holdings, summary, currentPhaseEvent, phaseTradeActions, pendingOrders, marketMinute, marketDayOpeningAssets, marketDayAssetHistory, marketIndexBaseCapitalization, marketIndexPreviousClose],
    saveGameState,
    { deep: true },
  );

  const setFlashMessage = (message: string) => {
    flashMessage.value = message;

    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        if (flashMessage.value === message) {
          flashMessage.value = '';
        }
      }, 1800);
    }
  };

  const setTradeQuantity = (value: number) => {
    tradeQuantity.value = clamp(Math.floor(Number(value) || 1), 1, 9999);
  };

  const nudgeTradeQuantity = (delta: number) => {
    setTradeQuantity(tradeQuantity.value + delta);
  };

  const getSuggestedTradeQuantity = (stockCode: string) => {
    const stock = stocks.value.find((item) => item.code === stockCode);
    const ownedQuantity = holdingsMap.value[stockCode]?.quantity ?? 0;

    return suggestTradeQuantity(stock, availableCash.value, ownedQuantity - pendingOrders.value.filter((order) => order.code === stockCode && order.side === 'sell').reduce((sum, order) => sum + order.quantity, 0));
  };

  const syncTradeQuantityForSelectedStock = (stockCode = selectedCode.value) => {
    tradeQuantity.value = getSuggestedTradeQuantity(stockCode);
  };

  const resetGame = () => {
    const nextState = createInitialPersistedState();
    currentScreen.value = nextState.currentScreen;
    currentPhase.value = nextState.currentPhase;
    ending.value = nextState.ending;
    cash.value = nextState.cash;
    tradeQuantity.value = nextState.tradeQuantity;
    selectedCode.value = nextState.selectedCode;
    stocks.value = nextState.stocks;
    holdings.value = nextState.holdings;
    summary.value = nextState.summary;
    currentPhaseEvent.value = clonePhaseEvent(nextState.currentPhaseEvent);
    phaseTradeActions.value = [];
    pendingOrders.value = [];
    marketMinute.value = nextState.marketMinute;
    marketIndexBaseCapitalization.value = nextState.marketIndexBaseCapitalization;
    marketIndexPreviousClose.value = nextState.marketIndexPreviousClose;
    marketDayOpeningAssets.value = nextState.marketDayOpeningAssets;
    marketDayAssetHistory.value = nextState.marketDayAssetHistory;
    flashMessage.value = '';
    syncTradeQuantityForSelectedStock(nextState.selectedCode);
  };

  const startGame = () => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(gameStorageKey);
      } catch {
        // Reset the in-memory game even when browser storage is unavailable.
      }
    }
    resetGame();
    currentScreen.value = 'game';
    beginMarketDay();
  };

  const beginMarketDay = () => {
    marketIndexPreviousClose.value = marketIndexValue.value;
    marketMinute.value = marketOpenMinute;
    marketDayOpeningAssets.value = totalAssets.value;
    marketDayAssetHistory.value = [totalAssets.value];
    phaseTradeActions.value = [];
    currentPhaseEvent.value = pickRandomPhaseEvent();
    stocks.value = stocks.value.map((stock) => ({ ...stock, previousPrice: stock.price, previousClose: stock.price, changeRate: 0, sessionStartIndex: stock.history.length - 1 }));
    pendingOrders.value = [];
    ending.value = null;
    summary.value = null;
    currentScreen.value = 'game';
  };

  const openScreen = (screen: Screen) => {
    currentScreen.value = screen;
  };

  const selectStock = (code: string) => {
    if (!stocks.value.some((stock) => stock.code === code)) {
      return;
    }

    selectedCode.value = code;
    syncTradeQuantityForSelectedStock(code);
  };

  const updateHoldingAfterBuy = (stockCode: string, quantity: number, price: number) => {
    const existingHolding = holdings.value.find((holding) => holding.code === stockCode);

    if (!existingHolding) {
      holdings.value = [...holdings.value, { code: stockCode, quantity, averagePrice: price }];
      return;
    }

    const totalCost = existingHolding.averagePrice * existingHolding.quantity + price * quantity;
    const totalQuantity = existingHolding.quantity + quantity;
    existingHolding.quantity = totalQuantity;
    existingHolding.averagePrice = Math.round(totalCost / totalQuantity);
  };

  const createLimitOrder = (side: TradeSide, quantity: number, limitPrice: number) => {
    if (!marketOpen.value) return;
    const stock = selectedStock.value;
    if (stock.halted) {
      setFlashMessage('상한가 또는 하한가에 도달해 오늘은 거래할 수 없어요.');
      return;
    }
    const orderQuantity = Math.floor(quantity);
    if (!Number.isFinite(limitPrice) || limitPrice <= 0 || orderQuantity <= 0) return;
    if (side === 'buy' && orderQuantity * limitPrice > availableCash.value) {
      setFlashMessage('예약 매수에 필요한 예수금이 부족해요.');
      return;
    }
    if (side === 'sell' && orderQuantity > selectedHoldingQuantity.value) {
      setFlashMessage('예약 매도할 수 있는 수량이 부족해요.');
      return;
    }
    pendingOrders.value = [...pendingOrders.value, {
      id: Math.max(0, ...pendingOrders.value.map((order) => order.id)) + 1,
      code: stock.code,
      side,
      quantity: orderQuantity,
      limitPrice: Math.floor(limitPrice),
    }];
    setFlashMessage(`${stock.name} ${side === 'buy' ? '매수' : '매도'} 예약을 걸었어요.`);
  };

  const cancelLimitOrder = (id: number) => {
    pendingOrders.value = pendingOrders.value.filter((order) => order.id !== id);
  };

  const fillLimitOrders = () => {
    const unfilled: PendingOrder[] = [];
    const fills: string[] = [];
    for (const order of pendingOrders.value) {
      const stock = stocks.value.find((item) => item.code === order.code);
      if (!stock || stock.halted || (order.side === 'buy' ? stock.price > order.limitPrice : stock.price < order.limitPrice)) {
        unfilled.push(order);
        continue;
      }
      if (order.side === 'buy') {
        const cost = stock.price * order.quantity;
        if (cash.value < cost) {
          unfilled.push(order);
          continue;
        }
        cash.value -= cost;
        updateHoldingAfterBuy(order.code, order.quantity, stock.price);
      } else {
        const holding = holdings.value.find((item) => item.code === order.code);
        if (!holding || holding.quantity < order.quantity) continue;
        holding.quantity -= order.quantity;
        cash.value += stock.price * order.quantity;
        if (!holding.quantity) holdings.value = holdings.value.filter((item) => item.code !== order.code);
      }
      appendPhaseTradeAction(order.side, stock, order.quantity);
      fills.push(`${stock.name} ${order.quantity}주 ${order.side === 'buy' ? '예약 매수' : '예약 매도'} 체결`);
    }
    pendingOrders.value = unfilled;
    if (fills.length) setFlashMessage(fills.join(' · '));
  };

  const appendPhaseTradeAction = (side: TradeSide, stock: StockState, quantity: number) => {
    const label = `${stock.name} ${quantity}주 ${side === 'buy' ? '매수' : '매도'}`;

    phaseTradeActions.value = [
      ...phaseTradeActions.value,
      {
        code: stock.code,
        side,
        quantity,
        label,
        price: stock.price,
        marketMinute: marketMinute.value,
      },
    ];

  };

  const buyStock = () => {
    if (!marketOpen.value) {
      setFlashMessage('거래 가능 시간에만 주문할 수 있어요.');
      return;
    }
    const quantity = Math.max(1, Math.floor(Number(tradeQuantity.value) || 1));
    const stock = selectedStock.value;
    if (stock.halted) {
      setFlashMessage('상한가 또는 하한가에 도달해 오늘은 거래할 수 없어요.');
      return;
    }

    if (!stock) {
      return;
    }

    const totalCost = stock.price * quantity;

    if (availableCash.value < totalCost) {
      setFlashMessage('현금이 조금 부족해요.');
      return;
    }

    cash.value -= totalCost;
    updateHoldingAfterBuy(stock.code, quantity, stock.price);
    appendPhaseTradeAction('buy', stock, quantity);
    setFlashMessage(`${stock.name} ${quantity}주 매수했어요.`);
  };

  const sellStock = () => {
    if (!marketOpen.value) {
      setFlashMessage('거래 가능 시간에만 주문할 수 있어요.');
      return;
    }
    const quantity = Math.max(1, Math.floor(Number(tradeQuantity.value) || 1));
    const stock = selectedStock.value;
    if (stock.halted) {
      setFlashMessage('상한가 또는 하한가에 도달해 오늘은 거래할 수 없어요.');
      return;
    }

    if (!stock) {
      return;
    }

    const existingHolding = holdings.value.find((holding) => holding.code === stock.code);

    if (!existingHolding || selectedHoldingQuantity.value < quantity) {
      setFlashMessage('팔 수 있는 보유 수량이 부족해요.');
      return;
    }

    cash.value += stock.price * quantity;
    existingHolding.quantity -= quantity;

    if (existingHolding.quantity <= 0) {
      holdings.value = holdings.value.filter((holding) => holding.code !== stock.code);
    }

    appendPhaseTradeAction('sell', stock, quantity);
    setFlashMessage(`${stock.name} ${quantity}주 매도했어요.`);
  };

  const updateLiveMarket = () => {
    const event = currentPhaseEvent.value;
    const volatility = marketMinute.value >= afterMarketOpenMinute ? 0.08 : 0.14;
    stocks.value = stocks.value.map((stock) => {
      if (stock.halted) return stock;
      const moveRate = calculateStockMoveRate(stock, event, volatility, 1 / marketTicksPerDay, volatility / marketTicksPerDay);
      const upperReference = stock.previousClose * (1 + dailyPriceLimitRate / 100);
      const lowerReference = stock.previousClose * (1 - dailyPriceLimitRate / 100);
      const upperUnit = getPriceRoundingUnit(upperReference);
      const lowerUnit = getPriceRoundingUnit(lowerReference);
      const upperLimit = Math.floor(upperReference / upperUnit) * upperUnit;
      const lowerLimit = Math.ceil(lowerReference / lowerUnit) * lowerUnit;
      const price = clamp(toRoundedPrice(stock.price * (1 + moveRate / 100)), lowerLimit, upperLimit);
      const fullHistory = [...stock.history, price];
      const history = fullHistory.slice(-80);
      const removedHistoryCount = fullHistory.length - history.length;

      return {
        ...stock,
        price,
        changeRate: Number((((price - stock.previousClose) / stock.previousClose) * 100).toFixed(2)),
        halted: price >= upperLimit || price <= lowerLimit,
        history,
        sessionStartIndex: Math.max(0, stock.sessionStartIndex - removedHistoryCount),
      };
    });
    pendingOrders.value = pendingOrders.value.filter((order) => !stocks.value.find((stock) => stock.code === order.code)?.halted);
    fillLimitOrders();
    currentPhaseEvent.value = pickRandomPhaseEvent();
    marketDayAssetHistory.value = [...marketDayAssetHistory.value, totalAssets.value].slice(-marketHistorySamplesPerDay);
    if (totalAssets.value <= bankruptcyFloor) {
      ending.value = 'broke';
      currentScreen.value = 'result';
    }
  };

  const closeMarketDay = () => {
    if (currentScreen.value !== 'game' || ending.value) return;
    marketMinute.value = marketCloseMinute;
    pendingOrders.value = [];
    stocks.value = stocks.value.map((stock) => ({
      ...stock,
      dailyHistory: [...stock.dailyHistory.filter((close) => close.day !== currentPhase.value), { day: currentPhase.value, price: stock.price }].slice(-maxGameDays),
    }));
    const phaseProfitRate = marketDayOpeningAssets.value > 0
      ? Number((((totalAssets.value - marketDayOpeningAssets.value) / marketDayOpeningAssets.value) * 100).toFixed(2))
      : 0;
    summary.value = {
      ...createSummaryFromStocks(
        currentPhase.value,
        stocks.value,
        totalAssets.value,
        phaseProfitRate,
        currentPhaseEvent.value,
        phaseTradeActions.value.map((action) => action.label).join(' · ') || '오늘은 거래하지 않았어요.',
      ),
      openingAssets: marketDayOpeningAssets.value,
      assetHistory: marketDayAssetHistory.value.slice(-marketHistorySamplesPerDay),
      trades: [...phaseTradeActions.value],
    };
    currentScreen.value = 'summary';
  };

  const advanceMarketClock = (minutes = 1) => {
    if (currentScreen.value !== 'game' || ending.value || marketMinute.value >= marketCloseMinute) return;
    const previousMinute = marketMinute.value;
    const targetMinute = Math.min(marketCloseMinute, previousMinute + minutes);
    for (let tickMinute = Math.floor(previousMinute / 5) * 5 + 5; tickMinute <= targetMinute && !ending.value; tickMinute += 5) {
      if (tickMinute > regularMarketCloseMinute && tickMinute < afterMarketOpenMinute) continue;
      marketMinute.value = tickMinute;
      updateLiveMarket();
    }
    marketMinute.value = targetMinute;
    if (currentScreen.value === 'game' && !ending.value && marketMinute.value >= marketCloseMinute) closeMarketDay();
  };

  const continueFromSummary = () => {
    if (currentPhase.value >= maxGameDays) {
      ending.value = 'completed';
      currentScreen.value = 'result';
      return;
    }
    summary.value = null;
    currentPhase.value += 1;
    beginMarketDay();
  };

  return {
    advanceMarketClock, buyStock, canBuySelected, canSellSelected, cash, continueFromSummary,
    currentEventDescription, currentEventTitle, currentPhase, ending, currentScreen, flashMessage,
    holdings, holdingsMap, maxAffordableQuantity, availableCash, pendingOrders, marketMinute, marketOpen,
    marketDayOpeningAssets, marketDayAssetHistory, marketIndexValue, marketIndexChange, marketIndexChangeRate, createLimitOrder, cancelLimitOrder,
    nudgeTradeQuantity, openScreen, resetGame, selectStock,
    selectedCode, selectedHoldingQuantity, selectedStock, sellStock, setTradeQuantity, startGame,
    stocks, strongestStock, summary, totalAssets, tradeQuantity, weakestStock,
  };
};
