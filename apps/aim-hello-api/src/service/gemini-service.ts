import { GoogleGenAI, GenerateContentParameters } from '@google/genai';
import axios from 'axios';
import JSZip from 'jszip';
import * as fs from 'fs';
import * as path from 'path';
import type { GeneratedContent } from './types';
import { AimException, ErrorCode } from '../../../../packages/shared/src/errors';
import * as yaml from 'js-yaml';
import { loadPromptFile, parseAiResponse, camelToDash, getFileMap } from '../utils';

// --- 환경 변수 및 AI 클라이언트 설정 ---
if (!process.env.GEMINI_API_KEY) {
    throw new AimException(ErrorCode.INVALID_INPUT, 'API_KEY environment variable not set');
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- 메인 서비스 함수 ---
export async function generateRefactoredCode($param: { s3Url: string }): Promise<GeneratedContent> {
    console.log('generateRefactoredCode starting (refactor-prepare.sh compatible)');
    try {
        // --- 1. Zip 로드 (사용자 S3 Zip + 로컬 템플릿 Zip) ---
        console.log('Step 1: Loading Template Zip and User Zip');
        const templateZipPath = path.join(process.cwd(), 'data', 'codes-monorepo-template.zip');
        const templateZipPromise = fs.promises
            .readFile(templateZipPath)
            .then(buffer => JSZip.loadAsync(new Uint8Array(buffer)));
        const userZipPromise = axios
            .get($param.s3Url, { responseType: 'arraybuffer' })
            .then(response => JSZip.loadAsync(new Uint8Array(response.data)));
        const [templateZip, userZip] = await Promise.all([templateZipPromise, userZipPromise]);
        let templateRootPath = '';
        const templateFiles = Object.keys(templateZip.files);
        if (templateFiles.length > 0 && templateFiles[0].endsWith('/')) {
            templateRootPath = templateFiles[0];
            console.log(`Template Zip root path detected: ${templateRootPath}`);
        }

        // --- 2. [수정됨] 컨텍스트 추출 (prepare.sh 기준) ---
        console.log('Step 2: Extracting original files from User Zip (prepare.sh logic)');
        const frontendRootFiles: { path: string; content: string }[] = [];
        const frontendSrcFiles: { path: string; content: string }[] = [];
        const backendSrcFiles: { path: string; content: string }[] = []; // [신규] backend/utils용

        let originalServiceCode: string | null = null;
        let originalTypeCode: string | null = null;
        let originalAppCode: string | null = null;
        let originalMetadataJson: Record<string, any> | null = null;
        let originalPackageName: string | null = null; // [신규] package.json의 name 저장

        // [수정] refactor-prepare.sh가 복사하는 Root 파일 목록 (index.html만)
        const userZipRootFiles = new Set([
            'index.html', //
        ]);

        for (const [filePath, file] of Object.entries(userZip.files)) {
            if (file.dir) continue;
            const content = await file.async('text');

            if (filePath === 'services/geminiService.ts') {
                originalServiceCode = content;
                frontendSrcFiles.push({ path: 'services/geminiService.ts', content }); //
            } else if (filePath === 'types.ts') {
                originalTypeCode = content;
                frontendSrcFiles.push({ path: 'types.ts', content }); //
            } else if (filePath === 'metadata.json') {
                try {
                    originalMetadataJson = JSON.parse(content);
                } catch (e) {
                    console.warn('Could not parse metadata.json. Using default empty object.', e);
                    originalMetadataJson = {}; // 기본값 설정
                }
                frontendSrcFiles.push({ path: 'metadata.json', content }); //
            } else if (filePath === 'package.json') {
                try {
                    const packageJson = JSON.parse(content);
                    originalPackageName = packageJson.name || null;
                    console.log(`Found package.json name: ${originalPackageName}`);
                } catch (e) {
                    console.warn('Could not parse package.json.', e);
                }
                // (주의) prepare.sh 기준에 따라 이 파일은 복사하지 않으므로, srcFiles에 push하지 않습니다.
            } else if (userZipRootFiles.has(filePath)) {
                frontendRootFiles.push({ path: filePath, content }); // index.html
            }
            // [신규] utils/ 복사 로직 (BE/FE)
            else if (filePath.startsWith('utils/')) {
                const utilPath = filePath.substring(6); // 'utils/' 제거
                frontendSrcFiles.push({ path: `utils/${utilPath}`, content }); //
                backendSrcFiles.push({ path: `utils/${utilPath}`, content }); //
            }
            // [신규] App.tsx, components/, constants.ts, index.tsx 등
            else if (
                filePath.startsWith('components/') || //
                filePath === 'constants.ts' || //
                filePath === 'App.tsx' || //
                filePath === 'index.tsx' || //
                filePath.startsWith('src/') // 기타 src/ 파일들
            ) {
                let srcPath = filePath;
                if (filePath.startsWith('src/')) {
                    srcPath = filePath.substring(4); // 'src/' 접두사 제거
                }

                frontendSrcFiles.push({ path: srcPath, content });
                if (filePath === 'App.tsx' || filePath === 'src/App.tsx') {
                    originalAppCode = content;
                }
            }
            // 그 외 (package.json, vite.config.ts 등)은 prepare.sh에 없으므로 무시
        }

        if (!originalServiceCode) {
            throw new AimException(ErrorCode.INVALID_INPUT, 'services/geminiService.ts not found in zip file.');
        }

        // --- 3. [수정됨] 컨텍스트 추출 (템플릿 Zip) ---
        console.log('Step 3: Loading context from Template Zip');
        // [제거됨] backendPort 읽기 로직
        const apiTemplateFile = templateZip.file(templateRootPath + 'apps/backend/src/api/hello-api.ts');
        if (!apiTemplateFile) {
            throw new AimException(ErrorCode.INVALID_INPUT, 'hello-api.ts not found in template zip.');
        }
        const apiCodeTemplate = await apiTemplateFile.async('text');

        // --- 4. 정보 추출 ---
        console.log('Step 4: Extracting API Path ID');
        const funcNameMatch = originalServiceCode.match(/export (?:async )?(?:function|const)\s+([\w]+)\s*(?:=|\(|:)/);
        if (!funcNameMatch || !funcNameMatch[1]) {
            throw new AimException(ErrorCode.INVALID_INPUT, 'Main function name not found in gemini-service.ts');
        }
        const apiPathId = camelToDash(funcNameMatch[1]);
        console.log('API Path ID extracted:', apiPathId);

        // --- 5. AI 호출 1: 백엔드 ---
        console.log('Step 5.1: Starting AI Call 1 (Backend)');
        const beSystemPrompt = loadPromptFile('refactor/backend/SYSTEM.md');
        let beUserPrompt = loadPromptFile('refactor/backend/USER.md');

        beUserPrompt = beUserPrompt
            .replace('{{{serviceCode}}}', `\n${originalServiceCode}\n`)
            .replace('{{{typeCode}}}', `\n${originalTypeCode || ''}\n`)
            .replace('{{{apiCode}}}', `\n${apiCodeTemplate}\n`);

        const beParams: GenerateContentParameters = {
            model: 'gemini-2.5-flash',
            contents: beUserPrompt,
            config: { systemInstruction: beSystemPrompt, temperature: 0.8, topP: 0.95 },
        };

        const beResult = await ai.models.generateContent(beParams);
        const beResponseText = beResult.text.trim();
        if (!beResponseText) {
            throw new AimException(ErrorCode.AI_MODEL_ERROR, 'AI response (Backend) is empty.');
        }
        const backendFiles = parseAiResponse(beResponseText, 'backend');
        console.log(`Step 5.2: AI Call 1 (Backend) complete. Found keys: ${Object.keys(backendFiles).join(', ')}`);

        // --- 6. AI 호출 2: 프론트엔드 ---
        console.log('Step 6.1: Starting AI Call 2 (Frontend)');
        const feSystemPrompt = loadPromptFile('refactor/frontend/SYSTEM.md');
        let feUserPrompt = loadPromptFile('refactor/frontend/USER.md');

        feUserPrompt = feUserPrompt
            .replace('{{{apiPathId}}}', apiPathId)
            .replace('{{{serviceCode}}}', `\n${originalServiceCode}\n`)
            .replace('{{{typeCode}}}', `\n${originalTypeCode || ''}\n`)
            .replace('{{{appCode}}}', `\n${originalAppCode || ''}\n`);

        const feParams: GenerateContentParameters = {
            model: 'gemini-2.5-flash',
            contents: feUserPrompt,
            config: { systemInstruction: feSystemPrompt, temperature: 0.8, topP: 0.95 },
        };

        const feResult = await ai.models.generateContent(feParams);
        const feResponseText = feResult.text.trim();
        if (!feResponseText) {
            throw new AimException(ErrorCode.AI_MODEL_ERROR, 'AI response (Frontend) is empty.');
        }
        const frontendFiles = parseAiResponse(feResponseText, 'frontend');
        console.log(`Step 6.2: AI Call 2 (Frontend) complete. Found keys: ${Object.keys(frontendFiles).join(', ')}`);

        // --- 7. [수정됨] Zip 병합 (AI 결과 + prepare.sh 백엔드 복사) ---
        console.log('Step 7: Merging generated code into template Zip');

        // [FIX] AI가 쓴 파일의 '상대 경로'를 추적 (예: 'App.tsx')
        const aiWrittenRelativePaths = new Set<string>();

        const beFileMap = getFileMap('backend');
        const feFileMap = getFileMap('frontend');

        // 7.1. 백엔드 파일 덮어쓰기 (AI 생성)
        if (backendFiles.serviceCode) {
            // [수정] Flash 모델이 SYSTEM.md의 './types' 지침을 어기고
            // '../types'로 잘못 생성하는 경우를 대비한 강제 수정 로직 (사용자 요청)
            const correctedServiceCode = backendFiles.serviceCode.replace(
                /from\s+['"]\.\.\/types['"]/g, // AI가 실수로 만든 경로
                "from './types'", // SYSTEM.md가 지시한 올바른 경로
            );

            const beSvcPath = templateRootPath + beFileMap.serviceCode;
            templateZip.file(beSvcPath, correctedServiceCode); // 수정된 코드를 씀
            console.log(`Writing BE file to zip: ${beSvcPath} (Path corrected for Flash model)`);
        }

        if (backendFiles.apiCode) {
            const beApiPath = templateRootPath + beFileMap.apiCode;
            templateZip.file(beApiPath, backendFiles.apiCode);
            console.log(`Writing BE file to zip: ${beApiPath}`);
        }

        // 7.2. 프론트엔드 파일 덮어쓰기 (AI 생성)
        if (frontendFiles.serviceCode) {
            const feSvcPath = templateRootPath + feFileMap.serviceCode;
            templateZip.file(feSvcPath, frontendFiles.serviceCode);
            console.log(`Writing FE file to zip: ${feSvcPath}`);

            // [FIX] 8.1단계의 file.path와 일치하는 키를 Set에 추가
            aiWrittenRelativePaths.add('services/geminiService.ts');
        }

        // 7.3. types.ts 복사 (refactor-prepare.sh [3/4], [4/4] 역할)
        if (originalTypeCode) {
            const beTypePath = templateRootPath + beFileMap.typeCode; // apps/backend/src/services/types.ts
            templateZip.file(beTypePath, originalTypeCode);
            console.log(`Copied original types.ts to: ${beTypePath}`);

            const feTypePath = templateRootPath + feFileMap.typeCode; // apps/frontend/src/types.ts
            templateZip.file(feTypePath, originalTypeCode);
            console.log(`Copied original types.ts to: ${feTypePath}`);
        }

        // 7.4. 백엔드 의존성 추가 (@google/genai) (refactor-prepare.sh [1/4] 역할)
        const bePkgPath = templateRootPath + `apps/backend/package.json`;
        const bePkgFile = templateZip.file(bePkgPath);
        if (bePkgFile) {
            try {
                const bePkgJson = JSON.parse(await bePkgFile.async('text'));
                if (!bePkgJson.dependencies) bePkgJson.dependencies = {};
                if (!bePkgJson.dependencies['@google/genai']) {
                    bePkgJson.dependencies['@google/genai'] = '1.29.0';
                    templateZip.file(bePkgPath, JSON.stringify(bePkgJson, null, 2));
                    console.log('Added @google/genai to backend package.json');
                }
            } catch (e) {
                console.error('Error modifying backend package.json:', e);
            }
        }

        // 7.5. [수정됨] 환경 변수(none.yml) 설정 (사용자 요청 "필수 로직")
        if (originalMetadataJson && originalMetadataJson.geminiApiKey) {
            const backendEnvPath = templateRootPath + `apps/backend/env/none.yml`;
            const envFile = templateZip.file(backendEnvPath);
            if (envFile) {
                try {
                    const envData: any = yaml.load(await envFile.async('text'));
                    if (envData && envData.local) {
                        envData.local.GEMINI_API_KEY = originalMetadataJson.geminiApiKey;
                        if (envData.dev) envData.dev.GEMINI_API_KEY = originalMetadataJson.geminiApiKey;
                        if (envData.prod) envData.prod.GEMINI_API_KEY = originalMetadataJson.geminiApiKey;
                        templateZip.file(backendEnvPath, yaml.dump(envData, { indent: 2, lineWidth: -1 }));
                        console.log('Set GEMINI_API_KEY in backend none.yml (Logical Fix)');
                    }
                } catch (e) {
                    console.error('Error modifying none.yml:', e);
                }
            }
        }

        // 7.6. [신규] 백엔드 utils 복사 (refactor-prepare.sh [4/4] 역할)
        backendSrcFiles.forEach(file => {
            // file.path는 'utils/myUtil.ts'
            const finalBeSrcPath = templateRootPath + `apps/backend/src/${file.path}`;
            templateZip.file(finalBeSrcPath, file.content);
            console.log(`Copying user BE src file to: ${finalBeSrcPath}`);
        });

        // --- 8. [수정됨] Zip 병합 (사용자 파일 이식 - refactor-prepare.sh [4/4] 역할) ---
        console.log('Step 8: Merging user files into template Zip (prepare.sh FE copy)');

        // 8.1. 사용자 Src 파일 이식 (App.tsx, components/, metadata.json 등)
        frontendSrcFiles.forEach(file => {
            // file.path는 'App.tsx', 'components/Btn.tsx', 'metadata.json', 'services/geminiService.ts' 등

            // [FIX] 7.2단계에서 AI가 이미 이 파일을 썼다면, 원본 파일로 덮어쓰지 않음
            if (aiWrittenRelativePaths.has(file.path)) {
                console.log(`Skipping copy of ${file.path}, AI version already written.`);
                return; // 다음 파일로
            }

            // 원본 types.ts 파일은 건너뜁니다 (7.3단계에서 이미 복사됨).
            if (file.path === 'types.ts') {
                console.log(`Skipping user file (already handled): ${file.path}`);
                return;
            }

            let content = file.content;

            // 2단계에서 'src/'를 제거했으므로, 다시 붙여서 템플릿 경로와 조합
            const finalSrcPath = templateRootPath + `apps/frontend/src/${file.path}`;
            templateZip.file(finalSrcPath, content);
            console.log(`Copying user src file to: ${finalSrcPath}`);
        });

        // 8.2. 사용자 Root 파일 이식 (index.html만)
        for (const file of frontendRootFiles) {
            let content = file.content;
            const targetPath = templateRootPath + `apps/frontend/${file.path}`;

            if (file.path === 'index.html') {
                //
                // refactor-prepare.sh의 sed 명령어 구현
                content = content.replace(/<script\s+type="importmap">[\s\S]*?<\/script>/, '');
                content = content
                    .replace(/src="\/index.tsx"/g, 'src="/src/index.tsx"') //
                    .replace(/src="index.tsx"/g, 'src="/src/index.tsx"') //
                    .replace(/src="\.\/index.tsx"/g, 'src="/src/index.tsx"'); //
                console.log('Fixed index.html paths (sed replacement)');
            }
            // [제거됨] package.json 병합 로직 (prepare.sh에 없음)
            // [제거됨] vite.config.ts 수정 로직 (prepare.sh에 없음)

            templateZip.file(targetPath, content);
            console.log(`Copying user root file to: ${targetPath}`);
        }

        // --- 9. 최종 반환 ---
        console.log('Step 9: Generating final monorepoFiles array');
        const monorepoFiles: { path: string; content: string }[] = [];
        for (const [relativePath, file] of Object.entries(templateZip.files)) {
            if (!file.dir) {
                const content = await file.async('text');
                monorepoFiles.push({ path: relativePath, content });
            }
        }

        // 디버깅용 Zip 파일 저장
        const zip = new JSZip();
        monorepoFiles.forEach(file => zip.file(file.path, file.content));
        const zipBuffer = await zip.generateAsync({ type: 'uint8array' });

        // 'tmp/refactored' 디렉토리가 aim-hello-api 내부에 있어야 함
        const zipLogDir = path.join(process.cwd(), 'tmp', 'refactored');
        if (!fs.existsSync(zipLogDir)) {
            fs.mkdirSync(zipLogDir, { recursive: true });
        }
        const zipPath = path.join(zipLogDir, 'monorepo.zip');
        fs.writeFileSync(zipPath, zipBuffer);
        console.log(`Zip file saved for logging: ${zipPath}, File count: ${monorepoFiles.length}`);

        console.log('generateRefactoredCode finished successfully.');
        return {
            monorepoFiles,
            packageName: originalPackageName,
        };
    } catch (error) {
        console.error('Error in generateRefactoredCode:', error);
        throw error;
    }
}
