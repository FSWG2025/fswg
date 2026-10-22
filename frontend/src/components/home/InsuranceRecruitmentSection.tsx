import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  ArrowRight, Shield, TrendingUp, Users, X, Zap,
  DollarSign, Clock, GraduationCap, CheckCircle, FileCheck, ChevronLeft, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import LeadCaptureModal from "@/components/global/LeadCaptureModal";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/AuthProvider";

/* ═══════════════════════════════════════════════════════
   Types & Data
═══════════════════════════════════════════════════════ */
interface Benefit {
  icon: any;
  title: string;
  description: string;
  color: string;
  detailedDescription: string;
  bullets: string[];
}

/* ═══════════════════════════════════════════════════════
   Benefit Detail Modal (unchanged)
═══════════════════════════════════════════════════════ */
const BenefitDetailModal = ({
  benefit,
  onClose,
  onInsuranceInterest,
  onBecomeAdvisor,
}: {
  benefit: Benefit;
  onClose: () => void;
  onInsuranceInterest: () => void;
  onBecomeAdvisor: () => void;
}) => {
  const Icon = benefit.icon;
  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-10 relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors z-10"><X className="w-5 h-5 text-gray-600" /></button>
        <div className="text-center mb-6">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}><Icon className="w-7 h-7 text-white" /></div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#12213E]">{benefit.title}</h2>
        </div>
        <p className="text-gray-600 leading-relaxed mb-6">{benefit.detailedDescription}</p>
        <div className="space-y-3 mb-8">
          {benefit.bullets.map((bullet, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#C69259]/10 flex items-center justify-center mt-0.5"><CheckCircle className="w-4 h-4 text-[#C69259]" /></div>
              <span className="text-gray-700 text-sm">{bullet}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => { onClose(); onInsuranceInterest(); }} className="cta-email">
            <span className="whitespace-nowrap">Get Insurance</span>
            <span className="cta-email-arrow"><ArrowRight className="h-4 w-4" /></span>
          </button>
          <button onClick={() => { onClose(); onBecomeAdvisor(); }} className="cta-email">
            <span className="whitespace-nowrap">Become Advisor</span>
            <span className="cta-email-arrow"><ArrowRight className="h-4 w-4" /></span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════
   Benefits Overview Modal (paginated on mobile)
═══════════════════════════════════════════════════════ */
const BenefitsModal = ({
  isOpen,
  onClose,
  benefits,
  onInsuranceInterest,
  onBecomeAdvisor,
}: {
  isOpen: boolean;
  onClose: () => void;
  benefits: Benefit[];
  onInsuranceInterest: () => void;
  onBecomeAdvisor: () => void;
}) => {
  const [selectedBenefit, setSelectedBenefit] = useState<Benefit | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) setActiveIndex(0);
  }, [isOpen]);

  const goNext = () => setActiveIndex((prev) => (prev + 1) % benefits.length);
  const goPrev = () => setActiveIndex((prev) => (prev - 1 + benefits.length) % benefits.length);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-10 relative"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-[#12213E]">Benefits of Joining</h2>
                <p className="text-gray-500 mt-2">Discover what you gain when you become part of our advisor network.</p>
              </div>

              {/* Mobile: Paginated single-card view */}
              {isMobile ? (
                <div className="flex flex-col items-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeIndex}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 w-full max-w-sm flex flex-col items-center text-center"
                    >
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${benefits[activeIndex].color} flex items-center justify-center mb-4`}
                      >
                        {React.createElement(benefits[activeIndex].icon, { className: "w-7 h-7 text-white" })}
                      </div>
                      <h3 className="text-lg font-bold text-[#12213E] mb-2">{benefits[activeIndex].title}</h3>
                      <p className="text-sm text-gray-600 flex-1">{benefits[activeIndex].description}</p>
                      <button
                        onClick={() => setSelectedBenefit(benefits[activeIndex])}
                        className="mt-4 inline-flex items-center gap-2 text-[#C69259] font-semibold text-sm hover:underline"
                      >
                        Learn more <ArrowRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation Arrows & Dots */}
                  <div className="flex items-center justify-center gap-4 mt-6">
                    <button
                      onClick={goPrev}
                      className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-[#12213E]" />
                    </button>
                    <div className="flex gap-2">
                      {benefits.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveIndex(i)}
                          className={`w-2.5 h-2.5 rounded-full transition-all ${i === activeIndex ? "bg-[#C69259] w-6" : "bg-gray-300"}`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={goNext}
                      className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-[#12213E]" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Desktop: Original grid layout */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {benefits.map((benefit, idx) => {
                    const Icon = benefit.icon;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col"
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-4`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-[#12213E] mb-2">{benefit.title}</h3>
                        <p className="text-sm text-gray-600 flex-1">{benefit.description}</p>
                        <button
                          onClick={() => setSelectedBenefit(benefit)}
                          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#C69259] hover:underline"
                        >
                          Learn more <ArrowRight className="h-4 w-4" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* CTA Buttons (always visible) */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                <button
                  onClick={() => {
                    onClose();
                    onInsuranceInterest();
                  }}
                  className="cta-email"
                >
                  <span className="whitespace-nowrap">Get Insurance Now</span>
                  <span className="cta-email-arrow"><ArrowRight className="h-4 w-4" /></span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onBecomeAdvisor();
                  }}
                  className="cta-email"
                >
                  <span className="whitespace-nowrap">Become an Advisor</span>
                  <span className="cta-email-arrow"><ArrowRight className="h-4 w-4" /></span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedBenefit && (
          <BenefitDetailModal
            benefit={selectedBenefit}
            onClose={() => setSelectedBenefit(null)}
            onInsuranceInterest={onInsuranceInterest}
            onBecomeAdvisor={onBecomeAdvisor}
          />
        )}
      </AnimatePresence>
    </>
  );
};

/* ═══════════════════════════════════════════════════════
   Licensing Process Modal (unchanged)
═══════════════════════════════════════════════════════ */
const LicensingProcessModal = ({
  isOpen, onClose, onBecomeAdvisor,
}: {
  isOpen: boolean; onClose: () => void; onBecomeAdvisor: () => void;
}) => {
  const steps = [
    { title: "Online Application", desc: "Submit your interest form and we'll reach out within 24 hours." },
    { title: "Study Materials", desc: "Receive curated study guides, practice exams, and video lessons." },
    { title: "Licensing Exam", desc: "Take the provincial exam with confidence, 92% pass rate on first attempt." },
    { title: "Mentorship & Onboarding", desc: "Shadow a senior advisor and complete your first client meetings." },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} transition={{ duration: 0.3 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-10 relative">
            <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors z-10"><X className="w-5 h-5 text-gray-600" /></button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C69259] to-[#D4A96A] flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FileCheck className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-extrabold text-[#12213E]">Your Licensing Journey</h2>
              <p className="text-gray-500 mt-2">From application to first client, we're with you every step.</p>
            </div>

            <div className="space-y-6 mb-8">
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-[#C69259]/10 border-2 border-[#C69259] flex items-center justify-center text-sm font-bold text-[#C69259]">
                      {idx + 1}
                    </div>
                    {idx < steps.length - 1 && (
                      <div className="w-0.5 flex-1 bg-[#C69259]/20 mt-2" />
                    )}
                  </div>
                  <div className="pb-6">
                    <h3 className="font-bold text-[#12213E] text-lg">{step.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => { onClose(); onBecomeAdvisor(); }} className="cta-email">
              <span className="whitespace-nowrap">Start Your Application</span>
              <span className="cta-email-arrow"><ArrowRight className="h-4 w-4" /></span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════════════
   Main Section Component
═══════════════════════════════════════════════════════ */
const InsuranceRecruitmentSection = () => {
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [benefitsModalOpen, setBenefitsModalOpen] = useState(false);
  const [licensingModalOpen, setLicensingModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  const handleInsuranceInterest = () => setLeadModalOpen(true);
  const handleBecomeAdvisor = () => {
    if (user?.role === "admin") {
      toast.error("Admins cannot apply for financial advisor roles");
      return;
    }
    if (user) navigate("/join-network");
    else setLeadModalOpen(true);
  };

  const benefits: Benefit[] = [
    {
      icon: Shield,
      title: "Get Life Insurance When You Join Us",
      description: "Access our best policies for yourself and your family at preferred rates.",
      color: "from-[#12213E] to-[#1E3A5F]",
      detailedDescription: "When you join First Step Wealth Group as an advisor, you qualify for top-tier life insurance for yourself and your loved ones, at rates reserved for our team.",
      bullets: ["Premier life insurance policies", "Preferred rates for you and your family", "Coverage from day one of training", "Protection while you build your career"],
    },
    {
      icon: TrendingUp,
      title: "Master Financial Skills That Pay Off",
      description: "Learn how money, protection, and wealth work, skills that stay with you for life.",
      color: "from-[#12213E] to-[#1E3A5F]",
      detailedDescription: "Our comprehensive program teaches you the financial literacy that most people never learn. You'll master budgeting, insurance, investments, and wealth building, all at your own pace.",
      bullets: ["Comprehensive financial education", "Learn skills schools don't teach", "Build a foundation for your career", "Flexible learning schedule"],
    },
    {
      icon: Users,
      title: "Build an Income Stream Helping Families",
      description: "Every policy you secure is a step toward a family's stability, and your financial freedom.",
      color: "from-[#12213E] to-[#1E3A5F]",
      detailedDescription: "This is more than a job, it's a mission. Every family you protect won't face financial ruin from an unexpected crisis. And every policy builds your recurring income.",
      bullets: ["Unlimited earning potential", "Recurring commission income", "Make a real difference in lives", "Flexible schedule, work from anywhere"],
    },
  ];

  const opportunityStats = [
    { icon: DollarSign, value: "$100K+", label: "Possible Annual Income" },
    { icon: Users, value: "33+", label: "Trusted Agents" },
    { icon: Clock, value: "8 Weeks", label: "Get Trained & Licensed Fast" },
    { icon: Zap, value: "100%", label: "Remote & Flexible" },
  ];

  return (
    <section ref={sectionRef} className="relative bg-[#E4EFF8] py-16 md:py-24" id="insurance-recruitment">
      <div className="mx-auto w-[98%] md:w-full md:max-w-[1100px] md:px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center">
          <h2 className="section-headline text-[#12213E]">
            Transform your career:
            <span className="mt-1 block text-[#C69259]">become a financial advisor</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-[#6B7280]">
            Our network brings together expert‑led training, mentorship, and a clear path to a rewarding career.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button onClick={handleInsuranceInterest} className="cta-email">
              <span className="whitespace-nowrap">Start</span>
              <span className="cta-email-arrow"><ArrowRight className="h-4 w-4" /></span>
            </button>
            <button onClick={() => setBenefitsModalOpen(true)} className="cta-email">
              <span className="whitespace-nowrap">Benefits of Joining</span>
              <span className="cta-email-arrow"><ArrowRight className="h-4 w-4" /></span>
            </button>
          </div>
        </motion.div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <article className="grid items-center gap-6 rounded-[28px] bg-white p-6 shadow-[0_16px_40px_rgba(18,33,62,0.05)] md:col-span-2 md:grid-cols-2 md:p-8">
            <div>
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E4EFF6] text-[#12213E]">
                <GraduationCap className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-2xl font-bold text-[#12213E]">Licensing & Certification</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-[#6B7280]">Get licensed in as little as 8 weeks with our guided program.</p>
              <button type="button" onClick={() => setLicensingModalOpen(true)} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#C69259] hover:underline">
                Learn More <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="rounded-[24px] bg-[#F7FBFE] p-6">
              <p className="text-5xl font-bold tracking-tight text-[#12213E]">33+</p>
              <p className="mt-1 text-sm text-[#6B7280]">licensed advisors</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {opportunityStats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-white px-3 py-3">
                    <stat.icon className="h-4 w-4 text-[#C69259]" />
                    <p className="mt-2 text-lg font-bold text-[#12213E]">{stat.value}</p>
                    <p className="text-[11px] leading-snug text-[#6B7280]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="rounded-[28px] bg-white p-6 shadow-[0_16px_40px_rgba(18,33,62,0.05)]">
            <h3 className="text-2xl font-bold text-[#12213E]">Career guidance</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#6B7280]">
              Interview prep and job placement support, from your first licensing conversation through to a role helping families.
            </p>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[#6B7280]">
              <li>Practice the interviews and client conversations you will have once you are licensed.</li>
              <li>Get feedback from advisors who already work with newcomer families in Canada.</li>
              <li>Move into placement with a clear next step inside the advisor network, including how to start conversations, follow up, and build a book of clients.</li>
            </ul>
          </article>

          <article className="rounded-[28px] bg-[#12213E] p-6 text-white shadow-[0_16px_40px_rgba(18,33,62,0.05)]">
            <h3 className="text-2xl font-bold">Ready To Join The Team?</h3>
            <div className="mt-6 flex flex-col items-start gap-3">
              <button type="button" onClick={handleInsuranceInterest} className="cta-email">
                <span className="whitespace-nowrap">Get Free Insurance Review</span>
                <span className="cta-email-arrow"><ArrowRight className="h-4 w-4" /></span>
              </button>
              <button type="button" onClick={handleBecomeAdvisor} className="cta-email">
                <span className="whitespace-nowrap">Become a Financial Advisor</span>
                <span className="cta-email-arrow"><ArrowRight className="h-4 w-4" /></span>
              </button>
            </div>
          </article>
        </div>
      </div>

      <BenefitsModal isOpen={benefitsModalOpen} onClose={() => setBenefitsModalOpen(false)} benefits={benefits} onInsuranceInterest={handleInsuranceInterest} onBecomeAdvisor={handleBecomeAdvisor} />
      <LicensingProcessModal isOpen={licensingModalOpen} onClose={() => setLicensingModalOpen(false)} onBecomeAdvisor={handleBecomeAdvisor} />
      <LeadCaptureModal isOpen={leadModalOpen} onClose={() => setLeadModalOpen(false)} />
    </section>
  );
};

export default InsuranceRecruitmentSection;