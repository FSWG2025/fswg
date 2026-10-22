import mongoose, { Document, Schema } from "mongoose";

export interface IBotBlock extends Document {
  ip?: string;
  visitorId?: string;
  userAgent?: string;
  reason: string;
  score: number;
  signals: string[];
  blockedUntil?: Date | null;
  permanent: boolean;
  hitCount: number;
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const botBlockSchema = new Schema<IBotBlock>(
  {
    ip: { type: String, trim: true, maxlength: 64, index: true },
    visitorId: { type: String, trim: true, maxlength: 80, index: true },
    userAgent: { type: String, trim: true, maxlength: 500 },
    reason: { type: String, required: true, maxlength: 300 },
    score: { type: Number, default: 0 },
    signals: { type: [String], default: [] },
    blockedUntil: { type: Date, default: null },
    permanent: { type: Boolean, default: false },
    hitCount: { type: Number, default: 1, min: 0 },
    lastSeenAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

botBlockSchema.index({ ip: 1, visitorId: 1 });

export default mongoose.model<IBotBlock>("BotBlock", botBlockSchema);
