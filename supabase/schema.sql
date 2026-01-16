-- ============================================
-- AI Todo Manager - Supabase Database Schema
-- ============================================
-- 이 스크립트는 Supabase SQL Editor에서 바로 실행 가능합니다.

-- ============================================
-- 1. 사용자 프로필 테이블 (public.users)
-- ============================================
-- auth.users와 1:1 관계를 가지는 사용자 프로필 테이블

create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 사용자 테이블 주석
comment on table public.users is '사용자 프로필 정보 테이블 (auth.users와 1:1 연결)';
comment on column public.users.id is 'auth.users.id와 동일한 UUID';
comment on column public.users.email is '사용자 이메일 (auth.users.email과 동기화)';
comment on column public.users.name is '사용자 이름';
comment on column public.users.avatar_url is '프로필 이미지 URL';

-- ============================================
-- 2. 할 일 테이블 (public.todos)
-- ============================================
-- 사용자별 할 일 관리 테이블

create table if not exists public.todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text default '' not null,
  created_date timestamp with time zone default timezone('utc'::text, now()) not null,
  due_date timestamp with time zone,
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  category text[] default array[]::text[] not null,
  completed boolean default false not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 할 일 테이블 주석
comment on table public.todos is '사용자별 할 일 관리 테이블';
comment on column public.todos.id is '할 일 고유 ID';
comment on column public.todos.user_id is '사용자 ID (public.users 참조)';
comment on column public.todos.title is '할 일 제목';
comment on column public.todos.description is '할 일 상세 설명';
comment on column public.todos.created_date is '생성 일시';
comment on column public.todos.due_date is '마감 일시 (선택사항)';
comment on column public.todos.priority is '우선순위 (high, medium, low)';
comment on column public.todos.category is '카테고리 배열';
comment on column public.todos.completed is '완료 여부';

-- ============================================
-- 3. 인덱스 생성 (성능 최적화)
-- ============================================

-- users 테이블 인덱스
create index if not exists users_email_idx on public.users(email);

-- todos 테이블 인덱스
create index if not exists todos_user_id_idx on public.todos(user_id);
create index if not exists todos_due_date_idx on public.todos(due_date);
create index if not exists todos_priority_idx on public.todos(priority);
create index if not exists todos_completed_idx on public.todos(completed);
create index if not exists todos_created_date_idx on public.todos(created_date);
create index if not exists todos_category_idx on public.todos using gin(category);

-- ============================================
-- 4. Row Level Security (RLS) 활성화
-- ============================================

-- users 테이블 RLS 활성화
alter table public.users enable row level security;

-- todos 테이블 RLS 활성화
alter table public.todos enable row level security;

-- ============================================
-- 5. RLS 정책 (users 테이블)
-- ============================================

-- 사용자는 자신의 프로필만 조회 가능
create policy "Users can view their own profile"
  on public.users
  for select
  using (auth.uid() = id);

-- 사용자는 자신의 프로필만 생성 가능
create policy "Users can create their own profile"
  on public.users
  for insert
  with check (auth.uid() = id);

-- 사용자는 자신의 프로필만 수정 가능
create policy "Users can update their own profile"
  on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 사용자는 자신의 프로필만 삭제 가능
create policy "Users can delete their own profile"
  on public.users
  for delete
  using (auth.uid() = id);

-- ============================================
-- 6. RLS 정책 (todos 테이블)
-- ============================================

-- 사용자는 자신의 할 일만 조회 가능
create policy "Users can view their own todos"
  on public.todos
  for select
  using (auth.uid() = user_id);

-- 사용자는 자신의 할 일만 생성 가능
create policy "Users can create their own todos"
  on public.todos
  for insert
  with check (auth.uid() = user_id);

-- 사용자는 자신의 할 일만 수정 가능
create policy "Users can update their own todos"
  on public.todos
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 사용자는 자신의 할 일만 삭제 가능
create policy "Users can delete their own todos"
  on public.todos
  for delete
  using (auth.uid() = user_id);

-- ============================================
-- 7. 트리거 함수 (updated_at 자동 업데이트)
-- ============================================

-- updated_at 자동 업데이트 함수
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- users 테이블 트리거
create trigger handle_users_updated_at
  before update on public.users
  for each row
  execute function public.handle_updated_at();

-- todos 테이블 트리거
create trigger handle_todos_updated_at
  before update on public.todos
  for each row
  execute function public.handle_updated_at();

-- ============================================
-- 8. 회원가입 시 사용자 프로필 자동 생성
-- ============================================

-- auth.users에 새 사용자가 추가되면 public.users도 자동 생성
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

-- auth.users INSERT 트리거
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================
-- 9. 샘플 데이터 (선택사항)
-- ============================================
-- 개발 및 테스트용 샘플 데이터
-- 실제 프로덕션 환경에서는 이 부분을 주석 처리하거나 삭제하세요

/*
-- 샘플 사용자 (수동으로 auth.users에 먼저 생성 필요)
insert into public.users (id, email, name) values
  ('00000000-0000-0000-0000-000000000001', 'demo@example.com', '데모 사용자')
on conflict (id) do nothing;

-- 샘플 할 일
insert into public.todos (user_id, title, description, priority, category, due_date, completed) values
  ('00000000-0000-0000-0000-000000000001', '프로젝트 기획서 작성', 'Q1 신규 프로젝트 기획서 초안 작성', 'high', array['업무', '기획'], now() + interval '7 days', false),
  ('00000000-0000-0000-0000-000000000001', '주간 회의 준비', '주간 스프린트 리뷰 자료 준비', 'medium', array['업무', '회의'], now() + interval '3 days', false),
  ('00000000-0000-0000-0000-000000000001', '운동하기', '헬스장에서 1시간 운동', 'low', array['개인', '건강'], now() + interval '1 day', true)
on conflict do nothing;
*/

-- ============================================
-- 10. 권한 설정
-- ============================================

-- authenticated 사용자에게 테이블 접근 권한 부여
grant usage on schema public to authenticated;
grant all on public.users to authenticated;
grant all on public.todos to authenticated;

-- anon 사용자는 접근 불가 (로그인 필요)
revoke all on public.users from anon;
revoke all on public.todos from anon;

-- ============================================
-- 스키마 생성 완료
-- ============================================
-- 이제 Supabase 대시보드의 SQL Editor에서 이 스크립트를 실행하세요.
-- 
-- 실행 순서:
-- 1. Supabase 프로젝트 생성
-- 2. SQL Editor 열기
-- 3. 이 파일의 전체 내용 복사 & 붙여넣기
-- 4. "Run" 버튼 클릭
-- 
-- 확인 방법:
-- - Table Editor에서 users, todos 테이블 확인
-- - RLS가 활성화되어 있는지 확인 (shield 아이콘)
-- - Authentication에서 새 사용자 생성 후 users 테이블 자동 생성 확인
