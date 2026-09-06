# Supabase ranking setup

이 프로젝트의 전역 랭킹은 `public.rankings` 테이블만 사용합니다. 연습 모드는 네트워크 요청이나 랭킹 저장을 하지 않습니다.

## 1. 데이터베이스 생성

Supabase Dashboard의 SQL Editor에서 `migrations/20260829000000_create_rankings.sql`을 실행합니다. 이 마이그레이션은 테이블, 정렬 인덱스, Row Level Security(RLS), 익명 읽기·등록 정책을 만듭니다.

## 2. 로컬 환경변수

`.env.example`을 복사해 `.env.local`을 만들고, Dashboard의 Project Settings > API에서 값을 채웁니다.

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

공개 키는 브라우저 번들에 포함됩니다. `service_role` 또는 secret 키는 절대 넣지 마세요.

## 3. GitHub Pages 배포 환경변수

GitHub 저장소의 Settings > Secrets and variables > Actions > Variables에 다음 Repository variables를 추가합니다.

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

배포 워크플로가 이 값을 빌드 시점에 Vite 환경변수로 주입합니다.

## 제한 사항

계정 없는 클라이언트 직접 등록은 점수 위조를 완전히 막을 수 없습니다. 현재 RLS는 허용된 두 컬럼만 읽고 쓰게 제한합니다. 경쟁성이나 보상 기능이 생기면 제출을 Supabase Edge Function으로 옮겨 서버에서 점수를 검증하세요.