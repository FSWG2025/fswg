import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { AlertTriangle, ArrowRight, Plus, X } from "lucide-react";
import { useAuth } from "@/hooks/AuthProvider";
import LeadCaptureModal from "@/components/global/LeadCaptureModal";
import { useNavigate } from "react-router";

const Hero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [popupDismissed, setPopupDismissed] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const trustRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (popupDismissed) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !showPopup) setShowPopup(true);
      },
      { threshold: 0.45 },
    );
    const el = trustRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [showPopup, popupDismissed]);

  const handleBookCall = () => {
    if (user) navigate("/dashboard");
    else setLeadModalOpen(true);
  };

  return (
    <section className="px-0 pb-6 pt-24 sm:px-5 sm:pt-28 lg:px-8">
      <div className="relative mx-auto max-w-[1180px] overflow-visible rounded-[32px] bg-[#E4EFF6] px-0 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        <div className="grid items-center gap-8 md:grid-cols-[1.05fr_0.95fr] md:gap-8 lg:gap-10">
          <div className="order-2 px-5 md:order-1 md:px-0">
            <p className="text-center text-xs font-semibold text-[#C69259] md:text-left">
              For newcomers and families in Canada
            </p>
            <h1 className="section-headline mx-auto mt-4 flex w-full max-w-[540px] flex-col gap-2 text-center text-[#12213E] md:mx-0 md:text-left lg:gap-2.5">
              <span>Your First Step</span>
              <span>Into a Lifetime</span>
              <span>
                of
                <span className="ml-[0.45em] text-[#C69259]">Wealth.</span>
              </span>
            </h1>
            <p className="mt-4 max-w-[400px] text-sm leading-relaxed text-[#12213E]/80 sm:text-[15px]">
              Financial education, real‑estate expertise, insurance protection,
              and entrepreneurial guidance to turn uncertainty into lasting
              prosperity.
            </p>
            <form
              className="mt-6 max-w-[420px]"
              onSubmit={(e) => {
                e.preventDefault();
                handleBookCall();
              }}
            >
              <label className="flex items-center rounded-full bg-white py-1.5 pl-5 pr-1.5 shadow-[0_10px_30px_rgba(18,33,62,0.08)]">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  aria-label="Your email address"
                  className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[#12213E] outline-none placeholder:text-[#12213E]/60"
                />
                <button
                  type="submit"
                  aria-label={user ? "Dashboard" : "Book a call"}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#12213E] text-white"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </label>
            </form>
            <div
              ref={trustRef}
              className="mt-4 flex max-w-[460px] flex-wrap items-center gap-x-4 gap-y-2"
            >
              {PATHS.map((item, index) => (
                <motion.span
                  key={item.label}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#12213E]/85"
                  initial={
                    reduceMotion
                      ? false
                      : { y: -80, scale: 0.8 }
                  }
                  animate={{ y: 0, scale: 1 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 520,
                          damping: 12,
                          delay: 0.2 + index * 0.12,
                        }
                  }
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white ${item.dot}`}
                  >
                    <Plus className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                  {item.label}
                </motion.span>
              ))}
            </div>
            <p className="mt-5 max-w-[400px] text-sm text-[#12213E]/80">
              Your future is built on the steps you take today.
            </p>
          </div>

          <Portrait
            onRent={() => navigate("/rental-guarantee")}
            onJoin={() => navigate("/register")}
          />
        </div>
        <p className="mt-6 px-5 text-xs text-[#12213E]/70 sm:px-0">
          First Step Wealth Group has been guiding families toward financial
          freedom since 2022.
        </p>
      </div>

      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-[#0A1428]/72 p-4 backdrop-blur-[6px] sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowPopup(false);
              setPopupDismissed(true);
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="hero-nudge-title"
              initial={{ opacity: 0, y: 40, scale: 0.92 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                boxShadow: [
                  "0 0 0 0 rgba(198,146,89,0.55)",
                  "0 0 0 14px rgba(198,146,89,0)",
                  "0 0 0 0 rgba(198,146,89,0.55)",
                ],
              }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{
                type: "spring",
                stiffness: 360,
                damping: 24,
                boxShadow: {
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeOut",
                },
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[420px] overflow-hidden rounded-[28px] bg-white shadow-[0_32px_80px_rgba(0,0,0,0.45)]"
            >
              <div className="relative overflow-hidden bg-[#12213E] px-6 pb-8 pt-7 text-center sm:px-8">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -left-10 -top-10 h-36 w-36 rounded-full bg-[#C69259]/35 blur-3xl"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-12 -right-8 h-40 w-40 rounded-full bg-[#C69259]/20 blur-3xl"
                />
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => {
                    setShowPopup(false);
                    setPopupDismissed(true);
                  }}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>

                <motion.div
                  className="relative mx-auto flex h-16 w-16 items-center justify-center"
                  animate={
                    reduceMotion
                      ? undefined
                      : { scale: [1, 1.08, 1] }
                  }
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span className="absolute inset-0 rounded-full bg-[#C69259]/35 blur-md" />
                  <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#C69259] text-[#12213E] shadow-[0_0_28px_rgba(198,146,89,0.65)]">
                    <AlertTriangle className="h-7 w-7" strokeWidth={2.5} />
                  </span>
                </motion.div>

                <p className="relative mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#C69259]/50 bg-[#C69259]/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#F3DFC7]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C69259]" />
                  Do not skip this
                </p>

                <h2
                  id="hero-nudge-title"
                  className="relative mt-3 text-[clamp(1.55rem,5.5vw,1.95rem)] font-extrabold leading-[1.15] tracking-tight text-white"
                >
                  It Is Risky To{" "}
                  <span className="text-[#C69259]">Ignore This</span>
                </h2>
                <p className="relative mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/75">
                  Every day newcomers lose housing, coverage, and time because
                  they waited. If you need{" "}
                  <span className="font-semibold text-white">rental support</span>,{" "}
                  <span className="font-semibold text-white">insurance</span>, or a{" "}
                  <span className="font-semibold text-white">wealth plan</span> -
                  this is your moment.
                </p>
              </div>

              <div className="space-y-2.5 bg-white px-5 py-5 sm:px-7 sm:py-6">
                <motion.button
                  type="button"
                  onClick={() => {
                    setShowPopup(false);
                    setPopupDismissed(true);
                    handleBookCall();
                  }}
                  className="flex w-full items-center justify-between rounded-full bg-[#C69259] py-1.5 pl-5 pr-1.5 text-left text-sm font-bold text-[#12213E] shadow-[0_12px_32px_rgba(198,146,89,0.45)] transition hover:bg-[#D4A574]"
                  animate={
                    reduceMotion
                      ? undefined
                      : { scale: [1, 1.02, 1] }
                  }
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="whitespace-nowrap">Book a free call now</span>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#12213E] text-white">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </motion.button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPopup(false);
                    setPopupDismissed(true);
                  }}
                  className="w-full rounded-2xl py-2.5 text-center text-xs font-semibold uppercase tracking-[0.12em] text-[#9CA3AF] transition hover:bg-[#F7F8FB] hover:text-[#6B7280]"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <LeadCaptureModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
      />
    </section>
  );
};

const PATHS = [
  { label: "Financial education", dot: "bg-[#12213E]" },
  { label: "Real-estate expertise", dot: "bg-[#C69259]" },
  { label: "Insurance protection and guidance", dot: "bg-[#6E93B5]" },
];

/** Dot-column heights (1–8) for the growth chart: early years soft, recent years brand. */
const GROWTH_COLUMNS = [
  { dots: 2, era: "past" as const },
  { dots: 3, era: "past" as const },
  { dots: 2, era: "past" as const },
  { dots: 4, era: "past" as const },
  { dots: 3, era: "past" as const },
  { dots: 5, era: "past" as const },
  { dots: 4, era: "now" as const },
  { dots: 6, era: "now" as const },
  { dots: 5, era: "now" as const },
  { dots: 7, era: "now" as const },
  { dots: 6, era: "now" as const },
  { dots: 8, era: "now" as const },
];

const GrowthDotChart = ({ className = "" }: { className?: string }) => (
  <figure
    aria-label="Since 2022. Families 100 plus. Advisors 33 plus."
    className={`overflow-hidden rounded-[20px] border border-[#12213E]/06 bg-white px-3 pb-2.5 pt-2.5 shadow-[0_14px_36px_rgba(18,33,62,0.14)] sm:rounded-[22px] sm:px-3.5 ${className}`}
  >
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#12213E]/45">
          Growth
        </p>
        <p className="mt-0.5 text-[22px] font-extrabold leading-none tracking-tight text-[#12213E] sm:text-2xl">
          100<span className="text-[#C69259]">+</span>
        </p>
      </div>
      <p className="pt-0.5 text-right text-[8px] font-semibold uppercase tracking-[0.08em] text-[#12213E]/40">
        <span className="text-[#12213E]/25">Since</span>{" "}
        <span className="text-[#C69259]">2022</span>
      </p>
    </div>

    <div className="mt-2.5 border-t border-[#12213E]/08 pt-2.5" aria-hidden>
      <div className="flex h-[72px] items-end justify-between gap-[3px] sm:h-[78px] sm:gap-1">
        {GROWTH_COLUMNS.map((col, i) => (
          <div
            key={i}
            className="flex flex-1 flex-col-reverse items-center gap-[3px]"
          >
            {Array.from({ length: col.dots }).map((_, d) => (
              <span
                key={d}
                className={`h-[5px] w-[5px] rounded-full sm:h-1.5 sm:w-1.5 ${
                  col.era === "now"
                    ? d === col.dots - 1
                      ? "bg-[#C69259]"
                      : "bg-[#12213E]"
                    : "bg-[#C5D4E3]"
                }`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex items-center justify-between font-mono text-[8px] font-medium tracking-tight text-[#12213E]/55 sm:text-[9px]">
        <span>
          2022 <span className="text-[#12213E]/35">12</span>
        </span>
        <span>
          Now <span className="font-semibold text-[#C69259]">100+</span>
        </span>
      </div>
    </div>
  </figure>
);

const Portrait = ({
  onRent,
  onJoin,
}: {
  onRent: () => void;
  onJoin: () => void;
}) => (
  <div className="relative order-1 mx-auto w-[98%] md:order-2 md:w-full md:max-w-none">
    <div className="relative h-[340px] sm:h-[400px] md:h-[440px] lg:h-[480px]">
      <img
        src="/hero-meeting.jpg"
        alt="Advisors meeting with a family"
        className="h-full w-full rounded-[28px] object-cover object-[center_28%] shadow-sm"
      />
      <button
        type="button"
        onClick={onJoin}
        className="absolute right-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-[#12213E] shadow-[0_8px_24px_rgba(18,33,62,0.12)] sm:right-4 sm:top-4 sm:px-3.5 sm:text-xs"
      >
        Join us
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
      <GrowthDotChart className="absolute left-4 top-4 z-10 hidden w-[188px] md:block" />
      <button
        type="button"
        onClick={onRent}
        className="absolute bottom-3 left-3 right-3 z-10 flex items-center rounded-full bg-white py-1.5 pl-5 pr-1.5 text-left shadow-[0_10px_30px_rgba(18,33,62,0.08)] sm:bottom-4 sm:left-4 sm:right-4"
      >
        <span className="min-w-0 flex-1 truncate text-sm text-[#12213E]">Rental guarantee</span>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#12213E] text-white">
          <ArrowRight className="h-4 w-4" />
        </span>
      </button>
    </div>
    <GrowthDotChart className="mt-3 w-full md:hidden" />
  </div>
);

export default Hero;
