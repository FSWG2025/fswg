import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import TestimonialSection from "@/components/home/TestimonialSection";

const Testimonials = () => {
  return (
    <>
      <SEO
        title="Client Testimonials"
        description="Hear from newcomers and families who built their first steps toward financial stability with First Step Wealth Group."
        canonical="https://firststepwealthgroup.ca/testimonials"
      />
      <main className="pt-24 md:pt-28">
        <section className="mx-auto max-w-[720px] px-4 pb-2 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#C69259]">
              Client Stories
            </p>
            <h1 className="section-headline mt-3 text-[#12213E]">
              What our clients say about their first steps
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-[#6B7280]">
              These stories come from people who used First Step Wealth Group for rental support,
              insurance guidance, and broader financial coaching. Browse by topic to hear how
              others approached the same decisions you may be facing.
            </p>
          </motion.div>
        </section>
        <TestimonialSection />
      </main>
    </>
  );
};

export default Testimonials;
