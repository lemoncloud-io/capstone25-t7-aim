import { Log } from '../models/log.model';
import { generateReadOnlyUrl, uploadProduct, uploadToS3 } from './uploadService';
import axios from 'axios';
import { IDeployment, Deployment } from '../models/deployment.model';
import { AimException, ErrorCode } from '@shared/errors';
import { formatErrorMessage } from '../utils/formatErrorMessage';
import JSZip from 'jszip';

const AIM_HELLO_API_URL = process.env.AIM_HELLO_API_URL || 'http://localhost:8000';

/**
 * 배포 작업 처리 함수
 *
 * 현재 구현: MongoDB 기반으로 배포 작업 처리
 * - DB에서 배포 데이터를 직접 받아 처리
 * - 배포 상태를 DB에 저장
 *
 * 향후 개선: Redis + BullMQ 기반으로 변경 가능
 * - Job 타입으로 변경
 * - 작업 큐에서 Job 데이터 받기
 */
export const processDeploymentJob = async (deployment: IDeployment) => {
    const { s3Key } = deployment;

    const log = async (message: string) => {
        const newLog = new Log({
            deploymentId: deployment._id as string,
            message,
        });
        await newLog.save();
        console.log(`[Deployment ${deployment._id as string}] ${message}`);
    };

    // Initialize framework variables (for future use)
    // const frontendFramework: string | null = null;
    // const backendFramework: string | null = null;

    try {
        // File Upload 단계
        await Deployment.updateOne({ _id: deployment._id }, { $set: { currentStep: 'UPLOADING' } });
        const updatedDeployment1 = await Deployment.findById(deployment._id);
        await log(`File Upload - currentStep set to: ${updatedDeployment1?.currentStep}`);

        // Analyzing 단계
        await Deployment.updateOne({ _id: deployment._id }, { $set: { currentStep: 'ANALYZING' } });
        const updatedDeployment2 = await Deployment.findById(deployment._id);
        await log(`Refactoring code with AI - currentStep set to: ${updatedDeployment2?.currentStep}`);

        // Generate pre-signed URL for AI analysis service
        const { signedUrl } = await generateReadOnlyUrl(s3Key);
        await log(`Generated pre-signed URL for AI analysis`);

        // Send pre-signed URL to AI analysis service
        let analyzeResponse;
        try {
            analyzeResponse = await axios.post(`${AIM_HELLO_API_URL}/hello/refactor-code/gemini`, { s3Url: signedUrl });
        } catch (axiosError) {
            const errorDetails = formatErrorMessage(axiosError, 'AI analysis service failed');
            console.error(errorDetails);
            throw new AimException(ErrorCode.AI_MODEL_UNAVAILABLE, errorDetails);
        }
        const analysisResult = analyzeResponse.data;

        // Check if monorepoFiles exist
        if (analysisResult.monorepoFiles && analysisResult.monorepoFiles.length > 0) {
            await log('Monorepo files generated successfully. Creating ZIP and uploading to S3.');

            // Create ZIP from monorepoFiles
            const zip = new JSZip();
            analysisResult.monorepoFiles.forEach((file: { path: string; content: string }) => {
                zip.file(file.path, file.content);
            });
            const zipBuffer = await zip.generateAsync({ type: 'uint8array' });
            const zipBase64 = Buffer.from(zipBuffer).toString('base64');

            // [수정] packageName을 사용하여 baseTitle 정의
            const baseTitle = analysisResult.packageName || `monorepo-${deployment._id as string}`;

            // [신규] 1. 'uploadProduct' API (운영)에 사용할 title (확장자 없음)
            // API 명세(image_dc2ffb.png)에 따라 package.json의 name을 그대로 사용
            const productTitle = baseTitle;

            // [신규] 2. 'uploadToS3' (개발)에 사용할 fileName (확장자 포함)
            // S3 Key는 파일명을 명시하는 것이 좋으므로 .zip을 포함
            const productFileName = `${baseTitle}.zip`;

            await log(`Using productTitle (for Prod API): ${productTitle}`);
            await log(`Using productFileName (for Dev S3): ${productFileName}`);

            let s3Uri: string; // 최종 URL을 저장할 변수

            // NODE_ENV 값에 따라 업로드 로직 분기
            if (process.env.NODE_ENV === 'production') {
                // --- 1. 운영 환경: 실제 Product API로 업로드 ---

                await log('Production environment. Uploading to real Product API...');
                const response = await uploadProduct({
                    data: zipBase64,
                    title: productTitle,
                });
                s3Uri = response.s3Uri;
                await log(`ZIP uploaded to Product API. s3Uri: ${s3Uri}`);
            } else {
                // --- 2. 테스트/개발 환경: 예전 S3(LocalStack) 로직으로 업로드 ---
                await log(`[MOCK] Development environment. Uploading to internal S3 (LocalStack)...`);

                // 1. S3에 업로드
                const { key } = await uploadToS3(zipBase64, productFileName);
                await log(`ZIP uploaded to S3 with key: ${key}`);

                // 2. S3 URL 생성
                const { signedUrl } = await generateReadOnlyUrl(key);
                s3Uri = signedUrl; // s3Uri 변수에 할당
                await log(`Generated signed URL for ZIP: ${s3Uri}`);
            }

            // Deployment DB에 monorepoZipUrl 필드를 새 s3Uri로 업데이트
            await Deployment.updateOne({ _id: deployment._id }, { $set: { monorepoZipUrl: s3Uri } });
        } else {
            await log('No monorepo files generated.');
        } // Check if refactoring was successful
        if (analysisResult.monorepoFiles && analysisResult.monorepoFiles.length > 0) {
            await log('Code refactoring completed successfully.');
        } else {
            await log('Code refactoring may have issues.');
        }

        // Extract analysis data (for future use)
        // const analysis = analysisResult.analysis || analysisResult;

        // Splitting 단계
        await Deployment.updateOne({ _id: deployment._id }, { $set: { currentStep: 'SPLITTING' } });
        const updatedDeployment3 = await Deployment.findById(deployment._id);
        await log(`Splitting Frontend & Backend - currentStep set to: ${updatedDeployment3?.currentStep}`);
        // This is a conceptual step, no actual code needed for this simulation

        // Deploying Backend 단계
        await Deployment.updateOne({ _id: deployment._id }, { $set: { currentStep: 'DEPLOYING_BACKEND' } });
        const updatedDeployment4 = await Deployment.findById(deployment._id);
        await log(`Deploying Backend to AWS Lambda - currentStep set to: ${updatedDeployment4?.currentStep}`);

        // TODO: Implement actual AWS Lambda deployment
        // 1. Create Lambda function from backend code
        // 2. Set up API Gateway for the Lambda
        // 3. Configure environment variables
        // For now, simulate deployment with LocalStack

        const backendUrl = `https://${deployment._id}-backend.lambda-url.us-east-1.on.aws/`;

        // Simulate deployment delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        await log(`Backend deployed successfully at ${backendUrl}`);

        // Update deployment with backend URL
        await Deployment.updateOne({ _id: deployment._id }, { $set: { backendUrl } });

        // Deploying Frontend 단계
        await Deployment.updateOne({ _id: deployment._id }, { $set: { currentStep: 'DEPLOYING_FRONTEND' } });
        const updatedDeployment5 = await Deployment.findById(deployment._id);
        await log(`Deploying Frontend to AWS S3 - currentStep set to: ${updatedDeployment5?.currentStep}`);

        // TODO: Implement actual AWS S3 static website hosting
        // 1. Build frontend application
        // 2. Upload build artifacts to S3 bucket
        // 3. Configure S3 for static website hosting
        // 4. Set up CloudFront CDN (optional)
        // For now, simulate deployment with LocalStack

        const frontendUrl = `https://${deployment._id}-frontend.s3-website-us-east-1.amazonaws.com/`;

        // Simulate deployment delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        await log(`Frontend deployed successfully at ${frontendUrl}`);

        // Update deployment with frontend URL
        await Deployment.updateOne({ _id: deployment._id }, { $set: { frontendUrl } });

        // Finalizing 단계
        await Deployment.updateOne({ _id: deployment._id }, { $set: { currentStep: 'FINALIZING' } });
        const updatedDeployment6 = await Deployment.findById(deployment._id);
        await log(`Finalizing Deployment - currentStep set to: ${updatedDeployment6?.currentStep}`);
        // Deployment status update will be handled in queueService
        await log('Deployment completed successfully.');
    } catch (error) {
        console.error(error);
        if (error instanceof AimException) {
            const aimError = error as AimException;
            await log(`Deployment failed: ${aimError.message}`);
        } else {
            await log(`Deployment failed: ${String(error)}`);
        }
        throw error; // Re-throw to let queueService handle status update
    }
};
