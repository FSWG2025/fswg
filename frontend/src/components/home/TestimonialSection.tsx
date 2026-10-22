import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, X, ChevronLeft, ChevronRight, ChevronDown,
} from "lucide-react";
import ConsultationBookingModal from "@/components/global/ConsultationBookingModal";

/* ═══════════════════════════════════════════════════════
   Types & Data
═══════════════════════════════════════════════════════ */
type TestimonialSize = "small" | "medium" | "large";

type StoryTopic = "Home" | "Investing" | "Insurance" | "Rental" | "Planning";

interface Testimonial {
  quote: string;
  name: string;
  location: string;
  year: number;
  rating: number;
  size: TestimonialSize;
  avatar: string;
  highlighted?: boolean;
  topic: StoryTopic;
}

const testimonials: Testimonial[] = [
  {
    quote: "First Step didn't just teach us about money. They helped us buy our first home and felt in control of our future. As newcomers from a place like Nigeria, we never thought this was possible in a short period of time.",
    name: "Chidi & Adaeze O.",
    location: "Brampton, ON",
    year: 2023,
    rating: 4,
    size: "large",
    avatar: "",
    highlighted: true,
    topic: "Home",
  },
  {
    quote: "I never thought I could invest until I met the team. Now I have a growing portfolio and a clear plan for retirement. I feel secure for the first time since moving from Lagos.",
    name: "Obinna E.",
    location: "Vancouver, BC",
    year: 2022,
    rating: 5,
    size: "small",
    avatar: "",
    topic: "Investing",
  },
  {
    quote: "Their insurance guidance alone saved our family thousands while giving us better coverage. Genuine experts who actually care about newcomers.",
    name: "Sarah M.",
    location: "Calgary, AB",
    year: 2023,
    rating: 5,
    size: "small",
    avatar: "",
    topic: "Insurance",
  },
  {
    quote: "We were drowning in debt before we found First Step. They created a realistic plan, consolidated our loans, and now we're actually saving for our kids' education.",
    name: "David & Rachel T.",
    location: "Edmonton, AB",
    year: 2022,
    rating: 4.5,
    size: "medium",
    avatar: "",
    topic: "Planning",
  },
  {
    quote: "As a newcomer from Kenya, I had no idea how the Canadian financial system worked. They walked me through everything, from credit building to my first investment. I'm forever grateful.",
    name: "Amina O.",
    location: "Ottawa, ON",
    year: 2022,
    rating: 5,
    size: "small",
    avatar: "",
    topic: "Investing",
  },
  {
    quote: "Thanks to First Step, my family feels secure knowing we have the right insurance protection and a solid retirement plan. The peace of mind is priceless.",
    name: "Michael & Jennifer W.",
    location: "Winnipeg, MB",
    year: 2023,
    rating: 5,
    size: "medium",
    avatar: "",
    topic: "Insurance",
  },
  {
    quote: "We went from renting to owning our first home in 18 months. The team made the entire process feel effortless and exciting. Now we're building real wealth.",
    name: "The Oluwole Family",
    location: "Ibadan, Nigeria",
    year: 2024,
    rating: 5,
    size: "medium",
    avatar: "",
    topic: "Home",
  },
  {
    quote: "As a single mom in Toronto, I thought homeownership was out of reach forever. First Step showed me a clear path and now I have the keys to my own place. Dreams do come true.",
    name: "Sophie L.",
    location: "Toronto, ON",
    year: 2023,
    rating: 5,
    size: "small",
    avatar: "",
    topic: "Home",
  },
  {
    quote: "Moving from Ghana to Canada was overwhelming. The team helped me understand the rental market, build credit, and now I'm planning to buy my first home in Calgary.",
    name: "Kofi A.",
    location: "Calgary, AB",
    year: 2024,
    rating: 5,
    size: "medium",
    avatar: "",
    topic: "Rental",
  },
  {
    quote: "The insurance advice saved us from a financial disaster when my husband got sick. We can't thank First Step enough for their guidance and genuine care.",
    name: "Ngozi & Emeka I.",
    location: "Abuja, Nigeria",
    year: 2022,
    rating: 5,
    size: "large",
    avatar: "",
    topic: "Insurance",
  },
  {
    quote: "I started with zero knowledge about investing. Now I have a diversified portfolio and a retirement plan that actually makes sense to me. The team made it so simple.",
    name: "Thomas R.",
    location: "Halifax, NS",
    year: 2023,
    rating: 5,
    size: "small",
    avatar: "",
    topic: "Investing",
  },
  {
    quote: "The rental guarantee program was a game-changer. Without Canadian credit history, no landlord would look at us. First Step changed everything. We moved in within a week.",
    name: "Oluwaseun & Titi A.",
    location: "Winnipeg, MB",
    year: 2024,
    rating: 5,
    size: "medium",
    avatar: "",
    topic: "Rental",
  },
];

const storyTopics = ["All", "Home", "Investing", "Insurance", "Rental", "Planning"] as const;

const initialFor = (name: string) => name.trim().charAt(0).toUpperCase();
const avatarTones = ["#C69259", "#12213E", "#1E3A5F", "#8A6840", "#2C4A6E", "#A67C4E"];

const pyramidRows = <T,>(items: T[]) => {
  const pattern = items.length === 12 ? [1, 2, 3, 3, 2, 1] : [];
  if (pattern.length === 0) {
    let left = items.length;
    let width = 1;
    let grow = true;
    while (left > 0) {
      const take = Math.min(width, left);
      pattern.push(take);
      left -= take;
      if (grow) {
        if (width === 3) grow = false;
        else width += 1;
      } else if (width > 1) width -= 1;
    }
  }
  const rows: T[][] = [];
  let cursor = 0;
  pattern.forEach((count) => {
    rows.push(items.slice(cursor, cursor + count));
    cursor += count;
  });
  return rows;
};

/* ─── Testimonial Modal ──────────────────── */
const TestimonialModal = ({
  isOpen,
  onClose,
  onBookConsultation,
}: {
  isOpen: boolean;
  onClose: () => void;
  onBookConsultation: () => void;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goNext = useCallback(() => setActiveIndex((prev) => (prev + 1) % testimonials.length), []);
  const goPrev = useCallback(() => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length), []);

  useEffect(() => {
    if (!isOpen) return;
    intervalRef.current = setInterval(goNext, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isOpen, goNext]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[32px] shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden relative flex flex-col"
          >
            <button onClick={onClose} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="text-center max-w-lg"
                >
                  <blockquote className="text-xl md:text-2xl font-bold text-[#0F172A] leading-snug mb-6">
                    "{testimonials[activeIndex].quote}"
                  </blockquote>
                  <div className="text-center">
                    <p className="font-bold text-[#0F172A] text-lg">{testimonials[activeIndex].name}</p>
                    <p className="text-sm text-[#64748B]">{testimonials[activeIndex].location} · {testimonials[activeIndex].year}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <button onClick={goPrev} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-5 h-5 text-[#0F172A]" />
            </button>
            <button onClick={goNext} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ChevronRight className="w-5 h-5 text-[#0F172A]" />
            </button>

            <div className="flex justify-center gap-2 pb-6">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setActiveIndex(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === activeIndex ? "bg-[#2F80ED] w-6" : "bg-gray-300"}`} />
              ))}
            </div>

            <div className="flex justify-center px-6 pb-6">
              <button type="button" onClick={onBookConsultation} className="cta-email">
                <span className="whitespace-nowrap">Book a Free Consultation</span>
                <span className="cta-email-arrow"><ArrowRight className="h-4 w-4" /></span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ─── Testimonial Section (FULLY RESPONSIVE) ──────────── */
const TestimonialSection = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [consultModalOpen, setConsultModalOpen] = useState(false);
  const [topic, setTopic] = useState<(typeof storyTopics)[number]>("All");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedName, setSelectedName] = useState(testimonials[0].name);

  const filtered = topic === "All" ? testimonials : testimonials.filter((story) => story.topic === topic);
  const selected = filtered.find((story) => story.name === selectedName) ?? filtered[0];
  const rows = pyramidRows(filtered);

  return (
    <section className="bg-[#E4EFF8] pb-14 pt-4 md:pb-20 md:pt-6">
      <div className="mx-auto w-[98%] md:w-full md:max-w-[1100px]">
        <h2 className="section-headline text-center text-[#12213E]" data-aos="fade-up">
          What Our Clients Says
        </h2>
        <div className="mt-6 flex flex-col items-center" data-aos="fade-up" data-aos-delay="60">
          <button
            type="button"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((open) => !open)}
            className="inline-flex items-center gap-2 rounded-full bg-white py-1.5 pl-4 pr-2 shadow-[0_10px_24px_rgba(18,33,62,0.06)]"
          >
            <span className="text-sm font-semibold text-[#12213E]">Client Stories</span>
            <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#12213E] px-2 text-xs font-semibold text-white">{String(filtered.length).padStart(2, "0")}</span>
            <span className="text-sm font-semibold text-[#6B7280]">{topic}</span>
            <ChevronDown className={`h-4 w-4 text-[#12213E] transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
          </button>
          {filtersOpen && (
            <div className="mt-4 flex w-full flex-col items-center gap-4">
              <p className="max-w-xl text-center text-sm leading-relaxed text-[#6B7280]">
                Real stories from real people who took the first step toward financial freedom.
              </p>
              <div className="mx-auto grid w-full max-w-[360px] grid-cols-3 gap-3">
                {storyTopics.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setTopic(item);
                      const next = item === "All" ? testimonials : testimonials.filter((story) => story.topic === item);
                      setSelectedName(next[0]?.name ?? testimonials[0].name);
                    }}
                    className={`rounded-full px-3 py-2.5 text-center text-sm font-semibold ${topic === item ? "bg-[#12213E] text-white" : "bg-white text-[#12213E] shadow-[0_8px_20px_rgba(18,33,62,0.06)]"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 md:gap-4" data-aos="fade-up" data-aos-delay="100">
          {rows.map((row) => (
            <div key={row.map((story) => story.name).join("-")} className="flex w-full max-w-full flex-nowrap justify-center gap-1.5 md:gap-4">
              {row.map((story) => {
                const active = story.name === selected?.name;
                const tone = avatarTones[testimonials.findIndex((item) => item.name === story.name) % avatarTones.length];
                return (
                  <button
                    key={story.name}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelectedName(story.name)}
                    className={`flex min-w-0 items-center gap-1.5 rounded-full py-1.5 pl-1.5 pr-2.5 md:gap-3 md:py-2 md:pl-2 md:pr-6 ${row.length > 2 ? "max-w-[32%] md:max-w-none" : ""} ${active ? "bg-white shadow-[0_10px_24px_rgba(18,33,62,0.08)]" : "bg-[#EAF1F8]"}`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white md:h-11 md:w-11 md:text-sm" style={{ backgroundColor: tone }}>{initialFor(story.name)}</span>
                    <span className="truncate text-left text-[12px] font-semibold text-[#12213E] md:text-base">{story.name}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {selected && (
          <article className="mx-auto mt-8 max-w-2xl rounded-[28px] bg-white px-6 py-5 text-center" data-aos="zoom-in" data-aos-duration="500">
            <p className="text-sm leading-relaxed text-[#4B5563] md:text-base">{selected.quote}</p>
            <p className="mt-3 text-sm font-semibold text-[#12213E]">{selected.location} · {selected.year}</p>
          </article>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3" data-aos="fade-up">
          <button type="button" onClick={() => setModalOpen(true)} className="cta-email">
            <span className="whitespace-nowrap">See More Stories</span>
            <span className="cta-email-arrow"><ArrowRight className="h-4 w-4" /></span>
          </button>
          <button type="button" onClick={() => setConsultModalOpen(true)} className="cta-email">
            <span className="whitespace-nowrap">Book a Consultation</span>
            <span className="cta-email-arrow"><ArrowRight className="h-4 w-4" /></span>
          </button>
        </div>
      </div>

      {/* Testimonials Modal */}
      <TestimonialModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onBookConsultation={() => setConsultModalOpen(true)} />

      {/* Consultation Booking Modal */}
      <ConsultationBookingModal isOpen={consultModalOpen} onClose={() => setConsultModalOpen(false)} />
    </section>
  );
};

export default TestimonialSection;