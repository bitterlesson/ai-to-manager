import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // 기본 메타데이터
  title: {
    default: "AI 할 일 관리 서비스",
    template: "%s | AI 할 일 관리",
  },
  description: "AI가 도와주는 똑똑한 할 일 관리 서비스",
  
  // 검색 엔진 최적화
  keywords: ["할 일 관리", "투두리스트", "AI", "생산성", "일정 관리", "태스크 관리"],
  authors: [{ name: "AI Todo Manager Team" }],
  creator: "AI Todo Manager",
  publisher: "AI Todo Manager",
  
  // 검색 엔진 크롤링 설정
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Open Graph (Facebook, LinkedIn 등 SNS 공유)
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://ai-to-manager.vercel.app",
    siteName: "AI 할 일 관리 서비스",
    title: "AI 할 일 관리 서비스",
    description: "AI가 도와주는 똑똑한 할 일 관리 서비스",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI 할 일 관리 서비스",
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "AI 할 일 관리 서비스",
    description: "AI가 도와주는 똑똑한 할 일 관리 서비스",
    images: ["/og-image.png"],
  },
  
  // 아이콘 설정
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  
  // 기타 설정
  metadataBase: new URL("https://ai-to-manager.vercel.app"),
  alternates: {
    canonical: "/",
  },
  
  // 앱 관련
  applicationName: "AI 할 일 관리",
  category: "productivity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
          <Toaster 
            position="top-center"
            richColors
            closeButton
            expand={false}
            toastOptions={{
              style: {
                zIndex: 9999,
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
