import { type Request, type Response } from "express";
import Content from '../../models/Content';
import { logAudit } from '../../utils/logAudit';

// @desc    Create content (page, blog, etc.)
// @route   POST /api/content
// @access  Private/Admin
export const createContent = async (req: Request, res: Response) => {
  try {
    const { title, slug, body, metaDescription, published, contentType } = req.body;

    if (!title || !slug || !body) {
      return res.status(400).json({ message: "Title, slug, and body are required" });
    }

    const existingSlug = await Content.findOne({ slug });
    if (existingSlug) {
      return res.status(400).json({ message: "A content with this slug already exists" });
    }

    const content = await Content.create({
      title,
      slug,
      body,
      metaDescription: metaDescription || "",
      published: published || false,
      contentType: contentType || "page",
      author: (req as any).user._id,
    });

    await logAudit({
      userId: (req as any).user._id.toString(),
      action: "Created Content",
      details: `Content "${title}" (${contentType || "page"})`,
      req,
    });

    res.status(201).json(content);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get all content (public or admin)
// @route   GET /api/content
// @access  Public (for published), Admin (all)
export const getContent = async (req: Request, res: Response) => {
  try {
    const { type, published, search } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const filter: any = {};

    if (type && type !== "all") filter.contentType = type;

    const user = (req as any).user;
    const canPreviewDrafts =
      user && (user.role === "admin" || user.role === "content_editor");
    if (!canPreviewDrafts) {
      filter.published = true;
    } else if (published === "true") {
      filter.published = true;
    } else if (published === "false") {
      filter.published = false;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { body: { $regex: search, $options: "i" } },
        { metaDescription: { $regex: search, $options: "i" } },
      ];
    }

    const [total, contentList] = await Promise.all([
      Content.countDocuments(filter),
      Content.find(filter)
        .populate("author", "name email")
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    res.json({
      content: contentList,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get single content by slug (public)
// @route   GET /api/content/:slug
// @access  Public
export const getContentBySlug = async (req: Request, res: Response) => {
  try {
    const filter: any = { slug: req.params.slug };
    const user = (req as any).user;
    const canPreviewDrafts =
      user && (user.role === "admin" || user.role === "content_editor");
    if (!canPreviewDrafts) {
      filter.published = true;
    }

    const content = await Content.findOne(filter).populate("author", "name email");
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    content.set("viewCount", (content.get("viewCount") || 0) + 1);
    await content.save();

    res.json(content);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get content by ID
// @route   GET /api/content/id/:id
// @access  Private/Admin
export const getContentById = async (req: Request, res: Response) => {
  try {
    const content = await Content.findById(req.params.id).populate("author", "name email");
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Update content
// @route   PATCH /api/content/:id
// @access  Private/Admin
export const updateContent = async (req: Request, res: Response) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    if (req.body.title) content.title = req.body.title;
    if (req.body.slug) {
      const existingSlug = await Content.findOne({ slug: req.body.slug, _id: { $ne: req.params.id } });
      if (existingSlug) {
        return res.status(400).json({ message: "Slug already in use" });
      }
      content.slug = req.body.slug;
    }
    if (req.body.body) content.body = req.body.body;
    if (req.body.metaDescription !== undefined) content.metaDescription = req.body.metaDescription;
    if (req.body.published !== undefined) content.published = req.body.published;
    if (req.body.contentType) content.contentType = req.body.contentType;

    const updated = await content.save();

    await logAudit({
      userId: (req as any).user._id.toString(),
      action: "Updated Content",
      details: `Content "${updated.title}" updated`,
      req,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Delete content
// @route   DELETE /api/content/:id
// @access  Private/Admin
export const deleteContent = async (req: Request, res: Response) => {
  try {
    const content = await Content.findByIdAndDelete(req.params.id);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    await logAudit({
      userId: (req as any).user._id.toString(),
      action: "Deleted Content",
      details: `Content "${content.title}" deleted`,
      req,
    });

    res.json({ message: "Content deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get content types
// @route   GET /api/content/types
// @access  Public
export const getContentTypes = async (req: Request, res: Response) => {
  try {
    const types = await Content.distinct("contentType");
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};