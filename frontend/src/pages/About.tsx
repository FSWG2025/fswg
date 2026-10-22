import SEO from "@/components/SEO";
import TrustSection from "@/components/home/TrustSection";
import GlobalImpactSection from "@/components/home/GlobalImpactSection";
import { motion } from "framer-motion";

const About = () => {
  return (
    <>
      <SEO
        title="About First Step Wealth Group: Closing the Wealth Gap in Canada"
        description="Learn how First Step Wealth Group helps newcomers, immigrants, and underserved families across Canada with housing, rentals, insurance, wealth education, and real estate support."
        canonical="https://firststepwealthgroup.ca/about"
      />
      <main>
        <section className="bg-[#F4F5F7] pt-28 pb-16 md:pt-32 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-[640px] px-6"
          >
            <p className="text-[13px] font-semibold uppercase tracking-[0.22em] text-[#12213E]">
              First Step
            </p>
            <p className="mt-8 text-[5.5rem] font-bold leading-[0.7] text-[#12213E]" aria-hidden="true">
              “
            </p>
            <p className="mt-8 text-[1.65rem] font-medium leading-snug tracking-[-0.02em] text-[#12213E] md:text-[2rem]">
              We exist to close the wealth gap for newcomers, immigrants, and
              underserved families, one financial decision at a time.
            </p>
            <div className="mt-10 flex items-center justify-between gap-6">
              <p className="text-lg font-bold leading-snug text-[#12213E]">Mr. Kaffo, CEO.</p>
              <p className="text-[5.5rem] font-bold leading-[0.7] text-[#12213E]" aria-hidden="true">
                ”
              </p>
            </div>
            <div className="mt-8 border-t border-[#12213E]/25 pt-4 text-center text-[15px] text-[#12213E]">
              Financial stability isn&apos;t a privilege, it&apos;s a right. And
              we&apos;re here to make it accessible to everyone.
            </div>
            <p className="mt-8 text-center text-sm leading-relaxed text-[#6B7280]">
              First Step Wealth Group supports newcomers and families through financial
              education, rental guarantees, insurance advisory, and real estate guidance.
              Below you&apos;ll find the partners and programs we work with, and a look at the
              community impact we aim to grow across Canada.
            </p>
          </motion.div>
        </section>
        <TrustSection />
        <GlobalImpactSection />
      </main>
    </>
  );
};

export default About;
