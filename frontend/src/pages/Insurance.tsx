import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, GraduationCap, Users } from "lucide-react";
import { useNavigate } from "react-router";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import SEO from "@/components/SEO";
import LeadCaptureModal from "@/components/global/LeadCaptureModal";
import { toast } from "sonner";
import { useAuth } from "@/hooks/AuthProvider";
import InsuranceModals from "@/features/marketing/insurance/InsuranceModals";
import {
  features,
  opportunityStats,
  reachPins,
  mapPoints,
  pinIcon,
  FitCanada,
  fadeUp,
  headlineMotion,
  Highlight,
  PhoneVisual,
} from "@/features/marketing/insurance/insuranceContent";

const Insurance = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [leadOpen, setLeadOpen] = useState(false);
  const [licensingOpen, setLicensingOpen] = useState(false);
  const [benefitsOpen, setBenefitsOpen] = useState(false);
  const [activePin, setActivePin] = useState(0);

  const openInsurance = () => setLeadOpen(true);
  const openAdvisor = () => {
    if (user?.role === "admin") {
      toast.error("Admins cannot apply for financial advisor roles");
      return;
    }
    if (user) navigate("/join-network");
    else setLeadOpen(true);
  };

  const runAction = (action: "insurance" | "advisor" | "benefits") => {
    if (action === "insurance") openInsurance();
    else if (action === "advisor") openAdvisor();
    else setBenefitsOpen(true);
  };

  return (
    <>
      <SEO
        title="Insurance Advice & Advisor Careers in Canada"
        description="Family insurance guidance and licensed advisor careers with First Step Wealth Group: free discovery calls, policy reviews, and a path into Canada’s insurance network."
        canonical="https://firststepwealthgroup.ca/insurance"
        keywords={[
          "insurance advisor Canada",
          "life insurance newcomers",
          "family insurance Canada",
          "become insurance advisor",
          "free insurance review",
          "First Step Wealth Group insurance",
        ]}
      />

      <main className="overflow-hidden bg-white">
        {/* Hero */}
        <section className="relative px-4 pb-10 pt-28 sm:px-6 md:pt-32">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(198,146,89,0.16), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 20%, rgba(228,239,248,0.9), transparent 50%)",
            }}
          />
          <div className="relative mx-auto max-w-[780px] text-center">
            <motion.span
              {...fadeUp}
              className="inline-flex rounded-full bg-[#E4EFF8] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#12213E]"
            >
              Insurance & Protection
            </motion.span>
            <motion.h1
              {...headlineMotion(0.05)}
              className="mt-5 text-center text-[clamp(2rem,5vw,3.4rem)] font-bold leading-[1.08] tracking-tight text-[#12213E]"
            >
              Protect your family, or build a career{" "}
              <Highlight>helping others</Highlight> do the same
            </motion.h1>
            <motion.p
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
              className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-[#6B7280]"
            >
              First Step Wealth Group helps you get the right insurance coverage for your family,
              and offers a path to become a licensed financial advisor, with expert‑led training,
              mentorship, and licensing in as little as 8 weeks.
            </motion.p>
            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.15 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
            >
              <button type="button" onClick={openInsurance} className="cta-email">
                <span className="whitespace-nowrap">Get Free Insurance Review</span>
                <span className="cta-email-arrow">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
              <button
                type="button"
                onClick={openAdvisor}
                className="inline-flex items-center gap-2 rounded-full border border-[#12213E]/15 bg-white px-5 py-3 text-sm font-semibold text-[#12213E] transition hover:bg-[#F7FBFE]"
              >
                Become an Advisor
              </button>
            </motion.div>
          </div>
        </section>

        {/* Z-pattern features */}
        <section className="mx-auto max-w-[1120px] space-y-20 px-4 py-12 sm:px-6 md:space-y-28 md:py-20">
          {features.map((feature, i) => {
            const reverse = i % 2 === 1;
            return (
              <motion.div
                key={feature.index}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.06 }}
                className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                  reverse ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className={`text-center md:text-left ${reverse ? "lg:pl-4" : "lg:pr-4"}`}>
                  <motion.p {...headlineMotion(0.05)} className="text-sm font-semibold text-[#C69259]">
                    {feature.index}
                  </motion.p>
                  <motion.h2
                    {...headlineMotion(0.12)}
                    className="mt-3 text-center text-[clamp(1.65rem,3.2vw,2.45rem)] font-bold leading-[1.15] tracking-tight text-[#12213E] md:text-left"
                  >
                    {feature.before}
                    <Highlight>{feature.highlight}</Highlight>
                    {feature.after}
                  </motion.h2>
                  <motion.p
                    {...headlineMotion(0.18)}
                    className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-[#6B7280] md:mx-0"
                  >
                    {feature.body}
                  </motion.p>
                  <motion.div {...headlineMotion(0.24)} className="mt-6 flex justify-center md:justify-start">
                    <button
                      type="button"
                      onClick={() => runAction(feature.action)}
                      className="inline-flex items-center gap-2 rounded-full border border-[#12213E]/15 bg-white px-5 py-2.5 text-sm font-semibold text-[#12213E] shadow-sm transition hover:border-[#C69259]/40 hover:text-[#C69259]"
                    >
                      {feature.cta}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </motion.div>
                </div>
                <PhoneVisual variant={feature.visual} />
              </motion.div>
            );
          })}
        </section>

        {/* Side-by-side highlight cards */}
        <section className="mx-auto max-w-[1120px] px-4 pb-16 sm:px-6 md:pb-24">
          <div className="grid gap-5 lg:grid-cols-2">
            <motion.div
              {...fadeUp}
              className="flex flex-col justify-between rounded-[32px] bg-[#F4F6F8] p-7 sm:p-9"
            >
              <div className="text-center md:text-left">
                <motion.h3
                  {...headlineMotion(0.08)}
                  className="text-center text-2xl font-bold leading-snug text-[#12213E] sm:text-[1.75rem] md:text-left"
                >
                  Licensing & certification that moves with you
                </motion.h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#6B7280] md:mx-0">
                  Get licensed in as little as 8 weeks with our guided program, study materials,
                  exam prep, and mentorship from application to your first client meetings.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap items-end justify-center gap-4 md:justify-between">
                <button
                  type="button"
                  onClick={() => setLicensingOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#12213E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0D1A2E]"
                >
                  View licensing journey
                  <ArrowRight className="h-4 w-4" />
                </button>
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#C69259] shadow-sm">
                  <GraduationCap className="h-6 w-6" />
                </span>
              </div>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.08 }}
              className="relative min-h-[320px] overflow-hidden rounded-[32px] bg-gradient-to-br from-[#E4EFF8] via-[#F7EFE4] to-[#E8EEF3] p-6 sm:p-8"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
                Opportunity snapshot
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {opportunityStats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 16, scale: 0.96 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.07 }}
                    className="rounded-[22px] bg-white/90 p-4 shadow-[0_10px_30px_rgba(18,33,62,0.08)] backdrop-blur"
                    style={{
                      transform: reduce ? undefined : `rotate(${i % 2 === 0 ? -1.5 : 1.5}deg)`,
                    }}
                  >
                    <stat.icon className="h-4 w-4 text-[#C69259]" />
                    <p className="mt-2 text-xl font-bold text-[#12213E]">{stat.value}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-[#6B7280]">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
              <div className="pointer-events-none absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-[#C69259]/20 blur-2xl" />
            </motion.div>
          </div>
        </section>

        {/* Reach / social proof */}
        <section className="border-t border-[#E8EDF2] bg-[#FAFBFC] px-4 py-16 sm:px-6 md:py-24">
          <div className="mx-auto max-w-[1120px]">
            <div className="text-center">
              <motion.span
                {...fadeUp}
                className="inline-flex rounded-full bg-[#E4EFF8] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#12213E]"
              >
                Across Canada
              </motion.span>
              <motion.h2
                {...headlineMotion(0.08)}
                className="mx-auto mt-5 max-w-2xl text-center text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-tight tracking-tight text-[#12213E]"
              >
                Helping newcomers and families protect what they’ve built, city by city
              </motion.h2>
              <motion.p
                {...fadeUp}
                className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[#6B7280]"
              >
                From Toronto to Vancouver, our communities include insurance protection among the
                services families rely on as they settle and grow in Canada.
              </motion.p>
            </div>

            <motion.div
              {...fadeUp}
              className="relative mx-auto mt-12 max-w-4xl overflow-hidden rounded-[32px] bg-white shadow-[0_20px_50px_rgba(18,33,62,0.06)]"
            >
              <div className="relative z-0 isolate h-[300px] overflow-hidden sm:h-[380px] md:h-[440px] [&_.leaflet-container]:z-0 [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full [&_.leaflet-container]:bg-[#E4EFF6] [&_.leaflet-control-attribution]:text-[10px]">
                <MapContainer
                  center={[56, -96]}
                  zoom={4}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                  aria-label="Map of Canadian cities where First Step offers insurance support"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <FitCanada points={mapPoints} />
                  {reachPins.map((pin, i) => (
                    <Marker
                      key={pin.city}
                      position={[pin.lat, pin.lng]}
                      icon={pinIcon}
                      eventHandlers={{ click: () => setActivePin(i) }}
                      title={pin.city}
                    />
                  ))}
                </MapContainer>
              </div>

              <div className="border-t border-[#E8EDF2] px-5 py-4">
                <div className="mb-3 flex flex-wrap justify-center gap-2">
                  {reachPins.map((pin, i) => (
                    <button
                      key={pin.city}
                      type="button"
                      onClick={() => setActivePin(i)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        activePin === i
                          ? "bg-[#12213E] text-white"
                          : "bg-[#F4F7FB] text-[#12213E] hover:bg-[#E4EFF6]"
                      }`}
                    >
                      {pin.city}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-[#F7FBFE] px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-[#12213E]">
                      {reachPins[activePin].city}, {reachPins[activePin].region}
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      {reachPins[activePin].note} · {reachPins[activePin].families}
                    </p>
                  </div>
                  <button type="button" onClick={openInsurance} className="cta-email">
                    <span className="whitespace-nowrap">Talk to us</span>
                    <span className="cta-email-arrow">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final persuasive band */}
        <section className="mx-auto max-w-[1120px] px-4 py-16 sm:px-6 md:py-20">
          <motion.div
            {...fadeUp}
            className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#E4EFF8] via-[#F7EFE4] to-[#E8EEF3] px-6 py-10 text-center sm:px-10 md:py-14"
          >
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-[#C69259]/15 blur-3xl" />
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#12213E]/08 blur-3xl" />
            <p className="relative text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C69259]">
              Ready when you are
            </p>
            <motion.h2
              {...headlineMotion(0.1)}
              className="relative mx-auto mt-4 max-w-xl text-center text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-tight text-[#12213E]"
            >
              The initial discovery call is always free
            </motion.h2>
            <p className="relative mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[#6B7280]">
              Whether you need a free insurance review or you are ready to start your advisor
              application, one conversation is enough to see which path fits.
            </p>
            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
              <button type="button" onClick={openInsurance} className="cta-email">
                <span className="whitespace-nowrap">Get Free Insurance Review</span>
                <span className="cta-email-arrow">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
              <button
                type="button"
                onClick={openAdvisor}
                className="inline-flex items-center gap-2 rounded-full border border-[#12213E]/15 bg-white/80 px-5 py-3 text-sm font-semibold text-[#12213E] backdrop-blur transition hover:bg-white"
              >
                <Users className="h-4 w-4 text-[#C69259]" />
                Become a Financial Advisor
              </button>
            </div>
          </motion.div>
        </section>
      </main>

      <InsuranceModals
        licensingOpen={licensingOpen}
        benefitsOpen={benefitsOpen}
        onCloseLicensing={() => setLicensingOpen(false)}
        onCloseBenefits={() => setBenefitsOpen(false)}
        onStartApplication={() => {
          setLicensingOpen(false);
          openAdvisor();
        }}
        onGetInsurance={() => {
          setBenefitsOpen(false);
          openInsurance();
        }}
        onBecomeAdvisor={() => {
          setBenefitsOpen(false);
          openAdvisor();
        }}
      />

      <AnimatePresence>
        {leadOpen && <LeadCaptureModal isOpen onClose={() => setLeadOpen(false)} />}
      </AnimatePresence>
    </>
  );
};

export default Insurance;
