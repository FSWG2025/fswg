import mongoose, { Schema, Document } from "mongoose";

export interface IContent extends Document {
  title: string;
  slug: string;
  body: string;
  metaDescription?: string;
  featuredImage?: string;
  published: boolean;
  author?: mongoose.Types.ObjectId;
  contentType: "page" | "blog" | "testimonial" | "service_extra";
  tags?: string[];
  viewCount: number;
  seoTitle?: string;
  seoKeywords?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const contentSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug can only contain lowercase letters, numbers, and hyphens",
      ],
    },
    body: {
      type: String,
      required: [true, "Body content is required"],
    },
    metaDescription: {
      type: String,
      maxlength: [160, "Meta description cannot exceed 160 characters"],
    },
    featuredImage: {
      type: String,
    },
    published: {
      type: Boolean,
      default: false,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    contentType: {
      type: String,
      enum: {
        values: ["page", "blog", "testimonial", "service_extra"],
        message: "{VALUE} is not a valid content type",
      },
      default: "page",
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    seoTitle: {
      type: String,
      maxlength: [60, "SEO title cannot exceed 60 characters"],
    },
    seoKeywords: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: Reading time estimate
contentSchema.virtual("readingTime").get(function () {
  const wordsPerMinute = 200;
  const wordCount = this.body
    ? this.body.replace(/<[^>]*>/g, "").split(/\s+/).length
    : 0;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Virtual: Excerpt
contentSchema.virtual("excerpt").get(function () {
  if (this.metaDescription) return this.metaDescription;
  const text = this.body ? this.body.replace(/<[^>]*>/g, "") : "";
  return text.substring(0, 160) + (text.length > 160 ? "..." : "");
});

// Index for text search
contentSchema.index({
  title: "text",
  body: "text",
  metaDescription: "text",
  tags: "text",
});

// Index for filtering
contentSchema.index({ contentType: 1, published: 1, updatedAt: -1 });
contentSchema.index({ slug: 1, published: 1 });

// Pre-save middleware to auto-generate slug if empty
contentSchema.pre("save", function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

export default mongoose.model<IContent>("Content", contentSchema);