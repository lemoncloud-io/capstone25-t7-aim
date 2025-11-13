import * as fs from 'fs';
import * as path from 'path';

/**
 * .md 프롬프트 파일을 'aim-hello-api' 내부에서 읽어옵니다.
 * (process.cwd()가 '.../apps/aim-hello-api/'라고 가정)
 * @param filePath 'refactor/backend/SYSTEM.md'와 같은 상대 경로
 */
export const loadPromptFile = (filePath: string): string => {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
        console.error(`Prompt file not found at expected path: ${fullPath}`);
        throw new Error(`Prompt file not found: ${filePath}. Looked at: ${fullPath}`);
    }
    console.log(`Loading prompt file from: ${fullPath}`);
    return fs.readFileSync(fullPath, 'utf-8');
};

/**
 * camelCase 문자열을 dash-case로 변환합니다. (예: 'myFunction' -> 'my-function')
 */
export const camelToDash = (str: string): string => {
    if (!str) return '';
    return str.replace(/[A-Z]/g, (letter, index) => {
        return index === 0 ? letter.toLowerCase() : `-${letter.toLowerCase()}`;
    });
};

// --- [이식] lib/common.ts의 핵심 기능 (fileMap) ---
/**
 * refactor.ts가 코드를 저장/로드하는 기준이 되는 파일 맵
 * (lib/common.ts의 fileMap 로직)
 */
export const getFileMap = (scope: 'backend' | 'frontend'): Record<string, string> => {
    // 백엔드 기본값
    const fileMap: Record<string, string> = {
        serviceCode: 'apps/backend/src/services/geminiService.ts',
        typeCode: 'apps/backend/src/services/types.ts',
        apiCode: 'apps/backend/src/api/hello-api.ts',
        appCode: 'apps/frontend/src/App.tsx',
    };
    if (scope === 'frontend') {
        // lib/common.ts의 scope == 'frontend' 분기
        fileMap.serviceCode = 'apps/frontend/src/services/geminiService.ts';
        fileMap.typeCode = 'apps/frontend/src/types.ts';
    }
    return fileMap;
};

/**
 * [이식] lib/common.ts의 asFileName 기능
 * (예: "apps/backend/src/services/geminiService.ts" -> "serviceCode")
 */
const asFileName = (filePath: string, scope: 'backend' | 'frontend'): string => {
    const fileMap = getFileMap(scope);
    // fileMap에서 v(경로)를 기준으로 k(단축키)를 찾습니다.
    return Object.entries(fileMap).find(([, v]) => v === filePath)?.[0] || filePath;
};

/**
 * [완성] lib/common.ts의 parseResult 로직
 * AI가 반환한 Markdown 형식의 응답을 파싱합니다.
 * @returns Record<string, string> (예: { 'serviceCode': '// code' })
 */
export const parseAiResponse = (txt: any, scope: 'backend' | 'frontend'): Record<string, string> => {
    if (typeof txt !== 'string') return {};

    // @apps/... 형식으로 여러 파일이 반환된 경우 (lib/common.ts 로직)
    if (txt.startsWith('@apps/')) {
        // "@apps/"로 분리하고 다시 "@apps/"를 붙여 배열 생성
        // .slice(1)을 사용하여 split()으로 생긴 첫 번째 빈 문자열을 제거합니다.
        const arr = txt
            .split('@apps/')
            .slice(1)
            .map(part => `@apps/${part}`);

        const result: Record<string, string> = {};
        for (const part of arr) {
            const i = part.indexOf('\n');
            if (i === -1 || !part) continue;

            const file = part.substring(1, i).trim(); // 예: "apps/backend/src/services/geminiService.ts"
            const content = part.substring(i).trim(); // 예: "```typescript\n// code\n```"

            // 코드 블록만 추출 (lib/common.ts의 재귀 호출을 단순화/안정화)
            const codeMatch = content.match(/^```(?:typescript|ts)?\s*\n?([\s\S]*?\n?)```[\s\n]*$/);
            const code = codeMatch ? codeMatch[1].trim() : content;

            // 경로를 "serviceCode"와 같은 단축키로 변환
            const fileName = asFileName(file, scope); //
            result[fileName] = code;
        }
        return result;
    }

    // 단일 코드 블록이 반환된 경우 (예: prompt/ STEP1)
    try {
        const match = txt.match(/^```(?:typescript|ts)?\s*\n?([\s\S]*?\n?)```[\s\n]*$/);
        if (match) {
            return { code: match[1].trim() }; // 'code'라는 임시 키로 반환
        }
        return { code: txt }; // 코드 블록이 없으면 원본 텍스트 반환
    } catch (e) {
        console.error('! 파싱 오류:', e);
        return {};
    }
};
