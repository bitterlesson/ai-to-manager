/**
 * Supabase 클라이언트 컴포넌트용 클라이언트 설정
 */

import { createBrowserClient } from '@supabase/ssr';

/**
 * 클라이언트 컴포넌트용 Supabase 클라이언트 생성
 */
export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
};
