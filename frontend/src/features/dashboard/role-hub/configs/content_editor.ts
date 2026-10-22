import type { RoleHubConfig } from "./types";
import { BookOpen, FileText, Home, Users } from "lucide-react";

export const content_editorConfig: RoleHubConfig = {
    role: "content_editor",
    subtitle:
      "Editorial hub for pages, blogs, testimonials, and pillar coverage.",
    primaryCta: { label: "Manage content", href: "/admin/content" },
    snapshots: [
      {
        key: "published",
        label: "Published",
        statKey: "published",
        sub: "Live pieces",
        icon: BookOpen,
        href: "/admin/content",
        accent: true,
      },
      {
        key: "drafts",
        label: "Drafts",
        statKey: "drafts",
        sub: "Needs work",
        icon: FileText,
        href: "/admin/content",
      },
      {
        key: "blogs",
        label: "Blogs",
        statKey: "blogs",
        sub: "Articles",
        icon: BookOpen,
        href: "/admin/content/blogs",
      },
      {
        key: "testimonials",
        label: "Testimonials",
        statKey: "testimonials",
        sub: "Social proof",
        icon: Users,
        href: "/admin/content/testimonials",
      },
    ],
    quickActions: [
      {
        id: "blog",
        label: "Blog",
        title: "Write or edit a blog",
        body: "Keep rental, insurance, real estate, and wealth covered.",
        cta: "Open blogs",
        href: "/admin/content/blogs",
      },
      {
        id: "pages",
        label: "Pages",
        title: "Update marketing pages",
        body: "Home pillars, about, and service landing copy.",
        cta: "Open pages",
        href: "/admin/content/pages",
      },
      {
        id: "stories",
        label: "Stories",
        title: "Curate testimonials",
        body: "Approve and feature newcomer success stories.",
        cta: "Open testimonials",
        href: "/admin/content/testimonials",
      },
    ],
    journey: [
      {
        id: "draft",
        label: "Draft",
        href: "/admin/content",
        doneWhen: (s) => (s.drafts || 0) > 0,
      },
      {
        id: "seo",
        label: "SEO pass",
        href: "/admin/content",
        doneWhen: () => false,
      },
      {
        id: "publish",
        label: "Publish",
        href: "/admin/content",
        doneWhen: (s) => (s.published || 0) > 0,
      },
      {
        id: "promote",
        label: "Promote",
        href: "/blog",
        doneWhen: () => false,
      },
    ],
    features: [
      {
        id: "dash-calendar",
        eyebrow: "Feature 01 · Editorial",
        title: "Publish checklist",
        body: "Ship content that matches First Step pillars.",
        type: "checklist",
        checklistStorageKey: "fswg:editor:publish",
        checklist: [
          { id: "title", label: "Clear title + slug" },
          { id: "meta", label: "Meta description under 160 chars" },
          { id: "image", label: "Featured image set" },
          { id: "cta", label: "CTA points to book / apply / join network" },
          { id: "review", label: "Compliance-friendly claims (no guarantees of returns)" },
        ],
      },
      {
        id: "dash-pillars",
        eyebrow: "Feature 02 · Coverage",
        title: "Pillar coverage map",
        body: "Aim for balanced education across the business.",
        type: "info",
        infoLines: [
          "Rental guarantee & housing readiness",
          "Insurance protection & advisor career path",
          "Real estate & mortgage guidance",
          "Wealth building & financial education",
          "Entrepreneurship for newcomers",
        ],
      },
      {
        id: "dash-links",
        eyebrow: "Feature 03 · Destinations",
        title: "Content destinations",
        body: "Jump to CMS sections or preview the public blog.",
        type: "links",
        links: [
          {
            title: "All content",
            href: "/admin/content",
            blurb: "Pages, blogs, testimonials.",
          },
          {
            title: "Public blog",
            href: "/blog",
            blurb: "Preview what newcomers see.",
          },
        ],
      },
    ],
    resources: [
      {
        title: "All content",
        href: "/admin/content",
        blurb: "CMS home.",
      },
      {
        title: "Blogs",
        href: "/admin/content/blogs",
        blurb: "Articles.",
      },
      {
        title: "Pages",
        href: "/admin/content/pages",
        blurb: "Marketing pages.",
      },
      {
        title: "Testimonials",
        href: "/admin/content/testimonials",
        blurb: "Social proof.",
      },
    ],
  };
