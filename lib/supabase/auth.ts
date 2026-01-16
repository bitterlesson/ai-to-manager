/**
 * Supabase 인증 관련 함수
 */

import { createClient } from "./client";

/**
 * 회원가입
 */
export const signUp = async (email: string, password: string, name: string) => {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name, // 사용자 메타데이터에 이름 저장
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
};

/**
 * 로그인
 */
export const signIn = async (email: string, password: string) => {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

/**
 * 로그아웃
 */
export const signOut = async () => {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
};

/**
 * 현재 사용자 정보 가져오기
 */
export const getCurrentUser = async () => {
  const supabase = createClient();

  // 먼저 세션 확인
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  return session.user;
};

/**
 * 현재 세션 가져오기
 */
export const getSession = async () => {
  const supabase = createClient();

  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return session;
};
