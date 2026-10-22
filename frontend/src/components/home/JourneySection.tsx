import { ArrowRight, Compass, Handshake, LineChart, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/hooks/AuthProvider";
import { useState } from "react";
import LeadCaptureModal from "@/components/global/LeadCaptureModal";

const STEPS = [
  {
    icon: MessageCircle,
    title: "Book a free discovery call",
    body: "Share where you are: housing, protection, or wealth: and we map the first move together.",
  },
  {
    icon: Compass,
    title: "Choose your pathway",
    body: "Rental guarantee, insurance advisory, real estate support, or wealth education. One clear lane.",
  },
  {
    icon: Handshake,
    title: "Get matched with guidance",
    body: "An advisor walks you through next steps with education-first advice, never a hard sell.",
  },
  {
    icon: LineChart,
    title: "Build lasting momentum",
    body: "Credit history, coverage, and long-term wealth habits that compound after that first step.",
  },
];

const JourneySection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leadOpen, setLeadOpen] = useState(false);

  const openConsult = () => {
    if (user) navigate("/dashboard");
    else setLeadOpen(true);
  };

  return (
    <section id="journey" className="bg-[#E4EFF8] py-12 md:py-16">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
        <div className="mb-8 text-center md:mb-10" data-aos="fade-up">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C69259]">
            How First Step works
          </p>
          <h2 className="mx-auto mt-3 max-w-[18.5rem] text-balance text-[1.65rem] font-bold leading-[1.2] tracking-tight text-[#12213E] sm:max-w-xl sm:text-[1.9rem] md:max-w-2xl md:text-[2.15rem] lg:text-[2.45rem]">
            Four steps from landing{" "}
            <span className="text-[#C69259]">to lasting wealth</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#6B7280] sm:mt-4 sm:text-[15px]">
            A calm sequence for newcomers and families: so you always know what
            comes next.
          </p>
        </div>

        <div className="grid items-start gap-8 sm:gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
          <ol className="min-w-0 space-y-0">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const last = index === STEPS.length - 1;
              return (
                <li
                  key={step.title}
                  className="relative flex gap-3 pb-7 last:pb-0 sm:gap-4 sm:pb-8"
                  data-aos="fade-up"
                  data-aos-delay={String(index * 90)}
                >
                  {!last && (
                    <span
                      aria-hidden
                      className="absolute left-[17px] top-10 bottom-0 w-px bg-[#12213E]/12 sm:left-[19px] sm:top-11"
                    />
                  )}
                  <span className="relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#12213E] text-white shadow-sm sm:h-10 sm:w-10">
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5 sm:pt-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#C69259] sm:text-[11px]">
                      Step {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-1 text-base font-bold leading-snug text-[#12213E] sm:text-lg">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-[#6B7280] sm:mt-1.5 sm:text-sm">
                      {step.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div
            className="relative min-w-0"
            data-aos="fade-up"
            data-aos-delay="80"
          >
            <div
              aria-hidden
              className="absolute -inset-2 rounded-[28px] bg-gradient-to-br from-[#C69259]/20 via-transparent to-[#12213E]/10 blur-xl sm:-inset-3 sm:rounded-[36px]"
            />
            <div className="relative overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-[0_20px_50px_rgba(18,33,62,0.1)] sm:rounded-[32px]">
              <img
                src="/hero-meeting.jpg"
                alt="Advisor guiding a family through their first steps"
                className="h-[200px] w-full object-cover object-[center_28%] sm:h-[260px] md:h-[min(40vh,340px)]"
              />
              <div className="space-y-3 p-4 sm:space-y-4 sm:p-6 md:p-7">
                <p className="text-sm leading-relaxed text-[#5B6575]">
                  The initial conversation is always free. Tell us your goal -
                  we will point you to the right pathway.
                </p>
                <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                  <button
                    type="button"
                    onClick={openConsult}
                    className="cta-email max-w-full justify-between sm:justify-start"
                  >
                    <span className="truncate">Start with a free call</span>
                    <span className="cta-email-arrow shrink-0">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </button>
                  <Link
                    to="/services"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#12213E]/12 bg-[#F7F8FB] px-5 py-3 text-sm font-semibold text-[#12213E] transition hover:border-[#C69259]/40"
                  >
                    View all services
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {leadOpen && (
        <LeadCaptureModal isOpen onClose={() => setLeadOpen(false)} />
      )}
    </section>
  );
};

export default JourneySection;
