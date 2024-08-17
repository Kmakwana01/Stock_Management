import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the interface for the JobPattern document
interface IJobPattern extends Document {
    patternId: mongoose.Schema.Types.ObjectId;
    jobId: mongoose.Schema.Types.ObjectId;
    piece: number;
    createdAt?: Date;
    updatedAt?: Date;
}

// Define the schema
const jobPatternSchema: Schema<IJobPattern> = new Schema(
    {
        patternId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "pattern",
            required: true,
            index: true
        },
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "job",
            required: true,
            index: true
        },
        piece: {
            type: Number,
            trim: true
        },
        createdAt: Date,
        updatedAt: Date
    },
    { timestamps: true, versionKey: false }
);

// Create and export the model
export const JOB_PATTERN: Model<IJobPattern> = mongoose.model<IJobPattern>('jobPattern', jobPatternSchema);
