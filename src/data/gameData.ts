import type { PhaseEvent, StockTemplate } from '../types/game';

export const startingCashDefault = 10000000;
export const maxGameDays = 30;
export const defaultEventTitle = '개장 전 브리핑';
export const defaultEventDescription = '섹터별 분위기와 시장 신호를 살피고 오늘의 투자 전략을 세워보세요.';

export const stockCatalog: StockTemplate[] = [
  { code: 'BLUE', name: '픽셀칩스', theme: 'IT 하드웨어', riskLabel: '안정형', basePrice: 360000, sharesOutstanding: 90000000, averageVolume: 920000, volatility: 6, drift: 1.1, eventTags: ['chip', 'cloud', 'internet'] },
  { code: 'GREEN', name: '그린웨이브에너지', theme: '친환경 전력', riskLabel: '성장형', basePrice: 148000, sharesOutstanding: 37500000, averageVolume: 650000, volatility: 8, drift: 1.4, eventTags: ['green', 'policy'] },
  { code: 'NEO', name: '뉴셀바이오', theme: '바이오 연구', riskLabel: '고변동', basePrice: 228000, sharesOutstanding: 24000000, averageVolume: 560000, volatility: 14, drift: 1.8, eventTags: ['bio', 'health'] },
  { code: 'AUR', name: '플레이포지', theme: '게임 스튜디오', riskLabel: '테마형', basePrice: 68000, sharesOutstanding: 16000000, averageVolume: 770000, volatility: 12, drift: 1.5, eventTags: ['game', 'stream', 'internet'] },
  { code: 'SKY', name: '오름로지스', theme: '항공 물류', riskLabel: '성장형', basePrice: 198000, sharesOutstanding: 31000000, averageVolume: 500000, volatility: 9, drift: 1.0, eventTags: ['air', 'trade', 'travel'] },
  { code: 'WAVE', name: '모아플랫폼', theme: '온라인 플랫폼', riskLabel: '성장형', basePrice: 268000, sharesOutstanding: 44000000, averageVolume: 740000, volatility: 9, drift: 1.2, eventTags: ['internet', 'commerce', 'cloud'] },
  { code: 'NOVA', name: '모션랩스', theme: '전기 모빌리티', riskLabel: '안정형', basePrice: 328000, sharesOutstanding: 28500000, averageVolume: 600000, volatility: 8, drift: 1.2, eventTags: ['auto', 'mobility', 'green'] },
  { code: 'CORE', name: '한빛반도체', theme: '반도체', riskLabel: '고변동', basePrice: 1350000, sharesOutstanding: 47500000, averageVolume: 890000, volatility: 13, drift: 1.7, eventTags: ['chip', 'ai'] },
  { code: 'AEG', name: '아크쉴드', theme: '방위 산업', riskLabel: '테마형', basePrice: 178000, sharesOutstanding: 19000000, averageVolume: 380000, volatility: 10, drift: 1.4, eventTags: ['defense', 'policy', 'robotics'] },
  { code: 'VXR', name: '코어매트릭스', theme: 'AI 반도체', riskLabel: '고변동', basePrice: 2480000, sharesOutstanding: 14000000, averageVolume: 970000, volatility: 17, drift: 2.3, eventTags: ['accelerator', 'ai', 'chip', 'cloud'] },
  { code: 'MINT', name: '데일리픽', theme: '생활 소비재', riskLabel: '안정형', basePrice: 5000, sharesOutstanding: 425000000, averageVolume: 440000, volatility: 4, drift: 0.6, eventTags: ['consumer', 'commerce'] },
  { code: 'LUM', name: '온유메디텍', theme: '헬스케어', riskLabel: '성장형', basePrice: 128000, sharesOutstanding: 26000000, averageVolume: 350000, volatility: 8, drift: 1.0, eventTags: ['health', 'bio'] },
  { code: 'POL', name: '스테이지원', theme: '공연·콘텐츠', riskLabel: '테마형', basePrice: 9000, sharesOutstanding: 150000000, averageVolume: 520000, volatility: 11, drift: 1.2, eventTags: ['stream', 'consumer', 'travel'] },
  { code: 'ORB', name: '로보메카', theme: '로보틱스', riskLabel: '고변동', basePrice: 388000, sharesOutstanding: 15500000, averageVolume: 690000, volatility: 15, drift: 1.9, eventTags: ['ai', 'robotics', 'mobility'] },
  { code: 'FIN', name: '브릿지페이', theme: '금융 플랫폼', riskLabel: '안정형', basePrice: 98000, sharesOutstanding: 41500000, averageVolume: 580000, volatility: 5, drift: 0.7, eventTags: ['finance', 'internet'] },
  { code: 'JET', name: '에어링크', theme: '항공', riskLabel: '테마형', basePrice: 168000, sharesOutstanding: 17000000, averageVolume: 470000, volatility: 10, drift: 1.2, eventTags: ['air', 'travel', 'consumer'] },
  { code: 'HYP', name: '딜리버리온', theme: '배송 커머스', riskLabel: '성장형', basePrice: 88000, sharesOutstanding: 35000000, averageVolume: 730000, volatility: 10, drift: 1.1, eventTags: ['commerce', 'consumer', 'internet'] },
  { code: 'MEC', name: '세림모빌리티', theme: '자동차 부품', riskLabel: '성장형', basePrice: 108000, sharesOutstanding: 29000000, averageVolume: 550000, volatility: 9, drift: 1.15, eventTags: ['auto', 'mobility', 'trade'] },
  { code: 'CLOUD', name: '클라우드웨이브', theme: '클라우드 서비스', riskLabel: '안정형', basePrice: 188000, sharesOutstanding: 33000000, averageVolume: 610000, volatility: 7, drift: 1.0, eventTags: ['cloud', 'internet'] },
  { code: 'FOOD', name: '한결식품', theme: '식품 제조', riskLabel: '안정형', basePrice: 12000, sharesOutstanding: 200000000, averageVolume: 420000, volatility: 5, drift: 0.7, eventTags: ['consumer', 'trade'] },
  { code: 'PORT', name: '동해항운', theme: '항만 물류', riskLabel: '성장형', basePrice: 245000, sharesOutstanding: 22000000, averageVolume: 360000, volatility: 9, drift: 1.1, eventTags: ['air', 'trade'] },
  { code: 'CARE', name: '온봄케어', theme: '돌봄 서비스', riskLabel: '성장형', basePrice: 92000, sharesOutstanding: 19500000, averageVolume: 290000, volatility: 8, drift: 0.9, eventTags: ['health', 'consumer'] },
  { code: 'LOOP', name: '에코셀머티리얼', theme: '배터리 소재', riskLabel: '고변동', basePrice: 425000, sharesOutstanding: 23000000, averageVolume: 630000, volatility: 13, drift: 1.4, eventTags: ['auto', 'green', 'chip'] },
  { code: 'BUILD', name: '한길건자재', theme: '건설 자재', riskLabel: '테마형', basePrice: 136000, sharesOutstanding: 26500000, averageVolume: 320000, volatility: 10, drift: 1.0, eventTags: ['trade', 'auto'] },
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
