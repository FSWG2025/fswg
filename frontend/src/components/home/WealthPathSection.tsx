import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, CalendarCheck, PiggyBank } from "lucide-react";
import LeadCaptureModal from "@/components/global/LeadCaptureModal";

const panel = "rounded-[28px] bg-[#F4F7FB] p-5 md:p-6";
const chartCard = "rounded-[22px] bg-white p-4 shadow-[0_8px_24px_rgba(18,33,62,0.04)] sm:p-5";

const steps = [
  {
    icon: PiggyBank,
    title: "Pick a number you can keep",
    body: "Start with a monthly amount that fits your budget. Consistency matters more than a large first deposit.",
  },
  {
    icon: BookOpen,
    title: "Learn the basics without pressure",
    body: "Use the calculator as a teaching tool. Ask about RRSPs, TFSAs, and how newcomers usually begin investing in Canada.",
  },
  {
    icon: CalendarCheck,
    title: "Turn the projection into a plan",
    body: "Book a free discovery call. An advisor can help you set goals, timelines, and next steps that match your situation.",
  },
];

/**
 * Bridge between the wealth calculator and FAQ.
 * Matches WealthProjectionSection light panel / white card language.
 */
const WealthPathSection = () => {
  const [leadOpen, setLeadOpen] = useState(false);

  return (
    <section
      id="wealth-path"
      className="bg-[#E4EFF8] py-12 md:py-16"
      aria-labelledby="wealth-path-heading"
    >
      <div className="mx-auto w-[98%] md:w-full md:max-w-[1100px]">
        <h2
          id="wealth-path-heading"
          className="section-headline text-center text-[#12213E]"
        >
          Make the projection <span className="text-[#C69259]">useful</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed text-[#6B7280]">
          The chart shows what steady deposits can become. Here is a simple way
          to move from curiosity to a habit—and, when you are ready, a real
          conversation.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-12">
          <article className={`${panel} md:col-span-12`}>
            <p className="text-sm font-semibold text-[#6B7280]">After the numbers</p>
            <h3 className="mt-2 max-w-xl text-[1.65rem] font-bold leading-tight tracking-tight text-[#12213E]">
              Three quiet steps between a projection and a plan.
            </h3>

            <ol className="mt-6 grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.li
                    key={step.title}
                    className={chartCard}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.06 * index }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E4EFF6] text-[#12213E]">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Step {index + 1}
                      </span>
                    </div>
                    <h4 className="mt-4 text-base font-bold leading-snug text-[#12213E]">
                      {step.title}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                      {step.body}
                    </p>
                  </motion.li>
                );
              })}
            </ol>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setLeadOpen(true)}
                className="cta-email !w-full justify-between ring-1 ring-[#E4EFF6] sm:!w-fit sm:justify-start"
              >
                <span className="whitespace-nowrap">Book a free discovery call</span>
                <span className="cta-email-arrow">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  document.getElementById("faq")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
                className="text-sm font-semibold text-[#6B7280] underline-offset-4 transition hover:text-[#12213E] hover:underline"
              >
                Or browse common questions below
              </button>
            </div>
          </article>
        </div>
      </div>

      {leadOpen && (
        <LeadCaptureModal isOpen onClose={() => setLeadOpen(false)} />
      )}
    </section>
  );
};

export default WealthPathSection;
