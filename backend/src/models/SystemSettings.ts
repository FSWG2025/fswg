import mongoose, { Document, Schema, Types } from "mongoose";

export type SystemStatus = "OK" | "DEGRADED" | "MAINTENANCE" | "LOCKDOWN";

export interface IFeatureFlag {
  enabled: boolean;
  roles?: string[];
}

export interface ISystemSettings extends Document {
  key: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  maintenanceUntil?: Date | null;
  maintenanceEtaBlurb?: string;
  featureFlags: Record<string, boolean | IFeatureFlag>;
  lockdown: boolean;
  readOnlyMode: boolean;
  freezeMessaging: boolean;
  freezeLeadIntake: boolean;
  freezePayments: boolean;
  blockNewSessionsByRole: string[];
  ipAllowlistStaff: string[];
  ipAllowlistEnabled: boolean;
  botBlockEnabled: boolean;
  broadcastBanner?: string;
  broadcastBannerUntil?: Date | null;
  statusOverride?: SystemStatus | null;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_FEATURE_FLAGS: Record<string, boolean | IFeatureFlag> = {
  registration: true,
  leadCapture: true,
  whatsappCtas: true,
  rentalApplications: true,
  videoRooms: true,
  wealthStudio: true,
  pushNotifications: true,
  newsletter: true,
  promoBanners: true,
};

const systemSettingsSchema = new Schema<ISystemSettings>(
  {
    key: { type: String, required: true, unique: true, default: "global" },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: {
      type: String,
      default: "We're performing scheduled maintenance. Please check back shortly.",
      maxlength: 500,
    },
    maintenanceUntil: { type: Date, default: null },
    maintenanceEtaBlurb: { type: String, default: "", maxlength: 200 },
    featureFlags: {
      type: Schema.Types.Mixed,
      default: () => ({ ...DEFAULT_FEATURE_FLAGS }),
    },
    lockdown: { type: Boolean, default: false },
    readOnlyMode: { type: Boolean, default: false },
    freezeMessaging: { type: Boolean, default: false },
    freezeLeadIntake: { type: Boolean, default: false },
    freezePayments: { type: Boolean, default: false },
    blockNewSessionsByRole: { type: [String], default: [] },
    ipAllowlistStaff: { type: [String], default: [] },
    ipAllowlistEnabled: { type: Boolean, default: false },
    botBlockEnabled: { type: Boolean, default: true },
    broadcastBanner: { type: String, default: "", maxlength: 400 },
    broadcastBannerUntil: { type: Date, default: null },
    statusOverride: {
      type: String,
      enum: ["OK", "DEGRADED", "MAINTENANCE", "LOCKDOWN", null],
      default: null,
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export async function getSystemSettings(): Promise<ISystemSettings> {
  let doc = await mongoose.model<ISystemSettings>("SystemSettings").findOne({
    key: "global",
  });
  if (!doc) {
    doc = await mongoose.model<ISystemSettings>("SystemSettings").create({
      key: "global",
      featureFlags: { ...DEFAULT_FEATURE_FLAGS },
    });
  }
  return doc;
}

export function deriveSystemStatus(s: ISystemSettings): SystemStatus {
  if (s.statusOverride) return s.statusOverride;
  if (s.lockdown) return "LOCKDOWN";
  if (s.maintenanceMode) return "MAINTENANCE";
  if (
    s.readOnlyMode ||
    s.freezeLeadIntake ||
    s.freezeMessaging ||
    s.freezePayments
  ) {
    return "DEGRADED";
  }
  return "OK";
}

export default mongoose.model<ISystemSettings>(
  "SystemSettings",
  systemSettingsSchema,
);
