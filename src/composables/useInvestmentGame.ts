import { computed, ref, watch } from 'vue'

import {
  defaultEventDescription,
  defaultEventTitle,
  defaultRanking,
  phaseEvents,
  startingCashDefault,
  stockCatalog,
  totalPhasesDefault,
} from '../data/gameData'
import type {
  BriefingFeaturedStock,
  BriefingSignal,
  BriefingTone,
  Holding,
  PersistedGameState,
  PhaseEvent,
  PhaseSummary,
  PhaseTradeAction,
  PhaseView,
  RankingEntry,
  Screen,
  StockState,
  StockTemplate,
  TradeSide,
} from '../types/game'

const gameStorageKey = 'simulated-investment-game-state'
const rankingStorageKey = 'simulated-investment-ranking'
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const toRoundedPrice = (value: number) => {
  const roundingUnit = value >= 1000000 ? 1000 : value >= 100000 ? 100 : 10
  return Math.max(1000, Math.round(value / roundingUnit) * roundingUnit)
}
const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min

const createFallbackPhaseEvent = (): PhaseEvent => ({
  title: defaultEventTitle,
  description: defaultEventDescription,
  affectedTags: [],
  effectRange: [-2, 2],
})

const clonePhaseEvent = (event: PhaseEvent): PhaseEvent => ({
  ...event,
  affectedTags: [...event.affectedTags],
  effectRange: [event.effectRange[0], event.effectRange[1]],
})

const pickRandomPhaseEvent = () =>
  clonePhaseEvent(phaseEvents[Math.floor(Math.random() * phaseEvents.length)] ?? createFallbackPhaseEvent())

const getEventDirection = (event: PhaseEvent): BriefingTone => {
  const averageImpact = (event.effectRange[0] + event.effectRange[1]) / 2

  if (averageImpact > 1) {
    return 'rise'
  }

  if (averageImpact < -1) {
    return 'fall'
  }

  return 'neutral'
}

const getMatchedTagCount = (stock: Pick<StockTemplate, 'eventTags'>, event: PhaseEvent) =>
  event.affectedTags.reduce((count, tag) => count + (stock.eventTags.includes(tag) ? 1 : 0), 0)

const getAlignmentScore = (stock: StockState, event: PhaseEvent) => {
  const direction = getEventDirection(event)
  const matchedTagCount = getMatchedTagCount(stock, event)
  const changeBias = direction === 'fall' ? Math.abs(Math.min(stock.changeRate, 0)) : Math.max(stock.changeRate, 0)

  return matchedTagCount * 4 + changeBias
}

const createHistoryFromPrices = (referencePrice: number, nextPrice: number) => {
  const delta = nextPrice - referencePrice
  const midpointA = toRoundedPrice(referencePrice - delta * 0.42)
  const midpointB = toRoundedPrice(referencePrice - delta * 0.18)
  const midpointC = toRoundedPrice(referencePrice + delta * 0.52)

  return [midpointA, midpointB, referencePrice, midpointC, nextPrice]
}

const applyEventImpact = (stock: Pick<StockTemplate, 'eventTags'>, event: PhaseEvent, intensity = 1) => {
  if (!event.affectedTags.length) {
    return randomBetween(event.effectRange[0], event.effectRange[1]) * intensity
  }

  if (event.affectedTags.some((tag) => stock.eventTags.includes(tag))) {
    return randomBetween(event.effectRange[0], event.effectRange[1]) * intensity
  }

  return randomBetween(-1.8, 1.8) * intensity
}

const calculateStockMoveRate = (
  stock: Pick<StockTemplate, 'volatility' | 'drift' | 'eventTags'>,
  event: PhaseEvent,
  intensity = 1,
) => {
  const baseMove = randomBetween(-stock.volatility * 0.58 * intensity, stock.volatility * 0.58 * intensity)
  const trend = randomBetween((stock.drift - 1.05) * intensity, (stock.drift + 1.05) * intensity)
  const eventMove = applyEventImpact(stock, event, intensity)

  return clamp(baseMove + trend + eventMove, -18, 18)
}

const createOpeningStockState = (template: StockTemplate, event: PhaseEvent): StockState => {
  const openingRate = calculateStockMoveRate(template, event, 0.82)
  const openingPrice = toRoundedPrice(template.basePrice * (1 + openingRate / 100))

  return {
    ...template,
    price: openingPrice,
    previousPrice: template.basePrice,
    changeRate: Number((((openingPrice - template.basePrice) / template.basePrice) * 100).toFixed(1)),
    history: createHistoryFromPrices(template.basePrice, openingPrice),
  }
}

const createInitialStocks = (event: PhaseEvent) => stockCatalog.map((template) => createOpeningStockState(template, event))

const normalizeStocks = (stocks: StockState[]) =>
  stocks.map((stock) => ({
    ...stock,
    previousPrice: stock.previousPrice ?? stock.price,
    history: stock.history?.length ? stock.history.slice(-8) : createHistoryFromPrices(stock.previousPrice ?? stock.price, stock.price),
  }))

const formatStockChange = (stock: StockState) => `${stock.name} ${stock.changeRate > 0 ? '+' : ''}${stock.changeRate.toFixed(1)}%`

const getRepresentativeStockCode = (stocks: StockState[], event: PhaseEvent) => {
  const direction = getEventDirection(event)
  const sorted = [...stocks].sort((left, right) => {
    const alignmentGap = getAlignmentScore(right, event) - getAlignmentScore(left, event)

    if (alignmentGap !== 0) {
      return alignmentGap
    }

    if (direction === 'fall') {
      return left.changeRate - right.changeRate
    }

    return right.changeRate - left.changeRate
  })

  return sorted[0]?.code ?? stocks[0]?.code ?? ''
}

const toBriefingTone = (changeRate: number): BriefingTone => {
  if (changeRate > 1) {
    return 'rise'
  }

  if (changeRate < -1) {
    return 'fall'
  }

  return 'neutral'
}

const describeFeaturedReason = (stock: StockState, event: PhaseEvent) => {
  const matchedTagCount = getMatchedTagCount(stock, event)
  const direction = getEventDirection(event)

  if (matchedTagCount > 0 && direction === 'rise') {
    return '이번 이슈 수혜랑 바로 연결되는 종목이에요.'
  }

  if (matchedTagCount > 0 && direction === 'fall') {
    return '이번 이벤트 영향을 직접 받을 수 있어서 조금 더 조심해서 볼 종목이에요.'
  }

  if (stock.changeRate > 1) {
    return '지금은 상승 압력이 이어지면서 매수세가 붙는 흐름이에요.'
  }

  if (stock.changeRate < -1) {
    return '지금은 조정 압력이 강하게 들어온 구간이에요.'
  }

  return '브리핑 대비 실제 움직임은 아직 중립에 가까워요.'
}

const buildFeaturedStocks = (stocks: StockState[], event: PhaseEvent): BriefingFeaturedStock[] => {
  const risingStocks = [...stocks].sort((left, right) => right.changeRate - left.changeRate)
  const fallingStocks = [...stocks].sort((left, right) => left.changeRate - right.changeRate)
  const alignedStocks = [...stocks]
    .sort((left, right) => getAlignmentScore(right, event) - getAlignmentScore(left, event))
    .filter((stock) => getMatchedTagCount(stock, event) > 0)

  const candidates = [...alignedStocks.slice(0, 2), risingStocks[0], fallingStocks[0]].filter(Boolean)
  const uniqueStocks = candidates.filter(
    (stock, index, collection) => stock && collection.findIndex((item) => item?.code === stock.code) === index,
  )

  return uniqueStocks.slice(0, 4).map((stock) => ({
    code: stock.code,
    name: stock.name,
    theme: stock.theme,
    price: stock.price,
    changeRate: stock.changeRate,
    riskLabel: stock.riskLabel,
    reason: describeFeaturedReason(stock, event),
    tone: toBriefingTone(stock.changeRate),
  }))
}

const buildBriefingSignals = (
  stocks: StockState[],
  event: PhaseEvent,
  phaseTradeActions: PhaseTradeAction[],
): BriefingSignal[] => {
  const risingStocks = [...stocks].sort((left, right) => right.changeRate - left.changeRate)
  const fallingStocks = [...stocks].sort((left, right) => left.changeRate - right.changeRate)
  const averageChange = stocks.reduce((sum, stock) => sum + stock.changeRate, 0) / Math.max(stocks.length, 1)

  const marketFlow = averageChange > 1 ? '상승 쪽 분위기' : averageChange < -1 ? '조정 쪽 분위기' : '혼조세'
  return [
    {
      id: 'market-flow',
      label: '시장 온도',
      value: `${marketFlow} · 평균 ${averageChange > 0 ? '+' : ''}${averageChange.toFixed(1)}%`,
      tone: averageChange > 0.6 ? 'rise' : averageChange < -0.6 ? 'fall' : 'neutral',
    },
    {
      id: 'hot-picks',
      label: '강세 상위',
      value: risingStocks.slice(0, 2).map(formatStockChange).join(' / '),
      tone: 'rise',
    },
    {
      id: 'risk-picks',
      label: '주의 구간',
      value: fallingStocks.slice(0, 2).map(formatStockChange).join(' / '),
      tone: 'fall',
    },
  ]
}

const suggestTradeQuantity = (stock: StockState | undefined, cashAmount: number, ownedQuantity: number) => {
  if (!stock) {
    return 1
  }

  if (ownedQuantity > 0) {
    return clamp(Math.ceil(ownedQuantity / 2), 1, ownedQuantity)
  }

  const affordableQuantity = Math.floor(cashAmount / stock.price)

  if (affordableQuantity <= 0) {
    return 1
  }

  const capByRisk = stock.riskLabel === '안정형' ? 8 : stock.riskLabel === '성장형' ? 5 : 3
  return clamp(Math.min(affordableQuantity, capByRisk), 1, Math.max(1, affordableQuantity))
}

const createInitialPersistedState = (): PersistedGameState => {
  const openingEvent = pickRandomPhaseEvent()
  const openingStocks = createInitialStocks(openingEvent)
  const selectedCode = getRepresentativeStockCode(openingStocks, openingEvent)

  return {
    nickname: '',
    currentScreen: 'home',
    totalPhases: totalPhasesDefault,
    currentPhase: 1,
    cash: startingCashDefault,
    tradeQuantity: suggestTradeQuantity(openingStocks.find((stock) => stock.code === selectedCode), startingCashDefault, 0),
    selectedCode,
    lastAction: '개장 전 브리핑부터 보고 이번 페이즈를 어떻게 갈지 정해봐요.',
    stocks: openingStocks,
    holdings: [],
    summary: null,
    currentPhaseEvent: openingEvent,
    currentEventTitle: openingEvent.title,
    currentEventDescription: openingEvent.description,
    phaseView: 'briefing',
    phaseTradeActions: [],
  }
}

const readJson = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') {
    return fallback
  }

  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

const createPersistedFallbackEvent = (title: string, description: string): PhaseEvent => ({
  title,
  description,
  affectedTags: [],
  effectRange: [-2, 2],
})

const normalizePersistedState = (state: PersistedGameState): PersistedGameState => {
  const fallback = createInitialPersistedState()
  const currentPhaseEvent = state.currentPhaseEvent
    ? clonePhaseEvent(state.currentPhaseEvent)
    : state.currentEventTitle && state.currentEventDescription
      ? createPersistedFallbackEvent(state.currentEventTitle, state.currentEventDescription)
      : fallback.currentPhaseEvent
  const normalizedStocks = state.stocks?.length ? normalizeStocks(state.stocks) : fallback.stocks
  const selectedCode = normalizedStocks.some((stock) => stock.code === state.selectedCode)
    ? state.selectedCode
    : getRepresentativeStockCode(normalizedStocks, currentPhaseEvent)

  return {
    ...fallback,
    ...state,
    nickname: state.nickname?.trim() ?? '',
    currentScreen: (state.currentScreen as string) === 'guide' ? 'home' : state.currentScreen,
    stocks: normalizedStocks,
    selectedCode,
    holdings: state.holdings ?? [],
    summary: state.summary ?? null,
    currentPhaseEvent,
    currentEventTitle: currentPhaseEvent.title,
    currentEventDescription: currentPhaseEvent.description,
    phaseView: state.phaseView ?? 'briefing',
    phaseTradeActions: state.phaseTradeActions ?? [],
  }
}

const createSummaryFromStocks = (
  phaseNumber: number,
  stocks: StockState[],
  totalAssets: number,
  phaseProfitRate: number,
  event: PhaseEvent,
  decisionLabel: string,
): PhaseSummary => {
  const sortedStocks = [...stocks].sort((left, right) => right.changeRate - left.changeRate)
  const weakestStock = sortedStocks[sortedStocks.length - 1]

  return {
    phaseNumber,
    eventTitle: event.title,
    eventDescription: event.description,
    phaseProfitRate,
    totalAssets,
    strongestStockCode: sortedStocks[0]?.code ?? '',
    weakestStockCode: weakestStock?.code ?? '',
    decisionLabel,
  }
}

const formatPlayedAt = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const useInvestmentGame = () => {
  const fallbackState = createInitialPersistedState()
  const persistedState = normalizePersistedState(readJson<PersistedGameState>(gameStorageKey, fallbackState))

  const currentScreen = ref<Screen>(persistedState.currentScreen)
  const nickname = ref(persistedState.nickname)
  const totalPhases = ref(persistedState.totalPhases)
  const currentPhase = ref(persistedState.currentPhase)
  const cash = ref(persistedState.cash)
  const tradeQuantity = ref(persistedState.tradeQuantity)
  const selectedCode = ref(persistedState.selectedCode)
  const lastAction = ref(persistedState.lastAction)
  const stocks = ref<StockState[]>(persistedState.stocks)
  const holdings = ref<Holding[]>(persistedState.holdings)
  const summary = ref<PhaseSummary | null>(persistedState.summary)
  const currentPhaseEvent = ref<PhaseEvent>(clonePhaseEvent(persistedState.currentPhaseEvent))
  const phaseView = ref<PhaseView>(persistedState.phaseView)
  const phaseTradeActions = ref<PhaseTradeAction[]>(persistedState.phaseTradeActions)
  const ranking = ref<RankingEntry[]>(readJson<RankingEntry[]>(rankingStorageKey, defaultRanking))
  const flashMessage = ref('')

  const currentEventTitle = computed(() => currentPhaseEvent.value.title)
  const currentEventDescription = computed(() => currentPhaseEvent.value.description)
  const selectedStock = computed(() => stocks.value.find((stock) => stock.code === selectedCode.value) ?? stocks.value[0])
  const phaseTradeCount = computed(() => phaseTradeActions.value.length)
  const phaseBuyCount = computed(() => phaseTradeActions.value.filter((action) => action.side === 'buy').length)
  const phaseSellCount = computed(() => phaseTradeActions.value.filter((action) => action.side === 'sell').length)
  const phaseTradedCodes = computed(() => new Set(phaseTradeActions.value.map((action) => action.code)))

  const holdingsMap = computed(() =>
    holdings.value.reduce<Record<string, Holding>>((accumulator, holding) => {
      accumulator[holding.code] = holding
      return accumulator
    }, {}),
  )

  const portfolioValue = computed(() =>
    holdings.value.reduce((sum, holding) => {
      const stock = stocks.value.find((item) => item.code === holding.code)
      return sum + (stock?.price ?? 0) * holding.quantity
    }, 0),
  )

  const totalAssets = computed(() => cash.value + portfolioValue.value)
  const score = computed(() => Math.round(totalAssets.value / 100))
  const returnRate = computed(() => Number((((totalAssets.value - startingCashDefault) / startingCashDefault) * 100).toFixed(1)))
  const isFinalSummary = computed(() => summary.value?.phaseNumber === totalPhases.value)
  const strongestStock = computed(() => stocks.value.find((stock) => stock.code === summary.value?.strongestStockCode) ?? null)
  const weakestStock = computed(() => stocks.value.find((stock) => stock.code === summary.value?.weakestStockCode) ?? null)
  const selectedHoldingQuantity = computed(() => holdingsMap.value[selectedCode.value]?.quantity ?? 0)
  const maxAffordableQuantity = computed(() => Math.max(0, Math.floor(cash.value / (selectedStock.value?.price ?? Number.MAX_SAFE_INTEGER))))
  const recommendedTradeQuantity = computed(() =>
    suggestTradeQuantity(selectedStock.value, cash.value, selectedHoldingQuantity.value),
  )
  const selectedStockLocked = computed(() => phaseTradedCodes.value.has(selectedCode.value))
  const canBuySelected = computed(() => !selectedStockLocked.value && maxAffordableQuantity.value > 0)
  const canSellSelected = computed(() => !selectedStockLocked.value && selectedHoldingQuantity.value > 0)
  const phaseTradeLocked = computed(
    () =>
      !stocks.value.some((stock) => {
        if (phaseTradedCodes.value.has(stock.code)) {
          return false
        }

        const hasHolding = (holdingsMap.value[stock.code]?.quantity ?? 0) > 0
        const canAfford = cash.value >= stock.price
        return hasHolding || canAfford
      }),
  )
  const briefingFeaturedStocks = computed(() => buildFeaturedStocks(stocks.value, currentPhaseEvent.value))
  const briefingSignals = computed(() => buildBriefingSignals(stocks.value, currentPhaseEvent.value, phaseTradeActions.value))

  const saveGameState = () => {
    if (typeof window === 'undefined') {
      return
    }

    const payload: PersistedGameState = {
      nickname: nickname.value.trim(),
      currentScreen: currentScreen.value,
      totalPhases: totalPhases.value,
      currentPhase: currentPhase.value,
      cash: cash.value,
      tradeQuantity: tradeQuantity.value,
      selectedCode: selectedCode.value,
      lastAction: lastAction.value,
      stocks: stocks.value,
      holdings: holdings.value,
      summary: summary.value,
      currentPhaseEvent: currentPhaseEvent.value,
      currentEventTitle: currentPhaseEvent.value.title,
      currentEventDescription: currentPhaseEvent.value.description,
      phaseView: phaseView.value,
      phaseTradeActions: phaseTradeActions.value,
    }

    window.localStorage.setItem(gameStorageKey, JSON.stringify(payload))
  }

  const saveRanking = () => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(rankingStorageKey, JSON.stringify(ranking.value))
  }

  watch(
    [
      currentScreen,
      nickname,
      totalPhases,
      currentPhase,
      cash,
      tradeQuantity,
      selectedCode,
      lastAction,
      stocks,
      holdings,
      summary,
      currentPhaseEvent,
      phaseView,
      phaseTradeActions,
    ],
    () => saveGameState(),
    { deep: true },
  )

  watch(
    ranking,
    () => saveRanking(),
    { deep: true },
  )

  const setFlashMessage = (message: string) => {
    flashMessage.value = message

    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        if (flashMessage.value === message) {
          flashMessage.value = ''
        }
      }, 1800)
    }
  }

  const setTradeQuantity = (value: number) => {
    tradeQuantity.value = clamp(Math.floor(Number(value) || 1), 1, 9999)
  }

  const nudgeTradeQuantity = (delta: number) => {
    setTradeQuantity(tradeQuantity.value + delta)
  }

  const getSuggestedTradeQuantity = (stockCode: string) => {
    const stock = stocks.value.find((item) => item.code === stockCode)
    const ownedQuantity = holdingsMap.value[stockCode]?.quantity ?? 0

    return suggestTradeQuantity(stock, cash.value, ownedQuantity)
  }

  const syncTradeQuantityForSelectedStock = (stockCode = selectedCode.value) => {
    tradeQuantity.value = getSuggestedTradeQuantity(stockCode)
  }

  const preparePhaseBriefing = (event = pickRandomPhaseEvent()) => {
    currentPhaseEvent.value = clonePhaseEvent(event)
    phaseView.value = 'briefing'
    phaseTradeActions.value = []
    flashMessage.value = ''
    selectedCode.value = getRepresentativeStockCode(stocks.value, currentPhaseEvent.value)
    syncTradeQuantityForSelectedStock(selectedCode.value)
  }

  const resetGame = () => {
    const nextState = createInitialPersistedState()
    nickname.value = nextState.nickname
    currentScreen.value = nextState.currentScreen
    totalPhases.value = totalPhasesDefault
    currentPhase.value = nextState.currentPhase
    cash.value = nextState.cash
    tradeQuantity.value = nextState.tradeQuantity
    selectedCode.value = nextState.selectedCode
    lastAction.value = nextState.lastAction
    stocks.value = nextState.stocks
    holdings.value = nextState.holdings
    summary.value = nextState.summary
    currentPhaseEvent.value = clonePhaseEvent(nextState.currentPhaseEvent)
    phaseView.value = nextState.phaseView
    phaseTradeActions.value = []
    flashMessage.value = ''
    syncTradeQuantityForSelectedStock(nextState.selectedCode)
  }

  const startGame = () => {
    resetGame()
    currentScreen.value = 'game'
    lastAction.value = '1페이즈 브리핑이 열렸어요.'
  }

  const openScreen = (screen: Screen) => {
    currentScreen.value = screen
  }

  const openBriefingView = () => {
    phaseView.value = 'briefing'
  }

  const openTradeView = () => {
    phaseView.value = 'trade'
  }

  const selectStock = (code: string) => {
    if (!stocks.value.some((stock) => stock.code === code)) {
      return
    }

    selectedCode.value = code
    syncTradeQuantityForSelectedStock(code)
  }

  const updateHoldingAfterBuy = (stockCode: string, quantity: number, price: number) => {
    const existingHolding = holdings.value.find((holding) => holding.code === stockCode)

    if (!existingHolding) {
      holdings.value = [...holdings.value, { code: stockCode, quantity, averagePrice: price }]
      return
    }

    const totalCost = existingHolding.averagePrice * existingHolding.quantity + price * quantity
    const totalQuantity = existingHolding.quantity + quantity
    existingHolding.quantity = totalQuantity
    existingHolding.averagePrice = Math.round(totalCost / totalQuantity)
  }

  const ensurePhaseTradeAvailable = () => {
    const stock = selectedStock.value

    if (!stock) {
      return false
    }

    if (phaseTradedCodes.value.has(stock.code)) {
      setFlashMessage('이 종목은 이번 페이즈에서 이미 거래했어요. 다른 종목으로 이어서 가보면 돼요.')
      return false
    }

    return true
  }

  const appendPhaseTradeAction = (side: TradeSide, stock: StockState, quantity: number) => {
    const label = `${stock.name} ${quantity}주 ${side === 'buy' ? '매수' : '매도'}`

    phaseTradeActions.value = [
      ...phaseTradeActions.value,
      {
        code: stock.code,
        side,
        quantity,
        label,
      },
    ]

    lastAction.value = phaseTradeActions.value.map((action) => action.label).join(' · ')
  }

  const buyStock = () => {
    if (!ensurePhaseTradeAvailable()) {
      return
    }

    const quantity = Math.max(1, Math.floor(Number(tradeQuantity.value) || 1))
    const stock = selectedStock.value

    if (!stock) {
      return
    }

    const totalCost = stock.price * quantity

    if (cash.value < totalCost) {
      setFlashMessage('현금이 조금 부족해요.')
      return
    }

    cash.value -= totalCost
    updateHoldingAfterBuy(stock.code, quantity, stock.price)
    appendPhaseTradeAction('buy', stock, quantity)
    setFlashMessage(`${stock.name} ${quantity}주 매수했어요.`)
  }

  const buyMaxStock = () => {
    if (!ensurePhaseTradeAvailable()) {
      return
    }

    const stock = selectedStock.value

    if (!stock) {
      return
    }

    const quantity = Math.floor(cash.value / stock.price)

    if (quantity <= 0) {
      setFlashMessage('지금은 살 수 있는 수량이 없어요.')
      return
    }

    tradeQuantity.value = quantity
    buyStock()
  }

  const sellStock = () => {
    if (!ensurePhaseTradeAvailable()) {
      return
    }

    const quantity = Math.max(1, Math.floor(Number(tradeQuantity.value) || 1))
    const stock = selectedStock.value

    if (!stock) {
      return
    }

    const existingHolding = holdings.value.find((holding) => holding.code === stock.code)

    if (!existingHolding || existingHolding.quantity < quantity) {
      setFlashMessage('팔 수 있는 보유 수량이 부족해요.')
      return
    }

    cash.value += stock.price * quantity
    existingHolding.quantity -= quantity

    if (existingHolding.quantity <= 0) {
      holdings.value = holdings.value.filter((holding) => holding.code !== stock.code)
    }

    appendPhaseTradeAction('sell', stock, quantity)
    setFlashMessage(`${stock.name} ${quantity}주 매도했어요.`)
  }

  const sellAllStock = () => {
    if (!ensurePhaseTradeAvailable()) {
      return
    }

    const stock = selectedStock.value

    if (!stock) {
      return
    }

    const quantity = holdingsMap.value[stock.code]?.quantity ?? 0

    if (quantity <= 0) {
      setFlashMessage('전량 매도할 수량이 없어요.')
      return
    }

    tradeQuantity.value = quantity
    sellStock()
  }

  const advancePhase = () => {
    const phaseNumber = currentPhase.value
    const activeEvent = clonePhaseEvent(currentPhaseEvent.value)
    const assetsBeforeMove = totalAssets.value
    const decisionLabel = phaseTradeActions.value.length > 0
      ? phaseTradeActions.value.map((action) => action.label).join(' · ')
      : '관망했어요'

    stocks.value = stocks.value.map((stock) => {
      const moveRate = calculateStockMoveRate(stock, activeEvent)
      const nextPrice = toRoundedPrice(stock.price * (1 + moveRate / 100))

      return {
        ...stock,
        previousPrice: stock.price,
        price: nextPrice,
        changeRate: Number((((nextPrice - stock.price) / stock.price) * 100).toFixed(1)),
        history: [...stock.history, nextPrice].slice(-8),
      }
    })

    const phaseProfitRate = Number((((totalAssets.value - assetsBeforeMove) / assetsBeforeMove) * 100).toFixed(1))
    summary.value = createSummaryFromStocks(phaseNumber, stocks.value, totalAssets.value, phaseProfitRate, activeEvent, decisionLabel)
    currentScreen.value = 'summary'
    lastAction.value = `${phaseNumber}페이즈가 끝났어요 · ${decisionLabel}`

    if (phaseNumber < totalPhases.value) {
      currentPhase.value += 1
    }
  }

  const continueFromSummary = () => {
    if (isFinalSummary.value) {
      currentScreen.value = 'result'
      return
    }

    summary.value = null
    preparePhaseBriefing()
    currentScreen.value = 'game'
    lastAction.value = `${currentPhase.value}페이즈 브리핑이 열렸어요.`
  }

  const goToResult = () => {
    currentScreen.value = 'result'
  }

  const registerRanking = () => {
    const trimmedNickname = nickname.value.trim()

    if (!trimmedNickname) {
      return
    }

    ranking.value = [
      {
        nickname: trimmedNickname,
        score: score.value,
        assets: totalAssets.value,
        playedAt: formatPlayedAt(),
      },
      ...ranking.value,
    ]
      .sort((left, right) => right.score - left.score)
      .slice(0, 10)

    resetGame()
    currentScreen.value = 'ranking'

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(gameStorageKey)
    }
  }

  const clearRanking = () => {
    ranking.value = []
  }

  return {
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
    selectedStock,
    selectedStockLocked,
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
  }
}
