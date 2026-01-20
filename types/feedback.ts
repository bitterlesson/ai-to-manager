/**
 * 피드백 타입 정의
 */

/**
 * 피드백 유형
 */
export const FEEDBACK_TYPE = {
  BUG: "bug",
  FEATURE: "feature",
} as const;

export type FeedbackType = (typeof FEEDBACK_TYPE)[keyof typeof FEEDBACK_TYPE];

/**
 * 피드백 상태
 */
export const FEEDBACK_STATUS = {
  PENDING: "pending",
  REVIEWED: "reviewed",
  RESOLVED: "resolved",
  REJECTED: "rejected",
} as const;

export type FeedbackStatus = (typeof FEEDBACK_STATUS)[keyof typeof FEEDBACK_STATUS];

/**
 * 피드백 인터페이스
 */
export interface Feedback {
  id: string;
  user_id: string;
  type: FeedbackType;
  title: string;
  description: string;
  status: FeedbackStatus;
  created_at: Date;
}

/**
 * 피드백 생성 입력
 */
export interface CreateFeedbackInput {
  type: FeedbackType;
  title: string;
  description: string;
}

/**
 * 피드백 유형 라벨
 */
export const getFeedbackTypeLabel = (type: FeedbackType): string => {
  switch (type) {
    case FEEDBACK_TYPE.BUG:
      return "버그 리포트";
    case FEEDBACK_TYPE.FEATURE:
      return "기능 요청";
    default:
      return type;
  }
};

/**
 * 피드백 상태 라벨
 */
export const getFeedbackStatusLabel = (status: FeedbackStatus): string => {
  switch (status) {
    case FEEDBACK_STATUS.PENDING:
      return "검토 대기";
    case FEEDBACK_STATUS.REVIEWED:
      return "검토 중";
    case FEEDBACK_STATUS.RESOLVED:
      return "해결됨";
    case FEEDBACK_STATUS.REJECTED:
      return "반려됨";
    default:
      return status;
  }
};
