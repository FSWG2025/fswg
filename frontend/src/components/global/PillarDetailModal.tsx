import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Shield, Home as HomeIcon, Building2, CheckCircle } from "lucide-react";

interface PillarContent {
  icon: React.FC<{ className?: string }>;
  color: string;
  headline: string;
  subhead: string;
  bullets: string[];
  image: string;
  primaryLabel: string;
  secondaryLabel?: string;
}

const contentMap: Record<string, PillarContent> = {
  rental: {
    icon: HomeIcon,
    color: "#E88D72",
    headline: "Rent Without the Stress",
    subhead:
      "Our Rental Guarantee replaces huge upfront deposits with a simple monthly solution.",
    bullets: [
      "Pre‑qualify in minutes with no credit impact",
      "No Canadian credit history required",
      "Move into your new home faster",
      "Build Canadian credit by paying rent",
      "Trusted by landlords across Canada",
    ],
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80",
    primaryLabel: "Apply Now",
  },
  insurance: {
    icon: Shield,
    color: "#12213E",
    headline: "Protect Your Family & Build a Career",
    subhead:
      "Get the best insurance coverage and turn your passion into a rewarding career as a licensed advisor.",
    bullets: [
      "Compare policies from 10+ top insurers",
      "Paid training program, earn while you learn",
      "Flexible remote work from anywhere",
      "Ongoing mentorship and career support",
      "Help families secure their financial future",
    ],
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&q=80",
    primaryLabel: "Join the Insurance Team",
    secondaryLabel: "Speak With an Advisor",
  },
  realestate: {
    icon: Building2,
    color: "#2563EB",
    headline: "Your Dream Home Starts Here",
    subhead:
      "From first‑time buyer to seasoned investor, we connect you with vetted agents and the best mortgage options.",
    bullets: [
      "Free mortgage pre‑approval guidance",
      "Access to top-rated real estate agents",
      "Investment property analysis and strategy",
      "Step‑by‑step support from search to closing",
      "Exclusive lender relationships and rates",
    ],
    image:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80",
    primaryLabel: "Book a Consultation",
  },
};

interface PillarDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "rental" | "insurance" | "realestate";
  onApply?: () => void;
  onConsult?: () => void;
}

export default function PillarDetailModal({
  isOpen,
  onClose,
  type,
  onApply,
  onConsult,
}: PillarDetailModalProps) {
  const content = contentMap[type];
  if (!content) return null;

  const Icon = content.icon;

  return (
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
            className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Image Header */}
            <div className="h-48 sm:h-56 rounded-t-[32px] overflow-hidden">
              <img
                src={content.image}
                alt={content.headline}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 flex flex-col flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md"
                  style={{ backgroundColor: content.color }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#12213E]">
                  {content.headline}
                </h2>
              </div>

              <p className="text-gray-600 leading-relaxed mb-6">{content.subhead}</p>

              {/* Bullet Points */}
              <div className="space-y-3 mb-8">
                {content.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#C69259]/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-[#C69259]" />
                    </div>
                    <span className="text-gray-700 text-sm">{bullet}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-auto space-y-3">
                {onApply && (
                  <button
                    onClick={onApply}
                    className="w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                    style={{ backgroundColor: content.color }}
                  >
                    {content.primaryLabel} <ArrowRight className="w-5 h-5" />
                  </button>
                )}
                {content.secondaryLabel && onConsult && (
                  <button
                    onClick={onConsult}
                    className="w-full py-3 rounded-xl font-bold border-2 border-[#12213E] text-[#12213E] flex items-center justify-center gap-2 hover:bg-[#12213E] hover:text-white transition-colors"
                  >
                    {content.secondaryLabel}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}