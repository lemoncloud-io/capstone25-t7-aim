/**
 * `types.ts`
 * - basic types used in `proxy`
 *
 * **[WARNING!] exports priority**
 * 1. define data type in `types.ts` w/ internal types.
 * 2. define Model in `model.ts`
 * 3. define View/Body in `view.ts`, and external types.
 *
 * @author      Steve Jung <steve@lemoncloud.io>
 * @date        2025-10-10 initial version with `lemon-core#4.0.7`
 *
 * @copyright   (C) lemoncloud.io 2025 - All Rights Reserved. (https://eureka.codes)
 */

/**
 * Lookup Table
 *
 * WARN! DO NOT EXPORT AS `$LUT`. use default export instead.
 */
const $LUT = {
    /**
     * Possible type of model.
     */
    ModelType: {
        test: 'test',
    } as const,
};

/**
 * export as default.
 */
export default $LUT;

/**
 * Types for AI refactoring
 */
export interface RefactorAnalysis {
    needsRefactoring: boolean;
    appType: 'frontend-only' | 'backend-only' | 'fullstack';
    frameworks: string[];
    refactoringPlan: string;
}

export interface RefactoredStructure {
    apps: {
        frontend?: {
            files: Record<string, string>;
        };
        backend?: {
            files: Record<string, string>;
        };
    };
}

export interface RefactorResult {
    analysis: RefactorAnalysis;
    refactoredStructure: RefactoredStructure;
    status: 'refactoring_completed' | 'no_refactoring_needed';
    message: string;
    newS3Key?: string;
    localFilePath?: string;
}
