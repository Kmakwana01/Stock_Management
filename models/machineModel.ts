import mongoose, { Document, Schema, Model } from 'mongoose';

interface IMachine extends Document {
    name: string;
    organizationId: mongoose.Schema.Types.ObjectId;
    isDeleted: Boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Define the schema
const machineSchema: Schema<IMachine> = new Schema({
    name: { type: String, required: true },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organization",
        required: true,
        index: true
    },
    isDeleted: { type: Boolean },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true, versionKey: false });

// Create and export the model
export const MACHINE: Model<IMachine> = mongoose.model<IMachine>('machine', machineSchema);
