import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { USER_ROLES, type UserRole } from "../constants/roles";

export type { UserRole };

export type RiskFlag = "high_risk" | "vip" | "legal_hold";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  address?: string;
  clientType?: "lead" | "consultation_client" | "rental_applicant";
  assignedConsultant?: mongoose.Types.ObjectId;
  expertise?: string;
  isActive: boolean;
  notes: string[];
  /** Internal dossier notes — admin/super only */
  internalNotes: string[];
  riskFlags: RiskFlag[];
  sessionVersion: number;
  softDeletedAt?: Date | null;
  emailLocked: boolean;
  emailVerified: boolean;
  lastActionAt?: Date;
  avatar?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLoginAt?: Date;
  matchPassword: (enteredPassword: string) => Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: {
        values: [...USER_ROLES],
        message: "{VALUE} is not a valid role",
      },
      default: "client",
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    clientType: {
      type: String,
      enum: {
        values: ["lead", "consultation_client", "rental_applicant"],
        message: "{VALUE} is not a valid client type",
      },
    },
    assignedConsultant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    expertise: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: [String],
      default: [],
    },
    internalNotes: {
      type: [String],
      default: [],
    },
    riskFlags: {
      type: [String],
      enum: ["high_risk", "vip", "legal_hold"],
      default: [],
    },
    sessionVersion: {
      type: Number,
      default: 0,
    },
    softDeletedAt: {
      type: Date,
      default: null,
    },
    emailLocked: {
      type: Boolean,
      default: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    lastActionAt: {
      type: Date,
    },
    avatar: {
      type: String,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Hash password before saving
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>("User", userSchema);