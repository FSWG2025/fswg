import { motion } from "framer-motion";
import { Check, Info } from "lucide-react";

const panel = "rounded-[28px] bg-[#F4F7FB] p-5 md:p-6";
const chartCard = "rounded-[22px] bg-white p-4 shadow-[0_8px_24px_rgba(18,33,62,0.04)] sm:p-5";

const does = [
  "Illustrates how monthly deposits can grow with compounding over time",
  "Lets you compare decades so the effect of staying invested is easier to see",
  "Gives you a conversation starter before you talk with an advisor",
];

const doesNot = [
  "Promise a specific return — markets vary year to year",
  "Include fees, taxes, inflation, or product rules",
  "Replace personalized advice for your income, goals, or risk comfort",
];

/**
 * Educational clarity strip before FAQ — same light/white language as the calculator.
 */
const WealthClaritySection = () => {
  return (
    <section
      id="wealth-clarity"
      className="bg-[#E4EFF8] pb-16 pt-4 md:pb-24 md:pt-6"
      aria-labelledby="wealth-clarity-heading"
    >
      <div className="mx-auto w-[98%] md:w-full md:max-w-[1100px]">
        <h2
          id="wealth-clarity-heading"
          className="section-headline text-center text-[#12213E]"
        >
          What this tool <span className="text-[#C69259]">is</span> — and is not
        </h2>
        <p className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed text-[#6B7280]">
          Clear expectations make the calculator more helpful. Use it to explore
          ideas, then verify anything that matters with a real plan.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-12">
          <motion.article
            className={`${panel} md:col-span-7`}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-sm font-semibold text-[#6B7280]">Built for learning</p>
            <h3 className="mt-2 text-[1.65rem] font-bold leading-tight tracking-tight text-[#12213E]">
              A simple model of steady saving — not a forecast of your future.
            </h3>
            <div className={`${chartCard} mt-5`}>
              <ul className="space-y-3">
                {does.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-[#12213E]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E4EFF6] text-[#12213E]">
                      <Check className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.article>

          <motion.article
            className={`${panel} md:col-span-5`}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.08 }}
          >
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-[#C69259]" aria-hidden />
              <p className="text-sm font-semibold text-[#6B7280]">Important limits</p>
            </div>
            <h3 className="mt-2 text-[1.45rem] font-bold leading-tight tracking-tight text-[#12213E]">
              It does not…
            </h3>
            <div className={`${chartCard} mt-5`}>
              <ul className="space-y-3">
                {doesNot.map((item) => (
                  <li key={item} className="text-sm leading-relaxed text-[#6B7280]">
                    <span className="font-semibold text-[#12213E]">— </span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-[#E4EFF6] pt-4 text-xs leading-relaxed text-[#9CA3AF]">
                Assumed returns in the chart are educational examples only. Past
                or illustrated performance is not a guarantee of future results.
              </p>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
};

export default WealthClaritySection;
