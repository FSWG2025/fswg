import mongoose, { Document, Schema, Types } from "mongoose";

export type WatchlistKind = "ip" | "email" | "visitorId" | "userId";

export interface IWatchlist extends Document {
  kind: WatchlistKind;
  value: string;
  label?: string;
  notes?: string;
  alertOnReturn: boolean;
  createdBy: Types.ObjectId;
  lastHitAt?: Date | null;
  hitCount: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const watchlistSchema = new Schema<IWatchlist>(
  {
    kind: {
      type: String,
      enum: ["ip", "email", "visitorId", "userId"],
      required: true,
      index: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: true,
    },
    label: { type: String, trim: true, maxlength: 120 },
    notes: { type: String, trim: true, maxlength: 500 },
    alertOnReturn: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lastHitAt: { type: Date, default: null },
    hitCount: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

watchlistSchema.index({ kind: 1, value: 1 }, { unique: true });

export default mongoose.model<IWatchlist>("Watchlist", watchlistSchema);
