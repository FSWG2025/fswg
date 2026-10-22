import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/AuthProvider";
import { api } from "@/lib/api";
import { toast } from "sonner";
import AuthShell, {
  authFieldClass,
  authPrimaryBtnClass,
} from "@/components/auth/AuthShell";
import { resolveAuthReturnTo, withReturnTo } from "@/lib/authReturnTo";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required").min(6, "At least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { user, loading, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const returnTo = resolveAuthReturnTo({
    fromParam: searchParams.get("from"),
    stateFrom: (location.state as { from?: unknown } | null)?.from,
  });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormValues) => {
    setSubmitting(true);
    try {
      const { data: loggedUser } = await api.post("/users/login", data);
      setUser(loggedUser);
      toast.success("Welcome back");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  if (user && !loading) return <Navigate to="/dashboard" />;

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue your wealth journey."
      panelTitle="Your client hub, ready when you are"
      panelBody="Pick up consultations, rental applications, messages, and planning tools in one secure place."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email")}
            className={authFieldClass}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Password
            </label>
            <Link
              to={withReturnTo("/forgot-password", returnTo)}
              className="text-xs font-semibold text-[#C69259] hover:text-[#B07D4A]"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              {...register("password")}
              className={`${authFieldClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#12213E]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button type="submit" disabled={submitting} className={authPrimaryBtnClass}>
          <span className="absolute inset-y-0 left-0 w-1 bg-[#C69259]" aria-hidden />
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
            </>
          ) : (
            <>
              Sign in <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-[#6B7280]">
        New here?{" "}
        <Link
          to={withReturnTo("/register", returnTo)}
          className="font-semibold text-[#12213E] hover:text-[#C69259]"
        >
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
};

export default Login;
