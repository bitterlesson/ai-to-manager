
# AI Todo Manager PRD

## 1. Product Overview
AI 기반 자연어 할 일 관리 SaaS. 사용자는 자연어로 할 일을 입력하면 구조화된 Todo로 변환되고, AI가 일간/주간 업무 요약 및 분석을 제공한다.

## 2. Core Features

### 2.1 Authentication
- Email/Password Login & Signup
- Supabase Auth 연동
- JWT 기반 세션 관리

### 2.2 Todo CRUD
- Create, Read, Update, Delete
- Fields:
  - title (string)
  - description (text)
  - created_date (timestamp)
  - due_date (timestamp)
  - priority (enum: high, medium, low)
  - category (string[])
  - completed (boolean)

### 2.3 Search / Filter / Sort
- Search: title, description
- Filter:
  - priority
  - category
  - status (in-progress, completed, overdue)
- Sort:
  - priority
  - due_date
  - created_date

### 2.4 AI Task Generator
- 자연어 입력 → 구조화된 Todo JSON 변환
- Google Gemini API 활용
- 프롬프트 기반 파싱

### 2.5 AI Summary & Analytics
- Daily Summary
- Weekly Summary
- Completion Rate 분석

## 3. UI Screens

### 3.1 Login / Signup
- 이메일 로그인
- 비밀번호 재설정

### 3.2 Main Todo Dashboard
- Todo List
- Add Todo
- Search / Filter / Sort
- AI Generate Button
- AI Summary Panel

### 3.3 Analytics Dashboard (Phase 2)
- 주간 완료율 차트
- 카테고리 분포
- 생산성 트렌드

## 4. Tech Stack
- Frontend: Next.js (App Router)
- UI: Tailwind CSS, shadcn/ui
- Backend: Supabase (Postgres + Auth)
- AI: Google Gemini API
- Hosting: Vercel

## 5. Data Model (Supabase)

### users (Supabase Auth)
- id (uuid)
- email
- created_at

### todos
- id (uuid)
- user_id (uuid, FK)
- title (text)
- description (text)
- created_date (timestamp)
- due_date (timestamp)
- priority (text)
- category (text[])
- completed (boolean)

## 6. API Endpoints

- POST /api/todos
- GET /api/todos
- PUT /api/todos/:id
- DELETE /api/todos/:id
- POST /api/ai/parse
- GET /api/ai/summary

## 7. Security
- Row Level Security (RLS)
- JWT Auth Middleware
- API Rate Limiting

## 8. MVP Scope
- Auth
- Todo CRUD
- AI Task Generator
- Daily Summary

## 9. Success Metrics
- DAU
- Task Completion Rate
- AI Task Usage Rate
