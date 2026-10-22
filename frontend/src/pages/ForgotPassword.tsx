import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import AuthShell, {
  authFieldClass,
  authPrimaryBtnClass,
} from "@/components/auth/AuthShell";
import { resolveAuthReturnTo, withReturnTo } from "@/lib/authReturnTo";

const forgotSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const returnTo = resolveAuthReturnTo({
    fromParam: searchParams.get("from"),
    stateFrom: (location.state as { from?: unknown } | null)?.from,
  });
  const loginHref = withReturnTo("/login", returnTo);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotFormValues) => {
    setSubmitting(true);
    try {
      await api.post("/users/forgot-password", data);
      toast.success("If an account exists, a reset link has been sent.");
      setSubmitted(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title={submitted ? "Check your email" : "Reset your password"}
      subtitle={
        submitted
          ? "If an account exists for that address, we sent a reset link."
          : "Enter the email on your First Step account and we’ll send a reset link."
      }
      panelTitle="Secure account recovery"
      panelBody="We’ll never ask for your password by email. Reset links expire quickly for your protection."
    >
      <Link
        to={loginHref}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#6B7280] transition hover:text-[#12213E]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>

      {submitted ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F5C8]">
            <CheckCircle className="h-7 w-7 text-[#3F6212]" />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">
            Check your inbox for the reset link. It expires in about 30 minutes.
          </p>
          <button
            type="button"
            onClick={() => navigate(loginHref)}
            className={`${authPrimaryBtnClass} mt-6`}
          >
            <span className="absolute inset-y-0 left-0 w-1 bg-[#C69259]" aria-hidden />
            Return to sign in <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...form.register("email")}
              className={authFieldClass}
            />
            {form.formState.errors.email && (
              <p className="mt-1.5 text-xs text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <button type="submit" disabled={submitting} className={authPrimaryBtnClass}>
            <span className="absolute inset-y-0 left-0 w-1 bg-[#C69259]" aria-hidden />
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Sending…
              </>
            ) : (
              <>
                Send reset link <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      )}
    </AuthShell>
  );
};

export default ForgotPassword;
