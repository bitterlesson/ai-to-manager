import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendOverdueNotification } from "@/lib/email/resend";
import { format, differenceInDays } from "date-fns";
import { ko } from "date-fns/locale";

/**
 * Vercel Cron Job을 위한 비밀 키 검증
 */
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Supabase 서버 클라이언트 (service_role 키 사용)
 */
function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * 지연된 할 일 체크 및 이메일 발송 (Cron Job)
 * 매일 오전 9시에 실행
 */
export async function GET(request: NextRequest) {
  try {
    // Cron 인증 확인 (Vercel Cron에서 호출 시)
    const authHeader = request.headers.get("authorization");
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerClient();
    const now = new Date();
    
    // 24시간 전 시간 계산 (마감일로부터 24시간 이상 지연된 것만)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 1. 모든 사용자의 지연된 중요(high priority) 할 일 조회
    const { data: overdueTodos, error: todosError } = await supabase
      .from("todos")
      .select("id, title, due_date, user_id, priority")
      .eq("priority", "high")
      .eq("completed", false)
      .lt("due_date", oneDayAgo.toISOString())
      .order("user_id");

    if (todosError) {
      console.error("할 일 조회 실패:", todosError);
      return NextResponse.json({ error: "Failed to fetch todos" }, { status: 500 });
    }

    if (!overdueTodos || overdueTodos.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "지연된 중요 할 일이 없습니다.",
        sentCount: 0 
      });
    }

    // 2. 사용자별로 그룹화
    const userTodosMap = new Map<string, typeof overdueTodos>();
    
    for (const todo of overdueTodos) {
      const existing = userTodosMap.get(todo.user_id) || [];
      existing.push(todo);
      userTodosMap.set(todo.user_id, existing);
    }

    // 3. 각 사용자에게 이메일 발송
    let sentCount = 0;
    const errors: string[] = [];

    for (const [userId, todos] of userTodosMap) {
      try {
        // 사용자 정보 조회
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

        if (userError || !userData?.user) {
          console.error(`사용자 조회 실패 (${userId}):`, userError);
          continue;
        }

        const user = userData.user;
        
        // 알림 설정 확인
        const emailNotificationEnabled = user.user_metadata?.emailNotificationEnabled ?? true;
        
        if (!emailNotificationEnabled) {
          console.log(`사용자 ${userId}의 이메일 알림이 비활성화됨`);
          continue;
        }

        if (!user.email) {
          console.log(`사용자 ${userId}의 이메일이 없음`);
          continue;
        }

        // 이메일 발송
        const overdueTodosForEmail = todos.map((todo) => ({
          title: todo.title,
          dueDate: format(new Date(todo.due_date), "yyyy년 M월 d일", { locale: ko }),
          daysOverdue: differenceInDays(now, new Date(todo.due_date)),
        }));

        await sendOverdueNotification({
          to: user.email,
          userName: user.user_metadata?.name || user.email.split("@")[0],
          overdueTodos: overdueTodosForEmail,
        });

        sentCount++;
        console.log(`이메일 발송 완료: ${user.email}`);
      } catch (error: any) {
        console.error(`사용자 ${userId} 이메일 발송 실패:`, error);
        errors.push(`${userId}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${sentCount}명에게 알림 이메일 발송 완료`,
      sentCount,
      totalOverdueTodos: overdueTodos.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Cron 작업 실패:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
