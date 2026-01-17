import { Resend } from "resend";

/**
 * Resend 클라이언트
 * 환경 변수 RESEND_API_KEY 필요
 */
export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * 지연된 할 일 알림 이메일 발송
 */
export async function sendOverdueNotification({
  to,
  userName,
  overdueTodos,
}: {
  to: string;
  userName: string;
  overdueTodos: Array<{
    title: string;
    dueDate: string;
    daysOverdue: number;
  }>;
}) {
  const todoList = overdueTodos
    .map(
      (todo) =>
        `<li style="margin-bottom: 8px;">
          <strong>${todo.title}</strong><br/>
          <span style="color: #666; font-size: 14px;">마감일: ${todo.dueDate} (${todo.daysOverdue}일 지연)</span>
        </li>`
    )
    .join("");

  const { data, error } = await resend.emails.send({
    from: "AI 할 일 관리 <onboarding@resend.dev>",
    to: [to],
    subject: `[긴급] ${overdueTodos.length}개의 중요한 할 일이 지연되었습니다`,
    html: `
      <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">⚠️ 지연된 중요 할 일 알림</h2>
        
        <p>안녕하세요, ${userName}님!</p>
        
        <p>다음 <strong>중요도 높음</strong> 할 일이 마감일로부터 24시간 이상 지연되었습니다:</p>
        
        <ul style="padding-left: 20px; line-height: 1.8;">
          ${todoList}
        </ul>
        
        <p style="margin-top: 24px;">
          <a href="https://ai-to-manager.vercel.app" 
             style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            할 일 관리하러 가기
          </a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px;">
          이 알림을 받고 싶지 않으시면 설정에서 이메일 알림을 비활성화하세요.<br/>
          © AI 할 일 관리 서비스
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("이메일 발송 실패:", error);
    throw error;
  }

  return data;
}
