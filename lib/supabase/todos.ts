/**
 * Supabase Todos CRUD 함수
 */

import { createClient } from "./client";
import type { Todo, CreateTodoInput, UpdateTodoInput, TodoSortBy } from "@/types/todo";

/**
 * 할 일 목록 조회
 */
export const getTodos = async (userId: string): Promise<Todo[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", userId)
    .order("created_date", { ascending: false });

  if (error) {
    throw new Error("할 일 목록을 불러오는데 실패했습니다.");
  }

  return data.map((todo) => ({
    ...todo,
    created_date: new Date(todo.created_date),
    due_date: todo.due_date ? new Date(todo.due_date) : null,
  }));
};

/**
 * 할 일 생성
 */
export const createTodo = async (
  userId: string,
  input: CreateTodoInput
): Promise<Todo> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("todos")
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description || "",
      priority: input.priority,
      due_date: input.due_date,
      category: input.category,
      completed: input.completed || false,
    })
    .select()
    .single();

  if (error) {
    throw new Error("할 일 생성에 실패했습니다.");
  }

  return {
    ...data,
    created_date: new Date(data.created_date),
    due_date: data.due_date ? new Date(data.due_date) : null,
  };
};

/**
 * 할 일 수정
 */
export const updateTodo = async (
  todoId: string,
  userId: string,
  input: UpdateTodoInput
): Promise<Todo> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("todos")
    .update({
      title: input.title,
      description: input.description,
      priority: input.priority,
      due_date: input.due_date,
      category: input.category,
      completed: input.completed,
    })
    .eq("id", todoId)
    .eq("user_id", userId) // 본인 소유만 수정 가능
    .select()
    .single();

  if (error) {
    throw new Error("할 일 수정에 실패했습니다.");
  }

  return {
    ...data,
    created_date: new Date(data.created_date),
    due_date: data.due_date ? new Date(data.due_date) : null,
  };
};

/**
 * 할 일 삭제
 */
export const deleteTodo = async (
  todoId: string,
  userId: string
): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase
    .from("todos")
    .delete()
    .eq("id", todoId)
    .eq("user_id", userId); // 본인 소유만 삭제 가능

  if (error) {
    throw new Error("할 일 삭제에 실패했습니다.");
  }
};

/**
 * 완료 상태 토글
 */
export const toggleTodoComplete = async (
  todoId: string,
  userId: string,
  completed: boolean
): Promise<Todo> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("todos")
    .update({ completed })
    .eq("id", todoId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error("완료 상태 변경에 실패했습니다.");
  }

  return {
    ...data,
    created_date: new Date(data.created_date),
    due_date: data.due_date ? new Date(data.due_date) : null,
  };
};

/**
 * 검색, 필터, 정렬이 적용된 할 일 목록 조회
 */
export const getFilteredTodos = async (
  userId: string,
  options: {
    searchQuery?: string;
    priorities?: string[];
    categories?: string[];
    status?: string[];
    sortBy?: TodoSortBy;
    sortOrder?: "asc" | "desc";
  }
): Promise<Todo[]> => {
  const supabase = createClient();

  let query = supabase
    .from("todos")
    .select("*")
    .eq("user_id", userId);

  // 검색: 제목에 키워드 포함
  if (options.searchQuery) {
    query = query.ilike("title", `%${options.searchQuery}%`);
  }

  // 필터: 우선순위
  if (options.priorities && options.priorities.length > 0) {
    query = query.in("priority", options.priorities);
  }

  // 필터: 카테고리 (배열에 포함된 항목)
  if (options.categories && options.categories.length > 0) {
    query = query.overlaps("category", options.categories);
  }

  // 필터: 상태
  if (options.status && options.status.length > 0) {
    const includesCompleted = options.status.includes("completed");
    const includesInProgress = options.status.includes("in-progress");
    const includesOverdue = options.status.includes("overdue");

    if (includesCompleted && !includesInProgress && !includesOverdue) {
      query = query.eq("completed", true);
    } else if (!includesCompleted && includesInProgress && !includesOverdue) {
      query = query.eq("completed", false);
    } else if (!includesCompleted && !includesInProgress && includesOverdue) {
      // 지연된 항목 (마감일이 지났고 미완료)
      query = query
        .eq("completed", false)
        .lt("due_date", new Date().toISOString());
    }
    // 여러 상태가 섞여있으면 필터링하지 않음
  }

  // 정렬
  const sortBy = options.sortBy || "created_date";
  const ascending = options.sortOrder === "asc";
  query = query.order(sortBy, { ascending });

  const { data, error } = await query;

  if (error) {
    throw new Error("할 일 목록을 불러오는데 실패했습니다.");
  }

  return data.map((todo) => ({
    ...todo,
    created_date: new Date(todo.created_date),
    due_date: todo.due_date ? new Date(todo.due_date) : null,
  }));
};
