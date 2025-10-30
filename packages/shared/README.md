# Shared Package

프로젝트 전체에서 공유되는 타입 정의, 유틸리티 함수 및 공통 인터페이스를 제공하는 패키지입니다.

## 개요

이 패키지는 Lemon Cloud 플랫폼의 여러 애플리케이션(frontend, backend, aim-hello-api)에서 공통으로 사용되는 코드와 타입을 모아둔 공유 라이브러리입니다. 코드 중복을 방지하고 일관성을 유지하기 위해 사용됩니다.

## 설치

이 패키지는 npm workspace를 통해 자동으로 연결됩니다. 별도의 설치가 필요하지 않습니다.

## 프로젝트 구조

```
packages/shared/
├── src/
│   ├── index.ts       # 메인 익스포트 파일
│   ├── types.ts       # 공통 타입 정의
│   └── utils.ts       # 유틸리티 함수들
│
├── package.json       # 패키지 설정
└── tsconfig.json      # TypeScript 설정
```

### 주요 파일 설명

- **`src/types.ts`** - 프로젝트 전체에서 사용되는 TypeScript 타입 및 인터페이스
- **`src/utils.ts`** - 공통 유틸리티 함수 (포맷팅, 검증, 변환 등)
- **`src/index.ts`** - 모든 익스포트를 통합하는 진입점

## 사용법

### 타입 임포트

```typescript
import { Project, Deployment, ApiResponse } from 'shared';
```

### 유틸리티 함수 사용

```typescript
import { formatDate, validateEmail } from 'shared';
```

## 개발 가이드

### 새로운 타입 추가

1. `src/types.ts`에 타입 정의 추가
2. `src/index.ts`에서 익스포트
3. 사용하는 애플리케이션에서 임포트하여 사용

### 새로운 유틸리티 함수 추가

1. `src/utils.ts`에 함수 구현
2. `src/index.ts`에서 익스포트
3. 필요한 애플리케이션에서 임포트하여 사용

## 기술 스택

- **언어**: TypeScript
- **패키지 관리**: npm workspaces
- **빌드**: TypeScript 컴파일러

## 주의사항

- 이 패키지는 `private: true`로 설정되어 있어 외부 배포되지 않습니다.
- 모든 변경사항은 프로젝트 전체에 영향을 미칠 수 있으므로 신중하게 검토하세요.
- 타입 변경 시 모든 사용하는 애플리케이션의 컴파일을 확인하세요.
