/**
 * AI 기반 할 일 분석 및 요약 API
 * 사용자의 할 일 목록을 분석하여 요약, 인사이트, 추천사항 제공
 */

import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

// 분석 결과 스키마
const TodoAnalysisSchema = z.object({
  summary: z.string().describe("전체 할 일 요약 (총 개수, 완료 개수, 완료율)"),
  urgentTasks: z.array(z.string()).describe("긴급하게 처리해야 할 할 일 목록 (최대 5개)"),
  insights: z.array(z.string()).describe("할 일 분석 인사이트 (시간대별 분포, 마감일 집중도 등, 3-5개)"),
  recommendations: z.array(z.string()).describe("실행 가능한 추천 사항 (구체적이고 실용적인 조언, 3-5개)"),
});

export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { 
          error: "잘못된 요청 형식입니다.",
          code: "INVALID_REQUEST_FORMAT"
        },
        { status: 400 }
      );
    }

    const { todos, period } = body;

    // 입력 검증
    if (!todos || !Array.isArray(todos)) {
      return NextResponse.json(
        { 
          error: "할 일 목록이 필요합니다.",
          code: "MISSING_TODOS"
        },
        { status: 400 }
      );
    }

    if (!period || !["today", "week"].includes(period)) {
      return NextResponse.json(
        { 
          error: "분석 기간이 올바르지 않습니다. (today 또는 week)",
          code: "INVALID_PERIOD"
        },
        { status: 400 }
      );
    }

    // 할 일이 없는 경우
    if (todos.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          summary: "아직 할 일이 없습니다.",
          urgentTasks: [],
          insights: ["할 일을 추가하여 생산성을 관리해보세요!"],
          recommendations: ["새로운 할 일을 추가해보세요."],
        },
      });
    }

    // 환경 변수 확인
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("GOOGLE_GENERATIVE_AI_API_KEY가 설정되지 않았습니다.");
      return NextResponse.json(
        { 
          error: "AI 서비스 설정이 올바르지 않습니다. 관리자에게 문의하세요.",
          code: "SERVICE_UNAVAILABLE"
        },
        { status: 500 }
      );
    }

    // 현재 날짜/시간 정보
    const now = new Date();
    const today = now.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
    const currentTime = now.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // 할 일 데이터 요약
    const totalCount = todos.length;
    const completedCount = todos.filter((t: any) => t.completed).length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // 우선순위별 통계
    const highPriorityTodos = todos.filter((t: any) => t.priority === "high");
    const mediumPriorityTodos = todos.filter((t: any) => t.priority === "medium");
    const lowPriorityTodos = todos.filter((t: any) => t.priority === "low");

    const highPriorityCount = highPriorityTodos.length;
    const mediumPriorityCount = mediumPriorityTodos.length;
    const lowPriorityCount = lowPriorityTodos.length;

    const highPriorityCompleted = highPriorityTodos.filter((t: any) => t.completed).length;
    const mediumPriorityCompleted = mediumPriorityTodos.filter((t: any) => t.completed).length;
    const lowPriorityCompleted = lowPriorityTodos.filter((t: any) => t.completed).length;

    const highCompletionRate = highPriorityCount > 0 ? Math.round((highPriorityCompleted / highPriorityCount) * 100) : 0;
    const mediumCompletionRate = mediumPriorityCount > 0 ? Math.round((mediumPriorityCompleted / mediumPriorityCount) * 100) : 0;
    const lowCompletionRate = lowPriorityCount > 0 ? Math.round((lowPriorityCompleted / lowPriorityCount) * 100) : 0;

    // 마감일 관련 통계
    const todosWithDueDate = todos.filter((t: any) => t.due_date);
    const overdueTodos = todosWithDueDate.filter((t: any) => {
      const dueDate = new Date(t.due_date);
      return !t.completed && dueDate < now;
    });
    const overdueCount = overdueTodos.length;

    // 카테고리별 통계
    const categoryMap = new Map<string, number>();
    todos.forEach((t: any) => {
      if (t.category && Array.isArray(t.category)) {
        t.category.forEach((cat: string) => {
          categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
        });
      }
    });
    const categoryStats = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat, count]) => `${cat}(${count}개)`)
      .join(", ");

    // 요일별 분포 (이번 주인 경우)
    const dayOfWeekStats = period === "week" ? todos.reduce((acc: any, t: any) => {
      if (t.due_date) {
        const day = new Date(t.due_date).toLocaleDateString("ko-KR", { weekday: "long" });
        acc[day] = (acc[day] || 0) + 1;
      }
      return acc;
    }, {}) : {};

    const dayOfWeekText = Object.entries(dayOfWeekStats)
      .sort((a: any, b: any) => b[1] - a[1])
      .map(([day, count]) => `${day}(${count}개)`)
      .join(", ");

    // 할 일 목록을 텍스트로 변환
    const todosText = todos.map((todo: any, index: number) => {
      const status = todo.completed ? "[완료]" : "[미완료]";
      const priority = todo.priority === "high" ? "🔴높음" : 
                      todo.priority === "medium" ? "🟡보통" : "🟢낮음";
      const dueDate = todo.due_date ? new Date(todo.due_date).toLocaleDateString("ko-KR") : "기한 없음";
      const isOverdue = todo.due_date && !todo.completed && new Date(todo.due_date) < now ? "⚠️지연" : "";
      return `${index + 1}. ${status} ${todo.title} - 우선순위: ${priority}, 마감일: ${dueDate} ${isOverdue}`;
    }).join("\n");

    const periodText = period === "today" ? "오늘" : "이번 주";

    // Gemini API로 분석
    const result = await generateObject({
      model: google("gemini-2.0-flash-exp"),
      schema: TodoAnalysisSchema,
      prompt: `당신은 생산성 전문가이자 친근한 AI 어시스턴트입니다.
사용자의 할 일 목록을 깊이 있게 분석하여 실질적인 인사이트와 추천사항을 제공하세요.

**📅 현재 정보:**
- 오늘 날짜: ${today}
- 현재 시간: ${currentTime}
- 분석 기간: ${periodText}

**📊 전체 통계:**
- 전체 할 일: ${totalCount}개
- 완료: ${completedCount}개 (${completionRate}%)
- 미완료: ${totalCount - completedCount}개
- 지연된 할 일: ${overdueCount}개 ⚠️

**🎯 우선순위별 완료율:**
- 높음: ${highPriorityCompleted}/${highPriorityCount}개 (${highCompletionRate}%)
- 보통: ${mediumPriorityCompleted}/${mediumPriorityCount}개 (${mediumCompletionRate}%)
- 낮음: ${lowPriorityCompleted}/${lowPriorityCount}개 (${lowCompletionRate}%)

${categoryStats ? `**📁 주요 카테고리:** ${categoryStats}` : ""}
${dayOfWeekText ? `**📆 요일별 분포:** ${dayOfWeekText}` : ""}

**📝 할 일 목록:**
${todosText}

---

**🔍 상세 분석 요청사항:**

1. **📈 요약 (summary)**:
   - 전체 할 일 개수, 완료 개수, 완료율을 간결하게 요약
   - 예: "총 8개의 할 일 중 5개 완료 (62.5%)"
   - 한 문장으로 작성

2. **🚨 긴급 할 일 (urgentTasks)**:
   - 지연된 할 일(⚠️표시) 우선 추출
   - 마감일이 임박했거나 우선순위가 높은 미완료 할 일
   - 제목만 나열 (최대 5개, 중요도 순)
   - 없으면 빈 배열 반환

3. **💡 인사이트 (insights)** - 4-6개 제공:
   
   **완료율 분석:**
   - 전체 완료율이 높은지 낮은지 평가
   - 우선순위별 완료 패턴 분석 (예: "높은 우선순위 작업의 완료율이 낮네요")
   - ${completionRate}%가 좋은 수준인지 개선이 필요한지 판단
   
   **시간 관리 분석:**
   - 마감일 준수율 평가 (지연된 할 일 ${overdueCount}개 기준)
   - ${period === "week" ? "요일별 업무 분포의 균형" : "당일 시간대별 집중도"}
   - 과부하 또는 여유 시간대 식별
   
   **생산성 패턴:**
   - ${period === "week" ? "가장 생산적인 요일 추론" : "남은 시간과 미완료 작업량 평가"}
   - 완료하기 쉬운 작업의 공통 특징 (우선순위, 카테고리 기준)
   - 자주 미루는 작업 유형 식별
   
   **긍정적인 피드백:**
   - 사용자가 잘하고 있는 부분 구체적으로 강조
   - 개선된 부분이 있다면 언급 (예: "완료율이 높아졌어요!")
   - 격려와 동기부여 메시지
   
   **각 인사이트는:**
   - 한 문장으로 간결하게 작성
   - 데이터를 근거로 구체적으로 설명
   - 친근하고 격려하는 톤 유지

4. **✨ 추천사항 (recommendations)** - 4-6개 제공:
   
   **실행 가능한 추천:**
   - 구체적인 시간 관리 팁 (예: "오전에 집중해서 2개의 높은 우선순위 작업부터 처리하세요")
   - 우선순위 조정 제안 (긴급한 작업부터 처리)
   - 일정 재배치 제안 (과부하 시간대 분산)
   
   **기간별 차별화:**
   ${period === "today" 
     ? "- 오늘 남은 시간 활용법\n   - 당일 집중해야 할 작업 우선순위\n   - 내일로 미뤄도 되는 작업 식별" 
     : "- 주간 패턴 기반 다음 주 계획 제안\n   - 주말 활용 전략\n   - 평일 업무 분산 방법"}
   
   **업무 과부하 대응:**
   - 작업량이 많다면 분산 전략 제시
   - 덜 중요한 작업 연기 제안
   - 휴식 시간 확보 권장
   
   **각 추천은:**
   - 바로 실천할 수 있는 구체적인 행동
   - "~하세요", "~해보세요" 등 행동 지향적 문구
   - 시간대, 작업명 등 구체적인 정보 포함

**📌 중요 원칙:**
- 한국어로 자연스럽게 작성
- 친근하고 격려하는 톤 유지
- 긍정적인 부분 먼저 언급, 개선점은 부드럽게 제시
- 데이터를 기반으로 정확하고 구체적인 분석
- 사용자가 바로 이해하고 실천할 수 있는 내용
- 동기부여와 성취감을 주는 메시지 포함`,
    });

    // 분석 결과 반환
    return NextResponse.json({
      success: true,
      data: result.object,
    });
  } catch (error: any) {
    console.error("AI 할 일 분석 오류:", error);

    // 에러 메시지 및 상태 코드 구체화
    let errorMessage = "할 일 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    let errorCode = "AI_ANALYSIS_ERROR";
    let statusCode = 500;
    
    if (error.message?.includes("API key") || error.message?.includes("api key")) {
      errorMessage = "AI API 키가 올바르지 않습니다. 관리자에게 문의하세요.";
      errorCode = "INVALID_API_KEY";
      statusCode = 500;
    } else if (error.message?.includes("quota") || error.message?.includes("rate limit") || error.message?.includes("429")) {
      errorMessage = "AI API 사용량 한도에 도달했습니다. 잠시 후 다시 시도해주세요.";
      errorCode = "QUOTA_EXCEEDED";
      statusCode = 429;
    } else if (error.message?.includes("network") || error.message?.includes("ECONNREFUSED") || error.message?.includes("timeout")) {
      errorMessage = "네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인하고 다시 시도해주세요.";
      errorCode = "NETWORK_ERROR";
      statusCode = 503;
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        code: errorCode,
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: statusCode }
    );
  }
}
