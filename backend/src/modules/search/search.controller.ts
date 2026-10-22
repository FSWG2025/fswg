import { type Request, type Response } from "express";
import Content from '../../models/Content';
import Service from '../../models/Service';

// @desc    Global search
// @route   GET /api/search
// @access  Public
export const globalSearch = async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string)?.trim() || "";
    const limit = parseInt(req.query.limit as string) || 10;

    console.log(`🔍 Search query: "${query}"`);

    if (!query) {
      return res.json({ results: [], total: 0 });
    }

    // Escape regex metacharacters
    const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(safe, "i");

    // 1. Search Content
    const contentResults = await Content.find({
      published: true,
      $or: [
        { title: regex },
        { slug: regex },
        { body: regex },
        { metaDescription: regex },
        { contentType: regex },
      ],
    })
      .select("title slug body metaDescription contentType updatedAt")
      .limit(limit)
      .lean();

    // 2. Search Services
    const serviceResults = await Service.find({
      isActive: true,
      $or: [
        { title: regex },
        { description: regex },
        { category: regex },
        { icon: regex },
      ],
    })
      .select("title description category icon order")
      .limit(limit)
      .lean();

    console.log(`Found ${contentResults.length} content, ${serviceResults.length} services`);

    // Format results
    const results = [
      ...contentResults.map((item: any) => ({
        id: item._id,
        type: item.contentType || "page",
        title: item.title,
        snippet: item.metaDescription || item.body?.substring(0, 120) || "",
        url: item.contentType === "blog" ? `/blog/${item.slug}` : `/page/${item.slug}`,
        fullBody: item.body,
      })),
      ...serviceResults.map((item: any) => ({
        id: item._id,
        type: "service",
        title: item.title,
        snippet: item.description?.substring(0, 120) || "",
        url: "/services",
        category: item.category,
      })),
    ];

    res.json({
      results,
      total: results.length,
      query,
    });
  } catch (error) {
    console.error("❌ Search error:", error);
    res.status(500).json({ message: "Search failed", error });
  }
};

// @desc    Quick search (autocomplete)
// @route   GET /api/search/quick
// @access  Public
export const quickSearch = async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string)?.trim() || "";

    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }

    const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`^${safe}`, "i");

    // Get matching titles only
    const contentTitles = await Content.find({
      published: true,
      title: regex,
    })
      .select("title slug contentType")
      .limit(5)
      .lean();

    const serviceTitles = await Service.find({
      isActive: true,
      title: regex,
    })
      .select("title category")
      .limit(5)
      .lean();

    const suggestions = [
      ...contentTitles.map((item: any) => ({
        text: item.title,
        type: item.contentType || "page",
        url: item.contentType === "blog" ? `/blog/${item.slug}` : `/page/${item.slug}`,
      })),
      ...serviceTitles.map((item: any) => ({
        text: item.title,
        type: "service",
        url: "/services",
      })),
    ];

    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ message: "Search failed", error });
  }
};