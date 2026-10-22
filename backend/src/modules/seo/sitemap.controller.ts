import { Request, Response } from "express";
import Content from "../../models/Content";

type SitemapEntry = {
  path: string;
  changefreq: "daily" | "weekly" | "monthly";
  priority: string;
};

const STATIC_PAGES: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/rental-guarantee", changefreq: "weekly", priority: "0.95" },
  { path: "/real-estate", changefreq: "weekly", priority: "0.95" },
  { path: "/insurance", changefreq: "weekly", priority: "0.9" },
  { path: "/wealth", changefreq: "weekly", priority: "0.85" },
  { path: "/services", changefreq: "weekly", priority: "0.85" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/testimonials", changefreq: "monthly", priority: "0.7" },
  { path: "/blog", changefreq: "daily", priority: "0.85" },
];

export const generateSitemap = async (req: Request, res: Response) => {
  const baseUrl = (
    process.env.CLIENT_URL || "https://firststepwealthgroup.ca"
  ).replace(/\/$/, "");

  try {
    const blogPosts = await Content.find({
      contentType: "blog",
      published: true,
    })
      .select("slug updatedAt")
      .lean();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const page of STATIC_PAGES) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page.path === "/" ? "" : page.path}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    for (const post of blogPosts as { slug: string; updatedAt: Date }[]) {
      if (!post.slug) continue;
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(post.updatedAt).toISOString()}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.65</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(xml);
  } catch (error) {
    console.error("[sitemap]", error);
    res.status(500).type("text/plain").send("Sitemap unavailable");
  }
};
