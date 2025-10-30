import { BuildSettings } from '@shared/types';

export interface Project {
    id: string;
    name: string;
    description?: string;
    version?: string;
    tags?: string[];
    status: 'analyzing' | 'deploying' | 'completed' | 'failed';
    uploadedAt: Date; // 파일 업로드 시간
    createdAt: Date; // 프로젝트 생성 시간
    updatedAt: Date; // 마지막 업데이트 시간
    zipFileUrl: string;
    originalFileName: string;
    fileSize?: number; // 파일 크기 (bytes)
    s3Url?: string; // S3에 저장된 파일 URL
    buildSettings?: BuildSettings;
    latestDeployment?: Deployment | null;
}

export interface Deployment {
    deployedUrl: any;
    url: any;
    id: string;
    projectId: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';
    currentStep?: 'UPLOADING' | 'ANALYZING' | 'SPLITTING' | 'DEPLOYING_BACKEND' | 'DEPLOYING_FRONTEND' | 'FINALIZING';
    frontendUrl?: string;
    backendUrl?: string;
    errorMessage?: string;
    startedAt: Date; // 배포 시작 시간
    completedAt?: Date; // 배포 완료 시간
}

export interface Service {
    id: string;
    deploymentId: string;
    type: 'FRONTEND' | 'BACKEND';
    framework: string;
    language: string;
    url: string;
    status: 'DEPLOYING' | 'RUNNING' | 'FAILED';
}

export interface DeploymentStatusResponse {
    deploymentId: string;
    status: Deployment['status'];
    frontendUrl?: string;
    backendUrl?: string;
    errorMessage?: string;
}
