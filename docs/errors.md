# 플랫폼 에러 코드 (자동화 배포)

- Date: 2025-10-31
- Version: v1.0.0

## Error Response (공통)

```typescript
export interface ErrorResponse {
    code: string;
    message: string;
}
```

## Error Codes by Workflow Step

### 1. Upload & File Processing (100-199)

| Error Code  | Error Message                       | HTTP Status |
| ----------- | ----------------------------------- | ----------- |
| AIMDEP00100 | 요청을 처리할 수 없습니다.          | 400         |
| AIMDEP00101 | 내부 서버 오류                      | 500         |
| AIMDEP00102 | JSON 파싱에 실패했습니다.           | 500         |
| AIMDEP00105 | 리소스를 찾을 수 없습니다.          | 404         |
| AIMDEP00106 | 입력 값이 유효하지 않습니다.        | 400         |
| AIMDEP00102 | Base64 디코딩에 실패했습니다.       | 400         |
| AIMDEP00103 | 유효하지 않은 .zip 파일 구조입니다. | 400         |
| AIMDEP00104 | S3 업로드에 실패했습니다.           | 500         |

### 2. AI Refactoring (200-249)

| Error Code  | Error Message                        | HTTP Status |
| ----------- | ------------------------------------ | ----------- |
| AIMDEP00200 | AI 리팩토링에 실패했습니다.          | 500         |
| AIMDEP00201 | 프론트엔드 코드 추출에 실패했습니다. | 500         |
| AIMDEP00202 | 벡엔드 코드 생성에 실패했습니다.     | 500         |

### 2.1 aim-hello-api Specific (1200-1299)

| Error Code  | Error Message                      | HTTP Status |
| ----------- | ---------------------------------- | ----------- |
| AIMDEP01200 | AI 모델에 연결할 수 없습니다.      | 500         |
| AIMDEP01201 | Lambda 실행 시간이 초과되었습니다. | 504         |

### 3. Deployment (300-399)

| Error Code  | Error Message                       | HTTP Status |
| ----------- | ----------------------------------- | ----------- |
| AIMDEP00300 | Lambda 배포에 실패했습니다.         | 500         |
| AIMDEP00301 | S3 정적 호스팅 배포에 실패했습니다. | 500         |
| AIMDEP00302 | API Gateway 생성에 실패했습니다.    | 500         |
