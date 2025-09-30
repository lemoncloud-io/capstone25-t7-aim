# capstone25-t7-aim

## Prerequisite

시작하기 전에 다음이 설치되어 있는지 확인하세요:

- **Node.js** >= 22.x ([다운로드](https://nodejs.org/))
- **npm** >= 10.x 
- **Git** ([다운로드](https://git-scm.com/))

## Getting Started

1. **저장소 클론**
   ```bash
   git clone git@github.com:lemoncloud-io/capstone25-t7-aim.git
   cd capstone25-t7-aim
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **개발 서버 시작**
   ```bash
   npm start
   ```
    - 프론트엔드: http://localhost:5173
    - 백엔드 API: http://localhost:4000

## 프로젝트 구조

```
capstone25-t7-aim/
├── apps/
│   ├── frontend/          # React + Vite 애플리케이션
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   │
│   └── backend/           # Express API 서버
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   └── shared/            # 공유 타입과 유틸리티
│       ├── src/
│       │   ├── types.ts   # 공유 TypeScript 타입
│       │   └── utils.ts   # 공유 유틸리티 함수
│       └── package.json
│
└── package.json           # 루트 워크스페이스 설정
```

### 주요 디렉토리

- **`apps/frontend`** - Vite를 사용한 React 프론트엔드 애플리케이션
- **`apps/backend`** - Express.js REST API 서버
- **`packages/shared`** - 프론트엔드와 백엔드 간 공유 코드

## 💻 개발

### 개발 모드 시작하기

**프론트엔드와 백엔드 모두 시작:**
```bash
npm start
```

**개별 시작:**
```bash
# 프론트엔드만
npm run frontend

# 백엔드만
npm run backend
```

### 공유 코드 사용하기

앱에서 공유 타입과 유틸리티 임포트:

```typescript
import { ApiResponse } from '@shared/types'
import { createAsyncDelay } from '@shared/utils'
```

## 빌드

### 프로덕션 빌드

**모든 워크스페이스 빌드:**
```bash
npm run build
```

**개별 빌드:**
```bash
# 백엔드 빌드
npm run build:backend

# 프론트엔드 빌드
npm run build:frontend
```

### 빌드 결과물

- **프론트엔드**: `apps/frontend/dist/` - 배포 준비된 정적 파일
- **백엔드**: `apps/backend/dist/` - 컴파일된 JavaScript 파일

### 프로덕션 빌드 실행

**프로덕션 서버 시작:**
```bash
npm run start:prod
```

**또는 개별 실행:**
```bash
# 백엔드 프로덕션
npm run start:prod:backend

# 프론트엔드 프리뷰
npm run start:prod:frontend
```

## 테스트

### 테스트 실행

```bash
npm run test:backend
npm run test:frontend
```

## 코드 품질

### Linting

**모든 워크스페이스 린팅:**
```bash
npm run lint
```

**자동 수정:**
```bash
npm run lint:fix
```

### 포매팅

**코드 포맷팅:**
```bash
npm run format
```

**포맷 검사:**
```bash
npm run format:check
```

### 설정 파일

- **ESLint**: `.eslintrc.json` - TypeScript, Prettier 통합
- **Prettier**: `.prettierrc` - 일관된 코드 스타일

## 기술 스택

### 프론트엔드
- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빠른 빌드 도구 및 개발 서버
- **TailwindCSS** - 유틸리티 우선 CSS 프레임워크
- **Jest** - 테스팅 프레임워크

### 백엔드
- **Express.js** - 웹 프레임워크
- **TypeScript** - 타입 안정성
- **Node.js** - 런타임 환경
- **Jest** - 테스팅 프레임워크
- **Nodemon** - 개발 자동 재시작

### 공유
- **TypeScript** - 공유 타입 및 인터페이스
- **공통 유틸리티** - 재사용 가능한 함수

### 개발 도구
- **npm workspaces** - 모노레포 관리
- **ESLint** - 코드 린팅
- **Prettier** - 코드 포매팅
- **ts-node** - TypeScript 실행
- **concurrently** - 여러 명령어 동시 실행
