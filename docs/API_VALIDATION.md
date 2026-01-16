# AI 할 일 파싱 API - 입력 검증 및 에러 처리

AI 할 일 생성 API의 입력 검증, 전처리, 후처리 및 에러 처리에 대한 상세 가이드입니다.

---

## 📋 목차

1. [입력 검증](#입력-검증)
2. [전처리](#전처리)
3. [후처리](#후처리)
4. [에러 응답](#에러-응답)

---

## ✅ 입력 검증

### 검증 규칙

#### 1. 빈 문자열 체크
```typescript
// ❌ 거부되는 입력
""
"   "
"\n\n"
```

**에러 응답**:
```json
{
  "error": "할 일을 입력해주세요.",
  "code": "INVALID_INPUT"
}
```
**HTTP 상태 코드**: `400`

---

#### 2. 최소 길이 제한 (2자)
```typescript
// ❌ 거부되는 입력
"안"        // 1자
"a"         // 1자

// ✅ 허용되는 입력
"할일"      // 2자
"ab"        // 2자
```

**에러 응답**:
```json
{
  "error": "최소 2자 이상 입력해주세요.",
  "code": "INVALID_INPUT"
}
```
**HTTP 상태 코드**: `400`

---

#### 3. 최대 길이 제한 (500자)
```typescript
// ❌ 거부되는 입력
"아주 긴 텍스트... (501자 이상)"

// ✅ 허용되는 입력
"긴 텍스트... (500자 이하)"
```

**에러 응답**:
```json
{
  "error": "최대 500자까지 입력 가능합니다. (현재: 523자)",
  "code": "INVALID_INPUT"
}
```
**HTTP 상태 코드**: `400`

---

#### 4. 의미 있는 문자 체크
```typescript
// ❌ 거부되는 입력 (공백, 특수문자만 있는 경우)
"!!!!!!"
"..."
"----"
"   !!!   "

// ✅ 허용되는 입력
"할일!!!"       // 의미 있는 문자 포함
"회의 준비..."   // 의미 있는 문자 포함
```

**에러 응답**:
```json
{
  "error": "의미 있는 내용을 입력해주세요.",
  "code": "INVALID_INPUT"
}
```
**HTTP 상태 코드**: `400`

---

#### 5. 특수 문자 및 이모지 처리
```typescript
// ✅ 허용됨 (자동으로 처리)
"회의 준비 😀"           // 이모지 포함
"프로젝트 #1 완성"       // 특수문자 포함
"TODO: 보고서 작성"      // 영문, 특수문자 포함
```

**처리 방법**:
- 이모지는 그대로 허용
- 특수문자는 그대로 허용
- 의미 있는 문자가 있는지만 검증

---

## 🔧 전처리

입력 텍스트는 다음 순서로 자동 전처리됩니다:

### 1. 앞뒤 공백 제거
```typescript
입력: "   내일 회의   "
전처리 후: "내일 회의"
```

### 2. 연속된 공백을 하나로 통합
```typescript
입력: "내일    오후     3시"
전처리 후: "내일 오후 3시"
```

### 3. 연속된 줄바꿈을 하나로 통합
```typescript
입력: "회의 준비\n\n\n발표 자료"
전처리 후: "회의 준비\n발표 자료"
```

### 전처리 예시

```typescript
// Before (원본 입력)
"   내일    오후    3시까지    중요한    회의   \n\n\n   준비   "

// After (전처리 후)
"내일 오후 3시까지 중요한 회의\n준비"
```

---

## ⚙️ 후처리

AI 파싱 결과는 다음 순서로 자동 후처리됩니다:

### 1. 제목 처리

#### 제목이 너무 긴 경우 (100자 초과)
```typescript
// Before
title: "아주 긴 제목입니다 계속 계속 계속... (120자)"

// After
title: "아주 긴 제목입니다 계속 계속 계속... (97자)..."
```

#### 제목이 비어있거나 너무 짧은 경우
```typescript
// Before
title: "" 또는 title: null

// After
title: "새 할 일"
```

---

### 2. 설명 처리

```typescript
// Before
description: "   발표 자료 준비   \n\n   "

// After
description: "발표 자료 준비"
```

---

### 3. 날짜 검증 (과거 날짜 체크)

```typescript
// 오늘: 2026-01-10

// Before (과거 날짜)
due_date: "2026-01-05"
due_time: "15:00"

// After (null로 변경)
due_date: null
due_time: null
```

**이유**: 과거 날짜는 의미가 없으므로 자동으로 제거

---

### 4. 우선순위 기본값

```typescript
// Before
priority: null 또는 priority: "invalid"

// After
priority: "medium"
```

---

### 5. 카테고리 기본값 및 정리

#### 비어있는 경우
```typescript
// Before
category: [] 또는 category: null

// After
category: ["개인"]
```

#### 중복 제거
```typescript
// Before
category: ["업무", "업무", "개인"]

// After
category: ["업무", "개인"]
```

#### 빈 문자열 제거
```typescript
// Before
category: ["업무", "", "  ", "개인"]

// After
category: ["업무", "개인"]
```

---

## ❌ 에러 응답

### HTTP 상태 코드별 에러 처리

---

### 400 - Bad Request (잘못된 입력)

#### 1. 잘못된 요청 형식
```json
{
  "error": "잘못된 요청 형식입니다.",
  "code": "INVALID_REQUEST_FORMAT"
}
```
**원인**: JSON 파싱 실패

---

#### 2. 입력 누락
```json
{
  "error": "입력 텍스트가 필요합니다.",
  "code": "MISSING_INPUT"
}
```
**원인**: `input` 필드가 없거나 문자열이 아님

---

#### 3. 입력 검증 실패
```json
{
  "error": "최소 2자 이상 입력해주세요.",
  "code": "INVALID_INPUT"
}
```
**원인**: 최소/최대 길이, 빈 문자열 등

---

### 429 - Too Many Requests (API 호출 한도 초과)

```json
{
  "error": "AI API 사용량 한도에 도달했습니다. 잠시 후 다시 시도해주세요.",
  "code": "QUOTA_EXCEEDED"
}
```
**원인**: Google Gemini API 할당량 초과

**해결 방법**:
- 1-2분 후 다시 시도
- Google Cloud Console에서 할당량 확인
- 유료 플랜 고려

---

### 500 - Internal Server Error (AI 처리 실패)

#### 1. AI 서비스 설정 오류
```json
{
  "error": "AI 서비스 설정이 올바르지 않습니다. 관리자에게 문의하세요.",
  "code": "SERVICE_UNAVAILABLE"
}
```
**원인**: `GOOGLE_GENERATIVE_AI_API_KEY` 환경 변수 누락

---

#### 2. 잘못된 API 키
```json
{
  "error": "AI API 키가 올바르지 않습니다. 관리자에게 문의하세요.",
  "code": "INVALID_API_KEY"
}
```
**원인**: Google API 키가 올바르지 않음

---

#### 3. 모델을 찾을 수 없음
```json
{
  "error": "AI 모델을 찾을 수 없습니다. 관리자에게 문의하세요.",
  "code": "MODEL_NOT_FOUND"
}
```
**원인**: Gemini 모델명이 올바르지 않음

---

#### 4. 스키마 검증 오류
```json
{
  "error": "AI 응답 형식이 올바르지 않습니다. 다시 시도해주세요.",
  "code": "VALIDATION_ERROR"
}
```
**원인**: AI 응답이 Zod 스키마와 맞지 않음

---

#### 5. 일반 AI 파싱 오류
```json
{
  "error": "할 일 파싱 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  "code": "AI_PARSE_ERROR"
}
```
**원인**: 기타 예상치 못한 오류

---

### 503 - Service Unavailable (네트워크 오류)

```json
{
  "error": "네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인하고 다시 시도해주세요.",
  "code": "NETWORK_ERROR"
}
```
**원인**: 네트워크 연결 문제, 타임아웃

---

## 📊 에러 코드 요약표

| HTTP 상태 | 에러 코드 | 에러 메시지 | 원인 |
|-----------|----------|------------|-----|
| 400 | `INVALID_REQUEST_FORMAT` | 잘못된 요청 형식 | JSON 파싱 실패 |
| 400 | `MISSING_INPUT` | 입력 텍스트 필요 | input 필드 없음 |
| 400 | `INVALID_INPUT` | 입력 검증 실패 | 최소/최대 길이, 빈 문자열 |
| 429 | `QUOTA_EXCEEDED` | API 할당량 초과 | Gemini API 사용량 초과 |
| 500 | `SERVICE_UNAVAILABLE` | 서비스 설정 오류 | 환경 변수 누락 |
| 500 | `INVALID_API_KEY` | 잘못된 API 키 | Google API 키 오류 |
| 500 | `MODEL_NOT_FOUND` | 모델을 찾을 수 없음 | 모델명 오류 |
| 500 | `VALIDATION_ERROR` | 응답 형식 오류 | Zod 스키마 불일치 |
| 500 | `AI_PARSE_ERROR` | 일반 AI 오류 | 기타 오류 |
| 503 | `NETWORK_ERROR` | 네트워크 오류 | 연결 문제, 타임아웃 |

---

## 🧪 테스트 케이스

### 1. 정상 입력

```bash
curl -X POST http://localhost:3000/api/ai/parse-todo \
  -H "Content-Type: application/json" \
  -d '{"input": "내일 오후 3시까지 회의 준비"}'
```

**응답** (200):
```json
{
  "success": true,
  "data": {
    "title": "회의 준비",
    "description": "",
    "due_date": "2026-01-11",
    "due_time": "15:00",
    "priority": "medium",
    "category": ["업무"]
  }
}
```

---

### 2. 빈 문자열

```bash
curl -X POST http://localhost:3000/api/ai/parse-todo \
  -H "Content-Type: application/json" \
  -d '{"input": ""}'
```

**응답** (400):
```json
{
  "error": "할 일을 입력해주세요.",
  "code": "INVALID_INPUT"
}
```

---

### 3. 너무 짧은 입력

```bash
curl -X POST http://localhost:3000/api/ai/parse-todo \
  -H "Content-Type: application/json" \
  -d '{"input": "안"}'
```

**응답** (400):
```json
{
  "error": "최소 2자 이상 입력해주세요.",
  "code": "INVALID_INPUT"
}
```

---

### 4. 너무 긴 입력

```bash
curl -X POST http://localhost:3000/api/ai/parse-todo \
  -H "Content-Type: application/json" \
  -d '{"input": "아주 긴 텍스트... (501자)"}'
```

**응답** (400):
```json
{
  "error": "최대 500자까지 입력 가능합니다. (현재: 501자)",
  "code": "INVALID_INPUT"
}
```

---

### 5. 특수문자만 있는 경우

```bash
curl -X POST http://localhost:3000/api/ai/parse-todo \
  -H "Content-Type: application/json" \
  -d '{"input": "!!!!!!"}'
```

**응답** (400):
```json
{
  "error": "의미 있는 내용을 입력해주세요.",
  "code": "INVALID_INPUT"
}
```

---

### 6. 과거 날짜 (자동 처리)

```bash
curl -X POST http://localhost:3000/api/ai/parse-todo \
  -H "Content-Type: application/json" \
  -d '{"input": "어제까지 보고서 제출"}'
```

**응답** (200):
```json
{
  "success": true,
  "data": {
    "title": "보고서 제출",
    "description": "",
    "due_date": null,
    "due_time": null,
    "priority": "medium",
    "category": ["업무"]
  }
}
```

---

## 🎯 프론트엔드 에러 처리

### TodoForm.tsx에서 에러 처리

```typescript
try {
  const response = await fetch("/api/ai/parse-todo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: trimmedInput }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "AI 파싱에 실패했습니다.");
  }

  const result = await response.json();
  // 성공 처리...
} catch (error: any) {
  console.error("AI 파싱 오류:", error);
  toast.error(error.message || "AI 파싱 중 오류가 발생했습니다.");
}
```

---

## 📚 참고 사항

### 입력 길이 제한 상수

```typescript
const INPUT_MIN_LENGTH = 2;      // 최소 2자
const INPUT_MAX_LENGTH = 500;    // 최대 500자
const TITLE_MIN_LENGTH = 1;      // 제목 최소 1자
const TITLE_MAX_LENGTH = 100;    // 제목 최대 100자
```

### 개발 환경에서 상세 에러 확인

```typescript
// production 환경
{
  "error": "AI API 키가 올바르지 않습니다.",
  "code": "INVALID_API_KEY"
}

// development 환경
{
  "error": "AI API 키가 올바르지 않습니다.",
  "code": "INVALID_API_KEY",
  "details": "API key not valid. Please pass a valid API key."
}
```

---

## 🎉 완료!

AI 할 일 파싱 API에 다음 기능이 완전히 구현되었습니다:

- ✅ **입력 검증**: 빈 문자열, 최소/최대 길이, 의미 있는 문자
- ✅ **전처리**: 공백 제거, 연속 공백/줄바꿈 통합
- ✅ **후처리**: 제목 조정, 날짜 검증, 기본값 설정
- ✅ **에러 처리**: 10가지 상세 에러 코드 및 사용자 친화적 메시지
- ✅ **보안**: 개발 환경에서만 상세 오류 노출

**프로덕션 준비 완료!** 🚀
