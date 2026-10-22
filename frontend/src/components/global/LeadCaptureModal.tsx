import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Mail,
  Phone,
  User,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";
import { api } from "@/lib/api";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { getOrCreateVisitorId } from "@/lib/visitorId";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prefillData?: { email?: string; name?: string; phone?: string };
}

const INTEREST_CATEGORIES = [
  { value: "rental_applicant", label: "Rental guarantee" },
  { value: "insurance", label: "Insurance" },
  { value: "real_estate", label: "Real estate" },
  { value: "financial_education", label: "Wealth education" },
  { value: "entrepreneurship", label: "Advisor career" },
];

const STEP_LABELS = ["About you", "Contact", "Location"];

const fieldClass =
  "w-full rounded-2xl border border-[#E8ECF1] bg-[#F7F8FB] px-4 py-3 text-sm text-[#12213E] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#C69259]/50 focus:bg-white focus:ring-2 focus:ring-[#C69259]/20";

const LeadCaptureModal = ({ isOpen, onClose, prefillData }: Props) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    interest: "",
    name: prefillData?.name || "",
    email: prefillData?.email || "",
    phone: prefillData?.phone || "",
    location: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const cleaned = value.replace(/[^\d\s()+-]/g, "").replace(/^-/, "");
      setFormData((prev) => ({ ...prev, phone: cleaned }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step === 1 && (!formData.interest || !formData.name.trim())) {
      toast.error("Please choose an interest and enter your name");
      return;
    }
    if (step === 2 && (!formData.email || !formData.phone)) {
      toast.error("Please enter your email and phone number");
      return;
    }
    if (step === 3 && !formData.location.trim()) {
      toast.error("Please enter your city / location");
      return;
    }
    if (step < 3) setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.interest ||
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.location.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await api.post("/leads", {
        firstName: formData.name.split(" ")[0] || formData.name,
        lastName: formData.name.split(" ").slice(1).join(" ") || "",
        email: formData.email,
        phone: formData.phone,
        source: "website",
        interest: formData.interest,
      });
      setSubmitted(true);
      toast.success("Request submitted: we will reach out soon.");
      // Attach this lead to the anonymous visitor cookie for admin visibility
      api
        .post("/visitors/track", {
          visitorId: getOrCreateVisitorId(),
          path: typeof window !== "undefined" ? window.location.pathname : "/",
          linkedEmail: formData.email,
          linkedName: formData.name,
        })
        .catch(() => {});
    } catch (error: unknown) {
      const raw =
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as { response?: { data?: { message?: unknown } } }).response?.data
          ?.message;
      const message = typeof raw === "string" ? raw : null;
      toast.error(message || "Could not submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#12213E]/45 p-4 backdrop-blur-[2px] sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-capture-title"
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-[420px] overflow-y-auto rounded-[24px] bg-white shadow-[0_24px_64px_rgba(18,33,62,0.22)]"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-[#8B93A1] transition hover:bg-[#F3F5F8] hover:text-[#12213E]"
        >
          <X className="h-4 w-4" />
        </button>

        {!submitted ? (
          <div className="px-6 pb-6 pt-7 sm:px-7">
            <div className="flex items-start gap-3 pr-6">
              <img
                src="/fswgLogo.jpg"
                alt=""
                className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-[#F3DFC7]"
              />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C69259]">
                  Free discovery call
                </p>
                <h2
                  id="lead-capture-title"
                  className="mt-0.5 text-lg font-bold leading-snug text-[#12213E]"
                >
                  Tell us where to start
                </h2>
                <p className="mt-1 text-sm text-[#6B7280]">
                  We reply within 24 hours: no obligation.
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-6">
              <div className="flex items-center justify-between gap-2">
                {STEP_LABELS.map((label, index) => {
                  const n = index + 1;
                  const active = step === n;
                  const done = step > n;
                  return (
                    <div key={label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition ${
                          done || active
                            ? "bg-[#12213E] text-white"
                            : "bg-[#EEF2F6] text-[#8B93A1]"
                        }`}
                      >
                        {done ? "✓" : n}
                      </div>
                      <span
                        className={`truncate text-[10px] font-semibold ${
                          active ? "text-[#12213E]" : "text-[#9CA3AF]"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#EEF2F6]">
                <div
                  className="h-full rounded-full bg-[#C69259] transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div>
                      <p className="mb-2 text-sm font-medium text-[#334155]">
                        I&apos;m interested in *
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {INTEREST_CATEGORIES.map((cat) => {
                          const selected = formData.interest === cat.value;
                          return (
                            <button
                              key={cat.value}
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  interest: cat.value,
                                }))
                              }
                              className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                                selected
                                  ? "bg-[#12213E] text-white"
                                  : "bg-[#F7F8FB] text-[#475569] ring-1 ring-[#E8ECF1] hover:ring-[#C69259]/40"
                              }`}
                            >
                              {cat.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[#334155]">
                        <User className="h-3.5 w-3.5 text-[#C69259]" />
                        Full name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className={fieldClass}
                        placeholder="Your full name"
                        autoComplete="name"
                      />
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[#334155]">
                        <Phone className="h-3.5 w-3.5 text-[#C69259]" />
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className={fieldClass}
                        placeholder="+1 (555) 123-4567"
                        autoComplete="tel"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[#334155]">
                        <Mail className="h-3.5 w-3.5 text-[#C69259]" />
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={fieldClass}
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[#334155]">
                        <MapPin className="h-3.5 w-3.5 text-[#C69259]" />
                        City / location *
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                        className={fieldClass}
                        placeholder="e.g. Toronto, ON"
                        autoComplete="address-level2"
                      />
                    </div>
                    <p className="rounded-2xl bg-[#F7FBFE] px-4 py-3 text-xs leading-relaxed text-[#5B6575]">
                      Ready when you are. Tap submit and an advisor will follow
                      up on your preferred pathway.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6 flex gap-2.5">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-1 rounded-2xl border border-[#E8ECF1] px-4 py-3 text-sm font-semibold text-[#475569] transition hover:bg-[#F7F8FB]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                )}
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="cta-email min-w-0 flex-1 justify-center"
                  >
                    <span className="whitespace-nowrap">Continue</span>
                    <span className="cta-email-arrow">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-[#12213E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0D1A2E] disabled:opacity-50"
                  >
                    {loading ? "Submitting…" : "Book my free call"}
                    {!loading && <ArrowRight className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-6 py-8 text-center sm:px-8"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F5EE]">
              <CheckCircle2 className="h-7 w-7 text-[#1B7A4E]" />
            </div>
            <img
              src="/fswgLogo.jpg"
              alt=""
              className="mx-auto mt-4 h-10 w-10 rounded-full object-cover ring-2 ring-[#F3DFC7]"
            />
            <h3 className="mt-4 text-xl font-bold text-[#12213E]">
              You&apos;re on the list
            </h3>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-[#6B7280]">
              We&apos;ll reach out within 24 hours. Create an account to track
              your request.
            </p>
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams();
                if (formData.name.trim()) params.set("name", formData.name.trim());
                if (formData.email.trim()) params.set("email", formData.email.trim());
                if (formData.phone.trim()) params.set("phone", formData.phone.trim());
                if (formData.location.trim())
                  params.set("address", formData.location.trim());
                navigate(`/register?${params.toString()}`);
              }}
              className="cta-email mx-auto mt-6 justify-center"
            >
              <span className="whitespace-nowrap">Create account</span>
              <span className="cta-email-arrow">
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full rounded-2xl px-4 py-2.5 text-sm font-semibold text-[#6B7280] transition hover:bg-[#F7F8FB] hover:text-[#12213E]"
            >
              Close
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default LeadCaptureModal;
