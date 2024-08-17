import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the interface for the JobPattern document
interface IJobPatternStatus extends Document {
    jobId: mongoose.Schema.Types.ObjectId;
    jobPatternId: mongoose.Schema.Types.ObjectId;
    processId: mongoose.Schema.Types.ObjectId;
    vendorId: mongoose.Schema.Types.ObjectId;
    status : string
    startDate?: Date;
    endDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

// Define the schema
const jobPatternSchema: Schema<IJobPatternStatus> = new Schema(
    {   
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "job",
            required: true,
            index: true
        },
        jobPatternId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "jobPattern",
            required: true,
            index: true
        },
        vendorId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'vendor',
            index : true,
            default : null
        },
        processId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "process",
            required: true,
            index: true
        },
        status: {
            type: String,
            required: true,
            enum: ["Complete", "Processing"]
        },
        startDate: Date,
        endDate: Date,
        createdAt: Date,
        updatedAt: Date,
    },
    { timestamps: true, versionKey: false }
);

// Create and export the model
export const JOB_PATTERN_STATUS: Model<IJobPatternStatus> = mongoose.model<IJobPatternStatus>('jobPatternStatus', jobPatternSchema);
