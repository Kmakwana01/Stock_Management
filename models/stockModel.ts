import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the interface for the Pattern document
interface IStockList extends Document {
    patternId:  mongoose.Schema.Types.ObjectId;
    organizationId: mongoose.Schema.Types.ObjectId;
    pieces: Number;
    isDeleted: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// Define the schema
const patternSchema: Schema<IStockList> = new Schema(
    {
        patternId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "pattern",
            required: true,
            index: true
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "organization",
            required: true,
            index: true
        },
        pieces: {
            type: Number
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

export const STOCK : Model<IStockList> = mongoose.model<IStockList>('stocks', patternSchema);
