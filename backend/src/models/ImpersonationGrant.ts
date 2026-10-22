import mongoose, { Document, Schema, Types } from "mongoose";

export interface IImpersonationGrant extends Document {
  superId: Types.ObjectId;
  targetId: Types.ObjectId;
  reason: string;
  expiresAt: Date;
  endedAt?: Date | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const impersonationGrantSchema = new Schema<IImpersonationGrant>(
  {
    superId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    expiresAt: { type: Date, required: true, index: true },
    endedAt: { type: Date, default: null },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

impersonationGrantSchema.index({ superId: 1, active: 1 });

export default mongoose.model<IImpersonationGrant>(
  "ImpersonationGrant",
  impersonationGrantSchema,
);
