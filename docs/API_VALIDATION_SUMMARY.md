# AI 할 일 파싱 API - 입력 검증 기능 구현 완료

AI 할 일 생성 API에 입력 검증, 전처리, 후처리 및 상세 에러 처리 기능이 추가되었습니다!

---

## ✅ 구현 완료

### 📁 수정된 파일

```
app/api/ai/parse-todo/
└── route.ts                          # 입력 검증 기능 추가 (UPDATED) ⭐

docs/
├── API_VALIDATION.md                 # 검증 가이드 (NEW) ⭐
└── AI_PARSE_IMPLEMENTATION.md        # 문서 업데이트 (UPDATED)
```

---

## 🎯 주요 기능

### 1️⃣ **입력 검증** ✅

```typescript
// 검증 규칙
const INPUT_MIN_LENGTH = 2;      // 최소 2자
const INPUT_MAX_LENGTH = 500;    // 최대 500자
```

**검증 항목**:
- ✅ 빈 문자열 체크
- ✅ 최소 길이 (2자)
- ✅ 최대 길이 (500자)
- ✅ 의미 있는 문자 존재 여부
- ✅ 타입 검증 (string)

**에러 예시**:
```json
{
  "error": "최소 2자 이상 입력해주세요.",
  "code": "INVALID_INPUT"
}
```

---

### 2️⃣ **전처리** ✅

```typescript
function preprocessInput(input: string): string {
  // 1. 앞뒤 공백 제거
  // 2. 연속된 공백을 하나로 통합
  // 3. 연속된 줄바꿈을 하나로 통합
}
```

**예시**:
```typescript
입력: "   내일    오후    3시   \n\n\n   회의   "
출력: "내일 오후 3시\n회의"
```

---

### 3️⃣ **후처리** ✅

```typescript
function postprocessResult(result: any): any {
  // 1. 제목 조정 (최대 100자, 최소 1자)
  // 2. 설명 정리
  // 3. 과거 날짜 검증 및 제거
  // 4. 우선순위 기본값 (medium)
  // 5. 카테고리 기본값 (["개인"])
  // 6. 카테고리 중복 제거
}
```

**제목 조정 예시**:
```typescript
// 너무 긴 제목
입력: "아주 긴 제목입니다... (120자)"
출력: "아주 긴 제목입니다... (97자)..."

// 빈 제목
입력: ""
출력: "새 할 일"
```

**과거 날짜 처리**:
```typescript
// 오늘: 2026-01-10
입력: due_date = "2026-01-05" (과거)
출력: due_date = null (제거)
```

---

### 4️⃣ **상세 에러 처리** ✅

#### 10가지 에러 코드

| HTTP | 코드 | 에러 메시지 |
|------|------|-----------|
| 400 | `INVALID_REQUEST_FORMAT` | 잘못된 요청 형식 |
| 400 | `MISSING_INPUT` | 입력 텍스트 필요 |
| 400 | `INVALID_INPUT` | 입력 검증 실패 |
| 429 | `QUOTA_EXCEEDED` | API 할당량 초과 |
| 500 | `SERVICE_UNAVAILABLE` | 서비스 설정 오류 |
| 500 | `INVALID_API_KEY` | 잘못된 API 키 |
| 500 | `MODEL_NOT_FOUND` | 모델을 찾을 수 없음 |
| 500 | `VALIDATION_ERROR` | 응답 형식 오류 |
| 500 | `AI_PARSE_ERROR` | 일반 AI 오류 |
| 503 | `NETWORK_ERROR` | 네트워크 오류 |

**에러 응답 예시**:
```json
{
  "error": "AI API 사용량 한도에 도달했습니다. 잠시 후 다시 시도해주세요.",
  "code": "QUOTA_EXCEEDED"
}
```

---

## 📊 데이터 흐름

### 전체 프로세스

```
사용자 입력
    ↓
[1] 타입 검증
    ↓
[2] 전처리 (공백 제거, 통합)
    ↓
[3] 입력 검증 (길이, 의미 있는 문자)
    ↓
[4] AI 파싱 (Gemini API)
    ↓
[5] 후처리 (제목 조정, 날짜 검증, 기본값)
    ↓
결과 반환
```

---

## 💡 사용 예시

### 예시 1: 정상 입력

**입력**:
```
"   내일    오후    3시까지    회의    준비   "
```

**처리 과정**:
```
1. 타입 검증: ✅ string
2. 전처리: "내일 오후 3시까지 회의 준비"
3. 입력 검증: ✅ 2~500자, 의미 있는 문자 존재
4. AI 파싱: { title: "회의 준비", due_date: "2026-01-11", ... }
5. 후처리: ✅ 제목 적절, 날짜 미래
```

**결과**:
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

### 예시 2: 빈 문자열 (검증 실패)

**입력**:
```
"   "
```

**처리 과정**:
```
1. 타입 검증: ✅ string
2. 전처리: ""
3. 입력 검증: ❌ 빈 문자열
```

**결과** (400):
```json
{
  "error": "할 일을 입력해주세요.",
  "code": "INVALID_INPUT"
}
```

---

### 예시 3: 너무 긴 입력 (검증 실패)

**입력**:
```
"아주 긴 텍스트... (501자)"
```

**처리 과정**:
```
1. 타입 검증: ✅ string
2. 전처리: "아주 긴 텍스트... (501자)"
3. 입력 검증: ❌ 최대 길이 초과
```

**결과** (400):
```json
{
  "error": "최대 500자까지 입력 가능합니다. (현재: 501자)",
  "code": "INVALID_INPUT"
}
```

---

### 예시 4: 과거 날짜 (후처리 자동 조정)

**입력**:
```
"어제까지 보고서 제출"
```

**처리 과정**:
```
1. 타입 검증: ✅ string
2. 전처리: "어제까지 보고서 제출"
3. 입력 검증: ✅ 통과
4. AI 파싱: { title: "보고서 제출", due_date: "2026-01-09" (과거), ... }
5. 후처리: ❌ 과거 날짜 → null로 변경
```

**결과**:
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

### 예시 5: 너무 긴 제목 (후처리 자동 조정)

**입력**:
```
"내일까지 아주 긴 제목의 프로젝트를 완성해야 하는데 여러 가지 작업이 많고 시간이 부족하고 팀원들과 협력해야 하는 중요한 일입니다 꼭 완료해야 합니다"
```

**처리 과정**:
```
1-4. 검증 및 AI 파싱 ✅
5. 후처리: 제목 120자 → 100자로 자동 조정
```

**결과**:
```json
{
  "success": true,
  "data": {
    "title": "내일까지 아주 긴 제목의 프로젝트를 완성해야 하는데 여러 가지 작업이 많고 시간이 부족하고 팀원들과 협력해야 하는 중요한 일입니다 꼭 완...",
    "due_date": "2026-01-11",
    "priority": "high",
    "category": ["업무"]
  }
}
```

---

## 🧪 테스트 케이스

### 1. 빈 문자열
```bash
curl -X POST http://localhost:3000/api/ai/parse-todo \
  -H "Content-Type: application/json" \
  -d '{"input": ""}'
```
**기대 결과**: 400 `INVALID_INPUT`

---

### 2. 공백만
```bash
curl -X POST http://localhost:3000/api/ai/parse-todo \
  -H "Content-Type: application/json" \
  -d '{"input": "     "}'
```
**기대 결과**: 400 `INVALID_INPUT`

---

### 3. 특수문자만
```bash
curl -X POST http://localhost:3000/api/ai/parse-todo \
  -H "Content-Type: application/json" \
  -d '{"input": "!!!!!!"}'
```
**기대 결과**: 400 `INVALID_INPUT`

---

### 4. 1자 입력
```bash
curl -X POST http://localhost:3000/api/ai/parse-todo \
  -H "Content-Type: application/json" \
  -d '{"input": "안"}'
```
**기대 결과**: 400 `INVALID_INPUT`

---

### 5. 501자 입력
```bash
curl -X POST http://localhost:3000/api/ai/parse-todo \
  -H "Content-Type: application/json" \
  -d '{"input": "긴 텍스트 x 501자..."}'
```
**기대 결과**: 400 `INVALID_INPUT`

---

### 6. 연속 공백
```bash
curl -X POST http://localhost:3000/api/ai/parse-todo \
  -H "Content-Type: application/json" \
  -d '{"input": "내일    오후    3시"}'
```
**기대 결과**: 200, 전처리 후 "내일 오후 3시"

---

### 7. 과거 날짜
```bash
curl -X POST http://localhost:3000/api/ai/parse-todo \
  -H "Content-Type: application/json" \
  -d '{"input": "어제까지 보고서"}'
```
**기대 결과**: 200, `due_date: null`

---

## 🔒 보안 개선

### 1. 개발 환경에서만 상세 오류 노출

```typescript
// Production
{
  "error": "AI API 키가 올바르지 않습니다.",
  "code": "INVALID_API_KEY"
}

// Development
{
  "error": "AI API 키가 올바르지 않습니다.",
  "code": "INVALID_API_KEY",
  "details": "API key not valid. Please pass a valid API key."
}
```

### 2. 입력 크기 제한으로 DoS 방지

- 최대 500자 제한
- 대용량 입력 거부

---

## 📚 참고 문서

- **[API 검증 가이드](./API_VALIDATION.md)** - 상세 검증 규칙 및 에러 처리
- **[AI 기능 가이드](./AI_FEATURES.md)** - AI 기능 사용법
- **[구현 문서](./AI_PARSE_IMPLEMENTATION.md)** - 기술 구현 상세

---

## 🎉 완료!

AI 할 일 파싱 API에 강력한 입력 검증 기능이 추가되었습니다:

- ✅ **입력 검증**: 빈 문자열, 길이 제한, 의미 있는 문자
- ✅ **전처리**: 공백 제거, 연속 공백/줄바꿈 통합
- ✅ **후처리**: 제목 조정, 날짜 검증, 기본값 설정
- ✅ **에러 처리**: 10가지 상세 에러 코드
- ✅ **보안**: DoS 방지, 개발 환경 전용 상세 오류
- ✅ **사용자 경험**: 친화적인 에러 메시지

**프로덕션 준비 완료!** 🚀
