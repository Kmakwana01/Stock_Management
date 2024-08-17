import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the interface for the Role document
interface IRole extends Document {
    jobId: mongoose.Schema.Types.ObjectId;
    clientId: mongoose.Schema.Types.ObjectId;
    colorId: mongoose.Schema.Types.ObjectId;
    organizationId: mongoose.Schema.Types.ObjectId;
    weightKg: number;
    weightGr: number;
    quantity: number;
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Define the schema
const RoleSchema: Schema<IRole> = new Schema(
    {
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "job",
            // required: true,
            index: true
        },
        clientId : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "client",
            // required: true,
            index: true
        },
        colorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "color",
            required: true,
            index: true
        },
        organizationId : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "organization",
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
        quantity : Number,
        isDeleted : Boolean,
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
export const ROLE: Model<IRole> = mongoose.model<IRole>('role', RoleSchema);
