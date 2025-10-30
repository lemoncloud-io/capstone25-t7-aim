import { Schema, model, Document } from 'mongoose';

export interface IProject extends Document {
    name: string;
    description?: string;
    version?: string;
    tags?: string[];
    uploadedAt: Date; // 파일 업로드 시간
    createdAt: Date; // 프로젝트 생성 시간
    updatedAt: Date; // 마지막 업데이트 시간
    zipFileUrl: string;
    originalFileName: string;
    fileSize?: number; // 파일 크기 (bytes)
    status: 'analyzing' | 'deploying' | 'completed' | 'failed';
    buildSettings?: {
        buildCommand: string;
        outputDirectory: string;
        installCommand: string;
        runtime: string;
        memory: string;
        timeout: string;
    };
}

const projectSchema = new Schema<IProject>({
    name: { type: String, required: true },
    description: { type: String },
    version: { type: String, default: '1.0.0' },
    tags: [{ type: String }],
    uploadedAt: { type: Date, default: Date.now }, // 파일 업로드 시간
    createdAt: { type: Date, default: Date.now }, // 프로젝트 생성 시간
    updatedAt: { type: Date, default: Date.now }, // 마지막 업데이트 시간
    zipFileUrl: { type: String, required: true },
    originalFileName: { type: String, required: true },
    fileSize: { type: Number }, // 파일 크기 (bytes)
    status: { type: String, enum: ['analyzing', 'deploying', 'completed', 'failed'], default: 'analyzing' },
    buildSettings: {
        buildCommand: { type: String, default: 'npm run build' },
        outputDirectory: { type: String, default: 'dist' },
        installCommand: { type: String, default: 'npm install' },
        runtime: { type: String, default: 'nodejs20.x' },
        memory: { type: String, default: '1024' },
        timeout: { type: String, default: '30' },
    },
});

// updatedAt 필드 자동 업데이트
projectSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export const Project = model<IProject>('Project', projectSchema);
