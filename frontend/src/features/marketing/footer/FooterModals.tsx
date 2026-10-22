import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router";
import {
  X,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileText,
  Scale,
  User,
  Lock,
  Eye,
  EyeOff,
  Mail,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/AuthProvider";

export const quickRegisterSchema = z
  .object({
    name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Please enter a valid email"),
    password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type QuickRegisterFormValues = z.infer<typeof quickRegisterSchema>;

export const QuickRegisterModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuickRegisterFormValues>({
    resolver: zodResolver(quickRegisterSchema),
  });

  const onSubmit = async (values: QuickRegisterFormValues) => {
    setSubmitting(true);
    try {
      const { data: newUser } = await api.post("/users/register", {
        name: values.name,
        email: values.email,
        password: values.password,
      });
      setUser(newUser);
      toast.success("Account created");
      reset();
      onClose();
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
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
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[32px] bg-white p-6 shadow-2xl sm:p-8"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
            <h2 className="pr-10 text-2xl font-extrabold text-[#12213E]">Create an account</h2>
            <p className="mt-2 text-sm text-[#6B7280]">
              Join First Step to track applications and book consultations.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-[#12213E]">
                  <User className="h-4 w-4 text-[#C69259]" /> Full Name
                </label>
                <input
                  {...register("name")}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#C69259]"
                  placeholder="Your name"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-[#12213E]">
                  <Mail className="h-4 w-4 text-[#C69259]" /> Email Address
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#C69259]"
                  placeholder="you@email.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-[#12213E]">
                  <Lock className="h-4 w-4 text-[#C69259]" /> Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-11 text-sm outline-none focus:border-[#C69259]"
                    placeholder="Min. 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-[#12213E]">
                  <Lock className="h-4 w-4 text-[#C69259]" /> Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-11 text-sm outline-none focus:border-[#C69259]"
                    placeholder="Repeat password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>
              <button type="submit" disabled={submitting} className="cta-email w-full">
                <span className="min-w-0 flex-1 whitespace-nowrap">
                  {submitting ? "Creating..." : "Create Account"}
                </span>
                <span className="cta-email-arrow">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
              <p className="text-center text-sm text-[#6B7280]">
                Already have an account?{" "}
                <Link to="/login" onClick={onClose} className="font-semibold text-[#C69259]">
                  Sign in
                </Link>
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const policyContent = {
  privacy: {
    icon: Shield,
    color: "from-blue-500 to-blue-600",
    title: "Privacy Policy",
    lastUpdated: "January 1, 2025",
    sections: [
      {
        heading: "Information We Collect",
        body: "We collect personal information that you voluntarily provide when you register, book a consultation, submit a rental application, or contact us. This includes your name, email address, phone number, mailing address, employment details, and financial information necessary to provide our services.",
      },
      {
        heading: "How We Use Your Information",
        body: "Your information is used to process applications, provide financial advisory services, communicate with you about your account, send important updates, and improve our platform experience. We never sell your personal data to third parties.",
      },
      {
        heading: "Data Protection",
        body: "We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your personal information. Access to your data is restricted to authorized personnel only.",
      },
      {
        heading: "Your Rights",
        body: "You have the right to access, correct, or delete your personal data at any time. You may also request a copy of your data or restrict its processing. Contact us at firststepwealthgroup@gmail.com to exercise these rights.",
      },
      {
        heading: "Cookies & Tracking",
        body: "We use essential cookies to keep you logged in and improve your experience. We may also use analytics cookies to understand how our platform is used. You can control cookie preferences through your browser settings.",
      },
    ],
  },
  terms: {
    icon: FileText,
    color: "from-emerald-500 to-emerald-600",
    title: "Terms of Use",
    lastUpdated: "January 1, 2025",
    sections: [
      {
        heading: "Acceptance of Terms",
        body: "By accessing or using the First Step Wealth Group platform, you agree to be bound by these Terms of Use. If you do not agree, please do not use our services.",
      },
      {
        heading: "Services Description",
        body: "First Step Wealth Group provides financial education, rental guarantee services, insurance advisory, real estate support, and wealth-building guidance. We connect clients with licensed professionals including mortgage brokers, insurance agents, real estate agents, and financial advisors.",
      },
      {
        heading: "User Responsibilities",
        body: "You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You agree to provide accurate, current, and complete information during registration and when using our services.",
      },
      {
        heading: "Advisory Relationship",
        body: "A formal advisory relationship is established only upon signing a written engagement agreement with First Step Wealth Group or one of our affiliated licensed professionals.",
      },
      {
        heading: "Termination",
        body: "We reserve the right to suspend or terminate accounts that violate these terms. Users may terminate their account at any time by contacting firststepwealthgroup@gmail.com.",
      },
    ],
  },
  legal: {
    icon: Scale,
    color: "from-violet-500 to-violet-600",
    title: "Legal Disclaimer",
    lastUpdated: "January 1, 2025",
    sections: [
      {
        heading: "Financial Services Offered",
        body: "First Step Wealth Group provides a range of financial services including: financial education, rental guarantee services, insurance advisory, real estate investment guidance, mortgage brokerage referrals, wealth-building consultations, and business mentorship.",
      },
      {
        heading: "Licensed Professionals",
        body: "Insurance products are offered through licensed insurance agents. Mortgage services are provided through licensed mortgage brokers. Real estate transactions are facilitated by licensed real estate agents.",
      },
      {
        heading: "Regulatory Compliance",
        body: "Our services comply with applicable Canadian federal and provincial regulations including FSRA, RECO, OSFI, and other provincial regulatory bodies.",
      },
      {
        heading: "No Guarantee of Results",
        body: "Past performance and client testimonials do not guarantee future results. Financial outcomes vary based on individual circumstances and market conditions.",
      },
      {
        heading: "Risk Disclosure",
        body: "All financial decisions involve risk. We encourage clients to carefully review all documentation and seek independent advice when necessary.",
      },
      {
        heading: "Governing Law & Dispute Resolution",
        body: "These terms are governed by the laws of the Province of Ontario and the federal laws of Canada. Disputes shall be resolved through binding arbitration in Toronto, Ontario.",
      },
    ],
  },
} as const;

export const PolicyModal = ({
  isOpen,
  onClose,
  type,
}: {
  isOpen: boolean;
  onClose: () => void;
  type: "privacy" | "terms" | "legal" | null;
}) => {
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (isOpen) setPage(0);
  }, [isOpen, type]);

  if (!type) return null;
  const content = policyContent[type];
  const Icon = content.icon;
  const sections = content.sections;
  const total = sections.length;
  const section = sections[page] || sections[0];
  const isLast = page >= total - 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#12213E]/45 p-3 backdrop-blur-[2px] sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[min(78vh,560px)] w-full max-w-md flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_24px_64px_rgba(18,33,62,0.22)] sm:max-h-[min(72vh,520px)] sm:rounded-[28px]"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
            >
              <X className="h-4 w-4" />
            </button>

            <div className={`shrink-0 bg-gradient-to-br ${content.color} px-5 pb-4 pt-6 text-white sm:px-6`}>
              <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-extrabold sm:text-2xl">{content.title}</h2>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-xs text-white/80 sm:text-sm">
                  Last updated: {content.lastUpdated}
                </p>
                <p className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold tabular-nums">
                  {page + 1} / {total}
                </p>
              </div>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all duration-300"
                  style={{ width: `${((page + 1) / total) * 100}%` }}
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${type}-${page}`}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C69259]">
                    Section {page + 1}
                  </p>
                  <h3 className="mt-1.5 text-lg font-bold leading-snug text-[#12213E]">
                    {section.heading}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#5B6575]">
                    {section.body}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="shrink-0 space-y-2.5 border-t border-[#EEF2F6] px-5 py-4 sm:px-6">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="inline-flex items-center gap-1 rounded-full border border-[#E5EAF0] px-3.5 py-2.5 text-sm font-semibold text-[#12213E] transition hover:bg-[#F7FBFE] disabled:opacity-35"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
                {!isLast ? (
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(total - 1, p + 1))}
                    className="cta-email min-w-0 flex-1 justify-center"
                  >
                    <span className="whitespace-nowrap">Next section</span>
                    <span className="cta-email-arrow">
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="cta-email min-w-0 flex-1 justify-center"
                  >
                    <span className="whitespace-nowrap">I Understand</span>
                    <span className="cta-email-arrow">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </button>
                )}
              </div>
              <div className="flex justify-center gap-1.5">
                {sections.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to section ${i + 1}`}
                    onClick={() => setPage(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === page ? "w-5 bg-[#12213E]" : "w-1.5 bg-[#12213E]/20"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const SocialModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
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
          className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
          <h3 className="mb-2 text-lg font-bold text-[#12213E]">Hold On!</h3>
          <p className="text-sm text-gray-600">
            Our social media page is currently undergoing management. Please check back later.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full rounded-full bg-[#12213E] py-2.5 font-semibold text-white transition-colors hover:bg-[#0D1A2E]"
          >
            Got it
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
