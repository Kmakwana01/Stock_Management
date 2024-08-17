import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the interface for the Sale document
interface ISale extends Document {
    patternId: mongoose.Schema.Types.ObjectId;
    soldById: mongoose.Schema.Types.ObjectId;
    organizationId: mongoose.Schema.Types.ObjectId;
    customerId: mongoose.Schema.Types.ObjectId;
    quantity: number;
    isDeleted: Boolean;
    date: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// Define the schema
const SaleSchema: Schema<ISale> = new Schema(
    {
        patternId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "pattern",
            required: true,
            index: true
        },
        soldById: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
            index: true
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "organization",
            required: true,
            index: true
        },
        quantity: {
            type: Number,
            required: true
        },
        date: {
            type: String
        },
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "customer",
            required: true,
            index: true
        },
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
export const SALE: Model<ISale> = mongoose.model<ISale>('sales', SaleSchema);
