import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronRight, MessageCircle } from "lucide-react";
import { allFaqs } from "@/features/marketing/faq/faqData";
import { ContactFormModal } from "@/features/marketing/faq/ContactFormModal";

const WHATSAPP_NUMBER = "+19055192873";

const openWhatsApp = (message: string) => {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
};

const FAQSection = () => {
  const [active, setActive] = useState(0);
  const [contactOpen, setContactOpen] = useState(false);
  const current = allFaqs[active] || allFaqs[0];

  const cycleNext = () => setActive((i) => (i + 1) % allFaqs.length);

  return (
    <section id="faq" className="bg-[#E4EFF8] py-16 md:py-24">
      <div className="mx-auto w-[98%]">
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#12213E] via-[#1a2d4d] to-[#12213E] px-5 py-8 shadow-[0_24px_64px_rgba(18,33,62,0.28)] sm:rounded-[32px] sm:px-8 sm:py-10 md:px-10 md:py-12 lg:px-12">
          {/* Warm gold accents: tree-quote + free-call palette */}
          <div className="pointer-events-none absolute -left-16 top-1/4 h-56 w-56 rounded-full bg-[#C69259]/25 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-[#F3DFC7]/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-2 select-none text-[clamp(5rem,18vw,11rem)] font-extrabold leading-none tracking-tighter text-white/[0.06] sm:right-6">
            faq
          </div>

          <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-12 xl:gap-16">
            {/* Left: stacked answer card */}
            <div
              className="relative mx-auto w-full max-w-[420px] lg:mx-0"
              data-aos="fade-right"
            >
              <div
                aria-hidden
                className="absolute inset-x-3 top-3 bottom-0 -rotate-[7deg] rounded-[22px] bg-white/40 shadow-md"
              />
              <div
                aria-hidden
                className="absolute inset-x-1.5 top-1.5 bottom-0 -rotate-[3.5deg] rounded-[22px] bg-white/70 shadow-lg"
              />
              <button
                type="button"
                onClick={cycleNext}
                className="relative w-full cursor-pointer rounded-[22px] bg-white p-6 text-left shadow-[0_20px_50px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 sm:p-7"
                aria-label="Show next FAQ answer"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.question}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C69259]">
                      {current.category}
                    </p>
                    <h3 className="mt-3 text-[1.15rem] font-bold leading-snug text-[#12213E] sm:text-[1.35rem]">
                      {current.question}
                    </h3>
                    <div className="my-4 border-t border-dashed border-[#E5EAF0]" />
                    <p className="text-sm leading-relaxed text-[#6B7280]">
                      {current.answer}
                    </p>
                    <p className="mt-6 text-right text-[11px] font-medium text-[#9CA3AF]">
                      Click card to cycle next →
                    </p>
                  </motion.div>
                </AnimatePresence>
              </button>
            </div>

            {/* Right: title + question list */}
            <div className="relative min-w-0" data-aos="fade-left" data-aos-delay="100">
              <h2 className="max-w-md text-[clamp(1.65rem,3.2vw,2.55rem)] font-bold leading-[1.15] tracking-tight text-white">
                Simplify your journey with{" "}
                <span className="text-[#C69259]">First Step</span>
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70 sm:text-[15px]">
                Got questions? Explore our FAQ on rentals, insurance, wealth, and
                how we help newcomers and families in Canada.
              </p>

              <ul className="mt-7 max-h-[min(52vh,420px)] space-y-1.5 overflow-y-auto overscroll-contain pr-1 sm:mt-8">
                {allFaqs.map((faq, idx) => {
                  const selected = idx === active;
                  return (
                    <li key={faq.question}>
                      <button
                        type="button"
                        onClick={() => setActive(idx)}
                        className={`group flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition sm:px-4 ${
                          selected
                            ? "bg-white/15 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                            : "hover:bg-white/8"
                        }`}
                      >
                        <span
                          className={`min-w-0 flex-1 text-sm font-medium leading-snug sm:text-[15px] ${
                            selected ? "text-white" : "text-white/85"
                          }`}
                        >
                          {faq.question}
                        </span>
                        <ChevronRight
                          className={`h-4 w-4 shrink-0 transition ${
                            selected
                              ? "text-[#C69259]"
                              : "text-white/45 group-hover:text-[#C69259]"
                          }`}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#C69259] px-5 py-3 text-sm font-semibold text-[#12213E] transition hover:bg-[#D4A574]"
                >
                  Ask a question <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    openWhatsApp(
                      "Hi! I have a question about First Step Wealth Group services.",
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
                >
                  <MessageCircle className="h-4 w-4 text-[#25D366]" /> WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ContactFormModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
      />
    </section>
  );
};

export default FAQSection;
