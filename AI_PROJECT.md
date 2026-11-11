# AI 프로젝트 프로필

## 프로젝트

- 목적: 퇴직금 1,000만 원으로 가상 주식 시장에 투자하는 브라우저 픽셀 아트 게임.
- 기술: Vue 3, TypeScript, Vue Router, Vite, pnpm.
- 화면·시뮬레이션: `src/components/screens/`는 화면 단위 UI, `src/components/shared/`는 재사용 표시 UI, `src/composables/useInvestmentGame.ts`는 반응형 게임 흐름, `src/game/marketModel.ts`는 시장 계산, `src/game/gamePersistence.ts`는 브라우저 저장과 복원을 담당합니다. 데이터와 계약은 `src/data/gameData.ts`, `src/types/game.ts`에 둡니다.
- 게임은 브라우저에서 실행되며 진행 상태와 관심 종목을 `localStorage`에 저장합니다.

## 화면 경로와 브라우저 이력

- `/` 시작 화면
- `/game/practice` 종목 시세 (별칭 `/game/practice/market`)
- `/game/practice/companies` 기업 정보 카드 목록
- `/game/practice/stocks/:code` 종목 상세
- `/game/practice/stocks/:code/order` 주문
- `/game/practice/portfolio` 내 주식
- `/summary` 장 마감 요약
- `/result` 파산 또는 30일 완료 결과
- 라우트는 Vue Router hash history를 사용합니다. 사용자의 화면 이동은 별도 경로로 push하고, 뒤로/앞으로 이동 시 경로에 맞는 게임 화면을 복원합니다. 종목 코드가 포함된 경로를 열 때 해당 종목 선택 상태를 동기화합니다.

## 게임 규칙과 데이터

- 시작 자금 1,000만 원. 정규장 09:00–15:30, 정비 시간 15:30–16:00, 애프터마켓 16:00–20:00.
- 한 런은 최대 30거래일이며, 30일차 장 마감 후 최종 결과 화면으로 종료합니다.
- 기본 1배속에서 초당 게임 시간 1분이 흐르며 1·2·4·8배속을 지원합니다. 게임 시간 5분마다 장이 열려 있는 구간에서 종목 가격과 차트를 갱신합니다. 정비 시간에도 시계는 흐르며, 한 거래일은 기본 속도 기준 660초입니다.
- 가상 종목 24개의 기준가는 5,000원부터 2,480,000원까지 분포합니다. 기업별 시가총액은 현재가와 발행 주식 수로 계산합니다.
- 종목별 일 마감 가격은 최근 30거래일을 저장하고, 종목 상세 차트에서 당일·일별·5거래일 단위 주별로 확인합니다.
- 종목은 전일 종가 대비 ±30% 가격 제한에 도달하면 그날 거래와 예약 주문 체결을 중단하며, 다음 거래일에 제한 상태를 해제합니다.
- 투자 관심도/인기도는 종목별 평균 거래량을 뜻하며, 인기순은 평균 거래량이 많은 순입니다. 이 지표는 정보용이며 주가 흐름에 직접 영향을 주지 않습니다.
- 종합지수는 종목별 시가총액 비중을 반영해 누적 계산하며, 거래일마다 1,000으로 초기화하지 않습니다. 이전 세이브에는 기준 시가총액을 보정해 적용합니다.
- 종목별 drift는 시장 평균을 기준으로 상쇄해 전체 시장에 고정 상승 추세가 생기지 않도록 합니다.
- 정규장과 애프터마켓에 즉시 매수·매도 및 지정가 예약이 가능합니다. 정비 시간에는 거래와 시세 갱신이 멈춥니다. 애프터마켓은 낮은 변동성을 사용하고, 미체결 주문은 20:00에 취소합니다.
- 20:00에 자산 변화와 거래 내역을 요약합니다. 총 자산이 10만 원 이하가 되면 파산으로 종료합니다.
- 가격은 외부 시장 데이터가 아닌 가상의 시장 이벤트·변동성으로 시뮬레이션합니다.
- 일중 이벤트 효과는 거래일 전체에 나누어 적용해 5분 갱신 횟수만큼 일일 등락이 반복 누적되지 않도록 합니다.

## 저장과 호환성

- 게임 진행 저장 키는 `simulated-investment-game-state`, 관심 종목 키는 `simulated-investment-watchlist`입니다.
- 저장 데이터는 현재 게임 상태 필드의 누락값을 기본값으로 보정합니다.
- 거래 경로를 추가해도 세이브 데이터의 거래 내역과 보유 자산을 유지합니다.

## 디자인과 자산

- 정보가 먼저 읽히는 픽셀 단말기 표현: 각진 테두리, 절제된 색상, 숫자 정렬, 일관된 버튼 피드백.
- 거래 화면은 원룸 데스크 배경과 시간대별 일본 교외 주택가 이미지를 사용합니다.
- `public/assets/market-index-mark-pixel.png`, `public/assets/company-emblems-pixel.png`, `public/assets/market-room-*-pixel.png`을 사용합니다.
- 픽셀은 시각 스타일이고 브랜드명은 LEXIP입니다.
- CSS는 `src/styles/app-base.css`의 앱 공통 기반, `pixel-theme.css`의 픽셀 테마, `market-terminal.css`의 증권 단말 화면 스타일로 나눕니다.

## 확인 명령

- `pnpm lint` — ESLint
- `pnpm build` — vue-tsc와 Vite production build
- `pnpm verify` — lint와 production build 통합 검증
- `pnpm preview` — 프로덕션 빌드 수동 확인
- 자동화된 테스트/E2E 스크립트는 없습니다.

## 배포

`.github/workflows/ci.yml`에서 PR 및 `main` 푸시 시 `pnpm verify`를 실행합니다. `.github/workflows/deploy-pages.yml`도 배포 전 lint와 build를 확인합니다. 외부 서비스 키나 빌드 환경 변수는 필요하지 않습니다.
