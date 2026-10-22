import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Shield, Home as HomeIcon, Building2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/AuthProvider";
import LeadCaptureModal from "@/components/global/LeadCaptureModal";
import ConsultationBookingModal from "@/components/global/ConsultationBookingModal";
import Hero from "@/components/home/Hero";
import RentalGuaranteeSection from "@/components/home/RentalGuaranteeSection";
import TestimonialSection from "@/components/home/TestimonialSection";
import JourneySection from "@/components/home/JourneySection";
import SEO from "@/components/SEO";
import { allFaqs } from "@/features/marketing/faq/faqData";
import {
  organizationSchema,
  websiteSchema,
  breadcrumbSchema,
} from "@/lib/seo";

/* ================================================================
   Pillars Section: Three ways we build your wealth
=============================================================== */
const PillarsSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  type ModalState =
    | { type: "lead" }
    | { type: "consult" }
    | null;

  const [activeModal, setActiveModal] = useState<ModalState>(null);
  const [activePath, setActivePath] = useState(0);
  const closeModal = () => setActiveModal(null);

  const handleRentalCTA = () => {
    if (user) navigate("/rental-applications");
    else setActiveModal({ type: "lead" });
  };
  const handleInsuranceCTA = () => {
    if (user) navigate("/join-network");
    else setActiveModal({ type: "lead" });
  };
  const handleRealEstateCTA = () => {
    if (user) setActiveModal({ type: "consult" });
    else setActiveModal({ type: "lead" });
  };
  const handleSpeakToAdvisor = () => setActiveModal({ type: "consult" });

  const cards = [
    {
      icon: HomeIcon,
      color: "#E88D72",
      title: "Rental Guarantee",
      desc: "No Canadian credit? We guarantee your rent so you can move in today, no huge upfront deposit.",
      btnLabel: "Apply Now",
      btnAction: handleRentalCTA,
      href: "/rental-guarantee",
    },
    {
      icon: Shield,
      color: "#12213E",
      title: "Insurance & Financial Protection",
      desc: "Get the right coverage for your family, and even turn it into a career as a licensed advisor.",
      btnLabel: "Join the Insurance Team",
      btnAction: handleInsuranceCTA,
      secondaryLabel: "Speak With an Advisor",
      secondaryAction: handleSpeakToAdvisor,
      href: "/insurance",
    },
    {
      icon: Building2,
      color: "#2563EB",
      title: "Real Estate Support",
      desc: "From first home to investment property, we connect you with vetted agents and the best mortgage options.",
      btnLabel: "Book a Consultation",
      btnAction: handleRealEstateCTA,
      href: "/real-estate",
    },
  ];

  const current = cards[activePath];
  const stepPath = (direction: number) => {
    setActivePath((index) => (index + direction + cards.length) % cards.length);
  };

  const pathPager = (
    <div className="flex w-fit shrink-0 items-center gap-3 rounded-full bg-white/10 px-2 py-1.5 text-white">
      <button type="button" aria-label="Previous path" onClick={() => stepPath(-1)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.16em]">
        Path {activePath + 1}/{cards.length}
      </span>
      <button type="button" aria-label="Next path" onClick={() => stepPath(1)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );

  const pathActions = (
    <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <button type="button" onClick={current.btnAction} className="cta-email max-w-full">
        <span className="truncate">{current.btnLabel}</span>
        <span className="cta-email-arrow shrink-0">
          <ArrowRight className="h-4 w-4" />
        </span>
      </button>
      {"secondaryLabel" in current && current.secondaryLabel && (
        <button
          type="button"
          onClick={current.secondaryAction}
          className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
        >
          <span className="truncate">{current.secondaryLabel}</span>
        </button>
      )}
    </div>
  );

  return (
    <section className="bg-transparent py-16 md:py-24" id="pillars">
      <div className="mx-auto mb-10 max-w-[1180px] px-4 text-center sm:px-6" data-aos="fade-up">
        <h2 className="section-headline text-[#12213E]">
          Three ways we build
          <span className="mt-1 block text-[#C69259]">your wealth</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-[#6B7280]">
          Choose the path that fits your life, every journey starts here.
        </p>
      </div>

      <div className="mx-auto w-[98%] md:w-full md:max-w-[1180px] md:px-6" data-aos="fade-up" data-aos-delay="80">
        <div className="grid items-start gap-6 overflow-x-clip rounded-[28px] bg-[#12213E] px-3 py-6 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] md:gap-x-8 md:gap-y-5 md:rounded-[32px] md:px-8 md:pt-8 md:pb-7 lg:gap-x-12 lg:px-12 lg:py-10">
          <div className="min-w-0">
            <div className="relative mx-auto w-full max-w-[380px] overflow-hidden px-3 pb-5 pt-2">
              {cards.map((card, index) => {
                const depth = (index - activePath + cards.length) % cards.length;
                const front = depth === 0;
                const Icon = card.icon;
                return (
                  <button
                    key={card.title}
                    type="button"
                    onClick={() => setActivePath(index)}
                    className={`rounded-[22px] bg-white p-5 text-left shadow-[0_18px_40px_rgba(0,0,0,0.28)] transition-[transform,opacity] duration-500 ${front ? "relative w-full" : "absolute left-3 right-3 top-2"}`}
                    style={{
                      zIndex: 30 - depth,
                      transform: front ? "none" : `translateY(${depth * 8}px) rotate(${depth % 2 === 0 ? -2 : 2}deg) scale(${1 - depth * 0.03})`,
                      opacity: front ? 1 : 0.8,
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
                        <Icon className="h-3.5 w-3.5" style={{ color: card.color }} />
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <p className="mt-2 text-[22px] font-bold leading-tight text-[#12213E]">{card.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{card.desc}</p>
                    <div className="mt-5 flex items-center justify-between border-t border-[#E8EDF2] pt-3">
                      <span className="text-[12px] text-[#6B7280]">{card.btnLabel}</span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ backgroundColor: card.color }}>
                        {index + 1}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mx-auto mt-3 flex w-fit md:hidden">{pathPager}</div>
          </div>

          <div className="min-w-0 max-w-full text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C69259]">Three paths</p>
            <h3 className="section-headline mt-2 max-w-md">{current.title}</h3>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/75">{current.desc}</p>
            <div className="mt-5 md:hidden">{pathActions}</div>
            <div className="mt-6 hidden w-full min-w-0 max-w-full flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center md:flex">
              <div className="shrink-0">{pathPager}</div>
              {pathActions}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeModal?.type === "lead" && (
          <LeadCaptureModal isOpen onClose={closeModal} />
        )}
        {activeModal?.type === "consult" && (
          <ConsultationBookingModal isOpen onClose={closeModal} />
        )}
      </AnimatePresence>
    </section>
  );
};

/* ================================================================
   Main Home Component
=============================================================== */
const Home = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <SEO
        title="Rental Guarantees, Housing & Real Estate Support for Newcomers in Canada"
        description="First Step Wealth Group helps newcomers and families in Canada rent without Canadian credit, secure housing, get insurance advice, build wealth, and navigate real estate with vetted support."
        canonical="https://firststepwealthgroup.ca/"
        keywords={[
          "rental guarantee Canada",
          "housing for newcomers Canada",
          "rent without Canadian credit",
          "real estate support Canada",
          "first-time home buyer newcomers",
          "mortgage guidance Canada",
          "insurance advisor Canada",
          "wealth building immigrants",
          "First Step Wealth Group",
        ]}
        structuredData={[
          organizationSchema(),
          websiteSchema(),
          breadcrumbSchema([{ name: "Home", path: "/" }]),
          faqSchema,
        ]}
      />
      <main>
        <Hero />
        <RentalGuaranteeSection />
        <PillarsSection />
        <JourneySection />
        <TestimonialSection />
      </main>
    </>
  );
};

export default Home;
