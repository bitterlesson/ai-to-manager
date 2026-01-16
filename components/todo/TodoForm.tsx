"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTodoInput, UpdateTodoInput, PRIORITY, Priority, Todo } from "@/types/todo";
import { Calendar as CalendarIcon, X, Loader2, Sparkles } from "lucide-react";
import { format, parse } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/**
 * 할 일 추가/편집 폼 컴포넌트
 */
interface TodoFormProps {
  todo?: Todo | null;
  onSubmit: (data: CreateTodoInput | UpdateTodoInput) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export const TodoForm = ({
  todo,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel,
}: TodoFormProps) => {
  // 편집 모드 여부
  const isEditMode = !!todo;
  
  // 폼 상태
  const [title, setTitle] = useState(todo?.title || "");
  const [description, setDescription] = useState(todo?.description || "");
  const [priority, setPriority] = useState<Priority>(todo?.priority || PRIORITY.MEDIUM);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    todo?.due_date ? new Date(todo.due_date) : undefined
  );
  const [categoryInput, setCategoryInput] = useState("");
  const [categories, setCategories] = useState<string[]>(todo?.category || []);
  const [completed, setCompleted] = useState(todo?.completed || false);

  // AI 파싱 상태
  const [aiInput, setAiInput] = useState("");
  const [isAiParsing, setIsAiParsing] = useState(false);

  /**
   * 카테고리 추가 핸들러
   */
  const handleAddCategory = () => {
    const trimmedCategory = categoryInput.trim();
    if (trimmedCategory && !categories.includes(trimmedCategory)) {
      setCategories([...categories, trimmedCategory]);
      setCategoryInput("");
    }
  };

  /**
   * 카테고리 제거 핸들러
   */
  const handleRemoveCategory = (category: string) => {
    setCategories(categories.filter((cat) => cat !== category));
  };

  /**
   * Enter 키로 카테고리 추가
   * 한글 입력 시 IME composition 처리
   */
  const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // 한글 입력 중(composition)이 아닐 때만 실행
      if (!e.nativeEvent.isComposing) {
        e.preventDefault();
        handleAddCategory();
      }
    }
  };

  /**
   * AI로 자연어 할 일 파싱
   */
  const handleAiParse = async () => {
    const trimmedInput = aiInput.trim();
    if (!trimmedInput) {
      toast.error("할 일을 입력해주세요.");
      return;
    }

    setIsAiParsing(true);
    try {
      const response = await fetch("/api/ai/parse-todo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: trimmedInput }),
      });

      // 에러 응답 처리
      if (!response.ok) {
        let errorMessage = "AI 파싱에 실패했습니다.";
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // JSON 파싱 실패 시 기본 메시지 사용
          console.error("에러 응답 파싱 실패:", e);
        }
        
        toast.error(errorMessage);
        return;
      }

      const result = await response.json();
      const parsed = result.data;

      // 파싱 결과를 폼에 자동으로 채우기
      setTitle(parsed.title);
      setDescription(parsed.description || "");
      setPriority(parsed.priority as Priority);
      setCategories(parsed.category || []);

      // 날짜와 시간 처리
      if (parsed.due_date) {
        try {
          // 날짜 파싱
          const parsedDate = parse(parsed.due_date, "yyyy-MM-dd", new Date());
          
          // 시간이 있으면 날짜에 시간 추가
          if (parsed.due_time) {
            const [hours, minutes] = parsed.due_time.split(":");
            parsedDate.setHours(parseInt(hours), parseInt(minutes));
          }
          
          setDueDate(parsedDate);
        } catch (error) {
          console.error("날짜 파싱 오류:", error);
        }
      }

      // 입력 초기화
      setAiInput("");
      toast.success("AI가 할 일을 분석했습니다! 확인 후 추가하세요.");
    } catch (error: any) {
      console.error("AI 파싱 오류:", error);
      toast.error(error.message || "AI 파싱 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsAiParsing(false);
    }
  };

  /**
   * Enter 키로 AI 파싱 실행
   */
  const handleAiInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (!e.nativeEvent.isComposing) {
        e.preventDefault();
        handleAiParse();
      }
    }
  };

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    // 폼 데이터 구성
    const formData = {
      title: title.trim(),
      description: description.trim(),
      priority,
      due_date: dueDate || null,
      category: categories,
      completed,
    };

    // 부모 컴포넌트에 데이터 전달
    await onSubmit(formData);
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

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{isEditMode ? "할 일 편집" : "새 할 일 추가"}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* AI 자연어 입력 (추가 모드에만 표시) */}
          {!isEditMode && (
            <div className="space-y-2 p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <Label className="text-primary font-semibold">AI로 빠르게 추가하기</Label>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder='예: "내일 오후 3시까지 중요한 팀 회의 준비하기"'
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={handleAiInputKeyDown}
                  disabled={isAiParsing || isSubmitting}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAiParse}
                  disabled={!aiInput.trim() || isAiParsing || isSubmitting}
                  className="gap-2"
                >
                  {isAiParsing && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Sparkles className="h-4 w-4" />
                  분석
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                자연스러운 문장으로 입력하면 AI가 자동으로 분석하여 아래 폼을 채워줍니다.
              </p>
            </div>
          )}

          {/* 제목 입력 */}
          <div className="space-y-2">
            <Label htmlFor="title" className="required">
              제목
            </Label>
            <Input
              id="title"
              placeholder="할 일 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* 설명 입력 */}
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              placeholder="상세 설명을 입력하세요 (선택사항)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          {/* 우선순위 선택 */}
          <div className="space-y-2">
            <Label htmlFor="priority">우선순위</Label>
            <Select
              value={priority}
              onValueChange={(value) => setPriority(value as Priority)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="우선순위 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PRIORITY.HIGH}>
                  <span className="text-destructive font-medium">
                    {getPriorityLabel(PRIORITY.HIGH)}
                  </span>
                </SelectItem>
                <SelectItem value={PRIORITY.MEDIUM}>
                  <span className="text-warning font-medium">
                    {getPriorityLabel(PRIORITY.MEDIUM)}
                  </span>
                </SelectItem>
                <SelectItem value={PRIORITY.LOW}>
                  <span className="text-success font-medium">
                    {getPriorityLabel(PRIORITY.LOW)}
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 마감일 선택 */}
          <div className="space-y-2">
            <Label>마감일</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? (
                    format(dueDate, "yyyy년 M월 d일", { locale: ko })
                  ) : (
                    <span>마감일 선택 (선택사항)</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  locale={ko}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
                {dueDate && (
                  <div className="p-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDueDate(undefined)}
                      className="w-full"
                    >
                      마감일 제거
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* 카테고리 입력 */}
          <div className="space-y-2">
            <Label htmlFor="category">카테고리</Label>
            <div className="flex gap-2">
              <Input
                id="category"
                placeholder="카테고리 입력 후 Enter"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                onKeyDown={handleCategoryKeyDown}
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddCategory}
                disabled={!categoryInput.trim() || isSubmitting}
              >
                추가
              </Button>
            </div>
            
            {/* 카테고리 뱃지 목록 */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map((category) => (
                  <Badge key={category} variant="secondary" className="gap-1">
                    {category}
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(category)}
                      className="ml-1 hover:text-destructive"
                      disabled={isSubmitting}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex gap-2 justify-end">
          {/* 취소 버튼 */}
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              취소
            </Button>
          )}
          
          {/* 제출 버튼 */}
          <Button type="submit" disabled={isSubmitting || !title.trim()}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel || (isEditMode ? "수정" : "추가")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
