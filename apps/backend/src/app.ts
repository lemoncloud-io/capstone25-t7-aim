import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import { ApiResponse, HelloResponse } from '@shared/types';
import mongoose from 'mongoose';
import projectsRouter from './apis/projects';
import deploymentsRouter from './apis/deployments';
import { AimException, ErrorCode } from '@shared/errors';

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

console.log('✅ S3 Client가 성공적으로 생성되었습니다.');

app.use(cors());
app.use(express.json());

app.use('/api', projectsRouter);
app.use('/api', deploymentsRouter);

// 글로벌 에러 핸들링 미들웨어 (Express 5 네이티브 비동기 에러 처리)
app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err instanceof AimException) {
        const aimError = err as AimException;
        res.status(aimError.httpStatus).send(aimError.toErrorResponse());
    } else {
        // 알 수 없는 에러
        console.error('Unknown error:', err);
        const fallbackError = new AimException(ErrorCode.JSON_PARSE_ERROR);
        res.status(fallbackError.httpStatus).send(fallbackError.toErrorResponse());
    }
});

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
