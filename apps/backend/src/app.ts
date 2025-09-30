import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import { ApiResponse, HelloResponse } from '@shared/types';

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

app.use(cors());
app.use(express.json());

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
