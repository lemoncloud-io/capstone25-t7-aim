import { ErrorCode, ErrorCodeMetadata } from './errorCode';
import { ApiErrorPayload } from '../types';

/**
 * 표준화된 에러를 throw하기 위한 커스텀 예외 클래스.
 */
export class AimException extends Error {
    public readonly httpStatus: number;
    public readonly code: string;
    public readonly description: string;
    public readonly details?: unknown;

    /**
     * @param errorCode ErrorCode enum 값
     * @param details 추가적인 에러 세부 정보 (옵션)
     */
    constructor(errorCode: ErrorCode, details?: unknown) {
        const metadata = ErrorCodeMetadata[errorCode];
        if (!metadata) {
            throw new Error(`Unknown error code: ${errorCode}`);
        }

        // Error.message 부모 속성에 description을 전달
        super(metadata.message);

        // 에러 이름(name)을 클래스 이름으로 설정 (스택 트레이스 가독성)
        Object.setPrototypeOf(this, AimException.prototype);
        this.name = 'AimException';

        // ErrorCodeMetadata에서 조회한 값 설정
        this.httpStatus = metadata.httpStatus;
        this.code = errorCode;
        this.description = metadata.message;
        this.details = details;
    }

    /**
     * 프론트엔드로 전송할 ApiErrorPayload DTO를 생성합니다.
     * @returns {ApiErrorPayload}
     */
    toErrorResponse(): ApiErrorPayload {
        return {
            code: this.code,
            description: this.description,
        };
    }
}
