import mongoose, { Document, Schema, Model } from 'mongoose';

interface IMaking extends Document {
    organizationId: mongoose.Schema.Types.ObjectId;
    jobPatternId: mongoose.Schema.Types.ObjectId;
    workerId: mongoose.Schema.Types.ObjectId;
    machineId: mongoose.Schema.Types.ObjectId;
    createdBy: mongoose.Schema.Types.ObjectId;
    pieces: Number;
    isDeleted: Boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Define the schema
const makingSchema: Schema<IMaking> = new Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organization",
        required: true,
        index: true
    },
    jobPatternId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "jobPattern",
        required: true,
        index: true
    },
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "workers",
        required: true,
        index: true
    },
    machineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "machine",
        required: true,
        index: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        index: true
    },
    pieces : Number,
    isDeleted: { type: Boolean },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true, versionKey: false });

// Create and export the model
export const MAKING: Model<IMaking> = mongoose.model<IMaking>('making', makingSchema);
