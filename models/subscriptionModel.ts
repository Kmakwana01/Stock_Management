import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the interface for the Subscription document
interface ISubscription extends Document {
    userId?: mongoose.Schema.Types.ObjectId;
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
    price?: string;
    durationInDays?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

// Define the schema
const SubscriptionSchema: Schema<ISubscription> = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        subscriptionStartDate: {
            type: Date,
        },
        subscriptionEndDate: {
            type: Date,
        },
        price: {
            type: String,
        },
        durationInDays: {
            type: Number,
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
export const SUBSCRIPTION: Model<ISubscription> = mongoose.model<ISubscription>('subscription', SubscriptionSchema);
