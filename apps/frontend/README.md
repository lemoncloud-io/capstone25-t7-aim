# Frontend

## 개요

이것은 AIM (Automated Infrastructure Management) 플랫폼의 프론트엔드 애플리케이션입니다. React와 TypeScript로 구축되었으며, 프로젝트 관리, 파일 업로드, 배포 파이프라인 모니터링을 위한 현대적인 웹 인터페이스를 제공합니다.

## 기술 스택

- **프레임워크**: React 18
- **언어**: TypeScript
- **빌드 도구**: Vite
- **스타일링**: Tailwind CSS
- **HTTP 클라이언트**: Axios
- **상태 관리**: React hooks
- **라우팅**: React Router (해당되는 경우)

## 기능

- **대시보드**: 프로젝트 및 배포 개요
- **프로젝트 관리**: 프로젝트 생성, 보기 및 관리
- **파일 업로드**: 배포를 위한 프로젝트 파일 업로드
- **배포 파이프라인**: 배포 단계 실시간 모니터링
- **설정**: 구성 및 환경 설정
- **반응형 디자인**: 모바일 친화적 인터페이스

## 설치

1. 프론트엔드 디렉토리로 이동:

    ```bash
    cd apps/frontend
    ```

2. 의존성 설치:
    ```bash
    npm install
    ```

## 실행

### 개발 모드

```bash
npm run dev
```

핫 모듈 교체로 개발 서버를 시작합니다.

### 프로덕션 빌드

```bash
npm run build
npm run preview
```

### Docker Compose로 실행 (프로젝트 루트에서)

```bash
docker compose up
```

## 개발

### 스크립트

- `npm run dev` - 개발 서버 시작
- `npm run build` - 프로덕션 빌드
- `npm run preview` - 프로덕션 빌드 미리보기
- `npm run test` - 테스트 실행
- `npm run lint` - ESLint 실행

### 테스트

```bash
npm run test
```

### 코드 품질

```bash
npm run lint
```

## 프로젝트 구조

## 프로젝트 구조

```
apps/frontend/
├── src/
│   ├── components/        # 재사용 가능한 UI 컴포넌트
│   │   ├── BuildLogs.tsx      # 배포 로그 표시 컴포넌트
│   │   ├── Dashboard.tsx      # 메인 대시보드
│   │   ├── DeploymentPipeline.tsx  # 배포 파이프라인 시각화
│   │   ├── FileDetails.tsx     # 파일 상세 정보
│   │   ├── FileUpload.tsx      # 파일 업로드 인터페이스
│   │   ├── Footer.tsx          # 푸터 컴포넌트
│   │   ├── ProjectCard.tsx     # 프로젝트 카드
│   │   ├── Settings.tsx        # 설정 페이지
│   │   └── TopBar.tsx          # 상단 네비게이션 바
│   │
│   ├── pages/             # 페이지 컴포넌트
│   │   ├── DeployPage.tsx      # 배포 페이지
│   │   ├── ProjectDetailPage.tsx  # 프로젝트 상세 페이지
│   │   ├── ProjectPage.tsx      # 프로젝트 목록 페이지
│   │   └── UploadPage.tsx       # 파일 업로드 페이지
│   │
│   ├── services/          # API 서비스 및 통신 로직
│   │   ├── deployment/
│   │   │   └── deploymentApi.ts  # 배포 관련 API 호출
│   │   └── project/
│   │       └── projectApi.ts     # 프로젝트 관련 API 호출
│   │
│   ├── assets/            # 정적 자산
│   │   └── react.svg      # React 로고
│   │
│   ├── App.tsx            # 메인 애플리케이션 컴포넌트
│   ├── main.tsx           # React 애플리케이션 진입점
│   ├── index.css          # 글로벌 스타일
│   ├── types.ts           # TypeScript 타입 정의
│   └── vite-env.d.ts      # Vite 환경 타입
│
├── public/                # 공개 정적 파일
│   └── vite.svg           # Vite 로고
│
├── package.json           # 의존성 및 스크립트
├── tsconfig.json          # TypeScript 설정
├── tsconfig.build.json    # 빌드용 TypeScript 설정
├── vite.config.ts         # Vite 설정
├── tailwind.config.js     # Tailwind CSS 설정
├── postcss.config.js      # PostCSS 설정
├── jest.config.ts         # Jest 테스트 설정
├── .env                   # 환경 변수
├── .env.example           # 환경 변수 예제
└── index.html             # HTML 템플릿
```

### 주요 컴포넌트 설명

- **`components/`** - UI 컴포넌트들
    - `FileUpload.tsx` - 드래그 앤 드롭 파일 업로드
    - `DeploymentPipeline.tsx` - 배포 진행 상태 시각화
    - `BuildLogs.tsx` - 실시간 로그 스트리밍
    - `ProjectCard.tsx` - 프로젝트 정보 카드

- **`pages/`** - 라우팅 페이지들
    - `ProjectPage.tsx` - 프로젝트 목록 및 생성
    - `DeployPage.tsx` - 배포 설정 및 실행
    - `ProjectDetailPage.tsx` - 프로젝트 상세 정보 및 로그

- **`services/`** - 백엔드 API와의 통신 로직
    - `deployment/deploymentApi.ts` - 배포 관련 API 호출
    - `project/projectApi.ts` - 프로젝트 관리 API 호출

- **스타일링**: Tailwind CSS를 사용한 유틸리티 기반 스타일링
- **상태 관리**: React hooks를 통한 로컬 상태 관리
- **API 통신**: Backend API와의 HTTP 통신

## 주요 컴포넌트

- **Dashboard**: 메인 개요 페이지
- **ProjectCard**: 프로젝트 목록 컴포넌트
- **FileUpload**: 파일 업로드 인터페이스
- **DeploymentPipeline**: 파이프라인 상태 시각화
- **TopBar**: 네비게이션 헤더
- **Footer**: 푸터 컴포넌트

## API 통합

프론트엔드는 서비스 레이어를 통해 백엔드 API와 통신합니다:

- `deploymentApi.ts` - 배포 관련 API 호출
- `projectApi.ts` - 프로젝트 관리 API 호출

## 스타일링

Tailwind CSS를 사용하여 유틸리티 우선 스타일링과 사용자 정의 컴포넌트 및 반응형 디자인 패턴을 사용합니다.
