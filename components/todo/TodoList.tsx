"use client";

import { Todo } from "@/types/todo";
import { TodoCard } from "./TodoCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Empty, EmptyMedia, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { ListTodo } from "lucide-react";

/**
 * 할 일 목록을 표시하는 컴포넌트
 */
interface TodoListProps {
  todos: Todo[];
  onToggleComplete?: (id: string, completed: boolean) => void;
  onEdit?: (todo: Todo) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
}

export const TodoList = ({
  todos,
  onToggleComplete,
  onEdit,
  onDelete,
  isLoading = false,
  emptyMessage = "할 일이 없습니다",
  emptyDescription = "새로운 할 일을 추가해보세요",
}: TodoListProps) => {
  /**
   * 로딩 상태 렌더링
   */
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-start space-x-3">
              <Skeleton className="h-5 w-5 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  /**
   * 빈 상태 렌더링
   */
  if (todos.length === 0) {
    return (
      <Empty className="py-12">
        <EmptyMedia variant="icon">
          <ListTodo />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>{emptyMessage}</EmptyTitle>
          <EmptyDescription>{emptyDescription}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  /**
   * 할 일 목록 렌더링
   */
  return (
    <ScrollArea className="h-full">
      <div className="space-y-4">
        {todos.map((todo) => (
          <TodoCard
            key={todo.id}
            todo={todo}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

/**
 * 완료된 할 일과 미완료 할 일을 분리하여 표시하는 컴포넌트
 */
interface TodoListWithSectionsProps extends TodoListProps {
  showCompleted?: boolean;
}

export const TodoListWithSections = ({
  todos,
  onToggleComplete,
  onEdit,
  onDelete,
  isLoading = false,
  showCompleted = true,
}: TodoListWithSectionsProps) => {
  // 미완료 할 일과 완료된 할 일 분리
  const incompleteTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);

  /**
   * 로딩 상태 렌더링
   */
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-start space-x-3">
              <Skeleton className="h-5 w-5 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  /**
   * 빈 상태 렌더링
   */
  if (todos.length === 0) {
    return (
      <Empty className="py-12">
        <EmptyMedia variant="icon">
          <ListTodo />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>할 일이 없습니다</EmptyTitle>
          <EmptyDescription>새로운 할 일을 추가해보세요</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-8">
        {/* 진행 중인 할 일 섹션 */}
        {incompleteTodos.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                진행 중 ({incompleteTodos.length})
              </h2>
            </div>
            <div className="space-y-4">
              {incompleteTodos.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  onToggleComplete={onToggleComplete}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        )}

        {/* 완료된 할 일 섹션 */}
        {showCompleted && completedTodos.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-muted-foreground">
                완료됨 ({completedTodos.length})
              </h2>
            </div>
            <div className="space-y-4">
              {completedTodos.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  onToggleComplete={onToggleComplete}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
