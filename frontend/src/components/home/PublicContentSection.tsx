import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, BookOpen, MessageSquare, FileText } from "lucide-react";
import { Link } from "react-router";
import { api } from "@/lib/api";
import type { Content } from "@/types";

const PublicContentSection = () => {
  const [blogs, setBlogs] = useState<Content[]>([]);
  const [testimonials, setTestimonials] = useState<Content[]>([]);
  const [pages, setPages] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data } = await api.get("/content?published=true");
        setBlogs(data.filter((item: Content) => item.contentType === "blog").slice(0, 3));
        setTestimonials(data.filter((item: Content) => item.contentType === "testimonial").slice(0, 3));
        setPages(data.filter((item: Content) => item.contentType === "page").slice(0, 3));
      } catch (error) {
        console.error("Failed to load content", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (loading) {
    return (
      <section className="bg-[#E4EFF8] py-24 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#C69259] border-t-transparent rounded-full mx-auto" />
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="overflow-hidden bg-[#E4EFF8] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-16">
          <h2 className="section-headline mb-4 text-[#12213E]">Latest Insights</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">Read our articles, success stories, and resources.</p>
        </motion.div>

        {blogs.length > 0 && (
          <div className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-[#12213E] flex items-center gap-2"><BookOpen className="w-6 h-6 text-[#C69259]" /> Blog</h3>
              <Link to="/blog" className="text-[#C69259] font-semibold text-sm hover:underline flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogs.map((post) => (
                <Link key={post._id} to={`/blog/${post.slug}`} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow group">
                  <h4 className="text-lg font-bold text-[#12213E] mb-2 group-hover:text-[#C69259] transition-colors">{post.title}</h4>
                  <p className="text-sm text-gray-500 mb-4">{post.metaDescription || post.body?.substring(0, 120)}</p>
                  <span className="text-xs text-gray-400">{new Date(post.updatedAt).toLocaleDateString()}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {testimonials.length > 0 && (
          <div className="mb-20">
            <div className="flex items-center justify-between mb-8"><h3 className="text-2xl font-bold text-[#12213E] flex items-center gap-2"><MessageSquare className="w-6 h-6 text-[#C69259]" /> Testimonials</h3></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div key={t._id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <p className="text-gray-600 italic mb-4">"{t.body}"</p>
                  <p className="text-sm font-semibold text-[#12213E]">{t.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {pages.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8"><h3 className="text-2xl font-bold text-[#12213E] flex items-center gap-2"><FileText className="w-6 h-6 text-[#C69259]" /> Resources</h3></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pages.map((page) => (
                <div key={page._id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h4 className="text-lg font-bold text-[#12213E] mb-2">{page.title}</h4>
                  <p className="text-sm text-gray-500">{page.metaDescription || page.body?.substring(0, 120)}</p>
                  <button onClick={() => alert(page.body)} className="mt-4 text-[#C69259] font-semibold text-sm hover:underline">Read more</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PublicContentSection;