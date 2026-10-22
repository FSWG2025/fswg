import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Mail,
  User,
  Phone,
  MapPin,
  AlertCircle,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

const WHATSAPP_NUMBER = "+19055192873";

const openWhatsApp = (message: string) => {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
};

const STEP_LABELS = ["About you", "Contact", "Your question"];

const fieldClass = (hasError?: boolean) =>
  `w-full rounded-2xl border bg-[#F7F8FB] px-4 py-3 text-sm text-[#12213E] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#C69259]/50 focus:bg-white focus:ring-2 focus:ring-[#C69259]/20 ${
    hasError ? "border-red-400" : "border-[#E8ECF1]"
  }`;

export const ContactFormModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    location: "",
    email: "",
    question: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateStep = (n: number) => {
    const next: Record<string, string> = {};
    if (n === 1) {
      if (!form.name.trim()) next.name = "Full name is required";
      if (!form.phone.trim()) next.phone = "Phone number is required";
    }
    if (n === 2) {
      if (!form.location.trim()) next.location = "Location is required";
      if (!form.email.trim()) {
        next.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        next.email = "Please enter a valid email";
      }
    }
    if (n === 3) {
      if (!form.question.trim()) next.question = "Your question is required";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) {
      toast.error("Please fill in the required fields");
      return;
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const buildMessage = () =>
    `Name: ${form.name}\nPhone: ${form.phone}\nLocation: ${form.location}\nEmail: ${form.email}\n\nQuestion:\n${form.question}`;

  const handleSendWhatsApp = () => {
    if (!validateStep(3)) {
      toast.error("Please enter your question");
      return;
    }
    openWhatsApp(buildMessage());
    onClose();
  };

  const handleSendEmail = () => {
    if (!validateStep(3)) {
      toast.error("Please enter your question");
      return;
    }
    const subject = `Question from ${form.name}`;
    window.location.href = `mailto:firststepwealthgroup@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildMessage())}`;
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-[#12213E]/45 p-3 backdrop-blur-[2px] sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ask-us-title"
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[min(78vh,560px)] w-full max-w-[420px] flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_24px_64px_rgba(18,33,62,0.22)] sm:max-h-[min(72vh,520px)] sm:rounded-[28px]"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-[#8B93A1] transition hover:bg-[#F3F5F8] hover:text-[#12213E]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="shrink-0 px-5 pb-3 pt-6 sm:px-6 sm:pt-7">
          <div className="flex items-start gap-3 pr-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#12213E] shadow-sm">
              <MessageCircle className="h-5 w-5 text-[#C69259]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C69259]">
                First Step support
              </p>
              <h2
                id="ask-us-title"
                className="mt-0.5 text-lg font-bold leading-snug text-[#12213E] sm:text-xl"
              >
                Ask Us Anything
              </h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                We&apos;ll get back to you within 24 hours.
              </p>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-2">
              {STEP_LABELS.map((label, index) => {
                const n = index + 1;
                const active = step === n;
                const done = step > n;
                return (
                  <div
                    key={label}
                    className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
                  >
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
        </div>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2 sm:px-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="s1"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[#334155]">
                      <User className="h-3.5 w-3.5 text-[#C69259]" />
                      Full name *
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className={fieldClass(!!errors.name)}
                      placeholder="Jane Doe"
                      autoComplete="name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[#334155]">
                      <Phone className="h-3.5 w-3.5 text-[#C69259]" />
                      Phone *
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      className={fieldClass(!!errors.phone)}
                      placeholder="+1 (555) 123-4567"
                      autoComplete="tel"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="s2"
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
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      className={fieldClass(!!errors.location)}
                      placeholder="Toronto, ON"
                      autoComplete="address-level2"
                    />
                    {errors.location && (
                      <p className="mt-1 text-xs text-red-500">{errors.location}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[#334155]">
                      <Mail className="h-3.5 w-3.5 text-[#C69259]" />
                      Email *
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className={fieldClass(!!errors.email)}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="s3"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[#334155]">
                      <AlertCircle className="h-3.5 w-3.5 text-[#C69259]" />
                      Your question *
                    </label>
                    <textarea
                      name="question"
                      rows={4}
                      value={form.question}
                      onChange={handleChange}
                      className={`${fieldClass(!!errors.question)} resize-none`}
                      placeholder="Type your question here..."
                    />
                    {errors.question && (
                      <p className="mt-1 text-xs text-red-500">{errors.question}</p>
                    )}
                  </div>
                  <p className="rounded-2xl bg-[#F7FBFE] px-4 py-3 text-xs leading-relaxed text-[#5B6575]">
                    Send via WhatsApp or email: we reply within 24 hours.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="shrink-0 space-y-2.5 border-t border-[#EEF2F6] px-5 py-4 sm:px-6">
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  className="inline-flex items-center gap-1 rounded-full border border-[#E5EAF0] px-3.5 py-2.5 text-sm font-semibold text-[#12213E] transition hover:bg-[#F7FBFE]"
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
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </button>
              ) : (
                <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] px-3 py-3 text-sm font-bold text-white transition hover:bg-[#20BD5A]"
                  >
                    <Send className="h-3.5 w-3.5" />
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={handleSendEmail}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#12213E] px-3 py-3 text-sm font-bold text-white transition hover:bg-[#0D1A2E]"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </button>
                </div>
              )}
            </div>
            <div className="flex justify-center gap-1.5">
              {STEP_LABELS.map((_, i) => (
                <span
                  key={STEP_LABELS[i]}
                  className={`h-1.5 rounded-full transition-all ${
                    i + 1 === step ? "w-5 bg-[#12213E]" : "w-1.5 bg-[#12213E]/20"
                  }`}
                />
              ))}
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
