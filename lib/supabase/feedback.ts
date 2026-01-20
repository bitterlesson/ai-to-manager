/**
 * Supabase Feedback CRUD 함수
 */

import { createClient } from "./client";
import type { Feedback, CreateFeedbackInput } from "@/types/feedback";

/**
 * 피드백 생성
 */
export const createFeedback = async (
  userId: string,
  input: CreateFeedbackInput
): Promise<Feedback> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("feedback")
    .insert({
      user_id: userId,
      type: input.type,
      title: input.title,
      description: input.description,
    })
    .select()
    .single();

  if (error) {
    console.error("피드백 생성 실패:", error);
    throw new Error("피드백 제출에 실패했습니다. 다시 시도해주세요.");
  }

  return {
    ...data,
    created_at: new Date(data.created_at),
  };
};

/**
 * 사용자의 피드백 목록 조회
 */
export const getUserFeedbacks = async (userId: string): Promise<Feedback[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("피드백 조회 실패:", error);
    throw new Error("피드백 목록을 불러오는데 실패했습니다.");
  }

  return data.map((feedback) => ({
    ...feedback,
    created_at: new Date(feedback.created_at),
  }));
};
