export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}

export interface HelloResponse {
    greeting: string;
    timestamp: string;
}

export interface BuildSettings {
    framework?: string;
    language?: string;
    buildCommand?: string;
    installCommand?: string;
    outputDirectory?: string;
    runtime?: string;
    memory?: string;
    timeout?: string;
}

export interface ProjectResponse {
    _id: string;
    name: string;
    description?: string;
    version?: string;
    tags?: string[];
    status: 'analyzing' | 'deploying' | 'completed' | 'failed';
    uploadedAt: string; // API 응답에서는 string으로 올 수 있음
    createdAt: string;
    updatedAt: string;
    zipFileUrl: string;
    originalFileName: string;
    fileSize?: number;
    s3Url?: string;
    buildSettings?: BuildSettings;
    latestDeployment?: DeploymentResponse | null;
}

export interface DeploymentResponse {
    _id: string;
    projectId: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';
    currentStep?: 'UPLOADING' | 'ANALYZING' | 'SPLITTING' | 'DEPLOYING_BACKEND' | 'DEPLOYING_FRONTEND' | 'FINALIZING';
    frontendUrl?: string;
    backendUrl?: string;
    errorMessage?: string;
    startedAt: string;
    completedAt?: string;
}

export interface ServiceResponse {
    id: string;
    deploymentId: string;
    type: 'FRONTEND' | 'BACKEND';
    framework: string;
    language: string;
    url: string;
    status: 'DEPLOYING' | 'RUNNING' | 'FAILED';
}

export interface DeploymentStatusApiResponse {
    deploymentId: string;
    status: DeploymentResponse['status'];
    frontendUrl?: string;
    backendUrl?: string;
    errorMessage?: string;
}
