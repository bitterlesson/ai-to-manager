"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, MessageSquare, Scale } from "lucide-react";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";

/**
 * 푸터 Props
 */
interface FooterProps {
  userId?: string;
}

/**
 * 대시보드 하단 푸터 컴포넌트
 * 피드백 버튼, 변경 이력 링크 및 저작권 정보 표시
 */
export const Footer = ({ userId }: FooterProps) => {
  const currentYear = new Date().getFullYear();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <>
      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
            {/* 저작권 */}
            <p>© {currentYear} AI 할 일 관리. All rights reserved.</p>

            {/* 링크 */}
            <div className="flex items-center gap-4">
              {/* 이용약관 */}
              <Link
                href="/terms"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Scale className="h-3 w-3" />
                <span>이용약관</span>
              </Link>

              {/* 구분선 */}
              <span className="text-border">|</span>

              {/* 피드백 버튼 (로그인 시에만 표시) */}
              {userId && (
                <>
                  <button
                    onClick={() => setIsFeedbackOpen(true)}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>피드백</span>
                  </button>
                  <span className="text-border">|</span>
                </>
              )}

              {/* 변경 이력 */}
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

      {/* 피드백 모달 */}
      {userId && (
        <FeedbackModal
          open={isFeedbackOpen}
          onOpenChange={setIsFeedbackOpen}
          userId={userId}
        />
      )}
    </>
  );
};
