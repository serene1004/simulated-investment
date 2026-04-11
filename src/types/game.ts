export type Screen = 'home' | 'game' | 'summary' | 'result' | 'ranking'
export type PhaseView = 'briefing' | 'trade'
export type TradeSide = 'buy' | 'sell'
export type BriefingTone = 'rise' | 'fall' | 'neutral'

export type StockTemplate = {
  code: string
  name: string
  theme: string
  riskLabel: string
  basePrice: number
  volatility: number
  drift: number
  eventTags: string[]
}

export type StockState = StockTemplate & {
  price: number
  previousPrice: number
  changeRate: number
  history: number[]
}

export type Holding = {
  code: string
  quantity: number
  averagePrice: number
}

export type RankingEntry = {
  nickname: string
  score: number
  assets: number
  playedAt: string
}

export type PhaseEvent = {
  title: string
  description: string
  affectedTags: string[]
  effectRange: [number, number]
}

export type BriefingSignal = {
  id: string
  label: string
  value: string
  tone: BriefingTone
}

export type BriefingFeaturedStock = {
  code: string
  name: string
  theme: string
  price: number
  changeRate: number
  riskLabel: string
  reason: string
  tone: BriefingTone
}

export type PhaseTradeAction = {
  code: string
  side: TradeSide
  quantity: number
  label: string
}

export type PhaseSummary = {
  phaseNumber: number
  eventTitle: string
  eventDescription: string
  phaseProfitRate: number
  totalAssets: number
  strongestStockCode: string
  weakestStockCode: string
  decisionLabel: string
}

export type PersistedGameState = {
  nickname: string
  currentScreen: Screen
  totalPhases: number
  currentPhase: number
  cash: number
  tradeQuantity: number
  selectedCode: string
  stocks: StockState[]
  holdings: Holding[]
  summary: PhaseSummary | null
  currentPhaseEvent: PhaseEvent
  phaseView: PhaseView
  phaseTradeActions: PhaseTradeAction[]
}
