import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  Home,
  KeyRound,
  LineChart,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router";
import SEO from "@/components/SEO";
import { useAuth } from "@/hooks/AuthProvider";
import LeadCaptureModal from "@/components/global/LeadCaptureModal";
import ConsultationBookingModal from "@/components/global/ConsultationBookingModal";
import {
  breadcrumbSchema,
  serviceSchema,
} from "@/lib/seo";

const IMG = {
  hero: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80",
  agents: "/real-estate-agents.jpg",
  mortgage: "/real-estate-mortgage.jpg",
  interior: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
  consult: "/real-estate-consult.jpg",
};

const benefitCards = [
  {
    image: IMG.mortgage,
    title: "Mortgage pre‑approval guidance",
    body: "We help you understand pre‑approval so you can shop with clarity, before you fall in love with a home you cannot yet finance.",
  },
  {
    image: IMG.agents,
    title: "Vetted agents & lenders",
    body: "Access top‑rated real estate professionals and lender relationships through our network, so you are not navigating the market alone.",
  },
];

const featureCards = [
  {
    icon: ClipboardCheck,
    title: "Step‑by‑step support",
    body: "From search to closing, we keep the process clear so first‑time buyers and investors know what comes next.",
  },
  {
    icon: LineChart,
    title: "Investment analysis",
    body: "When you are ready to grow beyond your first home, we help you look at investment property strategy with clearer numbers.",
  },
];

const steps = [
  {
    num: "01",
    title: "Initial consultation",
    body: "We learn your timeline, budget, and whether you are buying your first home or exploring an investment property, then map the right next steps.",
    image: IMG.consult,
  },
  {
    num: "02",
    title: "Mortgage & agent match",
    body: "We connect you with mortgage pre‑approval guidance and vetted real estate agents suited to your goals and location.",
    image: IMG.mortgage,
  },
  {
    num: "03",
    title: "Search to closing",
    body: "You get step‑by‑step support through offers, conditions, and closing, so the path from viewing to keys feels manageable.",
    image: IMG.interior,
  },
];

const RealEstate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leadOpen, setLeadOpen] = useState(false);
  const [consultOpen, setConsultOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const handleConsult = () => {
    if (user) setConsultOpen(true);
    else setLeadOpen(true);
  };

  const Cta = ({ label = "Book a Consultation" }: { label?: string }) => (
    <button type="button" onClick={handleConsult} className="cta-email">
      <span className="whitespace-nowrap">{label}</span>
      <span className="cta-email-arrow">
        <ArrowRight className="h-4 w-4" />
      </span>
    </button>
  );

  return (
    <>
      <SEO
        title="Real Estate Support & First-Time Home Buying Help in Canada"
        description="Real estate support for newcomers and families in Canada: mortgage pre-approval guidance, vetted agents, first-time home buying help, and investment property strategy with First Step Wealth Group."
        canonical="https://firststepwealthgroup.ca/real-estate"
        keywords={[
          "real estate Canada",
          "real estate support newcomers",
          "first-time home buyer Canada",
          "mortgage pre-approval guidance",
          "housing Canada immigrants",
          "buy a home in Canada",
          "real estate agents Canada",
          "investment property Canada",
          "First Step Wealth Group real estate",
        ]}
        structuredData={[
          serviceSchema({
            name: "Real Estate Support",
            description:
              "Mortgage guidance, vetted agents, and step-by-step support for first-time buyers and investors in Canada.",
            path: "/real-estate",
            serviceType: "Real estate advisory",
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Real Estate", path: "/real-estate" },
          ]),
        ]}
      />

      <main className="bg-[#F4F6F8] pb-8">
        {/* ── Hero ── */}
        <section className="px-3 pt-32 sm:px-5 md:pt-40 lg:px-8">
          <div className="relative mx-auto max-w-[1180px] overflow-hidden rounded-[32px]">
            <img
              src={IMG.hero}
              alt="Modern home in Canada"
              className="h-[min(78vh,720px)] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#12213E]/85 via-[#12213E]/35 to-[#12213E]/15" />

            <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-8 lg:p-10">
              <div className="flex items-start justify-between gap-4">
                <p className="text-[clamp(2.5rem,8vw,5.5rem)] font-bold leading-none tracking-tight text-white/25">
                  FSWG
                </p>
                <span className="hidden rounded-full bg-white/15 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md sm:inline-flex">
                  Real Estate Support
                </span>
              </div>

              <div className="grid items-end gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <p className="max-w-sm text-sm text-white/75">
                    From first‑time buyer to investor, clearer guidance from search to closing.
                  </p>
                  <h1 className="mt-3 max-w-xl text-[clamp(1.85rem,4.5vw,3.25rem)] font-bold leading-[1.05] tracking-tight text-white">
                    Stop renting.
                    <span className="mt-1 block text-[#C69259]">Start owning.</span>
                  </h1>
                  <div className="mt-6">
                    <Cta />
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <div className="rounded-[22px] bg-white/95 p-4 shadow-lg backdrop-blur-sm sm:flex-1">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E4EFF6] text-[#12213E]">
                        <Users className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-lg font-bold leading-none text-[#12213E]">Vetted agents</p>
                        <p className="mt-1 text-xs leading-snug text-[#6B7280]">
                          Connected through our professional network
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[22px] bg-white/95 p-4 shadow-lg backdrop-blur-sm sm:flex-1">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E4EFF6] text-[#12213E]">
                        <KeyRound className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-lg font-bold leading-none text-[#12213E]">Search → closing</p>
                        <p className="mt-1 text-xs leading-snug text-[#6B7280]">
                          Step‑by‑step support at every stage
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Benefits ── */}
        <section className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#6B7280]">
              01 · Why work with us
            </p>
            <h2 className="section-headline mt-4 text-[#12213E]">
              From first home to investment property, with a clearer plan
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#6B7280]">
              Buying a home in Canada can feel overwhelming. First Step Wealth Group connects you
              with vetted real estate agents and mortgage support so you can move forward with
              confidence, whether you are buying your first home or looking at investment property.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Cta />
              <button
                type="button"
                onClick={() => navigate("/rental-guarantee")}
                className="inline-flex items-center gap-2 rounded-full border border-[#12213E]/12 bg-white px-5 py-3 text-sm font-semibold text-[#12213E] transition-colors hover:bg-[#E4EFF6]"
              >
                Looking to rent first?
              </button>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {benefitCards.map((card, i) => (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="grid overflow-hidden rounded-[28px] bg-white shadow-[0_12px_40px_rgba(18,33,62,0.06)] sm:grid-cols-[0.9fr_1.1fr]"
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="h-44 w-full object-cover object-center sm:h-full sm:min-h-[200px]"
                />
                <div className="flex flex-col justify-center p-5 sm:p-6">
                  <h3 className="text-lg font-bold leading-snug text-[#12213E]">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{card.body}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* ── Built for buyers ── */}
        <section className="mx-auto max-w-[1180px] px-4 pb-16 sm:px-6 md:pb-24">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr] lg:items-stretch">
            <div className="flex flex-col justify-between rounded-[32px] bg-white p-6 shadow-[0_12px_40px_rgba(18,33,62,0.05)] sm:p-8">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#6B7280]">
                  02 · Built for your journey
                </p>
                <h2 className="section-headline mt-4 text-[#12213E]">
                  Guidance that reduces the overwhelm of buying
                </h2>
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#6B7280]">
                  We make the path simpler with trusted mortgage brokers, real estate agents, and a
                  clear plan, so you are not guessing at each step.
                </p>
                <div className="mt-6">
                  <Cta label="Get in touch" />
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {featureCards.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-[22px] bg-[#F4F6F8] p-5"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#12213E] shadow-sm">
                        <Icon className="h-4 w-4" />
                      </span>
                      <h3 className="mt-4 text-sm font-bold uppercase tracking-wide text-[#12213E]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{item.body}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative min-h-[420px] overflow-hidden rounded-[32px]"
            >
              <img src={IMG.interior} alt="Home interior" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#12213E]/80 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
                  <Building2 className="h-3.5 w-3.5 text-[#C69259]" />
                  Your next address
                </p>
                <blockquote className="mt-4 max-w-md text-xl font-semibold leading-snug text-white sm:text-2xl">
                  “Your dream home starts here, with vetted agents and the mortgage options that fit your life.”
                </blockquote>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="mx-auto max-w-[1180px] px-4 pb-16 sm:px-6 md:pb-20">
          <div className="rounded-[32px] bg-[#E8EEF3] p-5 sm:p-8 md:p-10">
            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#6B7280]">
                  03 · How it works
                </p>
                <h2 className="mt-3 text-2xl font-bold text-[#12213E] sm:text-3xl">
                  Step by step
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-relaxed text-[#6B7280] lg:pt-8">
                A simple path from conversation to keys. Choose a step to see what happens at each
                stage of working with First Step Wealth Group on real estate.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {steps.map((step, i) => (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => setActiveStep(i)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    activeStep === i
                      ? "bg-[#12213E] text-white"
                      : "bg-white text-[#12213E] hover:bg-white/80"
                  }`}
                >
                  {step.num}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.article
                key={activeStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}
                className="mt-5 grid overflow-hidden rounded-[28px] bg-white shadow-[0_12px_40px_rgba(18,33,62,0.06)] md:grid-cols-2"
              >
                <img
                  src={steps[activeStep].image}
                  alt=""
                  className="h-56 w-full object-cover md:h-full md:min-h-[280px]"
                />
                <div className="flex flex-col justify-center p-6 sm:p-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C69259]">
                    Step {steps[activeStep].num}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-[#12213E]">
                    {steps[activeStep].title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-[#6B7280]">
                    {steps[activeStep].body}
                  </p>
                  <div className="mt-6">
                    <Cta />
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>

            <div className="mt-6 flex items-center justify-between gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
              <span className="inline-flex items-center gap-2">
                <Home className="h-3.5 w-3.5" />
                First Step Wealth Group
              </span>
              <span>
                01 · {String(steps.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {leadOpen && <LeadCaptureModal isOpen onClose={() => setLeadOpen(false)} />}
        {consultOpen && (
          <ConsultationBookingModal isOpen onClose={() => setConsultOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default RealEstate;
