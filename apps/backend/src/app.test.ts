import request from 'supertest';
import app from './app';
import { ApiResponse, HelloResponse } from '@shared/types';

describe('Express API Tests', () => {
    describe('GET /', () => {
        it('should return server status with correct structure', async () => {
            const response = await request(app).get('/').expect('Content-Type', /json/).expect(200);

            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('environment');
            expect(response.body).toHaveProperty('endpoints');
            expect(response.body.message).toContain('AIM Backend Server가 실행 중입니다!');
            expect(response.body.endpoints).toEqual({
                hello: '/api/hello',
            });
        });
    });

    describe('GET /api/hello', () => {
        it('should return hello response with correct status code', async () => {
            const response = await request(app).get('/api/hello').expect('Content-Type', /json/).expect(200);

            expect(response.body).toBeDefined();
        });

        it('should return ApiResponse with correct structure', async () => {
            const response = await request(app).get('/api/hello');
            const body = response.body as ApiResponse<HelloResponse>;

            expect(body).toHaveProperty('success');
            expect(body).toHaveProperty('data');
            expect(body).toHaveProperty('message');
            expect(body.success).toBe(true);
            expect(body.message).toBe('Hello World API 응답입니다.');
        });

        it('should return HelloResponse data with correct properties', async () => {
            const response = await request(app).get('/api/hello');
            const body = response.body as ApiResponse<HelloResponse>;

            expect(body.data).toHaveProperty('greeting');
            expect(body.data).toHaveProperty('timestamp');
        });
    });

    describe('404 Handling', () => {
        it('should return 404 for non-existent routes', async () => {
            await request(app).get('/api/nonexistent').expect(404);
        });
    });

    describe('CORS', () => {
        it('should have CORS enabled', async () => {
            const response = await request(app).get('/api/hello').expect(200);

            expect(response.headers).toHaveProperty('access-control-allow-origin');
        });
    });
});
