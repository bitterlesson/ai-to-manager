"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sparkles, LogOut, User, Settings } from "lucide-react";

/**
 * 대시보드 헤더 컴포넌트
 * 서비스 로고, 사용자 정보, 로그아웃 기능 제공
 */
interface HeaderProps {
  user?: {
    name: string;
    email: string;
    avatar?: string | null;
  };
  onLogout?: () => void;
}

export const Header = ({ user, onLogout }: HeaderProps) => {
  /**
   * 사용자 이름의 첫 글자 추출 (아바타 표시용)
   */
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  /**
   * 로그아웃 핸들러
   */
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // TODO: 실제 로그아웃 로직 구현
      console.log("Logout");
    }
  };

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 및 서비스명 */}
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Todo Manager</h1>
            <p className="text-xs text-muted-foreground">스마트한 할 일 관리</p>
          </div>
        </div>

        {/* 사용자 메뉴 */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-white">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>프로필</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>설정</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>로그아웃</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};
