# 인증 상태 관리 가이드

Supabase 인증 상태 관리 기능이 구현되었습니다.

## ✅ 구현된 기능

### 1. 자동 리다이렉트

#### 메인 페이지 (`/`)
- ✅ 로그인하지 않은 사용자 → `/login`으로 자동 리다이렉트
- ✅ 로그인된 사용자만 접근 가능

#### 로그인/회원가입 페이지 (`/login`, `/signup`)
- ✅ 이미 로그인된 사용자 → `/`로 자동 리다이렉트
- ✅ 로그인되지 않은 사용자만 접근 가능

### 2. 실시간 사용자 정보 표시

- ✅ 로그인된 사용자의 이름 표시 (메타데이터 또는 이메일에서 추출)
- ✅ 이메일 주소 표시
- ✅ 아바타 이니셜 표시

### 3. 실시간 상태 변화 감지

- ✅ `onAuthStateChange` 이벤트 리스너 구독
- ✅ 로그인 시 자동으로 사용자 정보 업데이트
- ✅ 로그아웃 시 즉시 세션 제거 및 리다이렉트

### 4. 로딩 상태 처리

- ✅ 인증 확인 중 로딩 화면 표시
- ✅ 스피너 애니메이션
- ✅ 로딩 메시지

---

## 📁 수정된 파일

```
lib/supabase/
└── auth.ts                    # getCurrentUser, getSession 추가

app/
├── page.tsx                   # 인증 체크 및 실시간 감지
├── login/page.tsx             # 로그인 상태 체크
└── signup/page.tsx            # 로그인 상태 체크
```

---

## 🔧 구현 상세

### 1. 인증 함수 추가 (`lib/supabase/auth.ts`)

```typescript
/**
 * 현재 사용자 정보 가져오기
 */
export const getCurrentUser = async () => {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) throw error;
  return user;
};

/**
 * 현재 세션 가져오기
 */
export const getSession = async () => {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) throw error;
  return session;
};
```

---

### 2. 메인 페이지 인증 체크 (`app/page.tsx`)

#### 초기 인증 확인
```typescript
useEffect(() => {
  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        // 로그인되지 않은 경우 리다이렉트
        router.push("/login");
      } else {
        setUser(currentUser);
      }
    } catch (error) {
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  checkAuth();
}, [router]);
```

#### 실시간 상태 변화 감지
```typescript
// 인증 상태 변화 실시간 감지
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  async (event, session) => {
    if (event === "SIGNED_OUT" || !session) {
      // 로그아웃 시
      setUser(null);
      router.push("/login");
    } else if (event === "SIGNED_IN" && session) {
      // 로그인 시
      setUser(session.user);
    }
  }
);

// 클린업
return () => {
  subscription.unsubscribe();
};
```

#### 사용자 정보 변환 및 표시
```typescript
const currentUser = {
  name: user.user_metadata?.name || user.email?.split("@")[0] || "사용자",
  email: user.email || "",
  avatar: user.user_metadata?.avatar_url || null,
};

<Header user={currentUser} onLogout={handleLogout} />
```

---

### 3. 로그인 페이지 인증 체크 (`app/login/page.tsx`)

```typescript
useEffect(() => {
  const checkAuth = async () => {
    try {
      const user = await getCurrentUser();
      
      if (user) {
        // 이미 로그인되어 있으면 메인 페이지로 이동
        router.push("/");
      }
    } catch (error) {
      // 로그인되지 않은 상태 (정상)
    } finally {
      setIsChecking(false);
    }
  };

  checkAuth();
}, [router]);
```

---

### 4. 로그아웃 동작 (`app/page.tsx`)

```typescript
const handleLogout = async () => {
  if (confirm("로그아웃 하시겠습니까?")) {
    try {
      // Supabase 로그아웃
      await signOut();
      
      // 로그인 페이지로 이동
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
      alert("로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  }
};
```

**동작:**
1. 사용자 확인 다이얼로그 표시
2. Supabase `signOut()` 호출 → 세션 제거
3. `onAuthStateChange` 이벤트 발생 → `SIGNED_OUT`
4. 자동으로 `/login`으로 리다이렉트

---

## 🎯 동작 흐름

### 로그인 흐름
```
1. 사용자가 /login 접속
2. 인증 상태 확인
   - 로그인 안됨 → 로그인 폼 표시
   - 이미 로그인 → / 로 리다이렉트
3. 로그인 폼 제출
4. Supabase signIn() 호출
5. 세션 생성
6. onAuthStateChange 이벤트: SIGNED_IN
7. / 로 리다이렉트
```

### 로그아웃 흐름
```
1. 헤더에서 "로그아웃" 클릭
2. 확인 다이얼로그
3. Supabase signOut() 호출
4. 세션 제거
5. onAuthStateChange 이벤트: SIGNED_OUT
6. /login 으로 리다이렉트
```

### 메인 페이지 접근
```
1. 사용자가 / 접속
2. 인증 상태 확인
   - 로그인 안됨 → /login 으로 리다이렉트
   - 로그인됨 → 사용자 정보 로드
3. Header에 사용자 정보 표시
4. onAuthStateChange 구독 시작
```

---

## 🎨 로딩 화면

모든 페이지에서 인증 확인 중 로딩 화면 표시:

```typescript
if (isLoading || !user) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="mt-4 text-muted-foreground">로딩 중...</p>
      </div>
    </div>
  );
}
```

---

## 🔒 보안 기능

### 클라이언트 측 보호
- ✅ 각 페이지에서 인증 상태 확인
- ✅ 로그인되지 않은 사용자는 자동 리다이렉트
- ✅ 실시간 세션 감지로 즉시 반영

### 세션 관리
- ✅ Supabase가 자동으로 세션 관리
- ✅ httpOnly 쿠키에 저장
- ✅ 자동 갱신
- ✅ 로그아웃 시 완전 제거

---

## 🧪 테스트 시나리오

### 1. 로그인하지 않은 상태
```
1. 브라우저에서 http://localhost:3000 접속
2. 자동으로 /login으로 리다이렉트 확인
3. 로그인 시도
4. 성공 시 / 로 리다이렉트 확인
```

### 2. 로그인된 상태
```
1. / 접속 → 정상 접근
2. 헤더에 사용자 정보 표시 확인
3. /login 접속 → 자동으로 / 로 리다이렉트
4. /signup 접속 → 자동으로 / 로 리다이렉트
```

### 3. 로그아웃
```
1. 헤더 아바타 클릭
2. "로그아웃" 클릭
3. 확인 다이얼로그 → 확인
4. 즉시 /login으로 리다이렉트 확인
5. 다시 / 접속 시도 → /login으로 리다이렉트 확인
```

### 4. 실시간 상태 변화
```
1. 탭 A: 로그인 상태로 / 접속
2. 탭 B: 같은 브라우저에서 로그아웃
3. 탭 A: 자동으로 /login으로 리다이렉트 확인
```

---

## 🐛 문제 해결

### "로그인 페이지로 계속 리다이렉트됨"

**원인:** 세션이 저장되지 않음

**해결:**
1. 환경 변수 확인 (.env.local)
2. Supabase URL과 Key 확인
3. 브라우저 쿠키 설정 확인
4. 개발자 도구 → Application → Cookies 확인

### "사용자 정보가 표시되지 않음"

**원인:** user_metadata에 이름이 없음

**해결:**
- 회원가입 시 이름을 메타데이터에 저장
- 또는 이메일에서 자동 추출 (현재 구현됨)

### "로그아웃 후에도 접근 가능"

**원인:** 세션이 제거되지 않음

**해결:**
1. `signOut()` 함수 호출 확인
2. `router.refresh()` 호출 확인
3. 브라우저 캐시 삭제

---

## 📚 다음 단계

인증 상태 관리가 완료되었으므로 다음 기능을 구현할 수 있습니다:

1. ✅ 인증 상태 관리 완료
2. ⏳ Todo CRUD API 연동 (실제 데이터베이스)
3. ⏳ 사용자별 Todo 필터링
4. ⏳ 프로필 관리 페이지
5. ⏳ 실시간 동기화

---

**축하합니다! 🎉 인증 상태 관리가 완전히 구현되었습니다.**
