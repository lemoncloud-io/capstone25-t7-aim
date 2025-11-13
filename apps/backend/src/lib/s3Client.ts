import { S3Client } from '@aws-sdk/client-s3';

export const S3_BUCKET = process.env.S3_BUCKET || 'aim-deploy-bucket';
export const S3_REGION = process.env.S3_REGION || 'ap-northeast-2';

// LocalStack 사용 여부는 명시적 환경변수 USE_LOCALSTACK=true 로 제어합니다.
export const useLocalStack = process.env.USE_LOCALSTACK || 'true';

const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;

let s3Client: S3Client;

if (useLocalStack) {
    // LocalStack 사용 시
    s3Client = new S3Client({
        region: S3_REGION,
        endpoint: process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566',
        credentials: {
            accessKeyId: S3_ACCESS_KEY_ID || 'test',
            secretAccessKey: S3_SECRET_ACCESS_KEY || 'test',
        },
        forcePathStyle: true,
    });
    console.log('✅ S3 Client가 LocalStack 모드로 생성되었습니다.');
} else {
    // 실제 AWS S3 사용 시
    if (!S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) {
        throw new Error(
            'S3 credentials are not configured. Please set S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY environment variables for non-LocalStack environment.',
        );
    }

    s3Client = new S3Client({
        region: S3_REGION,
        credentials: {
            accessKeyId: S3_ACCESS_KEY_ID,
            secretAccessKey: S3_SECRET_ACCESS_KEY,
        },
    });
    console.log('✅ S3 Client가 AWS S3 모드로 성공적으로 생성되었습니다.');
}

// 생성된 클라이언트 인스턴스를 export
export { s3Client };
