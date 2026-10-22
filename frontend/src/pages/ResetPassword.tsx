import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/AuthProvider";
import {
  ArrowRight,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
} from "lucide-react";

/* ─── Schema ─────────────────────────────────────── */
const resetSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

/* ─── Reset Password Component ────────────────────── */
const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormValues) => {
    if (!token) {
      toast.error("Invalid reset token");
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post(
        `/users/reset-password/${token}`,
        { password: data.password }
      );

      // Auto-login if token returns user data
      if (response.data.user) {
        setUser(response.data.user);
      }

      toast.success("Password reset successful!");
      setSuccess(true);

      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to reset password. Link may be expired."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E4EFF8] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="h-2 bg-gradient-to-r from-[#12213E] via-[#C69259] to-[#12213E]" />

        <div className="p-8 sm:p-10">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#12213E]/70 hover:text-[#C69259] transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Login
          </Link>

          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full border-2 border-[#C69259] overflow-hidden shadow-md mx-auto mb-4">
              <img
                src="/fswgLogo.jpg"
                alt="First Step Wealth Group"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#12213E]">
              {success ? "Password Reset!" : "Set New Password"}
            </h1>
            <p className="text-gray-500 mt-2">
              {success
                ? "Your password has been reset. Redirecting..."
                : "Enter your new password below."}
            </p>
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="animate-spin h-8 w-8 border-4 border-[#C69259] border-t-transparent rounded-full mx-auto mt-6" />
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#12213E]">
                  <Lock className="w-4 h-4 text-[#C69259]" />
                  New Password
                </label>
                <PasswordInput
                  placeholder="Enter new password"
                  {...register("password")}
                  error={errors.password?.message}
                />
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#12213E]">
                  <Lock className="w-4 h-4 text-[#C69259]" />
                  Confirm Password
                </label>
                <PasswordInput
                  placeholder="Confirm new password"
                  {...register("confirmPassword")}
                  error={errors.confirmPassword?.message}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-[#12213E] to-[#1E3A5F] hover:from-[#0D1A2E] hover:to-[#12213E] 
                           text-white font-bold rounded-xl shadow-lg shadow-[#12213E]/20 
                           transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Resetting...
                  </>
                ) : (
                  <>
                    Reset Password <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

/* ─── Password Input Component ────────────────────── */
type PasswordInputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ error, ...rest }, ref) => {
    const [show, setShow] = useState(false);

    return (
      <div className="space-y-1">
        <div className="relative group">
          <input
            ref={ref}
            type={show ? "text" : "password"}
            {...rest}
            className="w-full px-4 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 
                       focus:outline-none focus:border-[#C69259] focus:ring-2 focus:ring-[#C69259]/20 
                       transition-all duration-300 group-hover:border-[#C69259]/50"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C69259] transition-colors cursor-pointer pointer-events-auto z-10"
          >
            {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default ResetPassword;