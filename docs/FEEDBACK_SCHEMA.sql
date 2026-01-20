-- =============================================
-- Feedback 테이블 생성 스크립트
-- Supabase SQL Editor에서 실행하세요.
-- =============================================

-- 1. feedback 테이블 생성
create table feedback (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('bug', 'feature')),
  title text not null,
  description text not null,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. RLS (Row Level Security) 활성화
alter table feedback enable row level security;

-- 3. RLS 정책: 사용자는 자신의 피드백만 조회 가능
create policy "Users can view their own feedback"
  on feedback for select
  using (auth.uid() = user_id);

-- 4. RLS 정책: 사용자는 자신의 피드백만 생성 가능
create policy "Users can create their own feedback"
  on feedback for insert
  with check (auth.uid() = user_id);

-- 5. 인덱스 생성 (성능 최적화)
create index feedback_user_id_idx on feedback(user_id);
create index feedback_type_idx on feedback(type);
create index feedback_status_idx on feedback(status);
create index feedback_created_at_idx on feedback(created_at desc);
