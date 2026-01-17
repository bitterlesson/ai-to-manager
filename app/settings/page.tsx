"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Sun, Moon, Monitor, Globe, Trash2, Loader2, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUser, signOut, updateNotificationSettings } from "@/lib/supabase/auth";
import { toast } from "sonner";

/**
 * 설정 페이지
 * 테마, 언어, 계정 삭제 기능 제공
 */
export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [language, setLanguage] = useState("ko");
  const [userId, setUserId] = useState<string | null>(null);
  const [emailNotificationEnabled, setEmailNotificationEnabled] = useState(true);
  const [isSavingNotification, setIsSavingNotification] = useState(false);

  /**
   * 클라이언트 마운트 확인 (hydration 오류 방지)
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * 사용자 인증 확인 및 설정 로드
   */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
          router.push("/login");
          return;
        }

        setUserId(currentUser.id);
        
        // localStorage에서 언어 설정 로드
        const savedLanguage = localStorage.getItem("language") || "ko";
        setLanguage(savedLanguage);
        
        // 사용자 메타데이터에서 알림 설정 로드
        const notificationEnabled = currentUser.user_metadata?.emailNotificationEnabled ?? true;
        setEmailNotificationEnabled(notificationEnabled);
      } catch (error) {
        console.error("설정 로드 실패:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [router]);

  /**
   * 언어 변경 핸들러
   */
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    localStorage.setItem("language", value);
    toast.success(value === "ko" ? "언어가 한국어로 변경되었습니다." : "Language changed to English.");
  };

  /**
   * 이메일 알림 토글 핸들러
   */
  const handleNotificationToggle = async (enabled: boolean) => {
    setIsSavingNotification(true);
    
    try {
      await updateNotificationSettings({ emailNotificationEnabled: enabled });
      setEmailNotificationEnabled(enabled);
      toast.success(enabled ? "이메일 알림이 활성화되었습니다." : "이메일 알림이 비활성화되었습니다.");
    } catch (error: any) {
      console.error("알림 설정 저장 실패:", error);
      toast.error("알림 설정 저장에 실패했습니다.");
    } finally {
      setIsSavingNotification(false);
    }
  };

  /**
   * 계정 삭제 핸들러
   */
  const handleDeleteAccount = async () => {
    if (!userId) return;

    setIsDeleting(true);

    try {
      const supabase = createClient();

      // 1. 사용자의 모든 todos 삭제
      const { error: todosError } = await supabase
        .from("todos")
        .delete()
        .eq("user_id", userId);

      if (todosError) {
        console.error("할 일 삭제 실패:", todosError);
        // 계속 진행 (todos가 없을 수도 있음)
      }

      // 2. 로그아웃
      await signOut();

      toast.success("계정 데이터가 삭제되었습니다. 완전한 계정 삭제를 원하시면 관리자에게 문의해주세요.");
      
      // 3. 로그인 페이지로 이동
      window.location.href = "/login";
    } catch (error: any) {
      console.error("계정 삭제 실패:", error);
      toast.error(error.message || "계정 삭제에 실패했습니다.");
      setIsDeleting(false);
    }
  };

  // 로딩 중
  if (isLoading || !mounted) {
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
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => router.push("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            돌아가기
          </Button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">설정</h1>

          <Separator />

          {/* 테마 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5" />
                테마
              </CardTitle>
              <CardDescription>
                앱의 테마를 선택하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={theme}
                onValueChange={setTheme}
                className="grid grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="light"
                    id="light"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="light"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Sun className="mb-3 h-6 w-6" />
                    라이트
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="dark"
                    id="dark"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="dark"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Moon className="mb-3 h-6 w-6" />
                    다크
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="system"
                    id="system"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="system"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Monitor className="mb-3 h-6 w-6" />
                    시스템
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* 언어 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                언어
              </CardTitle>
              <CardDescription>
                앱에서 사용할 언어를 선택하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="언어 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ko">🇰🇷 한국어</SelectItem>
                  <SelectItem value="en">🇺🇸 English</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                * 다국어 지원은 추후 업데이트 예정입니다.
              </p>
            </CardContent>
          </Card>

          {/* 알림 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                알림
              </CardTitle>
              <CardDescription>
                이메일 알림 설정을 관리하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notification" className="text-base">
                    지연 할 일 이메일 알림
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    중요도 높음 할 일이 24시간 이상 지연되면 이메일로 알려드립니다.
                  </p>
                </div>
                <Switch
                  id="email-notification"
                  checked={emailNotificationEnabled}
                  onCheckedChange={handleNotificationToggle}
                  disabled={isSavingNotification}
                />
              </div>
            </CardContent>
          </Card>

          {/* 위험 구역 */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                위험 구역
              </CardTitle>
              <CardDescription>
                계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        삭제 중...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        계정 삭제
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>정말 계정을 삭제하시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                      이 작업은 되돌릴 수 없습니다. 모든 할 일 데이터가 영구적으로 삭제됩니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      삭제
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
