import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the interface for the jobRole document
interface IJobRole extends Document {
    jobId: mongoose.Schema.Types.ObjectId;
    roleId: mongoose.Schema.Types.ObjectId;
    isDeleted: boolean;
    quantity: number;
    weightKg: number;
    weightGr: number;
    createdAt?: Date;
    updatedAt?: Date;
}

// Define the schema
const jobRoleSchema: Schema<IJobRole> = new Schema({

    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "job",
        required: true,
        index: true
    },
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "role",
        required: true,
        index: true
    },
    weightKg: {
        type: Number,
        required: true
    },
    weightGr: {
        type: Number,
        required: true
    },
    quantity: Number,
    isDeleted: { type: Boolean },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
    
}, { timestamps: true, versionKey: false });

// Create and export the model
export const JOB_ROLE: Model<IJobRole> = mongoose.model<IJobRole>('jobRole', jobRoleSchema);
