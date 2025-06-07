# 🌙 수면 기록 앱 (Sleep Tracker)

건강한 수면 습관을 만들어가는 개인 수면 기록 관리 서비스입니다.

## 📱 프로젝트 소개

수면 기록 앱은 사용자의 일일 수면 패턴을 기록하고 관리할 수 있는 풀스택 웹 애플리케이션입니다.
간단하고 직관적인 인터페이스로 수면 시간과 수면의 질을 추적하여 더 나은 수면 습관을 형성할 수 있도록 도와줍니다.

### 💤 왜 수면 기록이 중요할까요?

- **수면 패턴 파악**: 자신의 수면 습관을 객관적으로 분석
- **건강 관리**: 적정 수면 시간 유지로 건강한 라이프스타일 구축
- **수면의 질 개선**: 수면에 영향을 주는 요인들을 파악하고 개선
- **습관 형성**: 일정한 수면 스케줄을 통한 생체리듬 조절

## ✨ 주요 기능

### 📝 수면 기록 관리

- **새 기록 추가**: 날짜, 수면 시간, 메모를 포함한 상세 기록
- **기록 조회**: 모든 수면 기록을 시간순으로 정렬된 목록으로 확인
- **기록 수정**: 기존 수면 기록의 모든 정보 수정 가능
- **기록 삭제**: 불필요한 기록 삭제

### 📊 수면 통계 및 시각화

- **종합 통계 대시보드**: 전체/요일별/주간별 수면 패턴 분석
- **인터랙티브 차트**: Recharts 기반 바차트 및 라인차트
- **요일별 분석**: 월~일요일 각각의 평균 수면시간 시각화
- **추이 분석**: 주간별 수면 패턴 변화 추적
- **통계 요약**: 최대/최소 수면 요일, 데이터 포인트 현황

### 🎨 사용자 경험

- **직관적인 UI**: 깔끔하고 모던한 디자인
- **반응형 디자인**: 모바일과 데스크톱 모두 최적화
- **실시간 검증**: 입력 데이터 실시간 유효성 검사
- **추천 시스템**: 권장 수면 시간 제안 (6, 7, 8, 9시간)

## 🛠 기술 스택

### 🔧 공통 도구

- **패키지 매니저**: pnpm (workspace 기능 활용)
- **언어**: TypeScript
- **런타임**: Node.js 22.x
- **테스트**: Vitest
- **코드 품질**: Prettier, ESLint

### 🎨 프론트엔드 (Client)

- **프레임워크**: React 18
- **빌드 도구**: Vite
- **라우팅**: React Router v6
- **스타일링**: TailwindCSS
- **아이콘**: Lucide React
- **차트**: Recharts (데이터 시각화)
- **상태 관리**: React Hooks (useState, useEffect)

### ⚙️ 백엔드 (Server)

- **웹 프레임워크**: Fastify
- **데이터베이스**: SQLite
- **ORM**: DrizzleORM
- **API 설계**: RESTful API
- **검증**: JSON Schema (Fastify 내장)
- **로깅**: Fastify 내장 로거

### 🗄️ 데이터베이스 스키마

```sql
CREATE TABLE sleep_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,           -- YYYY-MM-DD 형식
  hours REAL NOT NULL,          -- 수면 시간 (0-24시간)
  note TEXT,                    -- 선택적 메모 (최대 500자)
  created_at TEXT NOT NULL,     -- ISO 문자열
  updated_at TEXT NOT NULL      -- ISO 문자열
);
```

## 🚀 로컬 실행 방법

### 1. 저장소 클론 및 의존성 설치

```bash
# 저장소 클론
git clone <repository-url>
cd YunSeok-Choi-Solvr-Q6

# pnpm workspace를 이용한 의존성 설치
pnpm install
```

### 2. 환경 변수 설정

**서버 환경변수** (`server/.env`):

```env
PORT=3001
HOST=localhost
NODE_ENV=development
DATABASE_URL=./database.db
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

### 3. 개발 서버 실행

```bash
# 클라이언트와 서버 동시 실행
pnpm dev

# 개별 실행
pnpm dev:client    # http://localhost:3000
pnpm dev:server    # http://localhost:3001
```

### 4. 테스트 실행

```bash
# 모든 테스트 실행
pnpm test

# 개별 테스트 실행
pnpm test:client   # 클라이언트 테스트
pnpm test:server   # 서버 테스트 (16개 API 테스트 포함)
```

### 5. 빌드

```bash
# 프로덕션 빌드
pnpm build

# 개별 빌드
pnpm build:client
pnpm build:server
```

## 📡 API 엔드포인트

### 수면 기록 관리

- `GET /api/sleep-records`: 모든 수면 기록 조회
- `GET /api/sleep-records/:id`: 특정 수면 기록 조회
- `POST /api/sleep-records`: 새로운 수면 기록 생성
- `PUT /api/sleep-records/:id`: 수면 기록 수정
- `DELETE /api/sleep-records/:id`: 수면 기록 삭제

### 수면 통계 분석

- `GET /api/sleep-records/sleep-statistics`: 종합 수면 통계 조회
  - 전체 평균 수면시간
  - 요일별 평균 수면시간 (월~일)
  - 주간별 수면 패턴 추이

### 시스템

- `GET /api/health`: 서버 상태 확인

### 요청/응답 예시

**수면 기록 생성 (POST /api/sleep-records)**

```json
// 요청
{
  "date": "2024-01-15",
  "hours": 7.5,
  "note": "깊게 잘 잤음. 꿈을 많이 꿨다."
}

// 응답
{
  "success": true,
  "message": "수면 기록이 성공적으로 생성되었습니다.",
  "data": {
    "id": 1,
    "date": "2024-01-15",
    "hours": 7.5,
    "note": "깊게 잘 잤음. 꿈을 많이 꿨다.",
    "createdAt": "2024-01-15T09:00:00.000Z",
    "updatedAt": "2024-01-15T09:00:00.000Z"
  }
}
```

## 🧪 테스트 현황

### 백엔드 테스트 (21개)

- ✅ 모든 CRUD 작업 테스트 (16개)
- ✅ 수면 통계 API 테스트 (5개)
- ✅ 입력 데이터 검증 테스트
- ✅ 에러 처리 시나리오 테스트
- ✅ 인메모리 데이터베이스를 통한 격리된 테스트

### 테스트 실행 결과

```bash
✓ 21 tests passing
✓ Sleep Records API 전체 기능 검증 완료
✓ Sleep Statistics API 검증 완료
✓ 빈 데이터, 단일/복수 기록, 소수점 처리 모든 시나리오 커버
```

## 📁 프로젝트 구조

```
YunSeok-Choi-Solvr-Q6/
├── client/                    # React 프론트엔드
│   ├── src/
│   │   ├── routes/
│   │   │   └── sleep/         # 수면 기록 페이지들
│   │   │       ├── SleepListPage.tsx
│   │   │       ├── SleepCreatePage.tsx
│   │   │       ├── SleepEditPage.tsx
│   │   │       └── SleepStatisticsPage.tsx
│   │   ├── layouts/           # 레이아웃 컴포넌트
│   │   └── ...
│   └── package.json
├── server/                    # Fastify 백엔드
│   ├── src/
│   │   ├── controllers/       # HTTP 요청 처리
│   │   ├── services/          # 비즈니스 로직
│   │   ├── routes/            # API 라우트 정의
│   │   ├── db/                # 데이터베이스 설정
│   │   └── ...
│   ├── test/                  # 테스트 파일
│   └── package.json
├── pnpm-workspace.yaml        # pnpm workspace 설정
└── package.json               # 루트 패키지 설정
```

## 🎯 개발 하이라이트

- **Full-Stack TypeScript**: 클라이언트부터 서버까지 타입 안전성 보장
- **모던 React 패턴**: Hooks 기반 함수형 컴포넌트
- **RESTful API 설계**: 직관적이고 표준적인 API 구조
- **포괄적인 테스트**: 백엔드 API 100% 테스트 커버리지
- **반응형 UI**: 모바일 퍼스트 디자인
- **사용자 중심 UX**: 직관적이고 접근하기 쉬운 인터페이스

## 💡 향후 개선 계획

- 📈 **시각화**: 수면 패턴 차트 및 그래프
- 📅 **캘린더 뷰**: 월별 수면 기록 캘린더
- 🔔 **알림 기능**: 취침 시간 알림
- 📊 **더 많은 통계**: 주간/월간 수면 분석
- 🌙 **수면 팁**: 개인화된 수면 개선 제안
- 📱 **PWA**: 모바일 앱과 같은 경험

## 📝 Changelog

### [v2.0.0] - 2025-06-07

#### ✨ 새로운 기능

**📊 수면 통계 분석 시스템**

- 전체 평균 수면시간 계산 기능 추가
- 요일별 평균 수면시간 분석 구현
- 주간별 수면 패턴 추이 계산 로직 개발
- `GET /api/sleep-records/sleep-statistics` API 엔드포인트 추가

**📈 데이터 시각화 페이지**

- Recharts 라이브러리 기반 인터랙티브 차트 구현
- 요일별 수면시간 바차트 시각화
- 주간별 수면 패턴 추이 라인차트 추가
- `/sleep/statistics` 라우트 및 네비게이션 연동

**🗃️ 테스트 데이터 생성기**

- 30일치 연속 수면 기록 자동 생성 함수 구현
- 4~9시간 랜덤 수면시간 (0.5 단위) 지원
- 개발/테스트 환경에서만 실행되는 안전장치 포함
- 기존 데이터 중복 방지 로직 구현

#### 🎨 UI/UX 개선

**통계 페이지 디자인**

- 카드 기반 모던 레이아웃 디자인
- 로딩 상태 및 에러 처리 구현
- 반응형 디자인 (모바일/데스크톱 대응)
- 그라데이션 배경 및 아이콘 활용

**네비게이션 개선**

- 메인 네비게이션에 "📊 통계" 링크 추가
- 직관적인 페이지 간 이동 경험 제공

#### 🧪 테스트 강화

**통계 API 테스트 추가**

- 빈 데이터 처리 테스트 케이스
- 단일/복수 기록 통계 계산 검증 테스트
- 요일별 누락 데이터 처리 테스트
- 소수점 수면시간 정확성 테스트
- 총 21개 테스트 (기존 16개 + 신규 5개) 모두 통과

#### 📦 의존성 업데이트

- `recharts` 패키지 추가 (차트 라이브러리)
- 기존 axios, lucide-react 활용 확장

#### 🔧 기술적 개선

**백엔드 아키텍처**

- DrizzleORM 기반 효율적 SQL 집계 쿼리 구현
- 요일별 그룹화 및 주간별 트렌드 분석 알고리즘
- JSON Schema 기반 API 응답 검증 강화

**성능 최적화**

- 반올림 처리로 사용자 친화적 수치 제공
- 메모리 효율적인 데이터 처리 로직

### [v1.0.0] - 2025-06-07

#### ✨ 초기 릴리즈

**핵심 기능**

- 수면 기록 CRUD 기능 구현
- RESTful API 설계 및 개발
- React 기반 SPA 구조
- SQLite + DrizzleORM 데이터 계층
- 실시간 폼 검증 및 사용자 친화적 UI

**기술 스택 확립**

- TypeScript 기반 풀스택 개발
- pnpm workspace 모노레포 구조
- Fastify + React + TailwindCSS 조합
- 포괄적 테스트 환경 구축

---

💤 **좋은 수면은 건강한 삶의 시작입니다!**
이 앱으로 더 나은 수면 습관을 만들어보세요. 🌙
