import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the interface for the Color document
interface IMenu extends Document {
    name  : string;
    organizationId : mongoose.Schema.Types.ObjectId;
    isDeleted: Boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Define the schema
const colorSchema: Schema<IMenu> = new Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organization",
        required: true,
        index: true
    },
    name : String,
    isDeleted: { type: Boolean },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true, versionKey: false });

// Create and export the model
export const MENU: Model<IMenu> = mongoose.model<IMenu>('menu', colorSchema);
