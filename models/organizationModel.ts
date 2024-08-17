import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the interface for the Organization document
interface IOrganization extends Document {
    name: string;
    address: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// Define the schema
const organizationSchema: Schema<IOrganization> = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        createdAt: Date,
        updatedAt: Date
    },
    { timestamps: true, versionKey: false }
);

// Create and export the model
export const ORGANIZATION: Model<IOrganization> = mongoose.model<IOrganization>('organization', organizationSchema);
