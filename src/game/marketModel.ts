import { defaultEventDescription, defaultEventTitle, maxGameDays, phaseEvents, stockCatalog } from '../data/gameData';
import type { BriefingTone, PhaseEvent, StockState, StockTemplate } from '../types/game';

const marketOpenMinute = 9 * 60;
const regularMarketCloseMinute = 15 * 60 + 30;
const afterMarketOpenMinute = 16 * 60;
const marketCloseMinute = 20 * 60;
const marketTicksPerDay = ((regularMarketCloseMinute - marketOpenMinute) / 5) + ((marketCloseMinute - afterMarketOpenMinute) / 5) + 1;
const marketHistorySamplesPerDay = marketTicksPerDay + 1;
const bankruptcyFloor = 100000;
const dailyPriceLimitRate = 30;
const marketDriftBaseline = stockCatalog.reduce((sum, stock) => sum + stock.drift, 0) / stockCatalog.length;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const toRoundedPrice = (value: number) => {
  const roundingUnit = value >= 1000000 ? 1000 : value >= 100000 ? 100 : value >= 1000 ? 10 : 1;
  return Math.max(1, Math.round(value / roundingUnit) * roundingUnit);
};
const getPriceRoundingUnit = (price: number) => price >= 1000000 ? 1000 : price >= 100000 ? 100 : price >= 1000 ? 10 : 1;
const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;
const createFallbackPhaseEvent = (): PhaseEvent => ({
  title: defaultEventTitle,
  description: defaultEventDescription,
  affectedTags: [],
  effectRange: [-2, 2],
});

const clonePhaseEvent = (event: PhaseEvent): PhaseEvent => ({
  ...event,
  affectedTags: [...event.affectedTags],
  effectRange: [event.effectRange[0], event.effectRange[1]],
});

const isPhaseEvent = (value: unknown): value is PhaseEvent => {
  if (!value || typeof value !== 'object') return false;
  const event = value as Partial<PhaseEvent>;
  return typeof event.title === 'string'
    && typeof event.description === 'string'
    && Array.isArray(event.affectedTags)
    && event.affectedTags.every((tag) => typeof tag === 'string')
    && Array.isArray(event.effectRange)
    && event.effectRange.length === 2
    && event.effectRange.every((impact) => typeof impact === 'number' && Number.isFinite(impact));
};

const pickRandomPhaseEvent = () =>
  clonePhaseEvent(phaseEvents[Math.floor(Math.random() * phaseEvents.length)] ?? createFallbackPhaseEvent());

const getEventDirection = (event: PhaseEvent): BriefingTone => {
  const averageImpact = (event.effectRange[0] + event.effectRange[1]) / 2;

  if (averageImpact > 1) {
    return 'rise';
  }

  if (averageImpact < -1) {
    return 'fall';
  }

  return 'neutral';
};

const getMatchedTagCount = (stock: Pick<StockTemplate, 'eventTags'>, event: PhaseEvent) =>
  event.affectedTags.reduce((count, tag) => count + (stock.eventTags.includes(tag) ? 1 : 0), 0);

const getAlignmentScore = (stock: StockState, event: PhaseEvent) => {
  const direction = getEventDirection(event);
  const matchedTagCount = getMatchedTagCount(stock, event);
  const changeBias = direction === 'fall' ? Math.abs(Math.min(stock.changeRate, 0)) : Math.max(stock.changeRate, 0);

  return matchedTagCount * 4 + changeBias;
};

const createHistoryFromPrices = (referencePrice: number, nextPrice: number) => {
  const delta = nextPrice - referencePrice;
  const midpointA = toRoundedPrice(referencePrice - delta * 0.42);
  const midpointB = toRoundedPrice(referencePrice - delta * 0.18);
  const midpointC = toRoundedPrice(referencePrice + delta * 0.52);

  return [midpointA, midpointB, referencePrice, midpointC, nextPrice];
};

const createOpeningHistory = (template: StockTemplate, openingPrice: number) => {
  const history = [openingPrice];
  for (let index = 0; index < 23; index += 1) {
    const previousPrice = history[0] * (1 + randomBetween(-template.volatility * 0.08, template.volatility * 0.08) / 100);
    history.unshift(toRoundedPrice(previousPrice));
  }
  return history;
};

const applyEventImpact = (stock: Pick<StockTemplate, 'eventTags'>, event: PhaseEvent, intensity = 1) => {
  if (!event.affectedTags.length) {
    return randomBetween(event.effectRange[0], event.effectRange[1]) * intensity;
  }

  if (event.affectedTags.some((tag) => stock.eventTags.includes(tag))) {
    return randomBetween(event.effectRange[0], event.effectRange[1]) * intensity;
  }

  return randomBetween(-1.8, 1.8) * intensity;
};

const calculateStockMoveRate = (
  stock: Pick<StockTemplate, 'volatility' | 'drift' | 'eventTags'>,
  event: PhaseEvent,
  intensity = 1,
  driftIntensity = intensity,
  eventIntensity = intensity,
) => {
  const baseMove = randomBetween(-stock.volatility * 0.58 * intensity, stock.volatility * 0.58 * intensity);
  const trend = (stock.drift - marketDriftBaseline) * driftIntensity + randomBetween(-1.05 * driftIntensity, 1.05 * driftIntensity);
  const eventMove = applyEventImpact(stock, event, eventIntensity);

  return clamp(baseMove + trend + eventMove, -18, 18);
};

const createOpeningStockState = (template: StockTemplate, event: PhaseEvent): StockState => {
  const openingRate = calculateStockMoveRate(template, event, 0.82);
  const openingPrice = toRoundedPrice(template.basePrice * (1 + openingRate / 100));
  const history = createOpeningHistory(template, openingPrice);

  return {
    ...template,
    price: openingPrice,
    previousPrice: template.basePrice,
    previousClose: openingPrice,
    changeRate: 0,
    halted: false,
    dailyHistory: [],
    history,
    sessionStartIndex: history.length - 1,
  };
};

const createInitialStocks = (event: PhaseEvent) => stockCatalog.map((template) => createOpeningStockState(template, event));
const getMarketCapitalization = (stocks: StockState[]) => stocks.reduce((sum, stock) => sum + stock.price * stock.sharesOutstanding, 0);

const normalizeStocks = (stocks: StockState[], marketMinute = marketOpenMinute, currentPhase = 1) =>
  stocks.map((stock) => {
    const history = stock.history?.length ? stock.history.slice(-80) : createHistoryFromPrices(stock.previousPrice ?? stock.price, stock.price);
    const removedHistoryCount = Math.max(0, (stock.history?.length ?? 0) - history.length);
    const defaultSessionStart = history.length - 1 - Math.floor((marketMinute - marketOpenMinute) / 5);

    return {
      ...stock,
      ...stockCatalog.find((template) => template.code === stock.code),
      previousPrice: stock.previousPrice ?? stock.price,
      previousClose: stock.previousClose ?? stock.price,
      halted: stock.halted ?? (Math.abs(((stock.price - (stock.previousClose ?? stock.price)) / (stock.previousClose ?? stock.price)) * 100) >= dailyPriceLimitRate),
      dailyHistory: Array.isArray(stock.dailyHistory)
        ? stock.dailyHistory.filter((close) => close && Number.isInteger(close.day) && close.day > 0 && Number.isFinite(close.price) && close.price > 0).slice(-maxGameDays)
        : currentPhase > 1 ? [{ day: currentPhase - 1, price: stock.previousClose ?? stock.price }] : [],
      history,
      sessionStartIndex: clamp(stock.sessionStartIndex === undefined ? defaultSessionStart : stock.sessionStartIndex - removedHistoryCount, 0, history.length - 1),
    };
  });


const getRepresentativeStockCode = (stocks: StockState[], event: PhaseEvent) => {
  const direction = getEventDirection(event);
  const sorted = [...stocks].sort((left, right) => {
    const alignmentGap = getAlignmentScore(right, event) - getAlignmentScore(left, event);

    if (alignmentGap !== 0) {
      return alignmentGap;
    }

    if (direction === 'fall') {
      return left.changeRate - right.changeRate;
    }

    return right.changeRate - left.changeRate;
  });

  return sorted[0]?.code ?? stocks[0]?.code ?? '';
};

const suggestTradeQuantity = (stock: StockState | undefined, cashAmount: number, ownedQuantity: number) => {
  if (!stock) {
    return 1;
  }

  if (ownedQuantity > 0) {
    return clamp(Math.ceil(ownedQuantity / 2), 1, ownedQuantity);
  }

  const affordableQuantity = Math.floor(cashAmount / stock.price);

  if (affordableQuantity <= 0) {
    return 1;
  }

  const capByRisk = stock.riskLabel === '안정형' ? 8 : stock.riskLabel === '성장형' ? 5 : 3;
  return clamp(Math.min(affordableQuantity, capByRisk), 1, Math.max(1, affordableQuantity));
};

export {
  afterMarketOpenMinute, bankruptcyFloor, calculateStockMoveRate, clamp, clonePhaseEvent, createInitialStocks,
  createOpeningStockState, dailyPriceLimitRate, getMarketCapitalization, getPriceRoundingUnit, getRepresentativeStockCode,
  isPhaseEvent, marketCloseMinute, marketHistorySamplesPerDay, marketOpenMinute, marketTicksPerDay, normalizeStocks,
  pickRandomPhaseEvent, regularMarketCloseMinute, suggestTradeQuantity, toRoundedPrice,
};
