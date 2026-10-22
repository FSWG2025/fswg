import { Link } from "react-router";
import { ArrowRight, BookOpen, CheckCircle2, Circle } from "lucide-react";
import type { ClientFeaturePanelsProps } from "../types";

export default function LearningDocsPanel({
  navigate,
  posts,
  docItems,
  docs,
  setDocs,
}: ClientFeaturePanelsProps) {
  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-2">
      <section
        id="dash-learning"
        className="scroll-mt-24 rounded-2xl border border-[#E5EAF0] bg-white p-5 shadow-[0_1px_2px_rgba(18,33,62,0.04),0_8px_24px_rgba(18,33,62,0.04)] sm:p-6"
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C69259]">
              Feature 06 · Learning hub
            </p>
            <h3 className="mt-1 text-lg font-bold text-[#12213E]">
              From the First Step blog
            </h3>
          </div>
          <BookOpen className="h-5 w-5 text-[#C69259]" />
        </div>
        <ul className="mt-4 space-y-2">
          {posts.length === 0 ? (
            <li className="rounded-xl bg-[#F7FBFE] px-3 py-4 text-sm text-[#6B7280]">
              No articles yet. Check back soon.
            </li>
          ) : (
            posts.map((post: any) => (
              <li key={post._id || post.slug}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="flex items-center justify-between rounded-xl border border-[#EEF2F6] px-3 py-2.5 hover:border-[#C69259]/40"
                >
                  <span className="text-sm font-semibold text-[#12213E]">
                    {post.title}
                  </span>
                  <ArrowRight className="h-4 w-4 text-[#C69259]" />
                </Link>
              </li>
            ))
          )}
        </ul>
        <button
          type="button"
          onClick={() => navigate("/blog")}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#C69259]"
        >
          Browse all articles <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      <section
        id="dash-docs"
        className="scroll-mt-24 rounded-2xl border border-[#E5EAF0] bg-white p-5 shadow-[0_1px_2px_rgba(18,33,62,0.04),0_8px_24px_rgba(18,33,62,0.04)] sm:p-6"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C69259]">
          Feature 07 · Document vault
        </p>
        <h3 className="mt-1 text-lg font-bold text-[#12213E]">
          Document checklist
        </h3>
        <p className="mt-1 text-sm text-[#6B7280]">
          Track what you have ready to upload for applications.
        </p>
        <ul className="mt-4 space-y-2">
          {docItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() =>
                  setDocs((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                }
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-[#F7FBFE]"
              >
                {docs[item.id] ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#65A30D]" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-[#CBD5E1]" />
                )}
                <span
                  className={`text-sm ${
                    docs[item.id]
                      ? "font-medium text-[#12213E] line-through opacity-60"
                      : "text-[#334155]"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => navigate("/app/documents")}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#C69259]"
        >
          Open document vault <ArrowRight className="h-4 w-4" />
        </button>
      </section>
    </div>
  );
}
