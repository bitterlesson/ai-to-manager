/**
 * Mock 데이터 - 개발 및 UI 테스트용
 */

import { Todo, PRIORITY } from "@/types/todo";

/**
 * Mock 사용자 데이터
 */
export const mockUser = {
  id: "mock-user-id",
  email: "user@example.com",
  name: "김철수",
  avatar: null,
};

/**
 * Mock 할 일 데이터
 */
export const mockTodos: Todo[] = [
  {
    id: "1",
    user_id: "mock-user-id",
    title: "프로젝트 기획서 작성",
    description: "Q1 신규 프로젝트 기획서 초안 작성 및 팀 공유",
    created_date: new Date("2026-01-08"),
    due_date: new Date("2026-01-15"),
    priority: PRIORITY.HIGH,
    category: ["업무", "기획"],
    completed: false,
  },
  {
    id: "2",
    user_id: "mock-user-id",
    title: "주간 회의 준비",
    description: "주간 스프린트 리뷰 자료 준비 및 발표 연습",
    created_date: new Date("2026-01-09"),
    due_date: new Date("2026-01-12"),
    priority: PRIORITY.MEDIUM,
    category: ["업무", "회의"],
    completed: false,
  },
  {
    id: "3",
    user_id: "mock-user-id",
    title: "운동하기",
    description: "헬스장에서 1시간 운동",
    created_date: new Date("2026-01-09"),
    due_date: new Date("2026-01-10"),
    priority: PRIORITY.LOW,
    category: ["개인", "건강"],
    completed: true,
  },
  {
    id: "4",
    user_id: "mock-user-id",
    title: "버그 수정",
    description: "로그인 페이지 리다이렉트 버그 수정",
    created_date: new Date("2026-01-08"),
    due_date: new Date("2026-01-09"),
    priority: PRIORITY.HIGH,
    category: ["업무", "개발"],
    completed: true,
  },
  {
    id: "5",
    user_id: "mock-user-id",
    title: "책 읽기",
    description: "클린 코드 3장 읽고 정리하기",
    created_date: new Date("2026-01-07"),
    due_date: null,
    priority: PRIORITY.LOW,
    category: ["개인", "학습"],
    completed: false,
  },
  {
    id: "6",
    user_id: "mock-user-id",
    title: "고객 미팅",
    description: "신규 기능 요구사항 청취 및 논의",
    created_date: new Date("2026-01-09"),
    due_date: new Date("2026-01-14"),
    priority: PRIORITY.MEDIUM,
    category: ["업무", "미팅"],
    completed: false,
  },
];

/**
 * 카테고리 목록 추출
 */
export const getAllCategories = (todos: Todo[]): string[] => {
  const categories = new Set<string>();
  todos.forEach((todo) => {
    todo.category.forEach((cat) => categories.add(cat));
  });
  return Array.from(categories).sort();
};

/**
 * Mock 카테고리 목록
 */
export const mockCategories = getAllCategories(mockTodos);
