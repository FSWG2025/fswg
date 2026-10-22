import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import type { Content } from "@/types";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import SEO from "@/components/SEO";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      try {
        const { data } = await api.get(`/content/${slug}`);
        setPost(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E4EFF8]">
        <div className="animate-spin h-10 w-10 border-4 border-[#C69259] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E4EFF8]">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#12213E] mb-4">Post Not Found</h1>
          <Link to="/blog" className="text-[#C69259] hover:underline font-semibold">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E4EFF8]">
      <SEO
        title={post.title}
        description={post.metaDescription || post.body?.replace(/<[^>]*>/g, "").substring(0, 160)}
        canonical={`/blog/${post.slug}`}
        ogType="article"
      />
      {/* Header */}
      <div className="bg-gradient-to-r from-[#12213E] to-[#1E3A5F] pt-28 pb-12 md:pt-32 md:pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4"
          >
            {post.title}
          </motion.h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(post.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {Math.ceil(post.body?.length / 1000 || 1)} min read
            </span>
            {post.author && (
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {(post.author as any)?.name || "FSWG Team"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12"
        >
          <div
            className="prose prose-lg max-w-none prose-headings:text-[#12213E] prose-a:text-[#C69259] prose-img:rounded-2xl"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.body) }}
          />
        </motion.div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-[#C69259] to-[#D4A96A] rounded-3xl p-8 md:p-12 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Take Your First Step?</h3>
          <p className="text-white/80 mb-6">Book a free consultation with our experts today.</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-[#12213E] rounded-full px-8 py-4 font-bold shadow-lg hover:bg-gray-100 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;