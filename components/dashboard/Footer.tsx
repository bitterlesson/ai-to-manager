"use client";

import Link from "next/link";
import { FileText } from "lucide-react";

/**
 * 대시보드 하단 푸터 컴포넌트
 * 변경 이력 링크 및 저작권 정보 표시
 */
export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          {/* 저작권 */}
          <p>© {currentYear} AI 할 일 관리. All rights reserved.</p>

          {/* 링크 */}
          <div className="flex items-center gap-4">
            <Link
              href="/changelog"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <FileText className="h-3 w-3" />
              <span>변경 이력</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
