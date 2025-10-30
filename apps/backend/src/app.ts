import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import { ApiResponse, HelloResponse } from '@shared/types';
import mongoose from 'mongoose';
import { S3Client } from '@aws-sdk/client-s3';
import projectsRouter from './api/projects';
import deploymentsRouter from './api/deployments';

const app = express();

// 환경변수 사용 예제
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

console.log('📋 Backend 환경변수 설정:');
console.log(`  - PORT: ${PORT}`);
console.log(`  - NODE_ENV: ${NODE_ENV}`);
console.log(`  - FRONTEND_URL: ${FRONTEND_URL}`);
console.log(`  - LOG_LEVEL: ${LOG_LEVEL}`);
console.log('---');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/aim';

mongoose
    .connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB에 성공적으로 연결되었습니다.'))
    .catch(err => console.error('❌ MongoDB 연결 실패:', err));

const S3_REGION = process.env.S3_REGION || 'ap-northeast-2';
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;

if (!S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) {
    throw new Error(
        'S3 credentials are not configured. Please set S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY environment variables.',
    );
}

export const s3Client = new S3Client({
    region: S3_REGION,
    credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
    },
});

console.log('✅ S3 Client가 성공적으로 생성되었습니다.');

app.use(cors());
app.use(express.json());

app.use('/api', projectsRouter);
app.use('/api', deploymentsRouter);

app.get('/api/hello', (req, res) => {
    const response: ApiResponse<HelloResponse> = {
        success: true,
        data: {
            greeting: `Hello World from Backend! (환경: ${NODE_ENV})`,
            timestamp: new Date().toISOString(),
        },
        message: 'Hello World API 응답입니다.',
    };

    if (LOG_LEVEL === 'debug') {
        console.log(response);
    }
    res.json(response);
});

app.get('/', (req, res) => {
    res.json({
        message: '🚀 AIM Backend Server가 실행 중입니다!',
        environment: NODE_ENV,
        endpoints: {
            hello: '/api/hello',
        },
    });
});

export default app;
