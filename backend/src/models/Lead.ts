import mongoose, { Schema, Document } from "mongoose";

export interface ILead extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source: string;
  interest: string;
  status: "new" | "contacted" | "qualified" | "converted" | "closed";
  assignedConsultant?: mongoose.Types.ObjectId;
  notes: string[];
  convertedClient?: mongoose.Types.ObjectId;
  lastContactedAt?: Date;
  priority: "low" | "medium" | "high";
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [1, "First name is required"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      default: "",
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      default: "website",
      enum: {
        values: ["website", "referral", "social_media", "event", "advertisement", "other"],
        message: "{VALUE} is not a valid source",
      },
    },
    interest: {
      type: String,
      default: "Consultation",
      enum: {
        values: [
          "Consultation",
          "rental_applicant",
          "insurance",
          "real_estate",
          "financial_education",
          "entrepreneurship",
          "wealth_building",
          "other",
        ],
        message: "{VALUE} is not a valid interest",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["new", "contacted", "qualified", "converted", "closed"],
        message: "{VALUE} is not a valid status",
      },
      default: "new",
      index: true,
    },
    assignedConsultant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    notes: {
      type: [String],
      default: [],
    },
    convertedClient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    lastContactedAt: {
      type: Date,
    },
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high"],
        message: "{VALUE} is not a valid priority",
      },
      default: "medium",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: Full name
leadSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Virtual: Days since created
leadSchema.virtual("daysSinceCreated").get(function () {
  const now = new Date();
  const created = this.createdAt;
  return Math.ceil(
    (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  );
});

// Indexes
leadSchema.index({ email: 1 });
leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ assignedConsultant: 1, status: 1 });
leadSchema.index({ interest: 1, status: 1 });

// Pre-save middleware to auto-set priority based on interest
leadSchema.pre("save", function (next) {
  const highPriorityInterests = ["insurance", "real_estate"];
  if (highPriorityInterests.includes(this.interest)) {
    this.priority = "high";
  }
  next();
});

// Static method to get lead stats
leadSchema.statics.getStats = async function () {
  const [total, newLeads, contacted, qualified, converted, closed] =
    await Promise.all([
      this.countDocuments(),
      this.countDocuments({ status: "new" }),
      this.countDocuments({ status: "contacted" }),
      this.countDocuments({ status: "qualified" }),
      this.countDocuments({ status: "converted" }),
      this.countDocuments({ status: "closed" }),
    ]);

  const conversionRate =
    total > 0 ? Math.round((converted / total) * 100) : 0;

  return {
    total,
    new: newLeads,
    contacted,
    qualified,
    converted,
    closed,
    conversionRate,
  };
};

// Static method to get leads by interest
leadSchema.statics.getByInterest = async function () {
  return await this.aggregate([
    { $group: { _id: "$interest", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
};

export default mongoose.model<ILead>("Lead", leadSchema);