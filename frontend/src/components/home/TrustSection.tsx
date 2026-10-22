import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, X, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════════
   WhatsApp Configuration
═══════════════════════════════════════════════════════ */
const WHATSAPP_NUMBER = "+19055192873";

const openWhatsApp = (message?: string) => {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    message || "Hi! I'm interested in partnering with First Step Wealth Group."
  )}`;
  window.open(url, "_blank");
};

/* ═══════════════════════════════════════════════════════
   Partner Data
═══════════════════════════════════════════════════════ */
const partners = [
  {
    name: "Marksman Travels and Tours",
    logo: "/marks.jpg",
    metric: "12+",
    label: "Years Active",
    description:
      "Marksman Travels and Tours specializes in visa processing, immigration consultations, and comprehensive travel services.",
    services: [
      "Visa application & processing",
      "Immigration consultations",
      "International & domestic flight bookings",
      "Newcomer relocation packages",
      "Corporate travel management",
    ],
    since: 2022,
  },
  {
    name: "Healthy Homecare",
    logo: "/homecare.jpg",
    metric: "98%",
    label: "Client Satisfaction",
    description:
      "Healthy Homecare provides compassionate, professional homecare services across Ontario with certified caregivers.",
    services: [
      "Personal care & companionship",
      "Dementia & Alzheimer's support",
      "Post‑surgery recovery assistance",
      "Respite care for family caregivers",
    ],
    since: 2022,
  },
  {
    name: "Viza Pinnacle",
    logo: "/pinnacle.jpg",
    metric: "50+",
    label: "Visas Processed",
    description:
      "Viza Pinnacle offers expert visa advisory, business travel solutions, and relocation support for entrepreneurs and professionals.",
    services: [
      "Business visa & work permit assistance",
      "Corporate travel strategy",
      "Market entry & relocation support",
      "Global mobility consulting",
    ],
    since: 2022,
  },
  {
    name: "Sage Solutions",
    logo: "/sage.jpg",
    metric: "200+",
    label: "Deals Won",
    description:
      "Sage Solutions helps SMEs attract clients, win business deals, and grow through strategic proposals, digital marketing, and LinkedIn optimization.",
    services: [
      "Business proposal writing",
      "Digital marketing strategy",
      "LinkedIn profile optimization",
      "Client acquisition consulting",
      "Deal negotiation support",
    ],
    since: 2025,
  },
];

/* ═══════════════════════════════════════════════════════
   Partner Detail Modal
═══════════════════════════════════════════════════════ */
const PartnerDetailModal = ({
  partner,
  onClose,
}: {
  partner: (typeof partners)[0] | null;
  onClose: () => void;
}) => {
  if (!partner) return null;

  return (
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
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-[32px] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-10"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#C69259]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#12213E]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-md border-2 border-[#C69259] flex items-center justify-center overflow-hidden p-3">
            <img
              src={partner.logo}
              alt={partner.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>

        <div className="text-center mb-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#12213E]">
            {partner.name}
          </h2>
          <p className="text-sm text-[#C69259] font-semibold mt-1">
            Partner since {partner.since} · {partner.metric} {partner.label}
          </p>
        </div>

        <p className="text-gray-600 text-center leading-relaxed mb-6">
          {partner.description}
        </p>

        <div className="space-y-2 mb-6">
          <h4 className="text-sm font-bold text-[#12213E] uppercase tracking-wider flex items-center gap-2">
 Services
          </h4>
          {partner.services.map((svc, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#C69259]/10 flex items-center justify-center mt-0.5">
                <svg
                  className="w-3 h-3 text-[#C69259]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-gray-700 text-sm">{svc}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════
   Partner Form Modal
═══════════════════════════════════════════════════════ */
const PartnerFormModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[e.target.name];
        return copy;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "Please enter a valid email";
    }
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const whatsappMsg = `Hi, I'm ${form.name} from ${form.company || "N/A"}. I'm interested in partnering with First Step Wealth Group.\nEmail: ${form.email}\nPhone: ${form.phone}\nMessage: ${form.message}`;
    onClose();
    openWhatsApp(whatsappMsg);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-[28px] sm:rounded-[32px] shadow-2xl w-full sm:max-w-lg max-h-[80vh] sm:max-h-[85vh] overflow-hidden flex flex-col relative"
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1.5 rounded-full bg-gray-300" />
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors z-10"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </button>

        <div className="flex-1 overflow-y-auto px-5 sm:px-8 pt-5 sm:pt-6 pb-6 sm:pb-8">
          <div className="text-center mb-5 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#12213E]">
              Partner With Us
            </h2>
            <p className="text-gray-500 mt-1.5 sm:mt-2 text-sm">
              Fill in your details and we'll connect instantly on WhatsApp
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#12213E] mb-1">
                Full Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl bg-white border ${errors.name ? "border-red-500" : "border-gray-200"} text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#C69259] focus:ring-2 focus:ring-[#C69259]/20 transition-all`}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#12213E] mb-1">
                Email *
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl bg-white border ${errors.email ? "border-red-500" : "border-gray-200"} text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#C69259] focus:ring-2 focus:ring-[#C69259]/20 transition-all`}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#12213E] mb-1">
                Phone *
              </label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl bg-white border ${errors.phone ? "border-red-500" : "border-gray-200"} text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#C69259] focus:ring-2 focus:ring-[#C69259]/20 transition-all`}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#12213E] mb-1">
                Company / Organization
              </label>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#C69259] focus:ring-2 focus:ring-[#C69259]/20 transition-all"
                placeholder="Acme Inc."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#12213E] mb-1">
                Message (optional)
              </label>
              <textarea
                name="message"
                rows={3}
                value={form.message}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#C69259] focus:ring-2 focus:ring-[#C69259]/20 resize-none"
                placeholder="Tell us about your interest..."
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3.5 sm:py-4 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" /> Connect on WhatsApp{" "}
              <Send className="w-4 h-4" />
            </motion.button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════
   Main Trust Section
═══════════════════════════════════════════════════════ */
const TrustSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { margin: "-100px", once: true });
  const [selectedPartner, setSelectedPartner] = useState<
    (typeof partners)[0] | null
  >(null);
  const [partnerFormOpen, setPartnerFormOpen] = useState(false);
  const partnerScrollerRef = useRef<HTMLDivElement>(null);

  const stepPartners = (direction: number) => {
    const scroller = partnerScrollerRef.current;
    const card = scroller?.querySelector("button");
    if (!scroller || !(card instanceof HTMLElement)) return;
    scroller.scrollBy({ left: direction * (card.offsetWidth + 16), behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#E4EFF8] py-12 md:py-20"
      id="trust"
    >
      <div className="mx-auto w-[98%] md:w-full md:max-w-[1180px] md:px-6">
      <div className="rounded-[32px] bg-white px-4 py-10 shadow-[0_16px_50px_rgba(18,33,62,0.06)] md:px-12 md:py-14">
        <motion.h2
          className="section-headline text-center text-[#12213E]"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Trusted Partners
        </motion.h2>

        <div className="mx-auto mt-6 max-w-2xl text-center text-[15px] leading-relaxed text-[#6B7280]">
          <p>The goal is to turn financial uncertainty into stability, and stability into lasting wealth.</p>
          <p className="mt-3">
            Our trusted partners help us deliver that promise across Canada. These partners have been vetted and trusted by First Step Wealth Group to deliver exceptional service to our community.
          </p>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button type="button" aria-label="Previous partner" onClick={() => stepPartners(-1)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#12213E] text-white">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div
            ref={partnerScrollerRef}
            className="flex flex-1 snap-x snap-mandatory gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {partners.map((partner) => (
              <button
                key={partner.name}
                type="button"
                onClick={() => setSelectedPartner(partner)}
                className="flex w-[78%] shrink-0 snap-center flex-col items-center rounded-[24px] bg-[#F7FBFE] px-5 py-6 text-center sm:w-[260px]"
              >
                <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-sm">
                  <img src={partner.logo} alt="" className="max-h-full max-w-full object-contain" />
                </span>
                <span className="mt-4 text-[15px] font-semibold leading-snug text-[#12213E]">{partner.name}</span>
                <span className="mt-1 text-[12px] text-[#6B7280]">{partner.metric} {partner.label}</span>
              </button>
            ))}
          </div>
          <button type="button" aria-label="Next partner" onClick={() => stepPartners(1)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#12213E] text-white">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6 flex justify-center">
          <button type="button" onClick={() => setPartnerFormOpen(true)} className="cta-email">
            <span className="whitespace-nowrap">Partner With Us</span>
            <span className="cta-email-arrow"><ArrowRight className="h-4 w-4" /></span>
          </button>
        </div>
      </div>
      </div>

      {/* Partner Detail Modal */}
      <AnimatePresence>
        {selectedPartner && (
          <PartnerDetailModal
            partner={selectedPartner}
            onClose={() => setSelectedPartner(null)}
          />
        )}
      </AnimatePresence>

      {/* Partner Form Modal */}
      <AnimatePresence>
        <PartnerFormModal
          isOpen={partnerFormOpen}
          onClose={() => setPartnerFormOpen(false)}
        />
      </AnimatePresence>
    </section>
  );
};

export default TrustSection;