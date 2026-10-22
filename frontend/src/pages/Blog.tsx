import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Shield,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { api } from "@/lib/api";
import type { Content } from "@/types";
import SEO from "@/components/SEO";
import LeadCaptureModal from "@/components/global/LeadCaptureModal";

const TOPIC_TAGS = [
  "Rental Guarantee",
  "Insurance",
  "Real Estate",
  "Wealth Building",
  "Credit Building",
  "Newcomers",
  "Financial Education",
  "Mortgage Guidance",
];

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&w=900&q=80",
];

const readMinutes = (body?: string) => Math.max(1, Math.ceil((body?.length || 400) / 1000));

const excerpt = (post: Content) =>
  post.metaDescription ||
  post.body?.replace(/<[^>]*>/g, "").substring(0, 140) ||
  "Insights from First Step Wealth Group.";

const postImage = (post: Content, index: number) =>
  post.featuredImage || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
};

const Blog = () => {
  const [posts, setPosts] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [leadOpen, setLeadOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/content?type=blog&published=true");
        setPosts(Array.isArray(data) ? data : data.content || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const featured = posts[0];
  const gridPosts = useMemo(() => {
    const rest = posts.slice(1);
    return showAll ? rest : rest.slice(0, 4);
  }, [posts, showAll]);

  const tagsFromPosts = useMemo(() => {
    const fromApi = posts.flatMap((p) => p.tags || []);
    const unique = [...new Set([...fromApi, ...TOPIC_TAGS])];
    return unique.slice(0, 10);
  }, [posts]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F6F8]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C69259] border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Financial Insights & Blog"
        description="Expert articles on wealth building, insurance, real estate, and financial education for Canadian families."
      />

      <main className="overflow-hidden bg-[#F4F6F8] pb-8 pt-32 md:pt-40">
        {/* ── Hero ── */}
        <section className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <div className="grid items-start gap-8 lg:grid-cols-[0.95fr_1.15fr_0.85fr] lg:gap-6">
            {/* Copy */}
            <motion.div
              {...fadeUp}
              className="text-center lg:pt-6 lg:text-left"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C69259]">
                Financial Insights
              </p>
              <h1 className="mt-3 text-[clamp(2.1rem,4.5vw,3.4rem)] font-bold leading-[1.05] tracking-tight text-[#12213E]">
                Your wealth.
                <span className="mt-1 block text-[#C69259]">Your first step.</span>
              </h1>
              <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-[#6B7280] lg:mx-0">
                Practical articles on rental support, insurance, real estate, and building wealth
                as a newcomer or family in Canada.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <button type="button" onClick={() => setLeadOpen(true)} className="cta-email">
                  <span className="whitespace-nowrap">Connect Now</span>
                  <span className="cta-email-arrow">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
              </div>

              <div className="mt-8 flex items-center justify-center gap-3 lg:justify-start">
                <div className="flex -space-x-2">
                  {["/fswgLogo.jpg", "/fswgLogo.jpg", "/fswgLogo.jpg"].map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-sm"
                      style={{ zIndex: 3 - i }}
                    />
                  ))}
                </div>
                <p className="max-w-[160px] text-left text-xs leading-snug text-[#6B7280]">
                  <span className="font-bold text-[#12213E]">33+</span> advisors helping families
                  across Canada
                </p>
              </div>
            </motion.div>

            {/* Featured visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-[32px]">
                <img
                  src={
                    featured
                      ? postImage(featured, 0)
                      : "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1000&q=80"
                  }
                  alt={featured?.title || "Financial insights"}
                  className="aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12213E]/55 via-transparent to-transparent" />

                {featured ? (
                  <Link
                    to={`/blog/${featured.slug}`}
                    className="absolute inset-x-4 bottom-4 rounded-[22px] bg-white/95 p-4 shadow-lg backdrop-blur-sm transition hover:bg-white"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C69259]">
                      Featured read
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm font-bold text-[#12213E]">
                      {featured.title}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#12213E]">
                      Read article <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                ) : (
                  <div className="absolute inset-x-4 bottom-4 rounded-[22px] bg-white/95 p-4 shadow-lg backdrop-blur-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C69259]">
                      Coming soon
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#12213E]">
                      Fresh insights are on the way
                    </p>
                  </div>
                )}
              </div>

              <div className="absolute -left-2 top-6 hidden rounded-2xl bg-white px-3 py-2 shadow-[0_12px_30px_rgba(18,33,62,0.12)] sm:block lg:-left-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  Reader focus
                </p>
                <p className="mt-0.5 text-sm font-bold text-[#12213E]">Practical & clear</p>
              </div>
            </motion.div>

            {/* Topic cloud */}
            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.12 }}
              className="rounded-[32px] bg-gradient-to-br from-[#E4EFF8] via-[#F7EFE4] to-[#E8EEF3] p-5 sm:p-6 lg:min-h-[420px]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
                Topics that grow with you
              </p>
              <h2 className="mt-2 text-xl font-bold leading-snug text-[#12213E]">
                Insights that improve as your life does
              </h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {tagsFromPosts.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#12213E] shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-8 rounded-[22px] bg-white/80 p-4 backdrop-blur-sm">
                <BookOpen className="h-5 w-5 text-[#C69259]" />
                <p className="mt-2 text-sm font-bold text-[#12213E]">
                  {posts.length > 0 ? `${posts.length} published articles` : "Library launching soon"}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#6B7280]">
                  Written for newcomers and families building stability in Canada.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Learn with us ── */}
        <section className="mx-auto mt-14 max-w-[1180px] px-4 sm:px-6 md:mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-[32px] bg-gradient-to-br from-[#E4EFF8] via-[#F7EFE4] to-[#E8EEF3]"
          >
            <div className="grid items-stretch lg:grid-cols-2">
              <div className="relative min-h-[240px] lg:min-h-full">
                <img
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=900&q=80"
                  alt="Advisor conversation"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-2xl font-bold text-[#12213E] sm:text-3xl">
                    Learn with First Step
                  </h2>
                  <button
                    type="button"
                    onClick={() => setLeadOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-[#12213E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0D1A2E]"
                  >
                    Join Us
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-[#6B7280]">
                  Our blog supports the same mission as our services: clearer financial decisions
                  for newcomers and underserved families, one article at a time.
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[22px] bg-white/80 p-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#12213E] text-white">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <h3 className="mt-3 text-sm font-bold uppercase tracking-wide text-[#12213E]">
                      Our Vision
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#6B7280]">
                      Close the wealth gap with education that is practical, honest, and accessible.
                    </p>
                  </div>
                  <div className="rounded-[22px] bg-white/80 p-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#12213E] text-white">
                      <Shield className="h-4 w-4" />
                    </span>
                    <h3 className="mt-3 text-sm font-bold uppercase tracking-wide text-[#12213E]">
                      Our Mission
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#6B7280]">
                      Help families rent, protect, and grow, through clear guidance and trusted
                      support.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── Articles grid ── */}
        <section className="mx-auto mt-16 max-w-[1180px] px-4 sm:px-6 md:mt-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="section-headline text-[#12213E]">Our latest articles</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#6B7280]">
              Browse guides on insurance, renting in Canada, real estate, and long‑term wealth
              habits, written for real life decisions.
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="mt-12 rounded-[32px] bg-white px-6 py-16 text-center shadow-[0_12px_40px_rgba(18,33,62,0.05)]">
              <BookOpen className="mx-auto h-12 w-12 text-[#C69259]/50" />
              <p className="mt-4 text-lg font-bold text-[#12213E]">No articles yet</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-[#6B7280]">
                Check back soon. This page is ready to showcase published insights from First Step
                Wealth Group.
              </p>
              <div className="mt-6 flex justify-center">
                <button type="button" onClick={() => setLeadOpen(true)} className="cta-email">
                  <span className="whitespace-nowrap">Get updates</span>
                  <span className="cta-email-arrow">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-10 grid gap-5 sm:grid-cols-2">
                {(featured && posts.length === 1 ? posts : gridPosts).map((post, idx) => {
                  const imageIndex = featured && posts.length > 1 ? idx + 1 : idx;
                  return (
                    <motion.div
                      key={post._id}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.06 }}
                    >
                      <Link
                        to={`/blog/${post.slug}`}
                        className="group flex h-full flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_12px_40px_rgba(18,33,62,0.06)] transition hover:shadow-[0_18px_50px_rgba(18,33,62,0.1)]"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <img
                            src={postImage(post, imageIndex)}
                            alt=""
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                          />
                          {idx === 1 && (
                            <div className="absolute bottom-3 left-3 rounded-2xl bg-white/95 px-3 py-2 shadow-md backdrop-blur-sm">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-3.5 w-3.5 text-[#C69259]" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#12213E]">
                                  {post.viewCount > 0 ? `${post.viewCount} views` : "Editor pick"}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col p-5 sm:p-6">
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#6B7280]">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(post.updatedAt).toLocaleDateString()}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {readMinutes(post.body)} min read
                            </span>
                          </div>
                          <h3 className="mt-3 text-lg font-bold leading-snug text-[#12213E] transition group-hover:text-[#C69259] sm:text-xl">
                            {post.title}
                          </h3>
                          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-[#6B7280]">
                            {excerpt(post)}
                          </p>
                          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#12213E]">
                            Read more
                            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {posts.length > 5 && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowAll((v) => !v)}
                    className="inline-flex items-center gap-2 rounded-full bg-[#12213E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0D1A2E]"
                  >
                    {showAll ? "Show less" : "View all"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* ── Bottom band ── */}
        <section className="mx-auto mt-16 max-w-[1180px] px-4 sm:px-6 md:mt-24">
          <div className="rounded-[32px] bg-[#E4EFF8] px-6 py-12 text-center sm:px-10 md:py-16">
            <h2 className="text-[clamp(1.6rem,3vw,2.4rem)] font-bold tracking-tight text-[#12213E]">
              Guides, tips & wealth education
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#6B7280]">
              Prefer a conversation? Book a free discovery call, or explore our rental, insurance,
              and real estate pages while you wait for the next article.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button type="button" onClick={() => setLeadOpen(true)} className="cta-email">
                <span className="whitespace-nowrap">Book a Call</span>
                <span className="cta-email-arrow">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
              <Link
                to="/wealth"
                className="inline-flex items-center gap-2 rounded-full border border-[#12213E]/12 bg-white px-5 py-3 text-sm font-semibold text-[#12213E] transition hover:bg-[#F7FBFE]"
              >
                Wealth calculator
              </Link>
            </div>
          </div>
        </section>
      </main>

      {leadOpen && <LeadCaptureModal isOpen onClose={() => setLeadOpen(false)} />}
    </>
  );
};

export default Blog;
