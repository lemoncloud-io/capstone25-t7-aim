# AIM Hello API

Google Generative AI를 활용한 서버리스 API 서비스입니다.

## 개요

이 프로젝트는 Google의 Generative AI 모델을 사용하여 간단한 API 엔드포인트를 제공하는 서버리스 애플리케이션입니다. Lemon Cloud 플랫폼의 일부로, AI 기반 분석 및 처리를 위한 기본 API를 제공합니다.

## 설치 및 실행

### 전제 조건

- Node.js 18+
- npm 또는 yarn
- Google AI API 키

### 설치

```bash
npm install
```

### 환경 설정

`.env` 파일을 생성하고 다음 변수를 설정하세요:

```env
GOOGLE_AI_API_KEY=your_api_key_here
```

### 실행

개발 모드:

```bash
npm start
```

빌드:

```bash
npm run build
```

테스트 실행:

```bash
npm test
```

## 프로젝트 구조

```
apps/aim-hello-api/
├── src/
│   ├── api/               # API 엔드포인트
│   │   ├── hello-api.ts   # Hello API 핸들러
│   │   └── hello-api.spec.ts  # API 테스트
│   │
│   ├── service/           # 비즈니스 로직 서비스
│   │   ├── model.ts       # AI 모델 서비스
│   │   ├── service.ts     # 메인 서비스 로직
│   │   ├── types.ts       # 타입 정의
│   │   └── views.ts       # 응답 뷰 포맷터
│   │
│   ├── engine.ts          # AI 엔진 초기화
│   ├── express.ts         # Express 서버 설정
│   └── index.ts           # 애플리케이션 진입점
│
├── env/                   # 환경 설정 파일
│   └── none.yml
│
├── package.json           # 의존성 및 스크립트
├── tsconfig.json          # TypeScript 설정
├── tsconfig.build.json    # 빌드용 TypeScript 설정
├── jest.config.json       # Jest 테스트 설정
├── handler.js             # 서버리스 핸들러
└── dist/                  # 빌드 출력 디렉토리
```

### 주요 파일 설명

- **`src/api/hello-api.ts`** - AI 기반 Hello API 엔드포인트
- **`src/service/model.ts`** - Google Generative AI 모델 인터페이스
- **`src/service/service.ts`** - API 요청 처리 및 응답 생성
- **`src/engine.ts`** - AI 모델 초기화 및 설정
- **`handler.js`** - AWS Lambda 또는 서버리스 플랫폼용 핸들러

## API 엔드포인트

### GET /hello

간단한 인사말을 생성하는 AI 기반 엔드포인트입니다.

**응답 예시:**

```json
{
    "message": "Hello! How can I help you today?",
    "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 기술 스택

- **프레임워크**: Express.js
- **언어**: TypeScript
- **AI**: Google Generative AI (@google/generative-ai)
- **코어 라이브러리**: lemon-core
- **테스트**: Jest
- **빌드**: ttsc (TypeScript 컴파일러)

## 개발 가이드

### 코드 구조

1. **API 레이어** (`src/api/`): HTTP 요청/응답 처리
2. **서비스 레이어** (`src/service/`): 비즈니스 로직 및 AI 모델 호출
3. **엔진 레이어** (`src/engine.ts`): AI 모델 초기화 및 설정

### 테스트

```bash
# 단위 테스트 실행
npm test

# 테스트 감시 모드
npm run test:watch
```

### 배포

이 애플리케이션은 서버리스 플랫폼 (AWS Lambda, Vercel 등)에 배포할 수 있습니다. `handler.js` 파일이 서버리스 함수의 진입점입니다.

## 문제 해결

### 일반적인 문제

1. **API 키 오류**: `.env` 파일에 올바른 `GOOGLE_AI_API_KEY`가 설정되어 있는지 확인하세요.
2. **빌드 오류**: Node.js 버전이 18 이상인지 확인하세요.
3. **테스트 실패**: 모든 의존성이 올바르게 설치되었는지 확인하세요.

## 라이선스

이 프로젝트는 LICENSE 파일을 참조하세요.
