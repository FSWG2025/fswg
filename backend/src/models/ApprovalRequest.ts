import mongoose, { Document, Schema } from "mongoose";

export const APPROVAL_ACTION_TYPES = [
  "rental_approve",
  "rental_reject",
  "advisor_approve",
  "advisor_reject",
  "advisor_enroll",
  "user_delete",
  "user_role_change",
  "user_deactivate",
] as const;

export type ApprovalActionType = (typeof APPROVAL_ACTION_TYPES)[number];

export const APPROVAL_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
] as const;

export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export interface IApprovalRequest extends Document {
  type: ApprovalActionType;
  resourceType: string;
  resourceId: string;
  title: string;
  summary: string;
  payload: Record<string, any>;
  requestedBy: mongoose.Types.ObjectId;
  status: ApprovalStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewNote?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const approvalRequestSchema = new Schema<IApprovalRequest>(
  {
    type: {
      type: String,
      enum: APPROVAL_ACTION_TYPES,
      required: true,
      index: true,
    },
    resourceType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    resourceId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    payload: {
      type: Schema.Types.Mixed,
      default: {},
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: APPROVAL_STATUSES,
      default: "pending",
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewNote: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

approvalRequestSchema.index(
  { resourceType: 1, resourceId: 1, type: 1, status: 1 },
);

export default mongoose.model<IApprovalRequest>(
  "ApprovalRequest",
  approvalRequestSchema,
);
