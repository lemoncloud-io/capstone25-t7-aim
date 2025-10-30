import { Schema, model, Document } from 'mongoose';

export interface ILog extends Document {
    deploymentId: Schema.Types.ObjectId;
    timestamp: Date;
    message: string;
}

const logSchema = new Schema<ILog>({
    deploymentId: { type: Schema.Types.ObjectId, ref: 'Deployment', required: true },
    timestamp: { type: Date, default: Date.now },
    message: { type: String, required: true },
});

export const Log = model<ILog>('Log', logSchema);
