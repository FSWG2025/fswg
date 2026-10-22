import mongoose, { Schema, Document } from "mongoose";

export interface IRentalGuarantee extends Document {
  applicant: mongoose.Types.ObjectId;
  rentalApplication?: mongoose.Types.ObjectId;
  propertyAddress: string;
  propertyType: "apartment" | "condo" | "house" | "townhouse" | "basement" | "other";
  landlordName: string;
  landlordEmail: string;
  landlordPhone?: string;
  monthlyRent: number;
  guaranteeFee: number;
  leaseStartDate: Date;
  leaseEndDate?: Date;
  status: "pending" | "active" | "expired" | "cancelled" | "renewed";
  termsAccepted: boolean;
  paymentHistory: {
    month: string;
    amount: number;
    paid: boolean;
    paidDate?: Date;
  }[];
  documents: string[];
  notes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const rentalGuaranteeSchema = new Schema(
  {
    applicant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Applicant is required"],
      index: true,
    },
    rentalApplication: {
      type: Schema.Types.ObjectId,
      ref: "RentalApplication",
    },
    propertyAddress: {
      type: String,
      required: [true, "Property address is required"],
      trim: true,
    },
    propertyType: {
      type: String,
      enum: {
        values: ["apartment", "condo", "house", "townhouse", "basement", "other"],
        message: "{VALUE} is not a valid property type",
      },
      default: "apartment",
    },
    landlordName: {
      type: String,
      required: [true, "Landlord name is required"],
      trim: true,
    },
    landlordEmail: {
      type: String,
      required: [true, "Landlord email is required"],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },
    landlordPhone: {
      type: String,
      trim: true,
    },
    monthlyRent: {
      type: Number,
      required: [true, "Monthly rent is required"],
      min: [0, "Rent cannot be negative"],
    },
    guaranteeFee: {
      type: Number,
      required: [true, "Guarantee fee is required"],
      min: [0, "Fee cannot be negative"],
    },
    leaseStartDate: {
      type: Date,
      required: [true, "Lease start date is required"],
    },
    leaseEndDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "active", "expired", "cancelled", "renewed"],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
      index: true,
    },
    termsAccepted: {
      type: Boolean,
      default: false,
    },
    paymentHistory: [
      {
        month: String,
        amount: Number,
        paid: { type: Boolean, default: false },
        paidDate: Date,
      },
    ],
    documents: [
      {
        type: String,
      },
    ],
    notes: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: Total paid in fees
rentalGuaranteeSchema.virtual("totalFeesPaid").get(function () {
  return this.paymentHistory
    .filter((p) => p.paid)
    .reduce((total, p) => total + ( p.amount || 0), 0);
});

// Virtual: Months active
rentalGuaranteeSchema.virtual("monthsActive").get(function () {
  if (this.status !== "active") return 0;
  const start = this.leaseStartDate;
  const now = new Date();
  return Math.ceil(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
});

// Indexes
rentalGuaranteeSchema.index({ applicant: 1, status: 1 });
rentalGuaranteeSchema.index({ status: 1, leaseStartDate: 1 });

export default mongoose.model<IRentalGuarantee>(
  "RentalGuarantee",
  rentalGuaranteeSchema
);