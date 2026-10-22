import { motion } from "framer-motion";
import { X, Shield, CheckCircle, ArrowRight, TrendingUp, AlertTriangle, Home, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router";

/* ─── WhatsApp Configuration ──────────────────────────── */
const WHATSAPP_NUMBER = "1234567890"; // Replace with your actual WhatsApp number (with country code, no + or spaces)
const WHATSAPP_MESSAGE = "Hi! I'm interested in partnering with First Step Wealth Group as a landlord. Can you tell me more about your rental guarantee program?";

const openWhatsApp = () => {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
  window.open(url, "_blank");
};

/* ─── Props ───────────────────────────────────────────── */
interface Props {
  isOpen: boolean;
  type: "problem" | "solution" | "renter" | "landlord" | "general";
  onClose: () => void;
  onApply: () => void;
}

/* ─── Modal Component ─────────────────────────────────── */
const RentalInfoModal = ({ isOpen, type, onClose, onApply }: Props) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const content = {
    problem: {
      title: "The Rental Reality for Newcomers",
      subtitle: "Why 6‑12 months' rent upfront is almost inevitable without Canadian credit",
      icon: AlertTriangle,
      color: "#FF5A26",
      items: [
        "No Canadian credit file = high‑risk tenant in landlords' eyes",
        "Even with proof of income, landlords demand 6‑12 months upfront as security",
        "That often means $15,000 to $30,000 locked away before you get keys",
        "Many newcomers lose out on their dream rental simply because of this gap",
      ],
      cta: "See How We Solve This",
      ctaAction: "register", // Navigate to register
    },
    solution: {
      title: "Our Guarantee: Rent Without the Wall",
      subtitle: "We become your guarantor, landlords trust us, you get approved.",
      icon: Shield,
      color: "#C3B1E1",
      items: [
        "We verify your income and employment, not just a credit score",
        "Our guarantee replaces the upfront deposit with a low monthly fee",
        "Landlords are paid on time, every month, zero risk to them",
        "Your rent payments are reported to Equifax, so you start building credit",
      ],
      cta: "Apply for the Guarantee",
      ctaAction: "register", // Navigate to register
    },
    renter: {
      title: "For Renters: Unlock Your Home",
      subtitle: "No Canadian credit? No problem. Pre‑qualify in 5 minutes.",
      icon: Home,
      color: "#FF5A26",
      items: [
        "Skip the 6‑12 months' rent deposit entirely",
        "Get approved based on your true financial health, not a missing credit score",
        "Move in faster, same‑day approvals in most cases",
        "Build Canadian credit history just by paying rent",
      ],
      cta: "Check Your Eligibility",
      ctaAction: "register", // Navigate to register
    },
    landlord: {
      title: "For Landlords: Zero Vacancy, Zero Risk",
      subtitle: "Fill vacancies with guaranteed, pre‑screened tenants.",
      icon: Shield,
      color: "#C3B1E1",
      items: [
        "We handle tenant screening and guarantee monthly payments",
        "No more worries about arrears or non‑payment",
        "Attract high‑quality newcomers who are ready to move in immediately",
        "Free listing service for your property, let us bring you tenants",
      ],
      cta: "Chat With Us on WhatsApp",
      ctaAction: "whatsapp", // Open WhatsApp
    },
    general: {
      title: "Rent with Confidence, Even Without Canadian Credit",
      subtitle: "Our Rental Guarantee replaces huge upfront deposits with a simple monthly solution.",
      icon: Shield,
      color: "#C69259",
      items: [
        "Pre‑qualify in 5 minutes with no impact on your credit score",
        "We guarantee your rent to any landlord",
        "Move in and start building credit right away",
        "Trusted by landlords across Canada",
      ],
      cta: "Apply for Rental Guarantee",
      ctaAction: "register", // Navigate to register
    },
  };

  const current = content[type];
  const IconComponent = current.icon;

  /* ─── Handle CTA Click ──────────────────────────────── */
  const handleCtaClick = () => {
    onClose();

    if (current.ctaAction === "whatsapp") {
      // Open WhatsApp for landlords
      openWhatsApp();
    } else if (current.ctaAction === "register") {
      // Navigate to register page for renters/newcomers
      navigate("/register");
    } else {
      // Fallback to the original onApply
      onApply();
    }
  };

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
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-10"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 rounded-full bg-opacity-10 flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${current.color}20` }}
          >
            <IconComponent className="w-8 h-8" style={{ color: current.color }} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#12213E]">
            {current.title}
          </h2>
          <p className="text-gray-500 mt-2">{current.subtitle}</p>
        </div>

        {/* Items list */}
        <div className="space-y-3 mb-8">
          {current.items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#C69259]/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-[#C69259]" />
              </div>
              <span className="text-gray-700 text-sm">{item}</span>
            </div>
          ))}
        </div>

        {/* Show stats for general and solution modals */}
        {(type === "general" || type === "solution") && (
          <div className="bg-[#F8FAFC] rounded-2xl p-5 mb-6">
            <h3 className="text-lg font-bold text-[#12213E] mb-3">Quick Facts</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Average rent (1‑bed, Toronto)</p>
                <p className="text-xl font-extrabold text-[#12213E]">$2,500+</p>
              </div>
              <div>
                <p className="text-gray-500">Typical upfront ask (no credit)</p>
                <p className="text-xl font-extrabold text-[#12213E]">6‑12 months</p>
              </div>
              <div>
                <p className="text-gray-500">Our guarantee cost</p>
                <p className="text-xl font-extrabold" style={{ color: current.color }}>
                  $110/mo
                </p>
              </div>
              <div>
                <p className="text-gray-500">Approval time</p>
                <p className="text-xl font-extrabold text-[#12213E]">Same day</p>
              </div>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={handleCtaClick}
          className={`w-full py-4 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:shadow-xl ${current.ctaAction === "whatsapp"
            ? "bg-[#25D366] hover:bg-[#20BD5A] text-white"
            : "bg-gradient-to-r from-[#12213E] to-[#1E3A5F] text-white"
            }`}
        >
          {current.ctaAction === "whatsapp" ? (
            <>
              <MessageCircle className="w-5 h-5" />
              {current.cta}
            </>
          ) : (
            <>
              <TrendingUp className="w-5 h-5" />
              {current.cta}
            </>
          )}
        </button>

        {/* Subtle hint text */}
        <p className="text-xs text-gray-400 text-center mt-4">
          {current.ctaAction === "whatsapp"
            ? "We typically respond within a few hours during business days."
            : "No commitment • Cancel anytime • 100% confidential"}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default RentalInfoModal;