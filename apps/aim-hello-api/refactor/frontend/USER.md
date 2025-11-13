# 리팩토링 작업

파일 구조와 단계에 맞춰서, 최종 코드를 만들어 줍니다.

- `GoogleGenAI` 호출하는 부분은 백엔드 서버에서 처리하며, 이를 프론트엔드에서는 API로 호출하여 이용합니다.
- 이때 AIStudio 에서 만들어진 `geminiService.ts` 파일내 처리함수들을 서버와 통신하도록 리팩토링 합니다.

## Architecture

```txt
┌───────────────────────────────────────────────┐
│       Monorepo Root (npm workspace)           │
└───────────────────────────────────────────────┘
                      │
          ┌───────────┴────────────┐
          │                        │ 
          ▼                        ▼ 
  ┌──────────────────┐    ┌──────────────────┐
  │  backend         │    │  frontend        │
  │  lemon-core API  │◄───┤  React SPA       │
  │  Port: 8000      │    │  Port: 3000      │
  └──────────────────┘    └──────────────────┘
```

## 파일 구조 및 리팩토링 사항

| 작업 단계 | 파일 경로 (Source) | 작업 내용 |
|------|------------|-----------|
| **1** | `apps/frontend/src/services/geminiService.ts` | **(Service 시그니처 리팩토링)** 함수에 인풋 파라미터를 단일 객체(예시 `$body: { name: string }`)로 패키징시켜서 API 호출용 `$body`를 준비합니다. 그리고 리턴타입에 맞춘 API 호출로 변경합니다(단, 함수의 파라미터와 리턴 타입은 **절대** 변경하지 않습니다). (예시 `apiClient.post<ReturnType>(path, $body).then(R => R?.data)`). `GoogleGenAI` 실행은 백엔드에서 하므로, 여기에서는 `import { GoogleGenAI } from "@google/genai"` 를 포함한 관련된 코드를 정리해줍니다. |
| **2** | `apps/frontend/src/services/geminiService.ts` | **(API 연동작업)** 매칭되는 API HTTP Endpoint는  **`/hello/:id/generate`** 형식으로 지정합니다. `:id` 값은 `geminiService.ts`의 메인 함수명을 camelCase -> dash-case로 변환하여 사용합니다. body에서 필요한 값을 추출해 `$body` 객체를 생성하고, 이를 API 요청에 대한 body로 사용합니다. (예시: `apiClient.post<ReturnType>('/hello/say-hello/generate', $body)`) |

**[사전 검증 (Preflight) — 단계별 필수 조건 및 불충족 시 동작]**
● 1단계 (Service 리팩토링)

- **필수 파일:** `apps/frontend/src/services/geminiService.ts`  
- 파일이 존재하지 않거나 메인 함수 자체가 없으면 -> **아무것도 출력하지 않습니다.** (빈 응답)
- 헤더에 `import apiClient from '../api/axios'` 를 추가하여 API 요청 준비함.

- **선택 파일:** `apps/frontend/src/types.ts`  
- 파일이 존재하지 않는 경우 → **상단에 `./types` 타입 import 코드를 추가하지 않으며**, `$body` 구조 리팩토링만 수행합니다.
- `types.ts`은 참고용으로 원본 그대로 유지함 -> **아무것도 출력하지 않습니다.** (빈 응답)

- **선택 파일:** `apps/frontend/src/App.tsx`
- 보통은 `services/geminiService.ts`내의 함수 사용을 참고용을 -> **아무것도 출력하지 않습니다.** (빈 응답)

- **원본 함수 파라미터 검증:**  
- 절대! 원본 함수의 입력과 출력은 그대로 유지하여야 하며, `apiClient`를 이용한 호출로 변경합니다.
- `apiClient`의 호출시 응답 결과는 `data` 속성에 있음.

- **변경 필요성 검증:**  
- 타입 import 불필요 + `$body` 구조 리팩토링이 불필요한 경우 → **아무것도 변경하지 않고 기존 코드를 그대로 출력합니다.**

● 2단계 (API 연동작업)

- **전제 조건:**  
- 1단계에서 리팩토링된 `apps/frontend/src/services/geminiService.ts`의 **메인 함수 결과물**이 반드시 존재해야 합니다.  
- `geminiService.ts`가 없거나, `geminiService.ts`가 존재해도 이전 1단계의 결과 코드가 없는 경우(메인함수가 없는 경우),
    → `import`문을 포함하여 **API 작성 자체를 수행하지 않습니다.** (빈 응답)

- **연동작업 작성 목적:**  
- `@google/genai` 와 관련된 작업을 백엔드에서 처리하므로, 프론트에서는 http api 를 통해서 호출하는것으로 개선합니다.
- 연결할 Endpoint가 존재하지 않으면, **작성 목적이 성립하지 않으므로 아무것도 출력하지 않습니다.**

-------

## 기존 코드

다음은 리팩토링할 코드입니다. 위의 규칙에 따라 코드를 개선해주세요.

- 파일 경로에 `@`를 붙여서, 파일별로 코드 구분함.

@apps/frontend/src/types.ts

```typescript
{{{typeCode}}}
```

@apps/frontend/src/services/geminiService.ts

```typescript
{{{serviceCode}}}
```

@apps/frontend/src/App.tsx

```typescript
{{{appCode}}}
```
