# AI Todo Manager - 설정 가이드

## 1. 패키지 설치

먼저 Supabase 패키지를 설치해야 합니다:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## 2. Supabase 프로젝트 설정

### 2.1 Supabase 프로젝트 생성
1. [Supabase](https://supabase.com) 접속
2. "New Project" 클릭
3. 프로젝트명, 데이터베이스 비밀번호 설정
4. 리전 선택 (가장 가까운 지역 선택)

### 2.2 API 키 확인
1. 프로젝트 대시보드 → Settings → API
2. Project URL 복사
3. `anon` public 키 복사
4. `service_role` secret 키 복사 (서버용)

## 3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI (Google Gemini) 설정
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key
```

## 4. Supabase 데이터베이스 스키마 생성

Supabase 대시보드의 SQL Editor에서 다음 쿼리를 실행하세요:

```sql
-- todos 테이블 생성
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

-- Row Level Security (RLS) 활성화
alter table todos enable row level security;

-- 사용자는 자신의 todo만 조회 가능
create policy "Users can view their own todos"
  on todos for select
  using (auth.uid() = user_id);

-- 사용자는 자신의 todo만 생성 가능
create policy "Users can create their own todos"
  on todos for insert
  with check (auth.uid() = user_id);

-- 사용자는 자신의 todo만 수정 가능
create policy "Users can update their own todos"
  on todos for update
  using (auth.uid() = user_id);

-- 사용자는 자신의 todo만 삭제 가능
create policy "Users can delete their own todos"
  on todos for delete
  using (auth.uid() = user_id);

-- 인덱스 생성 (성능 최적화)
create index todos_user_id_idx on todos(user_id);
create index todos_due_date_idx on todos(due_date);
create index todos_priority_idx on todos(priority);
create index todos_completed_idx on todos(completed);
```

## 5. Google Gemini API 키 발급

1. [Google AI Studio](https://aistudio.google.com/app/apikey) 접속
2. "Create API Key" 클릭
3. API 키 복사하여 `.env.local`에 추가

## 6. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000/login`로 접속하여 로그인 페이지를 확인하세요.

## 7. 인증 기능 구현 (다음 단계)

로그인/회원가입 폼은 UI만 구현된 상태입니다. 실제 인증 기능을 구현하려면:

1. `lib/supabase/auth.ts` 파일 생성 및 인증 함수 구현
2. 로그인/회원가입 컴포넌트에 실제 로직 연결
3. 세션 관리 미들웨어 구현
4. 보호된 라우트 설정

## 문제 해결

### "Module not found: Can't resolve '@supabase/supabase-js'"
→ `npm install @supabase/supabase-js @supabase/ssr` 실행

### 환경 변수가 적용되지 않음
→ 개발 서버 재시작 (`Ctrl+C` 후 `npm run dev`)

### Supabase 연결 오류
→ `.env.local` 파일의 URL과 API 키 확인
