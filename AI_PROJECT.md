# AI 프로젝트 프로필

## 프로젝트

- 목적: 시장 이벤트와 종목 데이터에 따라 매매 판단을 연습하는 브라우저 기반 주식 시뮬레이션 게임.
- 기술: Vue 3, TypeScript, Vue Router, Vite, Supabase JS.
- 패키지 관리자: pnpm 11.17.0 (`package.json`의 `packageManager`). CI 런타임은 Node.js 24.
- 라우트: `/`, `/ranking`, `/game/practice`, `/game/ranking`, `/summary`, `/result`; hash history를 사용합니다.
- 구조: `src/components/` 화면·UI, `src/composables/useInvestmentGame.ts` 게임 상태와 동작, `src/data/gameData.ts` 기본 데이터, `src/types/game.ts` 모델, `src/lib/` 통합, `supabase/migrations/` DB 변경.

## 데이터와 호환성 경계

- 진행 상태와 로컬 랭킹은 브라우저 저장소를 사용합니다. 진행 상태 키는 `simulated-investment-game-state`이며 현재 코드에 이전 이벤트 필드 호환 로직이 있습니다.
- 온라인 랭킹은 Supabase를 사용할 수 있으며 스키마와 RLS는 `supabase/migrations/20260829000000_create_rankings.sql`이 정의합니다.
- UI·라우트 교체 시 현재 URL, hash 기반 Pages 배포, 로컬 진행 상태 및 랭킹 컬럼 계약을 유지합니다. 저장 형식을 바꾸는 경우 기존 데이터 읽기 또는 명시적 변환 경로를 함께 제공합니다.
- Supabase 환경 변수는 `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`입니다. 실제 키는 읽거나 문서에 복사하지 않습니다.
- 별도 생성 코드 경로는 확인되지 않았습니다. 새로 생기면 생성 원본과 절차를 먼저 기록합니다.

## 리뉴얼 방향

- 상세한 시각·게임 루프 기준과 단계별 마이그레이션은 `serene-harness/renewal-migration.md`를 따릅니다.
- 목표는 밝고 친근한 픽셀풍 시장 시뮬레이션입니다. 픽셀 모티프와 제한된 팔레트를 사용하되, 한글과 금융 데이터의 가독성을 우선합니다.
- STONKS-9800에서 레트로 거래 단말기, 정보 밀도, 시세 확인-판단-거래-즉시 피드백의 흐름을 참고합니다. 원작 자산이나 화면을 복제하지 않습니다.
- 시각 변경은 기존 게임 규칙과 분리합니다. 매수·매도, 페이즈, 요약, 랭킹 및 저장 계약은 별도 요청과 검증 없이 변경하지 않습니다.

## 검증 명령

| 범위 | 명령 | 비고 |
|---|---|---|
| 린트 | `pnpm lint` | ESLint |
| 타입 검사 및 프로덕션 빌드 | `pnpm build` | `vue-tsc --noEmit && vite build` |
| 미리보기 | `pnpm preview` | 빌드 후 수동 확인 |
| 테스트 | 미확인 | `package.json`에 테스트 스크립트 없음 |
| E2E | 미확인 | 확인된 스크립트 없음 |

## 배포

- GitHub Actions의 `.github/workflows/deploy-pages.yml`에서 `main` 푸시 또는 수동 실행 시 lint와 build 후 GitHub Pages에 배포합니다.
- Supabase 스키마 변경은 migration 파일과 RLS를 함께 확인합니다. 외부 DB에 마이그레이션을 적용하거나 배포하는 일은 명시 요청 없이 하지 않습니다.
