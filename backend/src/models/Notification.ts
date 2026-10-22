import mongoose, { Document, Schema } from "mongoose";

export type NotificationType =
  | "consultation"
  | "rental"
  | "insurance"
  | "wealth"
  | "system"
  | "learning"
  | "network";

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  read: boolean;
  sourceKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ["consultation", "rental", "insurance", "wealth", "system", "learning", "network"],
      default: "system",
    },
    link: {
      type: String,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    sourceKey: {
      type: String,
      trim: true,
      index: true,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, sourceKey: 1 }, { unique: true, sparse: true });
notificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model<INotification>("Notification", notificationSchema);
