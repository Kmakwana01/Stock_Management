import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the interface for the Profile document
interface IProfile extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    firstName?: string;
    lastName?: string;
    profileImage?: string;
    mobileNumber?: number;
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Define the schema
const ProfileSchema: Schema<IProfile> = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
            index: true
        },
        firstName: {
            type: String,
            trim: true,
        },
        lastName: {
            type: String,
            trim: true,
        },
        profileImage: {
            type: String,
            trim: true
        },
        mobileNumber: {
            type: Number,
            trim: true
        },
        isDeleted: {
            type: Boolean,
            required: true
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
export const PROFILE: Model<IProfile> = mongoose.model<IProfile>('profile', ProfileSchema);
