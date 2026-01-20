"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  Target,
  TrendingUp,
  Calendar,
  Clock,
  RefreshCw,
  AlertTriangle,
  Trophy,
  Flame
} from "lucide-react";
import { Todo } from "@/types/todo";
import { toast } from "sonner";
import { 
  startOfWeek, 
  endOfWeek, 
  isWithinInterval, 
  startOfDay, 
  endOfDay,
  format,
  eachDayOfInterval,
  isSameDay
} from "date-fns";
import { ko } from "date-fns/locale";

/**
 * AI 요약 데이터 타입
 */
interface AnalysisResult {
  summary: string;
  urgentTasks: string[];
  insights: string[];
  recommendations: string[];
}

/**
 * AI 할 일 요약 및 분석 컴포넌트
 */
interface TodoSummaryProps {
  todos: Todo[];
}

export const TodoSummary = ({ todos }: TodoSummaryProps) => {
  const [activeTab, setActiveTab] = useState<"today" | "week">("today");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [hasError, setHasError] = useState(false);

  /**
   * 오늘 할 일 필터링
   */
  const todayTodos = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    return todos.filter((todo) => {
      if (!todo.due_date) return false;
      const dueDate = new Date(todo.due_date);
      return isWithinInterval(dueDate, { start: todayStart, end: todayEnd });
    });
  }, [todos]);

  /**
   * 이번 주 할 일 필터링
   */
  const weekTodos = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    return todos.filter((todo) => {
      if (!todo.due_date) return false;
      const dueDate = new Date(todo.due_date);
      return isWithinInterval(dueDate, { start: weekStart, end: weekEnd });
    });
  }, [todos]);

  /**
   * 요일별 할 일 분포 계산
   */
  const weeklyDistribution = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return days.map((day) => {
      const dayTodos = weekTodos.filter((todo) => {
        if (!todo.due_date) return false;
        return isSameDay(new Date(todo.due_date), day);
      });
      const completed = dayTodos.filter((t) => t.completed).length;
      const total = dayTodos.length;

      return {
        day: format(day, "EEE", { locale: ko }),
        date: format(day, "M/d"),
        total,
        completed,
        isToday: isSameDay(day, now),
      };
    });
  }, [weekTodos]);

  /**
   * 통계 계산
   */
  const getStats = (targetTodos: Todo[]) => {
    const total = targetTodos.length;
    const completed = targetTodos.filter((t) => t.completed).length;
    const remaining = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const highPriority = targetTodos.filter((t) => t.priority === "high" && !t.completed);
    const overdue = targetTodos.filter((t) => {
      if (!t.due_date || t.completed) return false;
      return new Date(t.due_date) < new Date();
    });

    return { total, completed, remaining, completionRate, highPriority, overdue };
  };

  const todayStats = getStats(todayTodos);
  const weekStats = getStats(weekTodos);

  /**
   * AI 분석 실행
   */
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setHasError(false);

    try {
      const targetTodos = activeTab === "today" ? todayTodos : weekTodos;

      const response = await fetch("/api/ai/analyze-todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          todos: targetTodos,
          period: activeTab,
        }),
      });

      if (!response.ok) {
        let errorMessage = "AI 분석에 실패했습니다.";
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error("에러 응답 파싱 실패:", e);
        }
        
        toast.error(errorMessage);
        setHasError(true);
        return;
      }

      const result = await response.json();
      setAnalysisResult(result.data);
      toast.success("AI 분석이 완료되었습니다!");
    } catch (error: any) {
      console.error("AI 분석 오류:", error);
      toast.error(error.message || "AI 분석 중 오류가 발생했습니다.");
      setHasError(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * 탭 변경 시 결과 초기화
   */
  const handleTabChange = (value: string) => {
    setActiveTab(value as "today" | "week");
    setAnalysisResult(null);
    setHasError(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          AI 요약 및 분석
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="today" className="text-xs sm:text-sm">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              오늘 ({todayTodos.length})
            </TabsTrigger>
            <TabsTrigger value="week" className="text-xs sm:text-sm">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              이번 주 ({weekTodos.length})
            </TabsTrigger>
          </TabsList>

          {/* 오늘의 요약 */}
          <TabsContent value="today" className="space-y-4 mt-0">
            {/* 오늘 통계 미리보기 */}
            <TodayPreview stats={todayStats} todos={todayTodos} />

            {/* AI 분석 버튼 */}
            <AnalyzeButton
              onClick={handleAnalyze}
              isAnalyzing={isAnalyzing}
              disabled={todayTodos.length === 0}
              hasError={hasError}
            />

            {/* 빈 상태 */}
            {todayTodos.length === 0 && !analysisResult && (
              <EmptyState message="오늘 마감인 할 일이 없습니다." />
            )}

            {/* 분석 결과 */}
            {analysisResult && (
              <TodayAnalysisDisplay 
                result={analysisResult} 
                stats={todayStats}
                todos={todayTodos}
              />
            )}
          </TabsContent>

          {/* 이번 주 요약 */}
          <TabsContent value="week" className="space-y-4 mt-0">
            {/* 주간 통계 미리보기 */}
            <WeekPreview 
              stats={weekStats} 
              distribution={weeklyDistribution} 
            />

            {/* AI 분석 버튼 */}
            <AnalyzeButton
              onClick={handleAnalyze}
              isAnalyzing={isAnalyzing}
              disabled={weekTodos.length === 0}
              hasError={hasError}
            />

            {/* 빈 상태 */}
            {weekTodos.length === 0 && !analysisResult && (
              <EmptyState message="이번 주 마감인 할 일이 없습니다." />
            )}

            {/* 분석 결과 */}
            {analysisResult && (
              <WeekAnalysisDisplay 
                result={analysisResult} 
                stats={weekStats}
                distribution={weeklyDistribution}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

/**
 * 오늘 통계 미리보기
 */
const TodayPreview = ({ 
  stats, 
  todos 
}: { 
  stats: ReturnType<typeof getStats>;
  todos: Todo[];
}) => {
  if (todos.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* 완료율 */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold text-primary">{stats.completionRate}%</span>
            <span className="text-sm text-muted-foreground">완료율</span>
          </div>
          <Progress value={stats.completionRate} className="h-2" />
        </div>
        <div className="text-right text-sm">
          <div className="text-muted-foreground">{stats.completed}/{stats.total}</div>
          <div className="text-xs text-muted-foreground">완료</div>
        </div>
      </div>

      {/* 요약 뱃지 */}
      <div className="flex flex-wrap gap-2">
        {stats.remaining > 0 && (
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            남은 할 일 {stats.remaining}개
          </Badge>
        )}
        {stats.highPriority.length > 0 && (
          <Badge variant="destructive" className="text-xs">
            <Flame className="h-3 w-3 mr-1" />
            긴급 {stats.highPriority.length}개
          </Badge>
        )}
        {stats.overdue.length > 0 && (
          <Badge variant="destructive" className="text-xs bg-orange-500">
            <AlertTriangle className="h-3 w-3 mr-1" />
            지연 {stats.overdue.length}개
          </Badge>
        )}
        {stats.completionRate === 100 && (
          <Badge className="text-xs bg-green-500">
            <Trophy className="h-3 w-3 mr-1" />
            완료!
          </Badge>
        )}
      </div>
    </div>
  );
};

// getStats 함수를 컴포넌트 외부로 이동
const getStats = (targetTodos: Todo[]) => {
  const total = targetTodos.length;
  const completed = targetTodos.filter((t) => t.completed).length;
  const remaining = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  const highPriority = targetTodos.filter((t) => t.priority === "high" && !t.completed);
  const overdue = targetTodos.filter((t) => {
    if (!t.due_date || t.completed) return false;
    return new Date(t.due_date) < new Date();
  });

  return { total, completed, remaining, completionRate, highPriority, overdue };
};

/**
 * 주간 통계 미리보기
 */
const WeekPreview = ({ 
  stats,
  distribution 
}: { 
  stats: ReturnType<typeof getStats>;
  distribution: Array<{
    day: string;
    date: string;
    total: number;
    completed: number;
    isToday: boolean;
  }>;
}) => {
  if (stats.total === 0) return null;

  const maxTotal = Math.max(...distribution.map((d) => d.total), 1);

  return (
    <div className="space-y-3">
      {/* 주간 완료율 */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold text-primary">{stats.completionRate}%</span>
            <span className="text-sm text-muted-foreground">주간 완료율</span>
          </div>
          <Progress value={stats.completionRate} className="h-2" />
        </div>
        <div className="text-right text-sm">
          <div className="text-muted-foreground">{stats.completed}/{stats.total}</div>
          <div className="text-xs text-muted-foreground">완료</div>
        </div>
      </div>

      {/* 요일별 분포 차트 */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground font-medium">요일별 분포</div>
        <div className="grid grid-cols-7 gap-1">
          {distribution.map((day, index) => {
            const maxBarHeight = 40; // 최대 bar 높이 (px)
            const barHeight = day.total > 0 ? Math.max((day.total / maxTotal) * maxBarHeight, 6) : 0;
            const completedRatio = day.total > 0 ? (day.completed / day.total) * 100 : 0;
            
            return (
              <div 
                key={index} 
                className={`text-center ${day.isToday ? "bg-primary/10 rounded-lg" : ""}`}
              >
                <div className={`text-[10px] font-medium ${day.isToday ? "text-primary" : "text-muted-foreground"}`}>
                  {day.day}
                </div>
                <div className="h-12 flex items-end justify-center p-1">
                  {day.total > 0 ? (
                    <div 
                      className="w-4/5 bg-muted rounded-sm overflow-hidden transition-all"
                      style={{ height: `${barHeight}px` }}
                    >
                      {/* 완료된 부분 (아래에서부터 채워짐) */}
                      <div 
                        className="w-full bg-green-500 transition-all"
                        style={{ 
                          height: `${completedRatio}%`,
                          marginTop: `${100 - completedRatio}%`
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-4/5 h-1 bg-muted/50 rounded-sm" />
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground">{day.total}</div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-muted rounded-sm" />
            <span>전체</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-sm" />
            <span>완료</span>
          </div>
        </div>
      </div>

      {/* 요약 뱃지 */}
      <div className="flex flex-wrap gap-2">
        {stats.remaining > 0 && (
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            남은 할 일 {stats.remaining}개
          </Badge>
        )}
        {stats.highPriority.length > 0 && (
          <Badge variant="destructive" className="text-xs">
            <Flame className="h-3 w-3 mr-1" />
            긴급 {stats.highPriority.length}개
          </Badge>
        )}
      </div>
    </div>
  );
};

/**
 * AI 분석 버튼
 */
const AnalyzeButton = ({ 
  onClick, 
  isAnalyzing, 
  disabled,
  hasError
}: { 
  onClick: () => void;
  isAnalyzing: boolean;
  disabled: boolean;
  hasError: boolean;
}) => (
  <Button
    onClick={onClick}
    disabled={isAnalyzing || disabled}
    className="w-full"
    variant={hasError ? "outline" : "default"}
  >
    {isAnalyzing ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        AI 분석 중...
      </>
    ) : hasError ? (
      <>
        <RefreshCw className="mr-2 h-4 w-4" />
        다시 시도
      </>
    ) : (
      <>
        <Sparkles className="mr-2 h-4 w-4" />
        AI 요약 보기
      </>
    )}
  </Button>
);

/**
 * 빈 상태
 */
const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-6 text-muted-foreground">
    <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
    <p className="text-sm">{message}</p>
  </div>
);

/**
 * 오늘 분석 결과 표시
 */
const TodayAnalysisDisplay = ({ 
  result, 
  stats,
  todos
}: { 
  result: AnalysisResult;
  stats: ReturnType<typeof getStats>;
  todos: Todo[];
}) => {
  // 남은 할 일 (미완료)
  const remainingTodos = todos.filter((t) => !t.completed);
  // 우선순위순 정렬
  const sortedRemaining = [...remainingTodos].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-4">
      <Separator />

      {/* 요약 카드 */}
      <SummaryCard summary={result.summary} />

      {/* 오늘 집중해야 할 작업 */}
      {sortedRemaining.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">🎯 오늘 집중해야 할 작업</h4>
          </div>
          <div className="space-y-2">
            {sortedRemaining.slice(0, 3).map((todo, index) => (
              <div 
                key={todo.id}
                className={`p-3 rounded-lg border ${
                  todo.priority === "high" 
                    ? "border-destructive/30 bg-destructive/5" 
                    : "border-border bg-muted/30"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{index === 0 ? "1️⃣" : index === 1 ? "2️⃣" : "3️⃣"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{todo.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={todo.priority === "high" ? "destructive" : "outline"} 
                        className="text-[10px] h-5"
                      >
                        {todo.priority === "high" ? "긴급" : todo.priority === "medium" ? "보통" : "낮음"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 긴급 할 일 */}
      {result.urgentTasks.length > 0 && (
        <UrgentTasksCard tasks={result.urgentTasks} />
      )}

      {/* 인사이트 */}
      {result.insights.length > 0 && (
        <InsightsCard insights={result.insights} />
      )}

      {/* 추천사항 */}
      {result.recommendations.length > 0 && (
        <RecommendationsCard recommendations={result.recommendations} />
      )}
    </div>
  );
};

/**
 * 주간 분석 결과 표시
 */
const WeekAnalysisDisplay = ({ 
  result, 
  stats,
  distribution
}: { 
  result: AnalysisResult;
  stats: ReturnType<typeof getStats>;
  distribution: Array<{
    day: string;
    date: string;
    total: number;
    completed: number;
    isToday: boolean;
  }>;
}) => {
  // 가장 바쁜 요일 찾기
  const busiestDay = [...distribution].sort((a, b) => b.total - a.total)[0];
  // 완료율이 가장 높은 요일
  const mostProductiveDay = [...distribution]
    .filter((d) => d.total > 0)
    .sort((a, b) => (b.completed / b.total) - (a.completed / a.total))[0];

  return (
    <div className="space-y-4">
      <Separator />

      {/* 요약 카드 */}
      <SummaryCard summary={result.summary} />

      {/* 주간 패턴 인사이트 */}
      <div className="grid grid-cols-2 gap-2">
        {busiestDay && busiestDay.total > 0 && (
          <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <div className="text-[10px] text-orange-600 dark:text-orange-400 font-medium">
              📊 가장 바쁜 요일
            </div>
            <div className="text-sm font-semibold mt-1">
              {busiestDay.day} ({busiestDay.total}개)
            </div>
          </div>
        )}
        {mostProductiveDay && mostProductiveDay.total > 0 && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="text-[10px] text-green-600 dark:text-green-400 font-medium">
              ⭐ 가장 생산적인 요일
            </div>
            <div className="text-sm font-semibold mt-1">
              {mostProductiveDay.day} ({Math.round((mostProductiveDay.completed / mostProductiveDay.total) * 100)}%)
            </div>
          </div>
        )}
      </div>

      {/* 긴급 할 일 */}
      {result.urgentTasks.length > 0 && (
        <UrgentTasksCard tasks={result.urgentTasks} />
      )}

      {/* 인사이트 */}
      {result.insights.length > 0 && (
        <InsightsCard insights={result.insights} />
      )}

      {/* 추천사항 (다음 주 계획 포함) */}
      {result.recommendations.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <h4 className="text-sm font-semibold">💡 추천 및 다음 주 계획</h4>
          </div>
          <div className="space-y-2">
            {result.recommendations.map((recommendation, index) => (
              <div 
                key={index} 
                className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20"
              >
                <div className="flex items-start gap-2">
                  <span className="text-sm">✨</span>
                  <p className="text-sm text-muted-foreground">{recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 요약 카드
 */
const SummaryCard = ({ summary }: { summary: string }) => (
  <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-full bg-primary/20">
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <div>
        <div className="text-xs text-primary font-medium mb-1">AI 요약</div>
        <p className="text-sm font-medium text-foreground">{summary}</p>
      </div>
    </div>
  </div>
);

/**
 * 긴급 할 일 카드
 */
const UrgentTasksCard = ({ tasks }: { tasks: string[] }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <AlertCircle className="h-4 w-4 text-destructive" />
      <h4 className="text-sm font-semibold">🚨 긴급 할 일</h4>
    </div>
    <div className="space-y-1.5">
      {tasks.map((task, index) => (
        <div 
          key={index}
          className="flex items-center gap-2 p-2 rounded-lg bg-destructive/5 border border-destructive/20"
        >
          <Flame className="h-3 w-3 text-destructive flex-shrink-0" />
          <span className="text-sm text-foreground">{task}</span>
        </div>
      ))}
    </div>
  </div>
);

/**
 * 인사이트 카드
 */
const InsightsCard = ({ insights }: { insights: string[] }) => {
  // 인사이트 유형에 따른 이모지 결정
  const getInsightEmoji = (insight: string): string => {
    if (insight.includes("완료율") || insight.includes("완료")) return "📊";
    if (insight.includes("긴급") || insight.includes("지연") || insight.includes("주의")) return "⚠️";
    if (insight.includes("잘") || insight.includes("좋") || insight.includes("훌륭") || insight.includes("👏") || insight.includes("💪")) return "🎉";
    if (insight.includes("집중") || insight.includes("패턴")) return "🎯";
    if (insight.includes("시간") || insight.includes("오전") || insight.includes("오후")) return "⏰";
    return "💡";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold">💡 인사이트</h4>
      </div>
      <div className="space-y-1.5">
        {insights.map((insight, index) => (
          <div 
            key={index}
            className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10"
          >
            <span className="text-sm flex-shrink-0">{getInsightEmoji(insight)}</span>
            <p className="text-sm text-muted-foreground">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 추천사항 카드
 */
const RecommendationsCard = ({ recommendations }: { recommendations: string[] }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Lightbulb className="h-4 w-4 text-amber-500" />
      <h4 className="text-sm font-semibold">✨ 추천사항</h4>
    </div>
    <div className="space-y-1.5">
      {recommendations.map((recommendation, index) => (
        <div 
          key={index}
          className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20"
        >
          <span className="text-sm flex-shrink-0">{index === 0 ? "1️⃣" : index === 1 ? "2️⃣" : index === 2 ? "3️⃣" : "▶️"}</span>
          <p className="text-sm text-muted-foreground">{recommendation}</p>
        </div>
      ))}
    </div>
  </div>
);
