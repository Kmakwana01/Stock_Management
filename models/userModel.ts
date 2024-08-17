import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the interface for the User document
interface IUser extends Document {
    userName: string;
    email: string;
    password: string;
    role: "owner" | "master" | "manager";
    organizationId: mongoose.Schema.Types.ObjectId;
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Define the schema
const UserSchema: Schema<IUser> = new Schema(
    {
        userName: {
            type: String
        },
        email: {
            type: String,
            // validate: {
            //     validator: function (v: string) {
            //         return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            //     },
            //     message: props => `${props.value} is not a valid email address!`
            // }
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true,
            enum: ["owner", "master", "manager"]
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
        createdAt: Date,
        updatedAt: Date
    },
    { timestamps: true, versionKey: false }
);

// Create and export the model
export const USER: Model<IUser> = mongoose.model<IUser>('user', UserSchema);
