import { DeploymentResponse } from '@shared/types';
import { Deployment } from '../../types';

// API 응답을 내부 타입으로 변환하는 유틸리티 함수들
export function convertDeploymentResponse(apiDeployment: DeploymentResponse): Deployment {
    console.log('API Deployment Project ID:', apiDeployment);
    return {
        id: apiDeployment._id,
        projectId: apiDeployment.projectId,
        status: apiDeployment.status,
        currentStep: apiDeployment.currentStep,
        frontendUrl: apiDeployment.frontendUrl,
        backendUrl: apiDeployment.backendUrl,
        errorMessage: apiDeployment.errorMessage,
        startedAt: new Date(apiDeployment.startedAt),
        completedAt: apiDeployment.completedAt ? new Date(apiDeployment.completedAt) : undefined,
    };
}

// 배포 관련 API 함수들
export async function fetchDeployment(
    deploymentId: string,
): Promise<{ deployment: Deployment; logs: { message: string }[] }> {
    const response = await fetch(`/api/deployments/${deploymentId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch deployment data');
    }
    const data = await response.json();
    return {
        deployment: convertDeploymentResponse(data.deployment),
        logs: data.logs,
    };
}
