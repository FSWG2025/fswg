import { useRef, useState } from "react";
import { ArrowRight, ShieldCheck, FileCheck, DollarSign, CreditCard } from "lucide-react";
import {
  DualCTAModal,
  LandlordPartnerModal,
  RentalInfoModal,
} from "@/features/marketing/rental-guarantee/RentalGuaranteeModals";
import {
  programCards,
  type ModalType,
} from "@/features/marketing/rental-guarantee/rentalGuaranteeData";

const RentalGuaranteeSection = () => {
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [dualCTAModalOpen, setDualCTAModalOpen] = useState(false);
  const [landlordFormOpen, setLandlordFormOpen] = useState(false);
  const openDualCTA = () => setDualCTAModalOpen(true);
  const [activeSolution, setActiveSolution] = useState(1);
  const stepScrollerRef = useRef<HTMLDivElement>(null);
  const [stepSlide, setStepSlide] = useState(0);

  // Steps for the new timeline
  const guaranteeSteps = [
    {
      icon: FileCheck,
      title: "We verify your income",
      desc: "We look at your employment and income, not your credit score.",
    },
    {
      icon: DollarSign,
      title: "Replace the huge deposit",
      desc: "Our guarantee replaces 6-12 months' rent with a low monthly fee.",
    },
    {
      icon: ShieldCheck,
      title: "Landlords get paid on time",
      desc: "Zero risk to them, we guarantee every payment.",
    },
    {
      icon: CreditCard,
      title: "Build your Canadian credit",
      desc: "Rent payments are reported, so your credit history grows.",
    },
  ];

  const solutions = [
    {
      title: programCards[0].title,
      description: programCards[0].description,
      action: "Learn more",
      run: () => setActiveModal("problem"),
      stat: "6 to 12",
      statLabel: "months' rent upfront",
    },
    {
      title: programCards[1].title,
      description: programCards[1].description,
      action: "See how it works",
      run: () => setActiveModal("solution"),
      stat: "6 to 12",
      statLabel: "months' rent upfront",
    },
    {
      title: programCards[2].title,
      description: programCards[2].description,
      action: "Apply Now",
      run: openDualCTA,
      stat: "5 min",
      statLabel: "to pre-qualify, with no impact on your credit score",
    },
    {
      title: programCards[3].title,
      description: programCards[3].description,
      action: "Partner with us",
      run: () => setLandlordFormOpen(true),
      stat: "Zero",
      statLabel: "risk of arrears",
    },
  ];

  const shown = solutions[activeSolution];

  return (
    <section className="relative bg-[#E4EFF8] py-10 md:py-16" id="rental-guarantee">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
        <div>
          <div className="mx-auto max-w-2xl text-center" data-aos="fade-up">
            <p className="text-[13px] text-[#6B7280]">Important for newcomers</p>
            <h2 className="section-headline mt-6 tracking-[-0.03em] text-[#12213E]">
              New to Canada?
              <span className="mt-1 block text-[#C69259]">Let's Help You Rent</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-[#6B7280]">
              Every day, newcomers are rejected for rentals they can actually afford, because of a credit score they don't have yet.
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#8B6B52]">
              6‑12 months' rent upfront is what landlords ask for when you have no Canadian credit, and if we're being honest, that stresses the hell out of you.
            </p>
          </div>

          <div className="mt-8 rounded-[24px] bg-[#F3F5F8] p-3 sm:p-4" data-aos="fade-up" data-aos-delay="80">
            <div className="grid items-stretch gap-3 md:grid-cols-2 md:gap-4">
              <div className="flex flex-col justify-center gap-1 py-2">
                {solutions.map((item, index) => {
                  const selected = index === activeSolution;
                  return (
                    <div
                      key={item.title}
                      role="button"
                      tabIndex={0}
                      onClick={() => setActiveSolution(index)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setActiveSolution(index);
                        }
                      }}
                      className={`flex cursor-pointer items-start gap-3.5 rounded-[20px] px-3 py-3.5 text-left transition-colors ${
                        selected ? "bg-[#12213E]" : "hover:bg-white/80"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[12px] font-medium ${
                          selected ? "bg-white/10 text-white" : "bg-[#E8EDF2] text-[#8B95A5]"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className={`block text-[15px] font-semibold leading-snug ${selected ? "text-white" : "text-[#1A1A1A]"}`}>
                          {item.title}
                        </span>
                        <span className={`mt-0.5 block text-[13px] leading-relaxed ${selected ? "text-white/65" : "text-[#8A919C]"}`}>
                          {item.description}
                        </span>
                        {selected && (
                          <button
                            type="button"
                            className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-[#C69259]"
                            onClick={(event) => {
                              event.stopPropagation();
                              item.run();
                            }}
                          >
                            {item.action}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex min-h-[440px] flex-col gap-3 md:min-h-full">
                <div className="relative min-h-[220px] flex-1 overflow-hidden rounded-[20px]">
                  <img
                    src="/toronto-sign.jpg"
                    alt="The Toronto sign at Nathan Phillips Square"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                </div>
                <div className="rounded-[18px] bg-[#12213E] px-5 py-4 text-center text-white">
                  <p className="text-4xl font-semibold tracking-tight">{shown.stat}</p>
                  <p className="mt-1 text-sm text-white/80">{shown.statLabel}</p>
                </div>
                <div className="relative min-h-[220px] flex-1 overflow-hidden rounded-[20px]">
                  <img
                    src="/newcomers-toronto.jpg"
                    alt="Newcomers together at Nathan Phillips Square in Toronto"
                    className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
                  />
                  <div className="absolute left-4 top-4 inline-flex max-w-[calc(100%-2rem)] flex-wrap items-center gap-x-2 gap-y-0.5 rounded-full bg-white/90 px-3 py-1.5 text-[12px] text-[#12213E] shadow-sm backdrop-blur">
                    <span className="font-semibold">{programCards[1].author?.name}</span>
                    <span className="text-[#6B7280]">{programCards[1].author?.role}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[20px] bg-[#F7FBFE] px-4 py-4 sm:px-5" data-aos="fade-up">
            <p className="text-sm font-semibold text-[#12213E]">We guarantee your rent</p>
            <p className="mt-1 text-[13px] leading-relaxed text-[#555555]">
              Sign a lease on day one. Build your Canadian life, not a workaround for one. Rental rejection stops most newcomers before they even start. Without Canadian credit history, landlords say "NO" without thinking twice, leaving YOU scrambling for weeks or months. We eliminate that wall entirely.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-[28px] bg-[linear-gradient(160deg,#F7FBFE_0%,#F6E7D4_48%,#E4EFF6_100%)] px-4 py-8 md:hidden" data-aos="fade-up">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Our rental guarantee</p>
            <p className="section-headline mx-auto mt-3 max-w-[16rem] text-center text-[#12213E]">We guarantee your rent</p>
            <div
              ref={stepScrollerRef}
              onScroll={() => {
                const el = stepScrollerRef.current;
                if (!el) return;
                const width = el.firstElementChild?.getBoundingClientRect().width ?? 1;
                const gap = 12;
                setStepSlide(Math.min(guaranteeSteps.length - 1, Math.max(0, Math.round(el.scrollLeft / (width + gap)))));
              }}
              className="mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {guaranteeSteps.map((step, index) => (
                <article key={step.title} className="w-[78%] shrink-0 snap-center rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(18,33,62,0.06)]">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C69259]">
                    <step.icon className="h-3.5 w-3.5" />
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-3 text-[15px] font-semibold leading-snug text-[#12213E]">{step.title}</p>
                  <p className="mt-2 text-[12px] leading-relaxed text-[#6B7280]">{step.desc}</p>
                </article>
              ))}
            </div>
            <div className="mt-4 flex justify-center gap-1.5">
              {guaranteeSteps.map((step, index) => (
                <button
                  key={step.title}
                  type="button"
                  aria-label={`Show step ${index + 1}`}
                  onClick={() => {
                    const el = stepScrollerRef.current;
                    const card = el?.children[index] as HTMLElement | undefined;
                    card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                    setStepSlide(index);
                  }}
                  className={`h-1.5 rounded-full transition-all ${index === stepSlide ? "w-5 bg-[#12213E]" : "w-1.5 bg-[#12213E]/25"}`}
                />
              ))}
            </div>
          </div>
          <div className="mt-5 hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-4">
            {guaranteeSteps.map((step, index) => (
              <div
                key={step.title}
                className="px-1"
                data-aos="fade-up"
                data-aos-delay={String(index * 80)}
              >
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F5F8] text-[#C69259]">
                  <step.icon className="h-3.5 w-3.5" />
                </div>
                <p className="text-sm font-semibold text-[#12213E]">{step.title}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-[#6B7280]">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center" data-aos="fade-up">
            <button
              type="button"
              onClick={openDualCTA}
              className="mx-auto flex w-full max-w-md items-center rounded-full bg-white py-1.5 pl-5 pr-1.5 text-left shadow-[0_10px_30px_rgba(18,33,62,0.08)] transition hover:bg-[#F7FBFE]"
            >
              <span className="min-w-0 flex-1 text-sm text-[#12213E]">How to Avoid Rental Rejection</span>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#12213E] text-white">
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
            <p className="mt-3 text-xs text-[#6B7280]">
              Pre‑qualify in 5 minutes · No impact on your credit score · Trusted by landlords across Canada
            </p>
          </div>
        </div>
      </div>

      <RentalInfoModal isOpen={!!activeModal} type={activeModal || "general"} onClose={() => setActiveModal(null)} onApply={openDualCTA} />
      <DualCTAModal isOpen={dualCTAModalOpen} onClose={() => setDualCTAModalOpen(false)} />
      <LandlordPartnerModal isOpen={landlordFormOpen} onClose={() => setLandlordFormOpen(false)} />
    </section>
  );
};

export default RentalGuaranteeSection;