import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISiteVisitor extends Document {
  visitorId: string;
  ip?: string;
  userAgent?: string;
  browser?: string;
  os?: string;
  device?: "mobile" | "desktop" | "tablet" | "unknown";
  language?: string;
  timezone?: string;
  screen?: string;
  referrer?: string;
  landingPage?: string;
  lastPath?: string;
  paths: string[];
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  country?: string;
  city?: string;
  region?: string;
  lat?: number;
  lng?: number;
  accuracyRadiusKm?: number;
  isp?: string;
  isProxy?: boolean;
  isVpn?: boolean;
  riskScore: number;
  watchlisted: boolean;
  botScore: number;
  botSignals: string[];
  blocked: boolean;
  visitCount: number;
  pageViews: number;
  firstSeenAt: Date;
  lastSeenAt: Date;
  linkedUser?: Types.ObjectId;
  linkedEmail?: string;
  linkedName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const siteVisitorSchema = new Schema(
  {
    visitorId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      maxlength: 80,
    },
    ip: { type: String, trim: true, maxlength: 64 },
    userAgent: { type: String, trim: true, maxlength: 500 },
    browser: { type: String, trim: true, maxlength: 60 },
    os: { type: String, trim: true, maxlength: 60 },
    device: {
      type: String,
      enum: ["mobile", "desktop", "tablet", "unknown"],
      default: "unknown",
    },
    language: { type: String, trim: true, maxlength: 32 },
    timezone: { type: String, trim: true, maxlength: 64 },
    screen: { type: String, trim: true, maxlength: 32 },
    referrer: { type: String, trim: true, maxlength: 500 },
    landingPage: { type: String, trim: true, maxlength: 300 },
    lastPath: { type: String, trim: true, maxlength: 300 },
    paths: {
      type: [String],
      default: [],
      validate: {
        validator: (arr: string[]) => arr.length <= 40,
        message: "Too many paths stored",
      },
    },
    utmSource: { type: String, trim: true, maxlength: 120 },
    utmMedium: { type: String, trim: true, maxlength: 120 },
    utmCampaign: { type: String, trim: true, maxlength: 120 },
    country: { type: String, trim: true, maxlength: 80 },
    city: { type: String, trim: true, maxlength: 80 },
    region: { type: String, trim: true, maxlength: 80 },
    lat: { type: Number },
    lng: { type: Number },
    accuracyRadiusKm: { type: Number },
    isp: { type: String, trim: true, maxlength: 120 },
    isProxy: { type: Boolean, default: false },
    isVpn: { type: Boolean, default: false },
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    watchlisted: { type: Boolean, default: false, index: true },
    botScore: { type: Number, default: 0, min: 0, max: 100 },
    botSignals: { type: [String], default: [] },
    blocked: { type: Boolean, default: false, index: true },
    visitCount: { type: Number, default: 1, min: 0 },
    pageViews: { type: Number, default: 0, min: 0 },
    firstSeenAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now, index: true },
    linkedUser: { type: Schema.Types.ObjectId, ref: "User", index: true },
    linkedEmail: { type: String, trim: true, lowercase: true, maxlength: 120 },
    linkedName: { type: String, trim: true, maxlength: 120 },
  },
  { timestamps: true }
);

siteVisitorSchema.index({ lastSeenAt: -1 });
siteVisitorSchema.index({ linkedEmail: 1 });
siteVisitorSchema.index({ lat: 1, lng: 1 });
siteVisitorSchema.index({ ip: 1 });

export default mongoose.model<ISiteVisitor>("SiteVisitor", siteVisitorSchema);
