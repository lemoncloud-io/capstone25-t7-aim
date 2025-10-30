import { Deployment, IDeployment } from '../models/deployment.model';
import { Project } from '../models/project.model';
import { processDeploymentJob } from './deploymentWorker';

/**
 * 배포 작업 큐 서비스
 *
 * 현재 구현: MongoDB 기반으로 배포 작업 상태 관리
 * - 개발 편의성과 단순성을 위해 DB만 사용
 * - 배포 작업을 비동기로 처리하고 DB에 상태 저장
 *
 * 향후 개선: Redis + BullMQ 기반으로 변경 가능
 * - 대규모 동시 배포 요청 처리 시 Redis 도입
 * - BullMQ를 사용한 작업 큐 관리로 성능 최적화
 * - 분산 시스템에서의 작업 스케줄링 개선
 */

export const addDeploymentJob = async (data: { projectId: string; s3Key: string }) => {
    // DB에 배포 작업 생성 (상태: 'PENDING')
    const deployment = await Deployment.create({
        status: 'PENDING',
        ...data,
    });

    // 비동기로 배포 작업 실행 (논블로킹)
    processDeploymentJobAsync(deployment);

    return (deployment._id as string).toString();
};

// 비동기 작업 처리 (백그라운드)
const processDeploymentJobAsync = async (deployment: IDeployment): Promise<void> => {
    try {
        // 상태 업데이트: IN_PROGRESS
        await Deployment.findByIdAndUpdate(deployment._id as string, {
            status: 'IN_PROGRESS',
            currentStep: 'UPLOADING', // 초기 단계 설정
        });

        // 프로젝트 상태도 업데이트: deploying
        await Project.findByIdAndUpdate(deployment.projectId, {
            status: 'deploying',
            updatedAt: new Date(),
        });

        // 배포 작업 실행
        await processDeploymentJob(deployment);

        // 상태 업데이트: SUCCESS
        await Deployment.findByIdAndUpdate(deployment._id as string, {
            status: 'SUCCESS',
            updatedAt: new Date(),
        });

        // 프로젝트 상태도 업데이트: completed
        await Project.findByIdAndUpdate(deployment.projectId, {
            status: 'completed',
            updatedAt: new Date(),
        });
    } catch (error) {
        // 상태 업데이트: FAILED
        await Deployment.findByIdAndUpdate(deployment._id as string, {
            status: 'FAILED',
            updatedAt: new Date(),
        });

        // 프로젝트 상태도 업데이트: failed
        await Project.findByIdAndUpdate(deployment.projectId, {
            status: 'failed',
            updatedAt: new Date(),
        });

        console.error(`Deployment ${deployment._id as string} has failed: ${(error as Error).message}`);
    }
};
/**
 * 향후 Redis + BullMQ 마이그레이션:
 *
 * import { Queue, Worker } from 'bullmq';
 *
 * const connection = {
 *   host: process.env.REDIS_HOST || 'localhost',
 *   port: parseInt(process.env.REDIS_PORT || '6379', 10),
 * };
 *
 * export const deploymentQueue = new Queue('deployment-queue', { connection });
 *
 * const worker = new Worker('deployment-queue', async (job) => {
 *   await processDeploymentJob(job.data);
 * }, { connection });
 *
 * worker.on('completed', (job) => {
 *   console.log(`${job.id} has completed!`);
 * });
 *
 * worker.on('failed', (job, err) => {
 *   console.log(`${job.id} has failed with ${err.message}`);
 * });
 */
