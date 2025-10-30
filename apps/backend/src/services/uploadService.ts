import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const S3_BUCKET = process.env.S3_BUCKET || 'aim-deploy-bucket';
const S3_REGION = process.env.S3_REGION || 'ap-southeast-2';

// LocalStack 사용 여부는 명시적 환경변수 USE_LOCALSTACK=true 로 제어합니다.
// 기본값은 실제 AWS S3를 사용합니다.
const useLocalStack = process.env.USE_LOCALSTACK === 'true';

let s3Client = new S3Client({
    region: S3_REGION,
    // LocalStack을 사용할 때만 endpoint/credentials/forcePathStyle를 설정합니다.
    ...(useLocalStack
        ? {
              endpoint: process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566',
              credentials: {
                  accessKeyId: process.env.S3_ACCESS_KEY_ID || 'test',
                  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'test',
              },
              forcePathStyle: true,
          }
        : {}),
});

// If not using LocalStack but the project provides S3-specific env vars (S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY),
// recreate the client with those credentials so .env files using S3_* variables work.
if (!useLocalStack && (process.env.S3_ACCESS_KEY_ID || process.env.S3_SECRET_ACCESS_KEY)) {
    const accessKey = process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
    const secretKey = process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
    if (accessKey && secretKey) {
        s3Client = new S3Client({
            region: S3_REGION,
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
            },
        });
    }
}

export const uploadToS3 = async (base64Data: string, fileName: string) => {
    const key = `${uuidv4()}-${fileName}`;

    // Base64 데이터를 Buffer로 변환
    const buffer = Buffer.from(base64Data, 'base64');

    const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: 'application/zip', // ZIP 파일로 가정
    });

    try {
        await s3Client.send(command);
        console.log(`✅ File uploaded to S3: ${key}`);
        return { key };
    } catch (error) {
        console.error('❌ S3 upload failed:', error);
        throw error;
    }
};

export const generateReadOnlyUrl = async (s3Key: string) => {
    const command = new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: s3Key,
    });

    // 읽기용 URL 생성
    const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600, // 1시간 동안 유효
    });

    // LocalStack을 사용할 때 로컬 호스트로 접근할 수 있도록 호스트 교체가 필요할 수 있습니다.
    const finalSignedUrl = useLocalStack ? signedUrl.replace('localstack:4566', 'localhost:4566') : signedUrl;

    return { signedUrl: finalSignedUrl };
};
