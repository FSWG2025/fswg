import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Loader2,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { api } from "@/lib/api";
import type { Service } from "@/types";
import SEO from "@/components/SEO";
import { useAuth } from "@/hooks/AuthProvider";
import LeadCaptureModal from "@/components/global/LeadCaptureModal";
import {
  enrichService,
  HERO_IMAGES,
  IMPACT_STATS,
  WHY_PILLARS,
} from "@/features/marketing/services/servicePageContent";
import { breadcrumbSchema, serviceSchema } from "@/lib/seo";

const ServiceList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [leadOpen, setLeadOpen] = useState(false);

  useEffect(() => {
    api
      .get("/services")
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : [];
        setServices(list);
        if (list[0]?._id) setActiveId(String(list[0]._id));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    AOS.init({
      duration: 450,
      easing: "ease-out-cubic",
      once: true,
      offset: 24,
      delay: 0,
      mirror: false,
      disable: () =>
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
    requestAnimationFrame(() => AOS.refreshHard());
  }, [loading, services, activeId]);

  const enriched = useMemo(
    () => services.map(enrichService),
    [services]
  );

  const active =
    enriched.find((s) => String(s._id) === activeId) || enriched[0];

  const openConsult = () => {
    if (user) navigate("/dashboard");
    else setLeadOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FB]">
        <Loader2 className="h-8 w-8 animate-spin text-[#C69259]" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Our Services: Rental, Insurance, Real Estate & Wealth Support in Canada"
        description="Explore First Step Wealth Group services: rental guarantees for newcomers, insurance advisory, real estate support, wealth education, and advisor careers across Canada."
        canonical="https://firststepwealthgroup.ca/services"
        keywords={[
          "First Step Wealth Group services",
          "rental guarantee Canada",
          "real estate support newcomers",
          "insurance advisory Canada",
          "wealth education immigrants",
          "housing support Canada",
        ]}
        structuredData={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
          ]),
          ...enriched.slice(0, 4).map((s) =>
            serviceSchema({
              name: s.title,
              description: s.description,
              path: s.href,
              serviceType: s.category.replace(/_/g, " "),
            })
          ),
        ]}
      />

      <main className="relative overflow-hidden bg-[#F7F8FB] pb-4 text-[#12213E]">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#C69259]/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-4rem] top-40 h-80 w-80 rounded-full bg-[#12213E]/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/3 top-[28rem] h-64 w-64 rounded-full bg-[#E4EFF8] blur-3xl"
        />

        {/* ── Hero ── */}
        <section className="relative mx-auto max-w-[1180px] px-4 pb-10 pt-32 sm:px-6 md:pt-40 md:pb-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div
              className="flex flex-col items-center text-center"
              data-aos="fade-up"
            >
              <p className="inline-flex items-center gap-2 rounded-full border border-[#12213E]/10 bg-white/80 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C69259] shadow-sm backdrop-blur">
                First Step services
              </p>
              <h1 className="mx-auto mt-5 max-w-2xl text-center text-[clamp(2.2rem,5vw,3.6rem)] font-bold leading-[1.08] tracking-tight text-[#12213E]">
                Pathways that move you from{" "}
                <span className="text-[#C69259]">surviving to thriving</span>{" "}
                in Canada
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-center text-[15px] leading-relaxed text-[#5B6575] sm:text-base">
                Rental guarantees, insurance advisory, real estate support, wealth
                education, and advisor careers: structured for newcomers and
                families who need a clear first step, not a hard sell.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button type="button" onClick={openConsult} className="cta-email">
                  <span className="whitespace-nowrap">Book a free discovery call</span>
                  <span className="cta-email-arrow">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
                <Link
                  to="/rental-guarantee"
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#12213E]/12 bg-white px-5 py-3 text-sm font-semibold text-[#12213E] shadow-sm transition hover:border-[#C69259]/40"
                >
                  Explore rental guarantee
                  <ChevronRight className="h-4 w-4 text-[#C69259]" />
                </Link>
              </div>
              <p className="mt-5 text-center text-xs font-medium text-[#8B93A1]">
                Trusted guidance for housing, protection, and long-term wealth -
                coast to coast.
              </p>
            </div>

            <div className="relative" data-aos="fade-left" data-aos-delay="120">
              <div className="absolute -inset-3 rounded-[36px] bg-gradient-to-br from-[#C69259]/25 via-transparent to-[#12213E]/15 blur-xl" />
              <div className="relative overflow-hidden rounded-[32px] border border-white/60 bg-white shadow-[0_24px_60px_rgba(18,33,62,0.12)]">
                <img
                  src={HERO_IMAGES.hero}
                  alt="First Step advisors supporting clients"
                  className="h-[min(52vh,420px)] w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#12213E]/85 via-[#12213E]/35 to-transparent p-5 sm:p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C69259]">
                    Free discovery call
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">
                    The initial conversation is always free
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3-up pillars ── */}
        <section className="relative mx-auto max-w-[1180px] px-4 py-12 sm:px-6 md:py-16">
          <div className="mb-10 text-center" data-aos="fade-up">
            <h2 className="mx-auto text-[clamp(1.6rem,3vw,2.2rem)] font-bold tracking-tight text-[#12213E]">
              Why families choose First Step
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-[#6B7280]">
              A calm, education-first experience across every service we publish.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {WHY_PILLARS.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <article
                  key={pillar.title}
                  data-aos="fade-up"
                  data-aos-delay={String(i * 100)}
                  className="rounded-[28px] border border-[#E8ECF1] bg-white p-6 shadow-[0_10px_30px_rgba(18,33,62,0.04)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3DFC7]">
                    <Icon className="h-5 w-5 text-[#12213E]" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#12213E]">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                    {pillar.body}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Tabbed service explorer ── */}
        {enriched.length > 0 && (
          <section className="relative mx-auto max-w-[1180px] px-4 py-12 sm:px-6 md:py-16">
            <div className="mb-8 text-center" data-aos="fade-up">
              <h2 className="mx-auto text-[clamp(1.6rem,3vw,2.2rem)] font-bold tracking-tight text-[#12213E]">
                Explore our services
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#6B7280]">
                Select a pathway to see how it works, who it is for, and what
                you can do next.
              </p>
            </div>

            <div
              className="flex justify-center gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              data-aos="fade-up"
              data-aos-delay="80"
            >
              {enriched.map((svc) => {
                const selected = String(svc._id) === String(active?._id);
                return (
                  <button
                    key={svc._id}
                    type="button"
                    onClick={() => setActiveId(String(svc._id))}
                    className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                      selected
                        ? "bg-[#12213E] text-white shadow-md"
                        : "bg-white text-[#475569] ring-1 ring-[#E5EAF0] hover:ring-[#C69259]/40"
                    }`}
                  >
                    {svc.title}
                  </button>
                );
              })}
            </div>

            {active && (
              <div
                key={active._id}
                data-aos="zoom-in"
                data-aos-duration="500"
                className="mt-8 grid items-center gap-8 overflow-hidden rounded-[32px] border border-[#E8ECF1] bg-white p-5 shadow-[0_16px_40px_rgba(18,33,62,0.06)] sm:p-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:p-10"
              >
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C69259]">
                    {active.accentLabel}
                  </p>
                  <h3 className="mt-3 text-2xl font-bold leading-tight text-[#12213E] sm:text-3xl">
                    {active.title}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-[#8B93A1]">
                    {active.eyebrow}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-[#5B6575] sm:text-[15px]">
                    {active.description}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {active.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3 text-sm text-[#334155]">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F3DFC7]">
                          <Check className="h-3 w-3 text-[#12213E]" strokeWidth={3} />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link to={active.href} className="cta-email">
                      <span className="whitespace-nowrap">Learn more</span>
                      <span className="cta-email-arrow">
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={openConsult}
                      className="inline-flex items-center gap-2 rounded-2xl border border-[#12213E]/12 bg-[#F7F8FB] px-5 py-3 text-sm font-semibold text-[#12213E]"
                    >
                      Talk to us
                    </button>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-[28px]">
                  <img
                    src={active.image}
                    alt={active.title}
                    className="h-[min(42vh,380px)] w-full object-cover"
                  />
                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#12213E] backdrop-blur">
                    {active.category.replace(/_/g, " ")}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Alternating deep dives ── */}
        {enriched.length > 0 && (
          <section className="relative mx-auto max-w-[1180px] space-y-16 px-4 py-12 sm:px-6 md:space-y-24 md:py-20">
            <div className="mx-auto max-w-2xl text-center" data-aos="fade-up">
              <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-bold tracking-tight text-[#12213E]">
                Every pathway, explained in detail
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#6B7280]">
                The same services published on our platform: expanded so you can
                see outcomes, steps, and who each offering is built for.
              </p>
            </div>

            {enriched.map((svc, index) => {
              const Icon = svc.icon;
              const flip = index % 2 === 1;
              return (
                <article
                  key={svc._id}
                  data-aos={flip ? "fade-left" : "fade-right"}
                  data-aos-delay={String((index % 3) * 60)}
                  className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-14 ${
                    flip ? "lg:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#12213E] text-white">
                        <Icon className="h-5 w-5" />
                      </span>
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C69259]">
                        {svc.accentLabel}
                      </p>
                    </div>
                    <h3 className="mt-4 text-2xl font-bold text-[#12213E] sm:text-[1.75rem]">
                      {svc.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#5B6575] sm:text-[15px]">
                      {svc.description}
                    </p>
                    <ul className="mt-5 space-y-2.5">
                      {svc.bullets.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-2.5 text-sm font-medium text-[#334155]"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#C69259]" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={svc.href}
                      className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#12213E] transition hover:text-[#C69259]"
                    >
                      Open {svc.title.toLowerCase()}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="relative" data-aos="zoom-in" data-aos-delay="100">
                    <div
                      aria-hidden
                      className={`absolute -inset-2 rounded-[36px] blur-2xl ${
                        flip ? "bg-[#12213E]/10" : "bg-[#C69259]/18"
                      }`}
                    />
                    <img
                      src={svc.image}
                      alt=""
                      className="relative h-[min(48vh,400px)] w-full rounded-[28px] object-cover shadow-[0_20px_50px_rgba(18,33,62,0.12)]"
                    />
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* ── Impact band ── */}
        <section className="relative mx-auto max-w-[1180px] px-4 py-8 sm:px-6 md:py-12">
          <div
            data-aos="fade-up"
            className="relative overflow-hidden rounded-[32px] bg-[#12213E] px-6 py-10 sm:px-10 md:py-14"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#C69259]/25 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-12 left-10 h-36 w-36 rounded-full bg-white/10 blur-3xl"
            />
            <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {IMPACT_STATS.map((stat, i) => (
                <div
                  key={stat.label}
                  className="text-center"
                  data-aos="fade-up"
                  data-aos-delay={String(i * 80)}
                >
                  <p className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm text-white/65">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Closing CTA ── */}
        <section className="relative mx-auto max-w-[1180px] px-4 py-12 sm:px-6 md:py-16">
          <div
            data-aos="fade-up"
            className="grid items-center gap-8 overflow-hidden rounded-[32px] border border-[#E8ECF1] bg-white p-6 shadow-[0_16px_40px_rgba(18,33,62,0.05)] sm:p-10 lg:grid-cols-[1.1fr_0.9fr]"
          >
            <div>
              <h2 className="text-center text-[clamp(1.5rem,3vw,2.1rem)] font-bold tracking-tight text-[#12213E]">
                Ready for your first step?
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#6B7280]">
                Tell us whether you need housing support, insurance guidance, wealth
                education, or a path into the advisor network. We will map the next
                move together: starting with a free discovery call.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button type="button" onClick={openConsult} className="cta-email">
                  <span className="whitespace-nowrap">Book free discovery call</span>
                  <span className="cta-email-arrow">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
                <Link
                  to="/#faq"
                  className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-[#12213E] hover:text-[#C69259]"
                >
                  Read FAQs
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <img
              src={HERO_IMAGES.team}
              alt="First Step team collaborating"
              className="h-56 w-full rounded-[24px] object-cover sm:h-64"
              data-aos="fade-left"
              data-aos-delay="100"
            />
          </div>
        </section>
      </main>

      {leadOpen && (
        <LeadCaptureModal isOpen onClose={() => setLeadOpen(false)} />
      )}
    </>
  );
};

export default ServiceList;
