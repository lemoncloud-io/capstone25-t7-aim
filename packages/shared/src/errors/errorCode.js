'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getMessageByCode = exports.ErrorCodeMetadata = exports.ErrorCode = void 0;
var ErrorCode;
(function (ErrorCode) {
    // General Errors (100-199)
    ErrorCode['REQUEST_BODY_UNREADABLE'] = 'AIMDEP00100';
    ErrorCode['JSON_PARSE_ERROR'] = 'AIMDEP00101';
    ErrorCode['INVALID_INPUT'] = 'AIMDEP00106';
    ErrorCode['NOT_FOUND'] = 'AIMDEP00105';
    // ... 기존 에러 코드 추가 (워크플로우 맞춤)
    ErrorCode['FAILED_TO_DECODE_BASE64'] = 'AIMDEP00102';
    ErrorCode['INVALID_ZIP_STRUCTURE'] = 'AIMDEP00103';
    ErrorCode['S3_UPLOAD_FAILED'] = 'AIMDEP00104';
    // AI Refactoring Errors (200-249)
    ErrorCode['AI_REFACTORING_FAILED'] = 'AIMDEP00200';
    ErrorCode['FRONTEND_EXTRACTION_FAILED'] = 'AIMDEP00201';
    ErrorCode['BACKEND_GENERATION_FAILED'] = 'AIMDEP00202';
    ErrorCode['AI_MODEL_ERROR'] = 'AIMDEP00203';
    // aim-hello-api Specific Errors (1200-1299)
    ErrorCode['AI_MODEL_UNAVAILABLE'] = 'AIMDEP01200';
    ErrorCode['LAMBDA_TIMEOUT'] = 'AIMDEP01201';
    // Deployment Errors (300-399)
    ErrorCode['LAMBDA_DEPLOYMENT_FAILED'] = 'AIMDEP00300';
    ErrorCode['S3_STATIC_HOSTING_FAILED'] = 'AIMDEP00301';
    ErrorCode['API_GATEWAY_CREATION_FAILED'] = 'AIMDEP00302';
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
// 에러 코드별 메타데이터
exports.ErrorCodeMetadata = {
    [ErrorCode.REQUEST_BODY_UNREADABLE]: { message: '요청을 처리할 수 없습니다.', httpStatus: 400 },
    [ErrorCode.JSON_PARSE_ERROR]: { message: 'JSON 파싱에 실패했습니다.', httpStatus: 500 },
    [ErrorCode.INVALID_INPUT]: { message: '입력 값이 유효하지 않습니다.', httpStatus: 400 },
    [ErrorCode.NOT_FOUND]: { message: '리소스를 찾을 수 없습니다.', httpStatus: 404 },
    [ErrorCode.FAILED_TO_DECODE_BASE64]: { message: 'Base64 디코딩에 실패했습니다.', httpStatus: 400 },
    [ErrorCode.INVALID_ZIP_STRUCTURE]: { message: '유효하지 않은 .zip 파일 구조입니다.', httpStatus: 400 },
    [ErrorCode.S3_UPLOAD_FAILED]: { message: 'S3 업로드에 실패했습니다.', httpStatus: 500 },
    [ErrorCode.AI_REFACTORING_FAILED]: { message: 'AI 리팩토링에 실패했습니다.', httpStatus: 500 },
    [ErrorCode.FRONTEND_EXTRACTION_FAILED]: { message: '프론트엔드 코드 추출에 실패했습니다.', httpStatus: 500 },
    [ErrorCode.BACKEND_GENERATION_FAILED]: { message: '벡엔드 코드 생성에 실패했습니다.', httpStatus: 500 },
    [ErrorCode.AI_MODEL_ERROR]: { message: 'AI 모델 호출에 실패했습니다.', httpStatus: 500 },
    [ErrorCode.AI_MODEL_UNAVAILABLE]: { message: 'AI 모델에 연결할 수 없습니다.', httpStatus: 500 },
    [ErrorCode.LAMBDA_TIMEOUT]: { message: 'Lambda 실행 시간이 초과되었습니다.', httpStatus: 504 },
    [ErrorCode.LAMBDA_DEPLOYMENT_FAILED]: { message: 'Lambda 배포에 실패했습니다.', httpStatus: 500 },
    [ErrorCode.S3_STATIC_HOSTING_FAILED]: { message: 'S3 정적 호스팅 배포에 실패했습니다.', httpStatus: 500 },
    [ErrorCode.API_GATEWAY_CREATION_FAILED]: { message: 'API Gateway 생성에 실패했습니다.', httpStatus: 500 },
};
const getMessageByCode = code => {
    const entry = Object.entries(exports.ErrorCodeMetadata).find(([key]) => key === code);
    return entry ? entry[1].message : `알 수 없는 에러 코드: ${code}`;
};
exports.getMessageByCode = getMessageByCode;
