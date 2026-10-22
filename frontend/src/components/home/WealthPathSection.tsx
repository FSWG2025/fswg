import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, CalendarCheck, PiggyBank } from "lucide-react";
import LeadCaptureModal from "@/components/global/LeadCaptureModal";

const panel = "rounded-[22px] bg-[#F4F7FB] p-4 sm:rounded-[28px] sm:p-5 md:p-6";
const chartCard =
  "rounded-[18px] bg-white p-4 shadow-[0_8px_24px_rgba(18,33,62,0.04)] sm:rounded-[22px] sm:p-5";

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
      className="bg-[#E4EFF8] py-10 sm:py-12 md:py-16"
      aria-labelledby="wealth-path-heading"
    >
      <div className="mx-auto w-[98%] max-w-[1100px] px-1 sm:px-0">
        <h2
          id="wealth-path-heading"
          className="whitespace-nowrap text-center text-[clamp(1.9rem,6.5vw,2.75rem)] font-bold leading-none tracking-tight text-[#12213E]"
        >
          Make it <span className="text-[#C69259]">useful</span>
        </h2>
        <p className="mx-auto mt-3 max-w-md px-1 text-center text-sm leading-relaxed text-[#6B7280] sm:mt-4">
          The chart shows what steady deposits can become. Here is a simple way
          to move from curiosity to a habit, and when you are ready, a real
          conversation.
        </p>

        <div className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.article
                key={step.title}
                className={panel}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.05 * index }}
              >
                <div className={chartCard}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#E4EFF6] text-[#12213E] sm:h-10 sm:w-10">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Step {index + 1}
                    </span>
                  </div>
                  <h3 className="mt-3 text-[0.95rem] font-bold leading-snug text-[#12213E] sm:mt-4 sm:text-base">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                    {step.body}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col items-stretch gap-3 sm:mt-8 sm:flex-row sm:items-center sm:justify-center sm:gap-5">
          <button
            type="button"
            onClick={() => setLeadOpen(true)}
            className="cta-email !w-full max-w-full justify-between ring-1 ring-[#E4EFF6] sm:!w-fit sm:justify-start"
          >
            <span>Book a free discovery call</span>
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
            className="px-1 text-center text-sm font-semibold text-[#6B7280] underline-offset-4 transition hover:text-[#12213E] hover:underline"
          >
            Or browse common questions below
          </button>
        </div>
      </div>

      {leadOpen && (
        <LeadCaptureModal isOpen onClose={() => setLeadOpen(false)} />
      )}
    </section>
  );
};

export default WealthPathSection;
