import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the interface for the User document
interface client extends Document {
    name: string;
    mobileNumber: number;
    createdBy : mongoose.Schema.Types.ObjectId;
    organizationId: mongoose.Schema.Types.ObjectId;
    isDeleted: boolean;
    deletedBy : mongoose.Schema.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

// Define the schema
const clientSchema: Schema<client> = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        mobileNumber: {
            type: Number,
            required: true
        },
        createdBy : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'user',
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "organization",
            required: true,
            index: true
        },
        isDeleted: {
            type: Boolean,
            required: true
        },
        deletedBy : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'user',
        },
        createdAt: Date,
        updatedAt: Date
    },
    { timestamps: true, versionKey: false }
);

// Create and export the model
export const CLIENT: Model<client> = mongoose.model<client>('client', clientSchema);