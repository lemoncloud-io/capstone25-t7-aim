import { ProjectResponse } from '@shared/types';
import { getData, postData, deleteData } from '../utils/api';

const API_BASE_URL = '/api';

// 프로젝트 관련 API 함수들
export async function fetchProjects(): Promise<ProjectResponse[]> {
    const response = await getData(API_BASE_URL, 'projects');
    return response.data;
}

export async function fetchProject(id: string): Promise<ProjectResponse> {
    const response = await getData(API_BASE_URL, `projects/${id}`);
    return response.data;
}

export async function deleteProject(id: string): Promise<void> {
    await deleteData(API_BASE_URL, `projects/${id}`);
}

export async function createProject(
    fileName: string,
    projectName: string,
    fileData: string,
): Promise<{ projectId: string }> {
    const body = {
        fileName,
        projectName,
        fileData,
    };
    const response = await postData(API_BASE_URL, 'projects', body);
    return response.data;
}
