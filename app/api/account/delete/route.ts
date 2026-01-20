import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * 계정 삭제 API
 * service_role 키를 사용하여 Supabase Auth에서 사용자 완전 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    // 1. 현재 로그인된 사용자 확인 (서버 클라이언트로)
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    const userId = user.id;

    // 2. service_role 키로 Supabase Admin 클라이언트 생성
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 3. 사용자의 모든 todos 삭제
    const { error: todosError } = await supabaseAdmin
      .from("todos")
      .delete()
      .eq("user_id", userId);

    if (todosError) {
      console.error("할 일 삭제 실패:", todosError);
      // 계속 진행 (todos가 없을 수도 있음)
    }

    // 4. Supabase Auth에서 사용자 완전 삭제
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("사용자 삭제 실패:", deleteError);
      return NextResponse.json(
        { error: "계정 삭제에 실패했습니다. 다시 시도해주세요." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "계정이 완전히 삭제되었습니다.",
    });
  } catch (error: any) {
    console.error("계정 삭제 API 오류:", error);
    return NextResponse.json(
      { error: error.message || "계정 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
