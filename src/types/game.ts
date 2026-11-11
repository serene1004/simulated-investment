export type Screen = 'home' | 'game' | 'summary' | 'result';
export type GameView = 'market' | 'companies' | 'chart' | 'orders' | 'portfolio';
export type TradeSide = 'buy' | 'sell';
export type BriefingTone = 'rise' | 'fall' | 'neutral';
export type GameEnding = 'broke' | 'completed';
export type StockDailyClose = { day: number; price: number };

export type StockTemplate = {
  code: string
  name: string
  theme: string
  riskLabel: string
  basePrice: number
  sharesOutstanding: number
  averageVolume: number
  volatility: number
  drift: number
  eventTags: string[]
};

export type StockState = StockTemplate & {
  price: number
  previousPrice: number
  previousClose: number
  changeRate: number
  halted: boolean
  dailyHistory: StockDailyClose[]
  history: number[]
  sessionStartIndex: number
};

export type Holding = {
  code: string
  quantity: number
  averagePrice: number
};

export type PendingOrder = {
  id: number
  code: string
  side: TradeSide
  quantity: number
  limitPrice: number
};

export type PhaseEvent = {
  title: string
  description: string
  affectedTags: string[]
  effectRange: [number, number]
};

export type PhaseTradeAction = {
  code: string
  side: TradeSide
  quantity: number
  label: string
  price?: number
  marketMinute?: number
};

export type PhaseSummary = {
  phaseNumber: number
  eventTitle: string
  eventDescription: string
  phaseProfitRate: number
  totalAssets: number
  strongestStockCode: string
  weakestStockCode: string
  decisionLabel: string
  openingAssets?: number
  assetHistory?: number[]
  trades?: PhaseTradeAction[]
};

export type PersistedGameState = {
  currentScreen: Screen
  currentPhase: number
  ending: GameEnding | null
  cash: number
  tradeQuantity: number
  selectedCode: string
  stocks: StockState[]
  holdings: Holding[]
  summary: PhaseSummary | null
  currentPhaseEvent: PhaseEvent
  phaseTradeActions: PhaseTradeAction[]
  pendingOrders: PendingOrder[]
  marketMinute: number
  marketDayOpeningAssets: number
  marketDayAssetHistory: number[]
  marketIndexBaseCapitalization: number
  marketIndexPreviousClose: number
};

export type GameBoardState = {
  view: GameView
  currentPhase: number
  marketMinute: number
  marketOpen: boolean
  marketIndexValue: number
  marketIndexChange: number
  marketIndexChangeRate: number
  marketSpeed: 1 | 2 | 4 | 8
  dayOpeningAssets: number
  flashMessage: string
  cash: number
  availableCash: number
  totalAssets: number
  stocks: StockState[]
  selectedCode: string
  selectedStock: StockState
  tradeQuantity: number
  maxAffordableQuantity: number
  selectedHoldingQuantity: number
  holdings: Holding[]
  pendingOrders: PendingOrder[]
  canBuySelected: boolean
  canSellSelected: boolean
};
