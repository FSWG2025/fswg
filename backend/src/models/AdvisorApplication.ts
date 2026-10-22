import mongoose, { Schema, Document } from "mongoose";

export interface ITrainingProgress {
  moduleName: string;
  completed: boolean;
  score?: number;
  completedAt?: Date;
  notes?: string;
}

export interface IAdvisorApplication extends Document {
  applicant: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  phone: string;
  currentOccupation: string;
  motivation: string;
  insuranceInterest: string;
  status: "submitted" | "under_review" | "approved" | "rejected" | "enrolled";
  assignedMentor?: mongoose.Types.ObjectId;
  trainingModules: ITrainingProgress[];
  notes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const trainingProgressSchema = new Schema(
  {
    moduleName: { type: String, required: true },
    completed: { type: Boolean, default: false },
    score: { type: Number, min: 0, max: 100 },
    completedAt: Date,
    notes: String,
  },
  { _id: false }
);

const advisorApplicationSchema = new Schema(
  {
    applicant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
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
      required: [true, "Phone number is required"],
      trim: true,
    },
    currentOccupation: {
      type: String,
      default: "",
      trim: true,
    },
    motivation: {
      type: String,
      required: [true, "Motivation statement is required"],
      minlength: [20, "Motivation must be at least 20 characters"],
      maxlength: [2000, "Motivation cannot exceed 2000 characters"],
    },
    insuranceInterest: {
      type: String,
      required: [true, "Insurance interest is required"],
      enum: {
        values: ["life", "critical_illness", "disability", "general"],
        message: "{VALUE} is not a valid insurance interest",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["submitted", "under_review", "approved", "rejected", "enrolled"],
        message: "{VALUE} is not a valid status",
      },
      default: "submitted",
      index: true,
    },
    assignedMentor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    trainingModules: {
      type: [trainingProgressSchema],
      default: [
        { moduleName: "Introduction to Insurance", completed: false },
        { moduleName: "Financial Planning Basics", completed: false },
        { moduleName: "Client Relationship Management", completed: false },
        { moduleName: "Product Knowledge", completed: false },
        { moduleName: "Sales & Marketing", completed: false },
        { moduleName: "Ethics & Compliance", completed: false },
      ],
    },
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

// Virtual: Calculate training progress percentage
advisorApplicationSchema.virtual("trainingProgress").get(function () {
  if (!this.trainingModules || this.trainingModules.length === 0) return 0;
  const completed = this.trainingModules.filter((m) => m.completed).length;
  return Math.round((completed / this.trainingModules.length) * 100);
});

// Index for efficient queries
advisorApplicationSchema.index({ status: 1, createdAt: -1 });
advisorApplicationSchema.index({ email: 1 });
advisorApplicationSchema.index({ applicant: 1, status: 1 });

// Pre-save middleware to log status changes
advisorApplicationSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    console.log(`📋 Application ${this._id} status changed to: ${this.status}`);
  }
  next();
});

export default mongoose.model<IAdvisorApplication>(
  "AdvisorApplication",
  advisorApplicationSchema
);