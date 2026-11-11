import { maxGameDays, startingCashDefault, stockCatalog } from '../data/gameData';
import type { PersistedGameState, PhaseEvent, PhaseSummary, StockState } from '../types/game';
import {
  clamp, clonePhaseEvent, createInitialStocks, createOpeningStockState, getMarketCapitalization,
  getRepresentativeStockCode, isPhaseEvent, marketCloseMinute, marketHistorySamplesPerDay, marketOpenMinute,
  normalizeStocks, pickRandomPhaseEvent, suggestTradeQuantity,
} from './marketModel';

const gameStorageKey = 'simulated-investment-game-state';

const createInitialPersistedState = (): PersistedGameState => {
  const openingEvent = pickRandomPhaseEvent();
  const openingStocks = createInitialStocks(openingEvent);
  const selectedCode = getRepresentativeStockCode(openingStocks, openingEvent);
  const marketIndexBaseCapitalization = getMarketCapitalization(openingStocks);

  return {
    currentScreen: 'home',
    currentPhase: 1,
    ending: null,
    cash: startingCashDefault,
    tradeQuantity: suggestTradeQuantity(openingStocks.find((stock) => stock.code === selectedCode), startingCashDefault, 0),
    selectedCode,
    stocks: openingStocks,
    holdings: [],
    summary: null,
    currentPhaseEvent: openingEvent,
    phaseTradeActions: [],
    pendingOrders: [],
    marketMinute: marketOpenMinute,
    marketDayOpeningAssets: startingCashDefault,
    marketDayAssetHistory: [startingCashDefault],
    marketIndexBaseCapitalization,
    marketIndexPreviousClose: 1000,
  };
};

const readJson = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const normalizePersistedState = (state: Partial<PersistedGameState>): PersistedGameState => {
  const fallback = createInitialPersistedState();
  const currentPhaseEvent = isPhaseEvent(state.currentPhaseEvent)
    ? clonePhaseEvent(state.currentPhaseEvent)
    : fallback.currentPhaseEvent;
  const savedStocks = state.stocks?.length ? normalizeStocks(state.stocks, state.marketMinute ?? marketOpenMinute, clamp(Math.floor(state.currentPhase ?? 1), 1, maxGameDays)) : fallback.stocks;
  const savedCodes = new Set(savedStocks.map((stock) => stock.code));
  const stocks = [...savedStocks, ...stockCatalog.filter((stock) => !savedCodes.has(stock.code)).map((stock) => createOpeningStockState(stock, currentPhaseEvent))];
  const holdings = state.holdings ?? [];
  const cash = state.cash ?? fallback.cash;
  const savedAssets = cash + holdings.reduce((sum, holding) => sum + (stocks.find((stock) => stock.code === holding.code)?.price ?? 0) * holding.quantity, 0);
  const selectedCode = stocks.some((stock) => stock.code === state.selectedCode) ? state.selectedCode! : getRepresentativeStockCode(stocks, currentPhaseEvent);
  const oldSummary = state.summary;
  const summary: PhaseSummary | null = oldSummary ? {
    phaseNumber: oldSummary.phaseNumber ?? state.currentPhase ?? fallback.currentPhase,
    eventTitle: oldSummary.eventTitle ?? currentPhaseEvent.title,
    eventDescription: oldSummary.eventDescription ?? currentPhaseEvent.description,
    phaseProfitRate: oldSummary.phaseProfitRate ?? 0,
    totalAssets: oldSummary.totalAssets ?? savedAssets,
    strongestStockCode: oldSummary.strongestStockCode ?? '',
    weakestStockCode: oldSummary.weakestStockCode ?? '',
    decisionLabel: oldSummary.decisionLabel ?? '오늘은 거래하지 않았어요.',
    openingAssets: oldSummary.openingAssets ?? savedAssets,
    assetHistory: oldSummary.assetHistory,
    trades: oldSummary.trades ?? [],
  } : null;
  const isKnownScreen = ['home', 'game', 'summary', 'result'].includes(state.currentScreen ?? '');
  const currentScreen = isKnownScreen ? state.currentScreen! : fallback.currentScreen;
  const currentPhase = clamp(Math.floor(state.currentPhase ?? fallback.currentPhase), 1, maxGameDays);

  return {
    currentScreen,
    currentPhase,
    ending: state.ending === 'broke' || state.ending === 'completed' ? state.ending : null,
    cash,
    tradeQuantity: clamp(Math.floor(state.tradeQuantity ?? fallback.tradeQuantity), 1, 9999),
    selectedCode,
    stocks,
    holdings,
    summary,
    currentPhaseEvent,
    phaseTradeActions: state.phaseTradeActions ?? [],
    pendingOrders: (state.pendingOrders ?? []).filter((order) =>
      stockCatalog.some((stock) => stock.code === order.code)
      && !stocks.find((stock) => stock.code === order.code)?.halted
      && (order.side === 'buy' || order.side === 'sell')
      && Number.isInteger(order.quantity) && order.quantity > 0
      && Number.isFinite(order.limitPrice) && order.limitPrice > 0),
    marketMinute: clamp(Math.floor(state.marketMinute ?? marketOpenMinute), marketOpenMinute, marketCloseMinute),
    marketDayOpeningAssets: state.marketDayOpeningAssets ?? savedAssets,
    marketDayAssetHistory: state.marketDayAssetHistory?.length ? state.marketDayAssetHistory.slice(-marketHistorySamplesPerDay) : [savedAssets],
    marketIndexBaseCapitalization: Number.isFinite(state.marketIndexBaseCapitalization) && state.marketIndexBaseCapitalization! > 0
      ? state.marketIndexBaseCapitalization!
      : getMarketCapitalization(stocks),
    marketIndexPreviousClose: Number.isFinite(state.marketIndexPreviousClose) && state.marketIndexPreviousClose! > 0
      ? state.marketIndexPreviousClose!
      : 1000,
  };
};

const createSummaryFromStocks = (
  phaseNumber: number,
  stocks: StockState[],
  totalAssets: number,
  phaseProfitRate: number,
  event: PhaseEvent,
  decisionLabel: string,
): PhaseSummary => {
  const sortedStocks = [...stocks].sort((left, right) => right.changeRate - left.changeRate);
  const weakestStock = sortedStocks[sortedStocks.length - 1];

  return {
    phaseNumber,
    eventTitle: event.title,
    eventDescription: event.description,
    phaseProfitRate,
    totalAssets,
    strongestStockCode: sortedStocks[0]?.code ?? '',
    weakestStockCode: weakestStock?.code ?? '',
    decisionLabel,
  };
};

export { createInitialPersistedState, createSummaryFromStocks, gameStorageKey, normalizePersistedState, readJson };
