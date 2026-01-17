"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * 테마 프로바이더 컴포넌트
 * 다크모드/라이트모드 지원
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
