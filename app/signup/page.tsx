"use client";

import { SignupForm } from "@/components/auth/SignupForm";
import { Sparkles, CheckCircle2, Brain, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signUp, getCurrentUser } from "@/lib/supabase/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

/**
 * 회원가입 페이지
 * Email/Password 회원가입 및 로그인 링크 제공
 */
export default function SignupPage() {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  /**
   * 이미 로그인된 사용자는 메인 페이지로 리다이렉트
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        
        if (user) {
          // 이미 로그인되어 있으면 메인 페이지로 이동
          router.push("/");
        }
      } catch (error) {
        // 로그인되지 않은 상태 (정상)
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  /**
   * 회원가입 핸들러
   */
  const handleSignup = async (email: string, password: string, name: string) => {
    try {
      const { user } = await signUp(email, password, name);

      if (user) {
        // 회원가입 성공
        setSuccessMessage("회원가입이 완료되었습니다! 이메일을 확인하여 계정을 인증해주세요.");
        
        // 2초 후 로그인 페이지로 이동
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (error: any) {
      // 에러 메시지 한글화
      let errorMessage = "회원가입 중 오류가 발생했습니다.";

      if (error.message?.includes("User already registered")) {
        errorMessage = "이미 가입된 이메일입니다.";
      } else if (error.message?.includes("Password should be at least")) {
        errorMessage = "비밀번호는 최소 6자 이상이어야 합니다.";
      } else if (error.message?.includes("Invalid email")) {
        errorMessage = "올바른 이메일 형식이 아닍니다.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  };

  // 인증 확인 중이면 로딩 화면 표시
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* 왼쪽: 서비스 소개 섹션 */}
      <div className="hidden lg:flex lg:w-1/2 bg-secondary p-12 flex-col justify-between relative overflow-hidden">
        {/* 배경 패턴 */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        
        <div className="relative z-10">
          {/* 로고 및 서비스명 */}
          <Link href="/" className="flex items-center space-x-3 mb-12 group">
            <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition-colors">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">AI Todo Manager</h1>
              <p className="text-sm text-white/80">스마트한 할 일 관리</p>
            </div>
          </Link>

          {/* 서비스 소개 */}
          <div className="space-y-8 max-w-md">
            <div>
              <h2 className="text-4xl font-bold text-white mb-4">
                지금 시작하세요
              </h2>
              <p className="text-lg text-white/90">
                무료로 가입하고 AI와 함께<br />
                생산적인 하루를 시작하세요
              </p>
            </div>

            {/* 주요 기능 */}
            <div className="space-y-4">
              <FeatureItem
                icon={<Brain className="h-5 w-5" />}
                title="AI 자동 분류"
                description="자연어로 입력하면 AI가 자동으로 구조화"
              />
              <FeatureItem
                icon={<CheckCircle2 className="h-5 w-5" />}
                title="스마트한 관리"
                description="우선순위, 카테고리, 마감일 자동 설정"
              />
              <FeatureItem
                icon={<TrendingUp className="h-5 w-5" />}
                title="생산성 분석"
                description="일간/주간 요약과 완료율 분석 제공"
              />
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="relative z-10 text-white/60 text-sm">
          © 2026 AI Todo Manager. All rights reserved.
        </div>
      </div>

      {/* 오른쪽: 회원가입 폼 섹션 */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* 모바일용 로고 */}
          <Link href="/" className="lg:hidden flex items-center justify-center space-x-2 mb-8">
            <div className="h-10 w-10 bg-secondary rounded-lg flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">AI Todo Manager</span>
          </Link>

          {/* 성공 메시지 */}
          {successMessage && (
            <Alert className="mb-4 border-success bg-success/10">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertDescription className="text-success-foreground">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* 회원가입 폼 */}
          <SignupForm onSubmit={handleSignup} />

          {/* 모바일용 푸터 */}
          <div className="lg:hidden mt-8 text-center text-sm text-muted-foreground">
            © 2026 AI Todo Manager
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 기능 소개 아이템 컴포넌트
 */
interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureItem = ({ icon, title, description }: FeatureItemProps) => {
  return (
    <div className="flex items-start space-x-3">
      <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
        <div className="text-white">{icon}</div>
      </div>
      <div>
        <h3 className="text-white font-semibold mb-1">{title}</h3>
        <p className="text-white/80 text-sm">{description}</p>
      </div>
    </div>
  );
};
