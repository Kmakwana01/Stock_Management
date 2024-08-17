import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the interface for the Process document
interface IProcess extends Document {
    name: string;
    organizationId: mongoose.Schema.Types.ObjectId;
    isDeleted: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// Define the schema
const processSchema: Schema<IProcess> = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "organization",
            required: true,
            index: true
        },
        isDeleted: {
            type: String
        },
        createdAt: {
            type: Date,
        },
        updatedAt: {
            type: Date,
        }
    },
    { timestamps: true, versionKey: false }
);

// Create and export the model
export const PROCESS: Model<IProcess> = mongoose.model<IProcess>('process', processSchema);
