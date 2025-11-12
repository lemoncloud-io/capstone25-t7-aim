/**
 * axios 에러 응답을 파싱하여 사람이 읽을 수 있는 로그 문자열로 만듭니다.
 */
export function formatErrorMessage(error: unknown, context: string): string {
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: unknown }; message?: string };
        const status = axiosError.response?.status;
        const data = axiosError.response?.data;
        let message = axiosError.message || 'Unknown error';
        if (typeof data === 'object' && data !== null) {
            const dataObj = data as Record<string, unknown>;
            message = (dataObj.message as string) || (dataObj.description as string) || message;
        }

        return `${context}: HTTP ${status} - ${message}`;
    }

    if (error instanceof Error) {
        return `${context}: ${error.message}`;
    }

    return `${context}: ${String(error)}`;
}
