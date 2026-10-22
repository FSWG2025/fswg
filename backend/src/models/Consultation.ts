import mongoose, { Schema, Document } from "mongoose";

export interface IConsultation extends Document {
  client: mongoose.Types.ObjectId;
  consultant: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
  dateTime: Date;
  duration: number;
  status: "scheduled" | "completed" | "cancelled" | "approved" | "rejected";
  interest?: string;
  notes?: string;
  followUpDate?: Date;
  feedback?: string;
  rating?: number;
  meetingLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

const consultationSchema = new Schema(
  {
    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Client is required"],
      index: true,
    },
    consultant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Service is required"],
    },
    dateTime: {
      type: Date,
      required: [true, "Date and time are required"],
      index: true,
    },
    duration: {
      type: Number,
      default: 60,
      min: [15, "Minimum duration is 15 minutes"],
      max: [240, "Maximum duration is 4 hours"],
    },
    status: {
      type: String,
      enum: {
        values: ["scheduled", "completed", "cancelled", "approved", "rejected"],
        message: "{VALUE} is not a valid status",
      },
      default: "scheduled",
      index: true,
    },
    interest: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
    },
    followUpDate: {
      type: Date,
    },
    feedback: {
      type: String,
      maxlength: [1000, "Feedback cannot exceed 1000 characters"],
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    meetingLink: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: Check if consultation is upcoming
consultationSchema.virtual("isUpcoming").get(function () {
  return this.dateTime > new Date() && this.status === "scheduled";
});

// Virtual: Check if consultation is past due
consultationSchema.virtual("isPastDue").get(function () {
  return this.dateTime < new Date() && this.status === "scheduled";
});

// Compound index for preventing double bookings
consultationSchema.index(
  { client: 1, dateTime: 1, status: 1 },
  { unique: false }
);

// Index for finding consultations by date range
consultationSchema.index({ dateTime: 1, status: 1 });

// Pre-save middleware
consultationSchema.pre("save", function (next) {
  // Auto-complete past consultations (optional)
  if (this.dateTime < new Date() && this.status === "scheduled") {
    // You could auto-update status, but we'll just log a warning
    console.warn(
      `⚠️ Consultation ${this._id} is past due. Consider updating status.`
    );
  }
  next();
});

// Static method to get upcoming consultations
consultationSchema.statics.getUpcoming = function (userId: string, role: string) {
  const filter: any = {
    dateTime: { $gte: new Date() },
    status: "scheduled",
  };

  if (role === "client") {
    filter.client = userId;
  } else if (role === "consultant") {
    filter.consultant = userId;
  }

  return this.find(filter)
    .populate("client", "name email phone")
    .populate("consultant", "name email expertise")
    .populate("service", "title category")
    .sort({ dateTime: 1 });
};

// Static method to get consultation stats
consultationSchema.statics.getStats = async function (userId: string, role: string) {
  const filter: any = {};

  if (role === "client") {
    filter.client = userId;
  } else if (role === "consultant") {
    filter.consultant = userId;
  }

  const [total, scheduled, completed, cancelled] = await Promise.all([
    this.countDocuments(filter),
    this.countDocuments({ ...filter, status: "scheduled" }),
    this.countDocuments({ ...filter, status: "completed" }),
    this.countDocuments({ ...filter, status: "cancelled" }),
  ]);

  return { total, scheduled, completed, cancelled };
};

export default mongoose.model<IConsultation>(
  "Consultation",
  consultationSchema
);