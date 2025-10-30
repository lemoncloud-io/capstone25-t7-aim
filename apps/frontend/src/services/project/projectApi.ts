import { ProjectResponse, DeploymentResponse } from '@shared/types';
import { Project, Deployment } from '../../types';

// API 응답을 내부 타입으로 변환하는 유틸리티 함수들
export function convertProjectResponse(apiProject: ProjectResponse): Project {
    return {
        id: apiProject._id,
        name: apiProject.name,
        description: apiProject.description,
        version: apiProject.version,
        tags: apiProject.tags,
        status: apiProject.status,
        uploadedAt: new Date(apiProject.uploadedAt),
        createdAt: new Date(apiProject.createdAt),
        updatedAt: new Date(apiProject.updatedAt),
        zipFileUrl: apiProject.zipFileUrl,
        originalFileName: apiProject.originalFileName,
        fileSize: apiProject.fileSize,
        s3Url: apiProject.s3Url,
        buildSettings: apiProject.buildSettings,
        latestDeployment: apiProject.latestDeployment ? convertDeploymentResponse(apiProject.latestDeployment) : null,
    };
}

export function convertDeploymentResponse(apiDeployment: DeploymentResponse): Deployment {
    return {
        id: apiDeployment._id,
        projectId: apiDeployment.projectId,
        status: apiDeployment.status,
        frontendUrl: apiDeployment.frontendUrl,
        backendUrl: apiDeployment.backendUrl,
        errorMessage: apiDeployment.errorMessage,
        startedAt: new Date(apiDeployment.startedAt),
        completedAt: apiDeployment.completedAt ? new Date(apiDeployment.completedAt) : undefined,
    };
}

// 프로젝트 관련 API 함수들
export async function fetchProjects(): Promise<Project[]> {
    const response = await fetch('/api/projects');
    if (!response.ok) {
        throw new Error('Failed to fetch projects');
    }
    const data: ProjectResponse[] = await response.json();
    return data.map(convertProjectResponse);
}

export async function fetchProject(id: string): Promise<Project> {
    const response = await fetch(`/api/projects/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch project');
    }
    const data: ProjectResponse = await response.json();
    return convertProjectResponse(data);
}

export async function deleteProject(id: string): Promise<void> {
    const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete project');
    }
}

export async function createProject(
    fileName: string,
    projectName: string,
    fileData: string,
): Promise<{ projectId: string }> {
    const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            fileName,
            projectName,
            fileData,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to create project');
    }

    return await response.json();
}
