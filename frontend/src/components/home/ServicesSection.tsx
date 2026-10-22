import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Home, Shield, BarChart3, X, ArrowRight } from "lucide-react";

const services = [
  {
    id: "investment",
    step: "01",
    title: "Investment Advisory",
    highlight: "grow your money",
    fullTitle: "We help you grow your money intelligently",
    shortDescription:
      "Data‑driven portfolio strategies that grow your wealth steadily while managing risk.",
    icon: TrendingUp,
    color: "from-blue-500 to-blue-600",
    image:
      "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&w=800&q=80",
    modalTitle: "Grow Your Money While You Sleep",
    detailedDescription:
      "Whether you have $100 or $100,000, we create a plan that works for you with low‑cost index funds, ETFs, and bonds.",
    benefits: [
      "Start with as little as $50 a month",
      "Fully diversified portfolio",
      "No confusing jargon",
      "Regular check‑ins",
    ],
  },
  {
    id: "realestate",
    step: "02",
    title: "Real Estate Support",
    highlight: "from renting to owning",
    fullTitle: "We guide you from renting to owning",
    shortDescription:
      "From your first home to investment properties, our experts guide every step.",
    icon: Home,
    color: "from-emerald-500 to-emerald-600",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
    modalTitle: "Stop Renting. Start Owning.",
    detailedDescription:
      "Buying a home can feel overwhelming, we make it simple with trusted mortgage brokers and real estate agents.",
    benefits: [
      "Free mortgage pre‑approval",
      "Vetted real estate professionals",
      "Step‑by‑step checklist",
      "Investment property analysis",
    ],
  },
  {
    id: "insurance",
    step: "03",
    title: "Insurance & Protection",
    highlight: "safeguard what matters",
    fullTitle: "We help you safeguard what matters most",
    shortDescription:
      "Life, health, and income protection plans that safeguard your family's future.",
    icon: Shield,
    color: "from-amber-500 to-amber-600",
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80",
    modalTitle: "Protect Everything You've Worked For",
    detailedDescription:
      "We compare policies from Canada's top insurance providers to find the right coverage for your budget.",
    benefits: [
      "Compare quotes from 10+ insurers",
      "Coverage that fits your needs",
      "Clear policy explanations",
      "Annual review",
    ],
  },
  {
    id: "wealth",
    step: "04",
    title: "Wealth Intelligence",
    highlight: "plan for the long term",
    fullTitle: "We help you plan for the long term",
    shortDescription:
      "Retirement, tax strategy, and estate planning made simple.",
    icon: BarChart3,
    color: "from-violet-500 to-violet-600",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    modalTitle: "See Your Entire Financial Life in One Place",
    detailedDescription:
      "Our Wealth Intelligence dashboard brings everything together: bank accounts, investments, debts, and projections.",
    benefits: [
      "Complete net worth snapshot",
      "Retirement roadmap",
      "Tax‑saving strategies",
      "Estate planning",
    ],
  },
];

/* ─── Service Detail Modal ────────────────────────── */
const ServiceModal = ({
  service,
  onClose,
}: {
  service: (typeof services)[0];
  onClose: () => void;
}) => (
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
      className="bg-white rounded-[32px] shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto relative"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
      >
        <X className="w-5 h-5 text-gray-600" />
      </button>
      <div className="h-48 sm:h-56 overflow-hidden rounded-t-[32px]">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center`}
          >
            <service.icon className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
            {service.modalTitle}
          </h2>
        </div>
        <p className="text-gray-600 leading-relaxed mb-6">
          {service.detailedDescription}
        </p>
        <div className="space-y-3 mb-8">
          {service.benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#2563EB]/10 flex items-center justify-center mt-0.5">
                <svg
                  className="w-4 h-4 text-[#2563EB]"
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
              <p className="text-gray-700">{b}</p>
            </div>
          ))}
        </div>
        <div className="bg-[#EBF3FF] rounded-2xl p-5 border border-[#2563EB]/10">
          <button className="w-full sm:w-auto bg-[#2563EB] text-white rounded-full px-6 py-3 font-semibold hover:bg-[#1D4ED8] transition-colors flex items-center justify-center gap-2">
            Book a Free Consultation <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

/* ─── Main Section ────────────────────────────────── */
const ServicesSection = () => {
  const [selectedService, setSelectedService] = useState<
    (typeof services)[0] | null
  >(null);

  return (
    <section className="relative bg-[#E4EFF8] overflow-hidden" id="services">
      {/* Subtle watermark */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url('/fswgLogo.jpg')`,
          backgroundRepeat: "repeat",
          backgroundSize: "300px auto",
          opacity: 0.03,
        }}
      />

      {/* Header */}
      <div className="relative z-20 pt-24 pb-16 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 bg-[#EBF3FF] border border-[#2563EB]/20 rounded-full px-4 py-2 mb-8"
        >
          <span className="text-xs font-medium text-[#0F172A]">
            How we help
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="section-headline mb-4 text-[#0F172A]"
        >
          How We Help You Build Wealth
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-base md:text-lg text-[#6B7280] max-w-2xl mx-auto"
        >
          Four pillars of financial empowerment, each designed to move you from
          surviving to thriving.
        </motion.p>
      </div>

      {/* Service Rows */}
      <div className="relative z-20 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className={`flex flex-col ${
              index % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"
            } gap-10 lg:gap-20 items-center mb-28 lg:mb-36 last:mb-0`}
          >
            {/* Image */}
            <div className="w-full lg:w-1/2 relative">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-80 lg:h-[450px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/20 to-transparent" />
              </div>
            </div>

            {/* Text */}
            <div className="w-full lg:w-1/2 lg:max-w-lg space-y-4">
              <span className="text-sm font-bold text-[#2563EB] tracking-wider">
                / {service.step}
              </span>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0F172A] leading-tight">
                {service.fullTitle.split(service.highlight).map((part, i) => (
                  <span key={i}>
                    {i > 0 && (
                      <span className="bg-[#2563EB]/10 text-[#2563EB] px-2 py-0.5 rounded-lg">
                        {service.highlight}
                      </span>
                    )}
                    {part}
                  </span>
                ))}
              </h3>
              <p className="text-lg text-[#6B7280] leading-relaxed">
                {service.shortDescription}
              </p>
              <button
                onClick={() => setSelectedService(service)}
                className="inline-flex items-center gap-2 text-[#2563EB] font-semibold hover:underline"
              >
                Read More <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {selectedService && (
          <ServiceModal
            service={selectedService}
            onClose={() => setSelectedService(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default ServicesSection;