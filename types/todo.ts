/**
 * 할 일(Todo) 관련 타입 정의
 */

/**
 * 우선순위 타입
 */
export const PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export type Priority = typeof PRIORITY[keyof typeof PRIORITY];

/**
 * 할 일 상태 타입
 */
export const TODO_STATUS = {
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
} as const;

export type TodoStatus = typeof TODO_STATUS[keyof typeof TODO_STATUS];

/**
 * 할 일(Todo) 인터페이스
 */
export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description: string;
  created_date: Date;
  due_date: Date | null;
  priority: Priority;
  category: string[];
  completed: boolean;
}

/**
 * 할 일 생성 시 필요한 데이터 (id, user_id, created_date 제외)
 */
export type CreateTodoInput = Omit<Todo, 'id' | 'user_id' | 'created_date'>;

/**
 * 할 일 수정 시 필요한 데이터 (부분 업데이트 가능)
 */
export type UpdateTodoInput = Partial<Omit<Todo, 'id' | 'user_id' | 'created_date'>>;

/**
 * 할 일 필터 옵션
 */
export interface TodoFilter {
  priority?: Priority[];
  category?: string[];
  status?: TodoStatus[];
  search?: string;
}

/**
 * 할 일 정렬 옵션
 */
export type TodoSortBy = 'priority' | 'due_date' | 'created_date';

export interface TodoSortOption {
  sortBy: TodoSortBy;
  order: 'asc' | 'desc';
}
