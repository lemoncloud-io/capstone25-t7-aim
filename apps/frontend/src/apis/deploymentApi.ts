import { DeploymentResponse } from '@shared/types';
import { getData } from '../utils/api';

const API_BASE_URL = '/api';

// 상태 체크 API 응답 타입
export interface DeploymentStatusResponse {
    status: 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';
    currentStep?: 'UPLOADING' | 'ANALYZING' | 'SPLITTING' | 'DEPLOYING_BACKEND' | 'DEPLOYING_FRONTEND' | 'FINALIZING';
    projectId: string;
    frontendUrl?: string;
    backendUrl?: string;
}

// 배포 관련 API 함수들
export async function fetchDeployment(
    deploymentId: string,
): Promise<{ deployment: DeploymentResponse; logs: { message: string }[] }> {
    const response = await getData(API_BASE_URL, `deployments/${deploymentId}`);
    return {
        deployment: response.data.deployment,
        logs: response.data.logs,
    };
}

// 상태 체크 전용 API - 배포 상태만 빠르게 확인
export async function fetchDeploymentStatus(deploymentId: string): Promise<DeploymentStatusResponse> {
    const response = await getData(API_BASE_URL, `deployments/${deploymentId}/status`);
    return response.data;
}
