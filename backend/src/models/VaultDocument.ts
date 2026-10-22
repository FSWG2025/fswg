import mongoose, { Document, Schema } from "mongoose";

export interface IVaultDocument extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  url: string;
  key?: string;
  size?: number;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const vaultDocumentSchema = new Schema<IVaultDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    key: { type: String },
    size: { type: Number },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IVaultDocument>("VaultDocument", vaultDocumentSchema);
