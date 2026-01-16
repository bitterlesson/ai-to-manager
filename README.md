# AI Todo Manager

AI 기반 자연어 할 일 관리 SaaS. 사용자는 자연어로 할 일을 입력하면 구조화된 Todo로 변환되고, AI가 일간/주간 업무 요약 및 분석을 제공합니다.

## 🚀 주요 기능

- ✅ **할 일 관리** (CRUD)
- 🔍 **검색, 필터, 정렬**
- 🤖 **AI 자연어 파싱** (자연어 → 구조화된 데이터)
- 📊 **생산성 분석** (준비 중)
- 🔐 **사용자 인증** (Supabase)

## 🛠 기술 스택

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth)
- **AI**: Google Gemini API
- **Deployment**: Vercel

## 📦 설치 및 실행

### 1. 패키지 설치

```bash
npm install
```

### 2. Supabase 패키지 설치

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Gemini AI
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📁 프로젝트 구조

```
ai-todo-manager/
├── app/                      # Next.js App Router
│   ├── login/               # 로그인 페이지
│   ├── signup/              # 회원가입 페이지
│   ├── forgot-password/     # 비밀번호 찾기
│   └── page.tsx            # 메인 대시보드
├── components/
│   ├── auth/               # 인증 관련 컴포넌트
│   ├── dashboard/          # 대시보드 컴포넌트 (Header, Toolbar)
│   ├── todo/               # Todo 컴포넌트 (Form, List, Card)
│   └── ui/                 # shadcn/ui 컴포넌트
├── lib/
│   ├── supabase/           # Supabase 클라이언트 설정
│   ├── mock-data.ts        # Mock 데이터
│   └── utils.ts            # 유틸리티 함수
├── types/
│   └── todo.ts             # Todo 타입 정의
└── docs/
    ├── AI Todo Manager PRD.md  # 제품 요구사항 문서
    └── SETUP.md                # 설정 가이드
```

## 🎨 디자인 시스템

**Modern Productivity** 컬러 팔레트 적용:

- **Primary (Indigo)**: 브랜드 메인 컬러, 주요 액션
- **Secondary (Violet)**: AI 기능 강조
- **Success (Green)**: 완료 상태, 낮은 우선순위
- **Warning (Amber)**: 보통 우선순위, 주의
- **Destructive (Red)**: 높은 우선순위, 삭제, 지연

## 📄 페이지 구성

### 1. 로그인/회원가입 (`/login`, `/signup`)
- 이메일/비밀번호 인증
- 반응형 2단 레이아웃
- 서비스 소개 및 주요 기능 안내

### 2. 메인 대시보드 (`/`)
- **Header**: 로고, 사용자 정보, 로그아웃
- **Toolbar**: 검색, 필터 (우선순위/상태/카테고리), 정렬
- **Main Area**:
  - 왼쪽: 빠른 추가 버튼, 통계 카드
  - 오른쪽: TodoList (진행 중 / 완료됨 섹션)

## 🔧 설정 가이드

자세한 설정 방법은 [docs/SETUP.md](docs/SETUP.md)를 참고하세요.

### Supabase 데이터베이스 스키마

```sql
create table todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  created_date timestamp with time zone default timezone('utc'::text, now()) not null,
  due_date timestamp with time zone,
  priority text not null default 'medium',
  category text[] default array[]::text[],
  completed boolean default false not null
);
```

Row Level Security (RLS) 정책 적용으로 사용자는 자신의 데이터만 접근 가능합니다.

## 📝 개발 규칙

프로젝트 개발 규칙은 [.cursor/rules/project-rules.mdc](.cursor/rules/project-rules.mdc)를 참고하세요.

주요 규칙:
- ✅ 함수형 컴포넌트 + 화살표 함수
- ✅ TypeScript strict 모드
- ✅ 한글 주석 및 JSDoc
- ✅ 컴포넌트 파일명 PascalCase
- ✅ ESLint 규칙 준수

## 🚧 현재 상태 (MVP)

### ✅ 완료
- UI/UX 디자인 시스템
- 로그인/회원가입 화면
- 메인 대시보드 (Mock 데이터)
- Todo CRUD UI 컴포넌트
- 검색, 필터, 정렬 기능
- 반응형 레이아웃

### ⏳ 진행 예정
- Supabase 인증 연동
- Todo API 연동
- AI Task Generator
- AI Summary & Analytics
- 실시간 동기화

## 🤝 기여

이슈와 PR은 언제나 환영합니다!

## 📄 라이선스

MIT License

---

**Built with ❤️ using Next.js, Supabase, and AI**
