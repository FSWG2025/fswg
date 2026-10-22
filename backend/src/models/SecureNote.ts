import mongoose, { Document, Schema } from "mongoose";

export interface ISecureNote extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const secureNoteSchema = new Schema<ISecureNote>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: false,
      maxlength: 200,
      default: "",
    },
    body: {
      type: String,
      default: "",
      maxlength: 50000,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISecureNote>("SecureNote", secureNoteSchema);
