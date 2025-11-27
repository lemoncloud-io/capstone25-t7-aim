import { Project, IProject } from '../models/project.model';
import { Deployment, IDeployment } from '../models/deployment.model';
import { ProjectResponse, DeploymentResponse } from '@shared/types';
import { Document } from 'mongoose';
import { AimException, ErrorCode } from '@shared/errors';

// --- DTO 변환 헬퍼 ---
type ProjectDoc = Document & IProject;
type DeploymentDoc = Document & IDeployment;

/** Mongoose 문서를 DeploymentResponse DTO로 변환합니다. */
function mapToDeploymentResponse(doc: DeploymentDoc): DeploymentResponse {
    const obj = doc.toObject();
    return {
        id: obj._id.toString(),
        projectId: obj.projectId.toString(),
        status: obj.status,
        currentStep: obj.currentStep,
        websiteUrl: obj.websiteUrl,
        errorMessage: obj.errorMessage,
        startedAt: obj.startedAt.toISOString(),
        completedAt: obj.completedAt ? obj.completedAt.toISOString() : undefined,
    };
}

/** Mongoose 문서를 ProjectResponse DTO로 변환합니다. */
function mapToProjectResponse(projectDoc: ProjectDoc, latestDeployment: DeploymentResponse | null): ProjectResponse {
    const projectObj = projectDoc.toObject();
    return {
        id: projectObj._id.toString(),
        name: projectObj.name,
        description: projectObj.description,
        version: projectObj.version,
        tags: projectObj.tags,
        status: projectObj.status,
        uploadedAt: projectObj.uploadedAt.toISOString(),
        createdAt: projectObj.createdAt.toISOString(),
        updatedAt: projectObj.updatedAt.toISOString(),
        zipFileUrl: projectObj.zipFileUrl,
        originalFileName: projectObj.originalFileName,
        fileSize: projectObj.fileSize,
        s3Url: projectObj.zipFileUrl, // Assuming s3Url is the same as zipFileUrl
        buildSettings: projectObj.buildSettings
            ? {
                  framework: projectObj.buildSettings.framework,
                  language: projectObj.buildSettings.language,
                  buildCommand: projectObj.buildSettings.buildCommand,
                  installCommand: projectObj.buildSettings.installCommand,
                  outputDirectory: projectObj.buildSettings.outputDirectory,
                  runtime: projectObj.buildSettings.runtime,
                  memory: projectObj.buildSettings.memory,
                  timeout: projectObj.buildSettings.timeout,
              }
            : undefined,
        latestDeployment: latestDeployment,
    };
}

// --- Repository 객체 ---
export const projectRepository = {
    async getAllProjects(): Promise<ProjectResponse[]> {
        const projects = await Project.find().sort({ uploadedAt: -1 });

        const projectsWithDeployment = await Promise.all(
            projects.map(async project => {
                const latestDeploymentDoc = await Deployment.findOne({ projectId: project._id })
                    .sort({ startedAt: -1 })
                    .select('_id status websiteUrl startedAt completedAt projectId currentStep errorMessage');

                const latestDeployment = latestDeploymentDoc ? mapToDeploymentResponse(latestDeploymentDoc) : null;

                return mapToProjectResponse(project, latestDeployment);
            }),
        );

        return projectsWithDeployment;
    },

    async getProjectById(id: string): Promise<ProjectResponse> {
        const project = await Project.findById(id);
        if (!project) {
            throw new AimException(ErrorCode.NOT_FOUND);
        }

        const latestDeploymentDoc = await Deployment.findOne({ projectId: project._id })
            .sort({ startedAt: -1 })
            .select('_id status websiteUrl startedAt completedAt projectId currentStep errorMessage');

        const latestDeployment = latestDeploymentDoc ? mapToDeploymentResponse(latestDeploymentDoc) : null;

        return mapToProjectResponse(project, latestDeployment);
    },

    async deleteProjectById(id: string): Promise<void> {
        const result = await Project.findByIdAndDelete(id);
        if (!result) {
            throw new AimException(ErrorCode.NOT_FOUND);
        }
    },

    async createProject(data: {
        name: string;
        description?: string;
        version?: string;
        tags?: string[];
        zipFileUrl: string;
        originalFileName: string;
        fileSize?: number;
    }): Promise<string> {
        const project = new Project({
            name: data.name,
            description: data.description || '',
            version: data.version || '1.0.0',
            tags: data.tags || [],
            zipFileUrl: data.zipFileUrl,
            originalFileName: data.originalFileName,
            fileSize: data.fileSize,
        });
        await project.save();
        return project.id;
    },
};
