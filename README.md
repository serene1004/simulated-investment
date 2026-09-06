# Simulated Investment

가상의 시장 이슈와 종목 데이터를 바탕으로 투자 판단을 연습하는 웹 기반 주식 투자 시뮬레이션 게임입니다. 초기 자금으로 종목을 매수·매도하고, 매 페이즈마다 달라지는 시장 이벤트에 대응해 최종 자산과 수익률을 높이는 것이 목표입니다.

## 주요 기능

- 연습 모드와 랭킹 모드 제공
- 5개 페이즈의 시장 브리핑, 이벤트 기반 주가 변동, 종목별 미니 차트
- 매수·매도·전량 거래 및 보유 자산 추적
- 게임 진행 상태와 로컬 랭킹의 브라우저 저장
- Supabase 연동 시 온라인 랭킹 등록·조회
- Vue Router 기반 화면 전환과 GitHub Pages 배포

## 기술 스택

- **Frontend**: Vue 3, TypeScript, Vue Router
- **Build**: Vite, pnpm
- **Backend**: Supabase (PostgreSQL, Row Level Security)
- **Code quality**: ESLint, vue-tsc
- **Deployment**: GitHub Actions, GitHub Pages

## 시작하기

Node.js 24 이상과 pnpm이 필요합니다.

```bash
pnpm install
pnpm dev
```

실행 주소는 Vite가 출력하는 로컬 주소(기본값: `http://localhost:5173`)입니다.

## 환경 변수 및 온라인 랭킹 설정

Supabase를 연결하지 않아도 게임과 로컬 랭킹은 사용할 수 있습니다. 온라인 랭킹을 사용하려면 `.env.example`을 복사해 `.env`를 만들고 프로젝트 값을 입력합니다.

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

그 다음 [rankings 마이그레이션](supabase/migrations/20260829000000_create_rankings.sql)을 Supabase SQL Editor에서 실행합니다. 이 마이그레이션은 랭킹 테이블, 읽기·등록 권한, Row Level Security 정책을 설정합니다.

GitHub Pages 배포에서는 Repository variables에 아래 값을 등록합니다.

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## 확인 명령

```bash
pnpm lint
pnpm build
pnpm preview
```

## 배포

`main` 브랜치에 푸시하면 GitHub Actions가 pnpm으로 의존성을 설치하고, lint·build를 수행한 뒤 GitHub Pages에 배포합니다.

## 변경 이력

주요 변경 사항은 [CHANGELOG.md](CHANGELOG.md)에서 관리합니다.