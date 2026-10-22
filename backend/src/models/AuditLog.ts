import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  user: mongoose.Types.ObjectId | string;
  action: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  /** Resolved from IP at log time */
  city?: string;
  region?: string;
  country?: string;
  lat?: number;
  lng?: number;
  /** e.g. "Lagos, Lagos, Nigeria" */
  locationLabel?: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  /** When true, only super_admin may see this entry (stealth). */
  superOnly?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      trim: true,
      index: true,
    },
    details: {
      type: String,
      trim: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    city: { type: String },
    region: { type: String },
    country: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    locationLabel: { type: String },
    resourceType: {
      type: String,
      enum: [
        "user",
        "lead",
        "consultation",
        "rental_application",
        "advisor_application",
        "content",
        "service",
        "message",
        "vault",
        "note",
        "notification",
        "auth",
        "system",
        "approval_request",
        "visitor",
        "impersonation",
        "watchlist",
        "promo",
        "bot",
      ],
    },
    resourceId: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    superOnly: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });

// Static method to create audit log
auditLogSchema.statics.logAction = async function (
  userId: string,
  action: string,
  details?: string,
  metadata?: Record<string, any>
) {
  return await this.create({
    user: userId,
    action,
    details,
    metadata,
  });
};

// TTL index to auto-delete logs older than 1 year (optional)
// auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

export default mongoose.model<IAuditLog>("AuditLog", auditLogSchema);