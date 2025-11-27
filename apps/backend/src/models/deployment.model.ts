import { Schema, model, Document } from 'mongoose';

export interface IDeployment extends Document {
    projectId: Schema.Types.ObjectId;
    s3Key: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';
    currentStep?: 'UPLOADING' | 'ANALYZING' | 'SPLITTING' | 'DEPLOYING_BACKEND' | 'DEPLOYING_FRONTEND' | 'FINALIZING';
    websiteUrl?: string;
    monorepoZipUrl?: string;
    eurekaDeploymentId?: string;
    errorMessage?: string;
    startedAt: Date;
    completedAt?: Date;
}

const deploymentSchema = new Schema<IDeployment>({
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    s3Key: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'SUCCESS', 'FAILED'], default: 'PENDING' },
    currentStep: {
        type: String,
        enum: ['UPLOADING', 'ANALYZING', 'SPLITTING', 'DEPLOYING_BACKEND', 'DEPLOYING_FRONTEND', 'FINALIZING'],
    },
    websiteUrl: { type: String },
    monorepoZipUrl: { type: String },
    eurekaDeploymentId: { type: String },
    errorMessage: { type: String },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
});

export const Deployment = model<IDeployment>('Deployment', deploymentSchema);
