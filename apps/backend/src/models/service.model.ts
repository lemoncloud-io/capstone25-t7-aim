import { Schema, model, Document } from 'mongoose';

export interface IService extends Document {
    deploymentId: Schema.Types.ObjectId;
    type: 'FRONTEND' | 'BACKEND';
    framework: string;
    language: string;
    url: string;
    status: 'DEPLOYING' | 'RUNNING' | 'FAILED';
}

const serviceSchema = new Schema<IService>({
    deploymentId: { type: Schema.Types.ObjectId, ref: 'Deployment', required: true },
    type: { type: String, enum: ['FRONTEND', 'BACKEND'], required: true },
    framework: { type: String, required: true },
    language: { type: String, required: true },
    url: { type: String, required: true },
    status: { type: String, enum: ['DEPLOYING', 'RUNNING', 'FAILED'], default: 'DEPLOYING' },
});

export const Service = model<IService>('Service', serviceSchema);
