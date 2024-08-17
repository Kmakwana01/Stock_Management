import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the interface for the JobStatus document
interface IJobStatus extends Document {
    jobId: mongoose.Schema.Types.ObjectId;
    processId?: mongoose.Schema.Types.ObjectId;
    vendorId?: mongoose.Schema.Types.ObjectId;
    status: 'Complete' | 'Processing';
    createdAt?: Date;
    updatedAt?: Date;
}

// Define the schema
const jobStatusSchema: Schema<IJobStatus> = new Schema(
    {
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "job",
            required: true,
            index: true
        },
        processId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "process",
            index: true
        },
        vendorId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'vendor',
            index : true,
            default : null
        },
        status: {
            type: String,
            required: true,
            enum: ["Complete", "Processing"]
        },
        createdAt: Date,
        updatedAt: Date
    },
    { timestamps: true, versionKey: false }
);

// Create and export the model
export const JOB_STATUS: Model<IJobStatus> = mongoose.model<IJobStatus>('jobStatus', jobStatusSchema);
