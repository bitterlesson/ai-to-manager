"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/Header";
import { Toolbar } from "@/components/dashboard/Toolbar";
import { TodoSummary } from "@/components/dashboard/TodoSummary";
import { TodoForm } from "@/components/todo/TodoForm";
import { TodoListWithSections } from "@/components/todo/TodoList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Todo, CreateTodoInput, UpdateTodoInput, TodoSortBy } from "@/types/todo";
import { Plus, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { signOut, getCurrentUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/client";
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodoComplete,
  getFilteredTodos,
} from "@/lib/supabase/todos";
import type { User } from "@supabase/supabase-js";

/**
 * 메인 대시보드 페이지
 * 할 일 관리, 검색, 필터, 정렬 기능 제공
 */
export default function HomePage() {
  const router = useRouter();
  
  // 인증 상태 관리
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTodosLoading, setIsTodosLoading] = useState(false);

  // 상태 관리
  const [todos, setTodos] = useState<Todo[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<TodoSortBy>("created_date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 인증 상태 확인 및 실시간 감지
   */
  useEffect(() => {
    const supabase = createClient();

    // 초기 세션 확인
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
          // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
          router.push("/login");
        } else {
          setUser(currentUser);
        }
      } catch (error) {
        console.error("인증 확인 중 오류:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // 인증 상태 변화 실시간 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          // 로그아웃 시 (명시적 SIGNED_OUT 이벤트만 처리)
          setUser(null);
          window.location.href = "/login";
        } else if (event === "SIGNED_IN" && session) {
          // 로그인 시
          setUser(session.user);
        }
      }
    );

    // 클린업
    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  /**
   * 할 일 목록 불러오기
   */
  const loadTodos = async () => {
    if (!user) return;

    setIsTodosLoading(true);
    try {
      const data = await getFilteredTodos(user.id, {
        searchQuery,
        priorities: selectedPriorities,
        categories: selectedCategories,
        status: selectedStatus,
        sortBy,
        sortOrder,
      });
      
      setTodos(data);

      // 카테고리 목록 추출
      const categories = new Set<string>();
      data.forEach((todo) => {
        todo.category.forEach((cat) => categories.add(cat));
      });
      setAvailableCategories(Array.from(categories).sort());
    } catch (error) {
      console.error("할 일 목록 로드 실패:", error);
      alert("할 일 목록을 불러오는데 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsTodosLoading(false);
    }
  };

  /**
   * 사용자 로그인 후 또는 필터 변경 시 할 일 목록 불러오기
   */
  useEffect(() => {
    if (user) {
      loadTodos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user,
    searchQuery,
    selectedPriorities,
    selectedCategories,
    selectedStatus,
    sortBy,
    sortOrder,
  ]);

  /**
   * 할 일 추가 핸들러
   */
  const handleAddTodo = async (data: CreateTodoInput | UpdateTodoInput) => {
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createTodo(user.id, data as CreateTodoInput);
      setShowAddDialog(false);
      
      // 목록 새로고침
      await loadTodos();
    } catch (error) {
      console.error("할 일 생성 실패:", error);
      alert("할 일을 생성하는데 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 할 일 수정 핸들러
   */
  const handleEditTodo = async (data: CreateTodoInput | UpdateTodoInput) => {
    if (!user || !editingTodo || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await updateTodo(editingTodo.id, user.id, data as UpdateTodoInput);
      setEditingTodo(null);
      
      // 목록 새로고침
      await loadTodos();
    } catch (error) {
      console.error("할 일 수정 실패:", error);
      alert("할 일을 수정하는데 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 할 일 삭제 핸들러
   */
  const handleDeleteTodo = async (id: string) => {
    if (!user) return;

    if (confirm("정말 삭제하시겠습니까?")) {
      try {
        await deleteTodo(id, user.id);
        
        // 목록 새로고침
        await loadTodos();
      } catch (error) {
        console.error("할 일 삭제 실패:", error);
        alert("할 일을 삭제하는데 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  /**
   * 완료 상태 토글 핸들러
   */
  const handleToggleComplete = async (id: string, completed: boolean) => {
    if (!user) return;

    try {
      await toggleTodoComplete(id, user.id, completed);
      
      // 목록 새로고침
      await loadTodos();
    } catch (error) {
      console.error("완료 상태 변경 실패:", error);
      alert("완료 상태를 변경하는데 실패했습니다. 다시 시도해주세요.");
    }
  };

  /**
   * 로그아웃 핸들러
   */
  const handleLogout = async () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      try {
        // Supabase 로그아웃
        await signOut();
        
        // 로그인 페이지로 이동 (강제 새로고침으로 상태 초기화)
        window.location.href = "/login";
      } catch (error) {
        console.error("로그아웃 중 오류 발생:", error);
        alert("로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    }
  };

  // 로딩 중이거나 사용자 정보 없으면 로딩 화면 표시
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 사용자 정보 변환
  const currentUser = {
    name: user.user_metadata?.name || user.email?.split("@")[0] || "사용자",
    email: user.email || "",
    avatar: user.user_metadata?.avatar_url || null,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* 헤더 */}
      <Header user={currentUser} onLogout={handleLogout} />

      {/* 툴바 */}
      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedPriorities={selectedPriorities}
        onPriorityChange={setSelectedPriorities}
        selectedCategories={selectedCategories}
        onCategoryChange={setSelectedCategories}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(newSortBy, newOrder) => {
          setSortBy(newSortBy);
          setSortOrder(newOrder);
        }}
        availableCategories={availableCategories}
      />

      {/* 메인 컨텐츠 */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 할 일 추가 폼 및 AI 기능 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 빠른 추가 버튼 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">새 할 일</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => setShowAddDialog(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  할 일 추가
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setShowAddDialog(true)}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI로 생성
                </Button>
              </CardContent>
            </Card>

            {/* 통계 카드 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">오늘의 통계</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">전체 할 일</span>
                  <span className="text-2xl font-bold">{todos.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">완료</span>
                  <span className="text-2xl font-bold text-success">
                    {todos.filter((t) => t.completed).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">진행 중</span>
                  <span className="text-2xl font-bold text-primary">
                    {todos.filter((t) => !t.completed).length}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">완료율</span>
                    <span className="text-sm font-semibold">
                      {todos.length > 0
                        ? Math.round(
                            (todos.filter((t) => t.completed).length / todos.length) * 100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-success rounded-full h-2 transition-all"
                      style={{
                        width: `${
                          todos.length > 0
                            ? (todos.filter((t) => t.completed).length / todos.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI 요약 및 분석 */}
            <TodoSummary todos={todos} />
          </div>

          {/* 오른쪽: 할 일 목록 */}
          <div className="lg:col-span-2">
            <TodoListWithSections
              todos={todos}
              isLoading={isTodosLoading}
              onToggleComplete={handleToggleComplete}
              onEdit={setEditingTodo}
              onDelete={handleDeleteTodo}
              showCompleted={true}
            />
          </div>
        </div>
      </main>

      {/* 할 일 추가 다이얼로그 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>새 할 일 추가</DialogTitle>
          </DialogHeader>
          <TodoForm
            onSubmit={handleAddTodo}
            onCancel={() => setShowAddDialog(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* 할 일 수정 다이얼로그 */}
      <Dialog open={!!editingTodo} onOpenChange={(open) => !open && setEditingTodo(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>할 일 수정</DialogTitle>
          </DialogHeader>
          {editingTodo && (
            <TodoForm
              todo={editingTodo}
              onSubmit={handleEditTodo}
              onCancel={() => setEditingTodo(null)}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
