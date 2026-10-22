import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPromoConfig extends Document {
  key: string;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  audience: "anon" | "logged_in" | "all";
  pageTargets: string[];
  startsAt?: Date | null;
  endsAt?: Date | null;
  active: boolean;
  killed: boolean;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const promoConfigSchema = new Schema<IPromoConfig>(
  {
    key: { type: String, required: true, unique: true, trim: true, maxlength: 80 },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    body: { type: String, required: true, trim: true, maxlength: 600 },
    ctaLabel: { type: String, trim: true, maxlength: 60 },
    ctaHref: { type: String, trim: true, maxlength: 300 },
    audience: {
      type: String,
      enum: ["anon", "logged_in", "all"],
      default: "all",
    },
    pageTargets: { type: [String], default: ["*"] },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
    active: { type: Boolean, default: true },
    killed: { type: Boolean, default: false },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default mongoose.model<IPromoConfig>("PromoConfig", promoConfigSchema);
