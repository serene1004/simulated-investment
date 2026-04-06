import type { PhaseEvent, StockTemplate } from '../types/game'

export const totalPhasesDefault = 5
export const startingCashDefault = 10000000
export const defaultEventTitle = '개장 전 브리핑'
export const defaultEventDescription = '섹터별 분위기를 살피고, 짧은 턴 안에서 어떤 종목이 급등할지 먼저 읽어보세요.'

export const stockCatalog: StockTemplate[] = [
  { code: 'BLUE', name: '블루테크', theme: '기술 인프라', riskLabel: '안정형', basePrice: 1280000, volatility: 6, drift: 1.2, eventTags: ['ai', 'chip', 'cloud'] },
  { code: 'GREEN', name: '그린에너지', theme: '친환경', riskLabel: '성장형', basePrice: 385000, volatility: 8, drift: 1.4, eventTags: ['green', 'policy'] },
  { code: 'NEO', name: '네오바이오', theme: '바이오', riskLabel: '고변동', basePrice: 640000, volatility: 14, drift: 1.8, eventTags: ['bio', 'health'] },
  { code: 'AUR', name: '오로라게임즈', theme: '게임', riskLabel: '테마형', basePrice: 118000, volatility: 12, drift: 1.5, eventTags: ['game', 'stream'] },
  { code: 'SKY', name: '스카이물류', theme: '물류', riskLabel: '안정형', basePrice: 520000, volatility: 5, drift: 0.8, eventTags: ['trade', 'consumer'] },
  { code: 'WAVE', name: '웨이브콘텐츠', theme: '콘텐츠', riskLabel: '성장형', basePrice: 168000, volatility: 10, drift: 1.1, eventTags: ['stream', 'consumer'] },
  { code: 'NOVA', name: '노바모빌리티', theme: '모빌리티', riskLabel: '성장형', basePrice: 745000, volatility: 9, drift: 1.3, eventTags: ['mobility', 'green'] },
  { code: 'CORE', name: '코어칩스', theme: '반도체', riskLabel: '고변동', basePrice: 1120000, volatility: 13, drift: 1.7, eventTags: ['chip', 'ai'] },
  { code: 'AEG', name: '에이기스디펜스', theme: '방산', riskLabel: '테마형', basePrice: 458000, volatility: 10, drift: 1.4, eventTags: ['defense', 'policy', 'robotics'] },
  { code: 'VXR', name: '벡터GPU', theme: 'AI 가속기', riskLabel: '고변동', basePrice: 2460000, volatility: 17, drift: 2.3, eventTags: ['accelerator', 'ai', 'chip', 'cloud'] },
  { code: 'MINT', name: '민트푸드', theme: '소비재', riskLabel: '안정형', basePrice: 92000, volatility: 4, drift: 0.6, eventTags: ['consumer'] },
  { code: 'LUM', name: '루멘헬스', theme: '헬스케어', riskLabel: '성장형', basePrice: 312000, volatility: 8, drift: 1.0, eventTags: ['health', 'bio'] },
  { code: 'POL', name: '폴라엔터', theme: '엔터테인먼트', riskLabel: '테마형', basePrice: 146000, volatility: 11, drift: 1.2, eventTags: ['stream', 'consumer'] },
  { code: 'ORB', name: '오비트로보틱스', theme: '로보틱스', riskLabel: '고변동', basePrice: 890000, volatility: 15, drift: 1.9, eventTags: ['ai', 'mobility'] },
]

export const defaultRanking = []

export const phaseEvents: PhaseEvent[] = [
  { title: 'AI 투자 열풍', description: 'AI 관련 기대감이 커지며 기술주와 반도체가 강세를 보였습니다.', affectedTags: ['ai', 'chip'], effectRange: [4, 10] },
  { title: '데이터센터 증설 기대', description: '대형 서버 투자 확대 기대감으로 AI 가속기와 반도체 종목이 빠르게 상승했습니다.', affectedTags: ['accelerator', 'ai', 'chip', 'cloud'], effectRange: [5, 12] },
  { title: '친환경 정책 수혜', description: '정책 기대감으로 친환경과 모빌리티 종목이 탄력을 받았습니다.', affectedTags: ['green', 'mobility', 'policy'], effectRange: [3, 8] },
  { title: '국방 예산 확대', description: '방산 수출 기대와 예산 확대 소식에 방산과 로보틱스 테마가 강세를 보였습니다.', affectedTags: ['defense', 'robotics', 'policy'], effectRange: [4, 10] },
  { title: '플랫폼 구독 증가', description: '콘텐츠와 게임 소비가 늘며 관련 종목이 주목받았습니다.', affectedTags: ['game', 'stream', 'consumer'], effectRange: [3, 9] },
  { title: '헬스케어 임상 기대', description: '바이오와 헬스케어 종목에 강한 매수세가 붙었습니다.', affectedTags: ['bio', 'health'], effectRange: [4, 11] },
  { title: '원가 부담 확대', description: '소비재와 물류 업종에 비용 부담이 커지며 약세가 이어졌습니다.', affectedTags: ['consumer', 'trade'], effectRange: [-8, -3] },
  { title: '차익 실현 매물', description: '급등했던 테마주 중심으로 차익 실현이 나오며 AI와 바이오 쪽 변동성이 커졌습니다.', affectedTags: ['game', 'ai', 'bio', 'accelerator'], effectRange: [-10, -4] },
  { title: '공급망 안정', description: '물류와 반도체 공급망 이슈가 완화되며 투자심리가 회복됐습니다.', affectedTags: ['trade', 'chip', 'cloud'], effectRange: [2, 7] },
  { title: '시장 관망세', description: '전반적으로 거래가 줄며 변동폭이 다소 제한됐습니다.', affectedTags: [], effectRange: [-2, 2] },
]
