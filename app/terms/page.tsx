"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Scale, Loader2 } from "lucide-react";

/**
 * 이용약관 페이지
 * TERMS_OF_SERVICE.md 파일을 읽어서 마크다운으로 렌더링
 */
export default function TermsPage() {
  const router = useRouter();
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 이용약관 파일 로드
   */
  useEffect(() => {
    const loadTerms = async () => {
      try {
        const response = await fetch("/api/terms");
        if (response.ok) {
          const data = await response.json();
          setContent(data.content);
        } else {
          setContent("이용약관을 불러오는데 실패했습니다.");
        }
      } catch (error) {
        console.error("이용약관 로드 실패:", error);
        setContent("이용약관을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    loadTerms();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            돌아가기
          </Button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-6 w-6" />
              이용약관
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    // 헤딩 스타일
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold mb-4 pb-2 border-b">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-primary">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-medium mt-4 mb-2">
                        {children}
                      </h3>
                    ),
                    // 문단 스타일
                    p: ({ children }) => (
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {children}
                      </p>
                    ),
                    // 리스트 스타일
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside space-y-2 mb-4 ml-2">
                        {children}
                      </ol>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside space-y-1 mb-4">
                        {children}
                      </ul>
                    ),
                    li: ({ children }) => (
                      <li className="text-muted-foreground">{children}</li>
                    ),
                    // 강조 스타일
                    strong: ({ children }) => (
                      <strong className="font-semibold text-foreground">
                        {children}
                      </strong>
                    ),
                    // 구분선
                    hr: () => <hr className="my-6 border-border" />,
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
