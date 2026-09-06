import type { PhaseEvent, StockTemplate } from '../types/game';

export const totalPhasesDefault = 5;
export const startingCashDefault = 10000000;
export const defaultEventTitle = '개장 전 브리핑';
export const defaultEventDescription = '섹터별 분위기를 살피고, 짧은 턴 안에서 어떤 종목이 급등할지 먼저 읽어보세요.';

export const stockCatalog: StockTemplate[] = [
  { code: 'BLUE', name: '세한전자', theme: 'IT 하드웨어', riskLabel: '안정형', basePrice: 1580000, volatility: 6, drift: 1.1, eventTags: ['chip', 'cloud', 'internet'] },
  { code: 'GREEN', name: '에코그리드', theme: '친환경', riskLabel: '성장형', basePrice: 402000, volatility: 8, drift: 1.4, eventTags: ['green', 'policy'] },
  { code: 'NEO', name: '메디온바이오', theme: '바이오', riskLabel: '고변동', basePrice: 688000, volatility: 14, drift: 1.8, eventTags: ['bio', 'health'] },
  { code: 'AUR', name: '넥스플레이', theme: '게임', riskLabel: '테마형', basePrice: 172000, volatility: 12, drift: 1.5, eventTags: ['game', 'stream', 'internet'] },
  { code: 'SKY', name: '에어링크로지스', theme: '항공물류', riskLabel: '성장형', basePrice: 448000, volatility: 9, drift: 1.0, eventTags: ['air', 'trade', 'travel'] },
  { code: 'WAVE', name: '웨이브커머스', theme: '인터넷 플랫폼', riskLabel: '성장형', basePrice: 628000, volatility: 9, drift: 1.2, eventTags: ['internet', 'commerce', 'cloud'] },
  { code: 'NOVA', name: '다온모터스', theme: '자동차', riskLabel: '안정형', basePrice: 932000, volatility: 8, drift: 1.2, eventTags: ['auto', 'mobility', 'green'] },
  { code: 'CORE', name: '메가칩스', theme: '반도체', riskLabel: '고변동', basePrice: 1340000, volatility: 13, drift: 1.7, eventTags: ['chip', 'ai'] },
  { code: 'AEG', name: '프론티어디펜스', theme: '방산', riskLabel: '테마형', basePrice: 532000, volatility: 10, drift: 1.4, eventTags: ['defense', 'policy', 'robotics'] },
  { code: 'VXR', name: '퀀텀GPU', theme: 'AI 가속기', riskLabel: '고변동', basePrice: 2790000, volatility: 17, drift: 2.3, eventTags: ['accelerator', 'ai', 'chip', 'cloud'] },
  { code: 'MINT', name: '데일리리테일', theme: '소비재', riskLabel: '안정형', basePrice: 108000, volatility: 4, drift: 0.6, eventTags: ['consumer', 'commerce'] },
  { code: 'LUM', name: '루미케어', theme: '헬스케어', riskLabel: '성장형', basePrice: 356000, volatility: 8, drift: 1.0, eventTags: ['health', 'bio'] },
  { code: 'POL', name: '스타라이트엔터', theme: '엔터테인먼트', riskLabel: '테마형', basePrice: 158000, volatility: 11, drift: 1.2, eventTags: ['stream', 'consumer', 'travel'] },
  { code: 'ORB', name: '오비탈로보틱스', theme: '로보틱스', riskLabel: '고변동', basePrice: 968000, volatility: 15, drift: 1.9, eventTags: ['ai', 'robotics', 'mobility'] },
  { code: 'FIN', name: '핀브릿지뱅크', theme: '금융 플랫폼', riskLabel: '안정형', basePrice: 286000, volatility: 5, drift: 0.7, eventTags: ['finance', 'internet'] },
  { code: 'JET', name: '제트웨이항공', theme: '항공', riskLabel: '테마형', basePrice: 372000, volatility: 10, drift: 1.2, eventTags: ['air', 'travel', 'consumer'] },
  { code: 'HYP', name: '하이퍼커머스', theme: '커머스', riskLabel: '성장형', basePrice: 238000, volatility: 10, drift: 1.1, eventTags: ['commerce', 'consumer', 'internet'] },
  { code: 'MEC', name: '미래오토텍', theme: '자동차 부품', riskLabel: '성장형', basePrice: 264000, volatility: 9, drift: 1.15, eventTags: ['auto', 'mobility', 'trade'] },
];

export const phaseEvents: PhaseEvent[] = [
  { title: 'AI 투자 열풍', description: 'AI 관련 기대감이 커지며 기술주와 반도체가 강세를 보였습니다.', affectedTags: ['ai', 'chip'], effectRange: [4, 10] },
  { title: '데이터센터 증설 기대', description: '대형 서버 투자 확대 기대감으로 AI 가속기와 반도체 종목이 빠르게 상승했습니다.', affectedTags: ['accelerator', 'ai', 'chip', 'cloud'], effectRange: [5, 12] },
  { title: '플랫폼 광고 회복', description: '광고 경기 반등 기대감으로 인터넷 플랫폼과 커머스 종목에 매수세가 붙었습니다.', affectedTags: ['internet', 'commerce', 'cloud'], effectRange: [3, 9] },
  { title: '완성차 수출 호조', description: '해외 판매가 예상보다 강하게 나오며 자동차와 부품주가 함께 올랐습니다.', affectedTags: ['auto', 'mobility', 'trade'], effectRange: [4, 9] },
  { title: '휴가철 여행 수요 폭증', description: '여행 예약과 항공 수요가 급증하면서 항공과 엔터 쪽에 자금이 몰렸습니다.', affectedTags: ['air', 'travel', 'consumer'], effectRange: [4, 10] },
  { title: '게임 대작 흥행', description: '신작 흥행 기대감이 커지며 게임과 플랫폼 종목이 강하게 반응했습니다.', affectedTags: ['game', 'stream', 'internet'], effectRange: [4, 10] },
  { title: '친환경 정책 수혜', description: '정책 기대감으로 친환경과 모빌리티 종목이 탄력을 받았습니다.', affectedTags: ['green', 'mobility', 'policy'], effectRange: [3, 8] },
  { title: '국방 예산 확대', description: '방산 수출 기대와 예산 확대 소식에 방산과 로보틱스 테마가 강세를 보였습니다.', affectedTags: ['defense', 'robotics', 'policy'], effectRange: [4, 10] },
  { title: '플랫폼 구독 증가', description: '콘텐츠와 게임 소비가 늘며 관련 종목이 주목받았습니다.', affectedTags: ['game', 'stream', 'consumer'], effectRange: [3, 9] },
  { title: '헬스케어 임상 기대', description: '바이오와 헬스케어 종목에 강한 매수세가 붙었습니다.', affectedTags: ['bio', 'health'], effectRange: [4, 11] },
  { title: '핀테크 규제 완화 기대', description: '수수료와 플랫폼 규제 완화 기대감으로 금융 플랫폼과 인터넷 서비스가 강세를 보였습니다.', affectedTags: ['finance', 'internet', 'commerce'], effectRange: [3, 8] },
  { title: '국제 유가 급등', description: '유가 부담이 커지며 항공, 물류, 소비 업종이 전반적으로 흔들렸습니다.', affectedTags: ['air', 'trade', 'consumer', 'auto'], effectRange: [-9, -4] },
  { title: '원가 부담 확대', description: '소비재와 물류 업종에 비용 부담이 커지며 약세가 이어졌습니다.', affectedTags: ['consumer', 'trade'], effectRange: [-8, -3] },
  { title: '차익 실현 매물', description: '급등했던 테마주 중심으로 차익 실현이 나오며 AI와 바이오 쪽 변동성이 커졌습니다.', affectedTags: ['game', 'ai', 'bio', 'accelerator'], effectRange: [-10, -4] },
  { title: '전면전 위기 고조', description: '지정학적 리스크가 커지며 시장 전반에 위험회피 매물이 쏟아졌습니다.', affectedTags: [], effectRange: [-12, -6] },
  { title: '대형 플랫폼 장애', description: '서비스 장애 이슈로 인터넷 플랫폼과 커머스 종목에 매도가 집중됐습니다.', affectedTags: ['internet', 'commerce', 'cloud'], effectRange: [-8, -3] },
  { title: '공급망 안정', description: '물류와 반도체 공급망 이슈가 완화되며 투자심리가 회복됐습니다.', affectedTags: ['trade', 'chip', 'cloud'], effectRange: [2, 7] },
  { title: '시장 관망세', description: '전반적으로 거래가 줄며 변동폭이 다소 제한됐습니다.', affectedTags: [], effectRange: [-2, 2] },
];
