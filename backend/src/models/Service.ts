import mongoose, { Schema, Document } from "mongoose";

export interface IService extends Document {
  title: string;
  description: string;
  category: "financial_education" | "insurance" | "real_estate" | "wealth_building" | "entrepreneurship";
  icon?: string;
  isActive: boolean;
  order: number;
  features?: string[];
  pricing?: {
    amount: number;
    currency: string;
    interval: "one-time" | "monthly" | "yearly";
  };
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      unique: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
          "financial_education",
          "insurance",
          "real_estate",
          "wealth_building",
          "entrepreneurship",
        ],
        message: "{VALUE} is not a valid category",
      },
      index: true,
    },
    icon: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    pricing: {
      amount: {
        type: Number,
        min: 0,
      },
      currency: {
        type: String,
        default: "CAD",
      },
      interval: {
        type: String,
        enum: ["one-time", "monthly", "yearly"],
        default: "one-time",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
serviceSchema.index({ isActive: 1, order: 1 });
serviceSchema.index({ category: 1, isActive: 1 });

// Pre-save middleware
serviceSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    console.log(`🔧 Service title updated: ${this.title}`);
  }
  next();
});

// Static method to get active services by category
serviceSchema.statics.getActiveByCategory = async function (category?: string) {
  const filter: any = { isActive: true };
  if (category) filter.category = category;
  return await this.find(filter).sort({ order: 1 });
};

export default mongoose.model<IService>("Service", serviceSchema);