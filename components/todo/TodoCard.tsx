"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Todo, PRIORITY } from "@/types/todo";
import { Calendar, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";

/**
 * 개별 할 일을 표시하는 카드 컴포넌트
 */
interface TodoCardProps {
  todo: Todo;
  onToggleComplete?: (id: string, completed: boolean) => void;
  onEdit?: (todo: Todo) => void;
  onDelete?: (id: string) => void;
}

export const TodoCard = ({
  todo,
  onToggleComplete,
  onEdit,
  onDelete,
}: TodoCardProps) => {
  /**
   * 우선순위에 따른 뱃지 스타일 반환
   */
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case PRIORITY.HIGH:
        return "bg-destructive text-destructive-foreground";
      case PRIORITY.MEDIUM:
        return "bg-warning text-warning-foreground";
      case PRIORITY.LOW:
        return "bg-success text-success-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  /**
   * 우선순위 한글 라벨 반환
   */
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case PRIORITY.HIGH:
        return "높음";
      case PRIORITY.MEDIUM:
        return "보통";
      case PRIORITY.LOW:
        return "낮음";
      default:
        return priority;
    }
  };

  /**
   * 마감일이 지났는지 확인
   */
  const isOverdue = todo.due_date && new Date(todo.due_date) < new Date() && !todo.completed;

  /**
   * 완료 상태 토글 핸들러
   */
  const handleToggleComplete = () => {
    onToggleComplete?.(todo.id, !todo.completed);
  };

  /**
   * 편집 버튼 클릭 핸들러
   */
  const handleEdit = () => {
    onEdit?.(todo);
  };

  /**
   * 삭제 버튼 클릭 핸들러
   */
  const handleDelete = () => {
    onDelete?.(todo.id);
  };

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md",
        todo.completed && "opacity-60",
        isOverdue && "border-destructive"
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-start space-x-3 flex-1">
          {/* 완료 체크박스 */}
          <Checkbox
            checked={todo.completed}
            onCheckedChange={handleToggleComplete}
            className="mt-1"
          />
          
          <div className="flex-1 space-y-1">
            {/* 제목 */}
            <h3
              className={cn(
                "font-semibold text-lg leading-none",
                todo.completed && "line-through text-muted-foreground"
              )}
            >
              {todo.title}
            </h3>
            
            {/* 설명 */}
            {todo.description && (
              <p
                className={cn(
                  "text-sm text-muted-foreground line-clamp-2",
                  todo.completed && "line-through"
                )}
              >
                {todo.description}
              </p>
            )}
          </div>
        </div>

        {/* 더보기 메뉴 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>편집</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>삭제</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* 우선순위 뱃지 */}
          <Badge className={getPriorityColor(todo.priority)}>
            {getPriorityLabel(todo.priority)}
          </Badge>

          {/* 마감일 */}
          {todo.due_date && (
            <div
              className={cn(
                "flex items-center text-sm text-muted-foreground",
                isOverdue && "text-destructive font-medium"
              )}
            >
              <Calendar className="mr-1 h-3 w-3" />
              <span>
                {format(new Date(todo.due_date), "yyyy년 M월 d일", { locale: ko })}
              </span>
            </div>
          )}

          {/* 카테고리 뱃지들 */}
          {todo.category.map((cat) => (
            <Badge key={cat} variant="outline" className="text-xs">
              {cat}
            </Badge>
          ))}

          {/* 지연 표시 */}
          {isOverdue && (
            <Badge variant="outline" className="text-destructive border-destructive">
              지연
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
