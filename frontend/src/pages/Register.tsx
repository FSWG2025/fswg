import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Phone,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/AuthProvider";
import { api } from "@/lib/api";
import { toast } from "sonner";
import AuthShell, {
  authFieldClass,
  authPrimaryBtnClass,
} from "@/components/auth/AuthShell";
import { markNewAccountWelcome } from "@/components/global/WelcomeModal";
import { cn } from "@/lib/utils";
import { resolveAuthReturnTo, withReturnTo } from "@/lib/authReturnTo";

const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required").min(2, "At least 2 characters"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    phone: z.string().min(1, "Phone is required").min(7, "Enter a valid phone"),
    address: z.string().min(1, "Address is required").min(2, "Enter your address"),
    password: z.string().min(1, "Password is required").min(6, "At least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const steps = [
  { id: 1, title: "You", icon: User, fields: ["name", "email"] as const },
  { id: 2, title: "Contact", icon: Phone, fields: ["phone", "address"] as const },
  { id: 3, title: "Security", icon: Lock, fields: ["password", "confirmPassword"] as const },
];

function readPrefill(searchParams: URLSearchParams) {
  return {
    name: searchParams.get("name")?.trim() || "",
    email: searchParams.get("email")?.trim() || "",
    phone: searchParams.get("phone")?.trim() || "",
    address:
      searchParams.get("address")?.trim() ||
      searchParams.get("location")?.trim() ||
      "",
  };
}

function initialStepFromPrefill(prefill: ReturnType<typeof readPrefill>) {
  if (prefill.name && prefill.email && prefill.phone && prefill.address) return 3;
  if (prefill.name && prefill.email) return 2;
  return 1;
}

const Register = () => {
  const { user, loading, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const returnTo = resolveAuthReturnTo({
    fromParam: searchParams.get("from"),
    stateFrom: (location.state as { from?: unknown } | null)?.from,
  });
  const prefill = useMemo(() => readPrefill(searchParams), [searchParams]);
  const hasLeadPrefill = Boolean(prefill.name || prefill.email || prefill.phone);

  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(() =>
    initialStepFromPrefill(prefill),
  );
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: prefill.name,
      email: prefill.email,
      phone: prefill.phone,
      address: prefill.address,
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const handleNext = async () => {
    const step = steps.find((s) => s.id === currentStep);
    if (!step) return;
    const isValid = await trigger([...step.fields]);
    if (!isValid) return;
    setDirection("forward");
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handleBack = () => {
    setDirection("backward");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setSubmitting(true);
    try {
      try {
        const { data: pub } = await api.get("/system/public");
        if (pub?.featureFlags?.registration === false) {
          toast.error(
            "Registration is temporarily closed. Please try again later.",
          );
          setSubmitting(false);
          return;
        }
      } catch {
        /* proceed; server still enforces */
      }
      const { data: newUser } = await api.post("/users/register", {
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        address: data.address || "",
        password: data.password,
      });
      setUser(newUser);
      markNewAccountWelcome(data.name || newUser?.name);
      toast.success("Account created");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (user && !loading) return <Navigate to="/dashboard" />;

  const slide = {
    enter: (dir: string) => ({
      x: dir === "forward" ? 56 : -56,
      opacity: 0,
      filter: "blur(4px)",
      scale: 0.97,
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
    },
    exit: (dir: string) => ({
      x: dir === "forward" ? -40 : 40,
      opacity: 0,
      filter: "blur(3px)",
      scale: 0.98,
    }),
  };

  const stepVariants = {
    enter: slide.enter,
    center: {
      ...slide.center,
      transition: {
        duration: 0.32,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.06,
        delayChildren: 0.05,
      },
    },
    exit: (dir: string) => ({
      ...slide.exit(dir),
      transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
    }),
  };

  const fieldItem = {
    enter: { opacity: 0, y: 12 },
    center: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle={
        hasLeadPrefill
          ? "We saved your details from the call request: just set a password to finish."
          : "Three quick steps to open your First Step client hub."
      }
      panelTitle="Start building with First Step"
      panelBody="Join newcomers using our hub for rentals, insurance guidance, and long-term wealth planning."
    >
      {/* Step rail */}
      <div className="mb-4 flex items-center gap-2 sm:mb-8">
        {steps.map((step, i) => (
          <div key={step.id} className="flex flex-1 items-center gap-2">
            <motion.div
              layout
              animate={{
                scale: currentStep === step.id ? 1.06 : 1,
                backgroundColor:
                  currentStep === step.id
                    ? "#12213E"
                    : currentStep > step.id
                      ? "#C69259"
                      : "#EEF2F6",
                color:
                  currentStep >= step.id ? "#FFFFFF" : "#9CA3AF",
              }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold sm:h-9 sm:w-9"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={currentStep > step.id ? "check" : "icon"}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex"
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                </motion.span>
              </AnimatePresence>
            </motion.div>
            <span
              className={cn(
                "hidden text-xs font-semibold sm:block",
                currentStep >= step.id ? "text-[#12213E]" : "text-[#9CA3AF]"
              )}
            >
              {step.title}
            </span>
            {i < steps.length - 1 && (
              <div className="relative h-px flex-1 overflow-hidden rounded-full bg-[#E5EAF0]">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-[#C69259]"
                  initial={false}
                  animate={{ width: currentStep > step.id ? "100%" : "0%" }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="relative min-h-[160px] overflow-hidden sm:min-h-[220px]">
          <AnimatePresence mode="wait" custom={direction}>
            {currentStep === 1 && (
              <motion.div
                key="s1"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-3 sm:space-y-4"
              >
                <motion.div variants={fieldItem}>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                    Full name
                  </label>
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    {...register("name")}
                    className={authFieldClass}
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>
                  )}
                </motion.div>
                <motion.div variants={fieldItem}>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    className={authFieldClass}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
                  )}
                </motion.div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="s2"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-3 sm:space-y-4"
              >
                <motion.div variants={fieldItem}>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="(123) 456-7890"
                    {...register("phone")}
                    className={authFieldClass}
                  />
                  {errors.phone && (
                    <p className="mt-1.5 text-xs text-red-500">{errors.phone.message}</p>
                  )}
                </motion.div>
                <motion.div variants={fieldItem}>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                    Address
                  </label>
                  <input
                    type="text"
                    placeholder="City, province"
                    {...register("address")}
                    className={authFieldClass}
                  />
                  {errors.address && (
                    <p className="mt-1.5 text-xs text-red-500">{errors.address.message}</p>
                  )}
                </motion.div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="s3"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-3 sm:space-y-4"
              >
                <motion.div variants={fieldItem}>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      {...register("password")}
                      className={`${authFieldClass} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
                  )}
                </motion.div>
                <motion.div variants={fieldItem}>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Confirm password"
                      {...register("confirmPassword")}
                      className={`${authFieldClass} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 flex items-center gap-3 sm:mt-6">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-full border border-[#E5EAF0] px-4 py-3 text-sm font-semibold text-[#12213E] hover:bg-[#F4F6F8] sm:px-5 sm:py-3.5"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          )}
          {currentStep < steps.length ? (
            <button type="button" onClick={handleNext} className={cn(authPrimaryBtnClass, "flex-1")}>
              <span className="absolute inset-y-0 left-0 w-1 bg-[#C69259]" aria-hidden />
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className={cn(
                authPrimaryBtnClass,
                "flex-1 !bg-[#C69259] !text-[#12213E] hover:!bg-[#B07D4A] hover:!text-white"
              )}
            >
              <span className="absolute inset-y-0 left-0 w-1 bg-[#12213E]" aria-hidden />
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating…
                </>
              ) : (
                <>Create account</>
              )}
            </button>
          )}
        </div>

      </form>

      <p className="mt-4 text-center text-sm text-[#6B7280] sm:mt-8">
        Already have an account?{" "}
        <Link
          to={withReturnTo("/login", returnTo)}
          className="font-semibold text-[#12213E] hover:text-[#C69259]"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
};

export default Register;
