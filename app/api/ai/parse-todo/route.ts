/**
 * AI 기반 자연어 할 일 파싱 API
 * Gemini API를 사용하여 자연어를 구조화된 할 일 데이터로 변환
 */

import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { parse } from "date-fns";

// 입력 검증 상수
const INPUT_MIN_LENGTH = 2;
const INPUT_MAX_LENGTH = 500;
const TITLE_MIN_LENGTH = 1;
const TITLE_MAX_LENGTH = 100;

// 할 일 파싱 결과 스키마
const TodoParseSchema = z.object({
  title: z.string().describe("할 일의 제목 (간결하게)"),
  description: z.string().optional().describe("할 일의 상세 설명 (여러 항목이 있을 경우 bullet point(•)로 구분하여 정리)"),
  due_date: z.string().nullable().describe("마감일 (YYYY-MM-DD 형식, 없으면 null)"),
  due_time: z.string().nullable().describe("마감 시간 (HH:MM 형식, 없으면 null)"),
  priority: z.enum(["high", "medium", "low"]).describe("우선순위 (긴급하거나 중요하면 high, 보통이면 medium, 여유있으면 low)"),
  category: z.array(z.string()).describe("카테고리 배열 (업무, 개인, 공부, 건강, 취미 등)"),
});

/**
 * 입력 텍스트 전처리
 */
function preprocessInput(input: string): string {
  // 앞뒤 공백 제거
  let processed = input.trim();
  
  // 연속된 공백을 하나로 통합
  processed = processed.replace(/\s+/g, " ");
  
  // 연속된 줄바꿈을 하나로 통합
  processed = processed.replace(/\n+/g, "\n");
  
  return processed;
}

/**
 * 입력 텍스트 검증
 */
function validateInput(input: string): { valid: boolean; error?: string } {
  // 빈 문자열 체크
  if (!input || input.length === 0) {
    return { valid: false, error: "할 일을 입력해주세요." };
  }
  
  // 최소 길이 체크
  if (input.length < INPUT_MIN_LENGTH) {
    return { valid: false, error: `최소 ${INPUT_MIN_LENGTH}자 이상 입력해주세요.` };
  }
  
  // 최대 길이 체크
  if (input.length > INPUT_MAX_LENGTH) {
    return { valid: false, error: `최대 ${INPUT_MAX_LENGTH}자까지 입력 가능합니다. (현재: ${input.length}자)` };
  }
  
  // 의미 있는 문자가 있는지 체크 (공백, 특수문자만 있는 경우)
  const meaningfulChars = input.replace(/[\s\p{P}\p{S}]/gu, "");
  if (meaningfulChars.length === 0) {
    return { valid: false, error: "의미 있는 내용을 입력해주세요." };
  }
  
  return { valid: true };
}

/**
 * 파싱 결과 후처리
 */
function postprocessResult(result: any): any {
  const processed = { ...result };
  
  // 1. 제목 처리
  if (processed.title) {
    // 앞뒤 공백 제거
    processed.title = processed.title.trim();
    
    // 제목이 너무 긴 경우 자동 조정
    if (processed.title.length > TITLE_MAX_LENGTH) {
      processed.title = processed.title.substring(0, TITLE_MAX_LENGTH - 3) + "...";
    }
    
    // 제목이 비어있거나 너무 짧은 경우
    if (processed.title.length < TITLE_MIN_LENGTH) {
      processed.title = "새 할 일";
    }
  } else {
    // 제목이 없는 경우 기본값
    processed.title = "새 할 일";
  }
  
  // 2. 설명 처리
  if (processed.description) {
    processed.description = processed.description.trim();
  } else {
    processed.description = "";
  }
  
  // 3. 날짜 검증 (과거 날짜인지 확인)
  if (processed.due_date) {
    try {
      const dueDate = parse(processed.due_date, "yyyy-MM-dd", new Date());
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // 과거 날짜인 경우 오늘로 변경
      if (dueDate < today) {
        processed.due_date = null;
        processed.due_time = null;
      }
    } catch (error) {
      // 날짜 파싱 실패 시 null로 설정
      processed.due_date = null;
      processed.due_time = null;
    }
  }
  
  // 4. 우선순위 기본값
  if (!processed.priority || !["high", "medium", "low"].includes(processed.priority)) {
    processed.priority = "medium";
  }
  
  // 5. 카테고리 기본값
  if (!processed.category || !Array.isArray(processed.category) || processed.category.length === 0) {
    processed.category = ["개인"];
  }
  
  // 카테고리 중복 제거 및 정리
  processed.category = [...new Set(processed.category as string[])].filter(
    (cat) => cat && cat.trim().length > 0
  );
  
  return processed;
}

export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { 
          error: "잘못된 요청 형식입니다.",
          code: "INVALID_REQUEST_FORMAT"
        },
        { status: 400 }
      );
    }

    const { input } = body;

    // 입력 타입 체크
    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { 
          error: "입력 텍스트가 필요합니다.",
          code: "MISSING_INPUT"
        },
        { status: 400 }
      );
    }

    // 전처리
    const preprocessedInput = preprocessInput(input);
    
    // 입력 검증
    const validation = validateInput(preprocessedInput);
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: validation.error,
          code: "INVALID_INPUT"
        },
        { status: 400 }
      );
    }

    // 환경 변수 확인
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("GOOGLE_GENERATIVE_AI_API_KEY가 설정되지 않았습니다.");
      return NextResponse.json(
        { 
          error: "AI 서비스 설정이 올바르지 않습니다. 관리자에게 문의하세요.",
          code: "SERVICE_UNAVAILABLE"
        },
        { status: 500 }
      );
    }

    // 현재 날짜/시간 정보 생성
    const now = new Date();
    const today = now.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
    const currentTime = now.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // Gemini API로 자연어 파싱
    const result = await generateObject({
      model: google("gemini-2.0-flash-exp"),
      schema: TodoParseSchema,
      prompt: `당신은 한국어 자연어를 할 일(TODO) 데이터로 변환하는 AI 어시스턴트입니다.

현재 정보:
- 오늘 날짜: ${today}
- 현재 시간: ${currentTime}

사용자 입력: "${preprocessedInput}"

위 입력을 분석하여 다음 규칙에 따라 구조화된 할 일 데이터로 변환하세요:

1. **제목 (title)**: 핵심 행동을 간결하게 추출 (예: "팀 회의 준비", "보고서 작성")

2. **설명 (description)**: 
   - 제목에 포함되지 않은 중요한 세부 사항이나 단계들을 추출
   - 여러 항목이 있을 경우 bullet point(•)를 사용하여 정리
   - 각 항목은 줄바꿈으로 구분
   - 형식 예시:
     "• 발표 자료 준비
• 참석자 명단 확인
• 회의실 예약"
   - 추가 정보가 없으면 빈 문자열
   - 간결하고 명확하게 작성

3. **마감일 (due_date)**: 
   - "오늘" → 오늘 날짜
   - "내일" → 오늘 + 1일
   - "모레" → 오늘 + 2일
   - "다음 주 월요일" → 다음 월요일 날짜
   - 명시적 날짜 → 해당 날짜
   - 날짜 정보 없음 → null
   - 형식: YYYY-MM-DD

4. **마감 시간 (due_time)**:
   - 명시된 시간 추출 (예: "오후 3시" → "15:00", "저녁 7시" → "19:00")
   - 시간 정보 없고 날짜만 있으면 → "09:00" (기본값)
   - 날짜도 시간도 없으면 → null
   - 형식: HH:MM (24시간)

5. **우선순위 (priority)**:
   - "긴급", "중요", "빨리", "시급", "마감 임박" → "high"
   - "보통", "일반" → "medium"
   - "여유", "천천히", "나중에" → "low"
   - 명시되지 않았다면 문맥으로 판단 (회의, 발표, 제출 등 → high, 일상적인 일 → medium)

6. **카테고리 (category)**:
   - 업무 관련 → ["업무"]
   - 공부/학습 → ["공부"]
   - 운동/건강 → ["건강"]
   - 개인적인 일 → ["개인"]
   - 취미/여가 → ["취미"]
   - 여러 카테고리 가능 (예: ["업무", "공부"])
   - 명확하지 않으면 문맥으로 추론

**중요**: 날짜 계산 시 오늘(${today})을 기준으로 정확히 계산하세요.`,
    });

    // 후처리
    const processedResult = postprocessResult(result.object);

    // 파싱 결과 반환
    return NextResponse.json({
      success: true,
      data: processedResult,
    });
  } catch (error: any) {
    console.error("AI 할 일 파싱 오류:", error);

    // 에러 메시지 및 상태 코드 구체화
    let errorMessage = "할 일 파싱 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    let errorCode = "AI_PARSE_ERROR";
    let statusCode = 500;
    
    // API 키 오류
    if (error.message?.includes("API key") || error.message?.includes("api key")) {
      errorMessage = "AI API 키가 올바르지 않습니다. 관리자에게 문의하세요.";
      errorCode = "INVALID_API_KEY";
      statusCode = 500;
    } 
    // 할당량 초과 (429)
    else if (error.message?.includes("quota") || error.message?.includes("rate limit") || error.message?.includes("429")) {
      errorMessage = "AI API 사용량 한도에 도달했습니다. 잠시 후 다시 시도해주세요.";
      errorCode = "QUOTA_EXCEEDED";
      statusCode = 429;
    } 
    // 네트워크 오류
    else if (error.message?.includes("network") || error.message?.includes("ECONNREFUSED") || error.message?.includes("timeout")) {
      errorMessage = "네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인하고 다시 시도해주세요.";
      errorCode = "NETWORK_ERROR";
      statusCode = 503;
    }
    // 모델 오류
    else if (error.message?.includes("model") || error.message?.includes("404")) {
      errorMessage = "AI 모델을 찾을 수 없습니다. 관리자에게 문의하세요.";
      errorCode = "MODEL_NOT_FOUND";
      statusCode = 500;
    }
    // 스키마 검증 오류
    else if (error.message?.includes("schema") || error.message?.includes("validation")) {
      errorMessage = "AI 응답 형식이 올바르지 않습니다. 다시 시도해주세요.";
      errorCode = "VALIDATION_ERROR";
      statusCode = 500;
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        code: errorCode,
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: statusCode }
    );
  }
}
