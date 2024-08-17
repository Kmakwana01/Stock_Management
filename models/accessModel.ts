import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the interface for the Color document
interface IAccess extends Document {
    userId : mongoose.Schema.Types.ObjectId;
    menuId : mongoose.Schema.Types.ObjectId;
    read: Boolean;
    write: Boolean;
    isDeleted: Boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Define the schema
const colorSchema: Schema<IAccess> = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        index: true
    },
    menuId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "menu",
        required: true,
        index: true
    },
    read: Boolean,
    write: Boolean,
    isDeleted: Boolean ,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true, versionKey: false });

// Create and export the model
export const ACCESS: Model<IAccess> = mongoose.model<IAccess>('access', colorSchema);
