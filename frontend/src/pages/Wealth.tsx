import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import WealthProjectionSection from "@/components/home/WealthProjectionSection";

const Wealth = () => {
  return (
    <>
      <SEO
        title="Wealth Calculator & Financial Education for Newcomers"
        description="Use First Step Wealth Group’s wealth calculator and education tools to project savings growth and take confident first steps toward financial stability in Canada."
        canonical="https://firststepwealthgroup.ca/wealth"
        keywords={[
          "wealth calculator Canada",
          "financial education newcomers",
          "savings growth Canada",
          "investing for immigrants",
          "First Step Wealth Group",
        ]}
      />
      <main className="pt-24 md:pt-28">
        <section className="mx-auto max-w-[720px] px-4 pb-2 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#C69259]">
              Wealth Education
            </p>
            <h1 className="section-headline mt-3 text-[#12213E]">
              See how steady savings can grow over time
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-[#6B7280]">
              This calculator is an educational tool. Enter a monthly deposit, choose a return
              rate, and explore how your projected total can change over decades. It is meant to
              illustrate the idea of compounding, not a promise of future investment results.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#6B7280]">
              Adjust the inputs below to see projected totals by year, then speak with an advisor
              if you want help turning a savings habit into a real plan.
            </p>
          </motion.div>
        </section>
        <WealthProjectionSection />
      </main>
    </>
  );
};

export default Wealth;
