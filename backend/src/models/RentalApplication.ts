import mongoose, { Schema, Document } from "mongoose";

export interface IRentalApplication extends Document {
  applicant: mongoose.Types.ObjectId;
  personalInfo: {
    fullName: string;
    dob: Date;
    currentAddress: string;
    phone: string;
    email: string;
  };
  employment: {
    employerName: string;
    position: string;
    monthlyIncome: number;
    employmentType: "full-time" | "part-time" | "self-employed" | "unemployed";
  };
  references: {
    name: string;
    relationship: string;
    phone: string;
  }[];
  documents: string[];
  status:
  | "submitted"
  | "under_review"
  | "info_requested"
  | "approved"
  | "rejected"
  | "cancelled";
  reviewedBy?: mongoose.Types.ObjectId;
  comments: string[];          // public – visible to applicant
  internalNotes: string[];     // private – admin/consultant only
  createdAt: Date;
  updatedAt: Date;
}

const rentalApplicationSchema = new Schema(
  {
    applicant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Applicant is required"],
      index: true,
    },
    personalInfo: {
      fullName: { type: String, required: true, trim: true },
      dob: { type: Date, required: true },
      currentAddress: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
      },
    },
    employment: {
      employerName: { type: String, required: true, trim: true },
      position: { type: String, required: true, trim: true },
      monthlyIncome: { type: Number, required: true, min: 0 },
      employmentType: {
        type: String,
        enum: ["full-time", "part-time", "self-employed", "unemployed"],
        required: true,
      },
    },
    references: [
      {
        name: String,
        relationship: String,
        phone: String,
      },
    ],
    documents: [{ type: String }],
    status: {
      type: String,
      enum: [
        "submitted",
        "under_review",
        "info_requested",
        "approved",
        "rejected",
        "cancelled",
      ],
      default: "submitted",
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    comments: { type: [String], default: [] },
    internalNotes: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Indexes
rentalApplicationSchema.index({ status: 1, createdAt: -1 });
rentalApplicationSchema.index({ applicant: 1, status: 1 });

export default mongoose.model<IRentalApplication>(
  "RentalApplication",
  rentalApplicationSchema
);