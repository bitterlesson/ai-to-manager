# AI Todo Manager

AI 기반 자연어 할 일 관리 SaaS. 사용자는 자연어로 할 일을 입력하면 구조화된 Todo로 변환되고, AI가 일간/주간 업무 요약 및 분석을 제공합니다.

## 🌐 서비스 URL

**Live Demo**: [https://ai-to-manager.vercel.app](https://ai-to-manager.vercel.app)

## 🚀 주요 기능

### 할 일 관리
- ✅ **CRUD**: 할 일 생성, 조회, 수정, 삭제
- 🔍 **검색**: 제목 기반 실시간 검색
- 🎯 **필터**: 우선순위, 상태, 카테고리별 필터링
- 📊 **정렬**: 생성일, 마감일, 우선순위 기준 정렬

### AI 기능
- 🤖 **자연어 파싱**: "내일 오후 3시까지 중요한 회의 준비" → 구조화된 할 일로 자동 변환
- 📈 **일간/주간 분석**: AI가 생산성 분석, 완료율, 개선 제안 제공
- 💡 **스마트 추천**: 우선순위 자동 결정, 카테고리 추천

### 사용자 기능
- 🔐 **인증**: 이메일/비밀번호 로그인, 회원가입, 비밀번호 재설정
- 👤 **프로필**: 이름 변경, 비밀번호 변경
- ⚙️ **설정**: 테마 (라이트/다크/시스템), 언어, 계정 삭제
- 📧 **이메일 알림**: 중요 할 일 24시간 이상 지연 시 알림 (활성/비활성 설정 가능)

## 🛠 기술 스택

| 분류 | 기술 |
|------|------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **UI** | Tailwind CSS, shadcn/ui, next-themes |
| **Backend** | Supabase (PostgreSQL + Auth) |
| **AI** | Google Gemini API (gemini-2.0-flash-exp), Vercel AI SDK |
| **Email** | Resend |
| **Scheduler** | Vercel Cron Jobs |
| **Deployment** | Vercel |

## 📦 설치 및 실행

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Gemini AI
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# Cron Job 인증 (선택)
CRON_SECRET=your_cron_secret
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📁 프로젝트 구조

```
ai-todo-manager/
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   ├── parse-todo/      # AI 자연어 파싱 API
│   │   │   └── analyze-todos/   # AI 요약 및 분석 API
│   │   └── cron/
│   │       └── check-overdue/   # 지연 알림 Cron Job
│   ├── login/                   # 로그인 페이지
│   ├── signup/                  # 회원가입 페이지
│   ├── forgot-password/         # 비밀번호 찾기
│   ├── profile/                 # 프로필 페이지
│   ├── settings/                # 설정 페이지
│   ├── layout.tsx               # 루트 레이아웃 (메타데이터, 테마)
│   └── page.tsx                 # 메인 대시보드
├── components/
│   ├── auth/                    # 인증 관련 컴포넌트
│   ├── dashboard/               # 대시보드 (Header, Toolbar, TodoSummary)
│   ├── providers/               # ThemeProvider
│   ├── todo/                    # Todo 컴포넌트 (Form, List, Card)
│   └── ui/                      # shadcn/ui 컴포넌트
├── lib/
│   ├── supabase/                # Supabase 클라이언트 및 인증
│   ├── email/                   # Resend 이메일 서비스
│   └── utils.ts                 # 유틸리티 함수
├── types/
│   └── todo.ts                  # Todo 타입 정의
├── docs/                        # 문서
└── vercel.json                  # Vercel Cron 설정
```

## 🎨 디자인 시스템

**Modern Productivity** 컬러 팔레트 적용:

- **Primary (Indigo)**: 브랜드 메인 컬러, 주요 액션
- **Secondary (Violet)**: AI 기능 강조
- **Success (Green)**: 완료 상태, 낮은 우선순위
- **Warning (Amber)**: 보통 우선순위, 주의
- **Destructive (Red)**: 높은 우선순위, 삭제, 지연

### 테마 지원
- 🌞 라이트 모드
- 🌙 다크 모드
- 💻 시스템 설정 자동 감지

## 📄 페이지 구성

### 1. 로그인/회원가입 (`/login`, `/signup`)
- 이메일/비밀번호 인증
- 이메일 인증 (Supabase)
- 반응형 2단 레이아웃

### 2. 메인 대시보드 (`/`)
- **Header**: 로고, 사용자 정보, 프로필/설정 메뉴
- **Toolbar**: 검색, 필터, 정렬
- **Main Area**:
  - 왼쪽: 빠른 추가 버튼, AI 생성 버튼, AI 요약 및 분석
  - 오른쪽: TodoList (진행 중 / 완료됨 섹션)

### 3. 프로필 (`/profile`)
- 사용자 정보 표시
- 이름 변경
- 비밀번호 변경

### 4. 설정 (`/settings`)
- 테마 선택 (라이트/다크/시스템)
- 언어 설정 (한국어/영어 - 추후 지원)
- 이메일 알림 활성/비활성
- 계정 삭제

## 🔧 Supabase 설정

### 데이터베이스 스키마

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

-- RLS 정책
alter table todos enable row level security;

create policy "Users can view their own todos"
  on todos for select using (auth.uid() = user_id);

create policy "Users can create their own todos"
  on todos for insert with check (auth.uid() = user_id);

create policy "Users can update their own todos"
  on todos for update using (auth.uid() = user_id);

create policy "Users can delete their own todos"
  on todos for delete using (auth.uid() = user_id);
```

## 📧 이메일 알림 설정

### Vercel Cron Job
- **실행 시간**: 매일 UTC 0:00 (KST 09:00)
- **대상**: 중요도 높음 + 24시간 이상 지연된 할 일
- **설정 파일**: `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/check-overdue",
      "schedule": "0 0 * * *"
    }
  ]
}
```

## 📝 개발 규칙

프로젝트 개발 규칙은 [.cursor/rules/project-rules.mdc](.cursor/rules/project-rules.mdc)를 참고하세요.

주요 규칙:
- ✅ 함수형 컴포넌트 + 화살표 함수
- ✅ TypeScript strict 모드
- ✅ 한글 주석 및 JSDoc
- ✅ 컴포넌트 파일명 PascalCase
- ✅ ESLint 규칙 준수

## ✅ 구현 완료

- [x] UI/UX 디자인 시스템
- [x] 로그인/회원가입 (이메일 인증)
- [x] 메인 대시보드
- [x] Todo CRUD (Supabase 연동)
- [x] 검색, 필터, 정렬 기능
- [x] AI 자연어 파싱 (Gemini API)
- [x] AI 요약 및 분석
- [x] 프로필 페이지
- [x] 설정 페이지 (테마, 언어, 계정 삭제)
- [x] 이메일 알림 (지연된 할 일)
- [x] 다크/라이트 테마
- [x] 반응형 레이아웃
- [x] SEO 메타데이터

## 🤝 기여

이슈와 PR은 언제나 환영합니다!

## 📄 라이선스

MIT License

---

**Built with ❤️ using Next.js, Supabase, Gemini AI, and Vercel**
