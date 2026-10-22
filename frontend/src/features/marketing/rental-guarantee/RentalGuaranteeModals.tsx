import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  X,
  CheckCircle,
  AlertTriangle,
  UserPlus,
  MessageCircle,
  ShieldCheck,
  Send,
  Shield,
  Home,
} from "lucide-react";
import { useNavigate } from "react-router";
import { openWhatsApp, type ModalType } from "./rentalGuaranteeData";

export const DualCTAModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-[#12213E]/45 px-[0.5%] pb-2 pt-3 backdrop-blur-[2px] sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dual-cta-title"
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-[99%] max-w-none overflow-hidden rounded-[24px] bg-white shadow-[0_24px_64px_rgba(18,33,62,0.22)] sm:w-full sm:max-w-[400px] sm:rounded-[28px]"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative overflow-hidden bg-[#12213E] px-5 pb-4 pt-5 text-white sm:px-6">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#C69259]/30 blur-2xl"
          />
          <div className="relative flex items-center gap-2.5 pr-8">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <ShieldCheck className="h-4 w-4 text-[#C69259]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#C69259]">
                Rental guarantee
              </p>
              <h2
                id="dual-cta-title"
                className="text-base font-bold leading-snug sm:text-lg"
              >
                Get Started Today
              </h2>
              <p className="mt-0.5 text-xs text-white/70 sm:text-sm">
                Choose how you&apos;d like to connect with us
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-wrap gap-1.5">
            {["Track status", "Faster follow-ups", "Secure"].map((label) => (
              <span
                key={label}
                className="rounded-full bg-[#F7FBFE] px-2.5 py-1 text-[11px] font-semibold text-[#475569]"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="mt-4 space-y-2.5">
            <div>
              <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wide text-[#C69259]">
                Recommended
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/register");
                }}
                className="cta-email w-full max-w-full justify-between"
              >
                <span className="inline-flex min-w-0 items-center gap-2 truncate">
                  <UserPlus className="h-4 w-4 shrink-0 text-[#C69259]" />
                  <span className="truncate">Create your free account</span>
                </span>
                <span className="cta-email-arrow shrink-0">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-[#E8ECF1]" />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                or
              </span>
              <div className="h-px flex-1 bg-[#E8ECF1]" />
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                openWhatsApp();
              }}
              className="inline-flex w-full max-w-full items-center justify-between rounded-full border border-[#25D366]/35 bg-[#F0FDF4] py-1.5 pl-5 pr-1.5 text-left text-sm font-semibold text-[#12213E] transition hover:border-[#25D366]/60 hover:bg-[#E8FCEC]"
            >
              <span className="inline-flex min-w-0 items-center gap-2 truncate">
                <MessageCircle className="h-4 w-4 shrink-0 text-[#25D366]" />
                <span className="truncate">Chat on WhatsApp</span>
              </span>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          </div>

          <p className="mt-3 text-center text-[10px] text-[#9CA3AF]">
            No commitment · Free consultation · Confidential
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════
   Landlord Partner Form Modal
═══════════════════════════════════════════════════════ */
export const LandlordPartnerModal = ({
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
    propertyAddress: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const whatsappMsg = `Hi, I'm ${form.name}. I'm interested in partnering as a landlord. Email: ${form.email}, Phone: ${form.phone}, Property Address: ${form.propertyAddress}. Message: ${form.message}`;
    onClose();
    openWhatsApp(whatsappMsg);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-[28px] sm:rounded-[32px] shadow-2xl w-full sm:max-w-md max-h-[80vh] sm:max-h-[85vh] overflow-hidden flex flex-col relative"
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1.5 rounded-full bg-gray-300" />
        </div>

        <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors z-10">
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </button>

        <div className="flex-1 overflow-y-auto px-5 sm:px-8 pt-5 sm:pt-6 pb-6 sm:pb-8">
          <div className="text-center mb-5 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#C3B1E1] to-[#A78BDB] flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
              <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#12213E]">Partner With Us</h2>
            <p className="text-gray-500 mt-1.5 sm:mt-2 text-sm">Fill in your details and we'll connect instantly</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#12213E] mb-1">Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#C69259] focus:ring-2 focus:ring-[#C69259]/20" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#12213E] mb-1">Email *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#C69259] focus:ring-2 focus:ring-[#C69259]/20" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#12213E] mb-1">Phone *</label>
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#C69259] focus:ring-2 focus:ring-[#C69259]/20" placeholder="+1 (555) 123-4567" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#12213E] mb-1">Property Address *</label>
              <input name="propertyAddress" value={form.propertyAddress} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#C69259] focus:ring-2 focus:ring-[#C69259]/20" placeholder="123 Main St, Toronto" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#12213E] mb-1">Message (optional)</label>
              <textarea name="message" rows={3} value={form.message} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#C69259] focus:ring-2 focus:ring-[#C69259]/20 resize-none" placeholder="Tell us about your property..." />
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
              className="w-full py-3.5 sm:py-4 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5" /> Connect on WhatsApp <Send className="w-4 h-4" />
            </motion.button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════
   🔥 RENTAL INFO MODAL, Responsive Bottom Sheet
═══════════════════════════════════════════════════════ */
export const RentalInfoModal = ({
  isOpen,
  type,
  onClose,
  onApply,
}: {
  isOpen: boolean;
  type: ModalType;
  onClose: () => void;
  onApply: () => void;
}) => {
  if (!isOpen) return null;

  const content = {
    problem: {
      title: "The Rental Reality for Newcomers",
      subtitle: "Why 6‑12 months' rent upfront is almost inevitable without Canadian credit",
      icon: AlertTriangle, color: "#FF5A26",
      items: [
        "No Canadian credit file = high‑risk tenant in landlords' eyes",
        "Even with proof of income, landlords demand 6‑12 months upfront as security",
        "That often means $15,000 to $30,000 locked away before you get keys",
        "Many newcomers lose out on their dream rental simply because of this gap",
      ],
      cta: "See How We Solve This", ctaAction: "dual",
    },
    solution: {
      title: "Our Guarantee: Rent Without the Wall",
      subtitle: "We become your guarantor; landlords trust us, you get approved.",
      icon: Shield, color: "#C3B1E1",
      items: [
        "We verify your income and employment, not just a credit score",
        "Our guarantee replaces the upfront deposit with a low monthly fee",
        "Landlords are paid on time, every month, which is of zero risk to them",
        "Your rent payments are well documented, so you start building credit",
      ],
      cta: "Apply for the Guarantee", ctaAction: "dual",
    },
    renter: {
      title: "For Renters: Unlock Your Home",
      subtitle: "No Canadian credit? No problem. Pre‑qualify in 5 minutes.",
      icon: Home, color: "#FF5A26",
      items: [
        "Skip the 6‑12 months' rent deposit entirely",
        "Get approved based on your true financial health, not a missing credit score",
        "Move in faster, same‑day approvals in most cases",
        "Build Canadian credit history just by paying rent",
      ],
      cta: "Check Your Eligibility", ctaAction: "dual",
    },
    landlord: {
      title: "For Landlords: Zero Vacancy, Zero Risk",
      subtitle: "Fill vacancies with guaranteed, pre‑screened tenants.",
      icon: Shield, color: "#C3B1E1",
      items: [
        "We handle tenant screening and guarantee monthly payments",
        "No more worries about arrears or non‑payment",
        "Attract high‑quality newcomers who are ready to move in immediately",
        "Free listing service for your property, let us bring you tenants",
      ],
      cta: "Chat With Us on WhatsApp", ctaAction: "whatsapp",
    },
    general: {
      title: "Rent with Confidence, Even Without Canadian Credit",
      subtitle: "Our Rental Guarantee replaces huge upfront deposits with a simple monthly solution.",
      icon: Shield, color: "#C69259",
      items: [
        "Pre‑qualify in 5 minutes with no impact on your credit score",
        "We guarantee your rent to any landlord",
        "Move in and start building credit right away",
        "Trusted by landlords across Canada",
      ],
      cta: "Apply for Rental Guarantee", ctaAction: "dual",
    },
  };

  const current = content[type];
  const IconComponent = current.icon;

  const handleClick = () => {
    if (current.ctaAction === "whatsapp") { onClose(); openWhatsApp(); }
    else { onClose(); onApply(); }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-t-[28px] sm:rounded-[32px] shadow-2xl w-full sm:max-w-2xl max-h-[80vh] sm:max-h-[85vh] overflow-hidden flex flex-col"
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1.5 rounded-full bg-gray-300" />
        </div>

        <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </button>

        <div className="flex-1 overflow-y-auto px-5 sm:px-10 pb-6 sm:pb-8">
          <div className="text-center pt-5 sm:pt-6 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-opacity-10 flex items-center justify-center mx-auto mb-3 sm:mb-4" style={{ backgroundColor: `${current.color}20` }}>
              <IconComponent className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: current.color }} />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#12213E] leading-tight">{current.title}</h2>
            <p className="text-gray-500 text-sm mt-1.5 sm:mt-2">{current.subtitle}</p>
          </div>

          <div className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-8">
            {current.items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#C69259]/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C69259]" />
                </div>
                <span className="text-sm sm:text-base text-gray-700 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>

          {(type === "general" || type === "solution") && (
            <div className="bg-[#F8FAFC] rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-5 sm:mb-6">
              <h3 className="text-base sm:text-lg font-bold text-[#12213E] mb-2 sm:mb-3">Quick Facts</h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div><p className="text-gray-500">Average rent (1‑bed, Toronto)</p><p className="text-lg sm:text-xl font-extrabold text-[#12213E]">$2,500+</p></div>
                <div><p className="text-gray-500">Typical upfront ask (no credit)</p><p className="text-lg sm:text-xl font-extrabold text-[#12213E]">6‑12 months</p></div>
                <div>
                  <p className="text-gray-500">Guarantee details</p>
                  <p className="text-sm sm:text-base font-bold text-[#12213E]">Terms & Conditions apply</p>
                </div>
                <div><p className="text-gray-500">Approval time</p><p className="text-lg sm:text-xl font-extrabold text-[#12213E]">Same day</p></div>
              </div>
            </div>
          )}

          <button onClick={handleClick} className="cta-email w-full">
            <span className="min-w-0 flex-1 whitespace-nowrap">{current.cta}</span>
            <span className="cta-email-arrow"><ArrowRight className="h-4 w-4" /></span>
          </button>

          <div className="h-4 sm:hidden" />
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════
   Main Section
═══════════════════════════════════════════════════════ */
