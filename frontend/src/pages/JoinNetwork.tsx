import { useState } from "react";
import { useAuth } from "@/hooks/AuthProvider";
import { Navigate, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Shield } from "lucide-react";
import { AppCard, AppPage, AppPageHeader } from "@/components/ui/AppCard";

const applicationSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Valid phone required"),
  currentOccupation: z.string().optional(),
  motivation: z.string().min(20, "Please explain in at least 20 characters"),
  insuranceInterest: z.enum(["life", "critical_illness", "disability", "general"]),
});

type FormValues = z.infer<typeof applicationSchema>;

const STEPS = ["Contact", "Background", "Motivation", "Review"] as const;

const JoinNetwork = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      fullName: user?.name || "",
      email: user?.email || "",
      phone: (user as any)?.phone || "",
      insuranceInterest: "general",
    },
  });

  const values = watch();

  const next = async () => {
    const fields: (keyof FormValues)[][] = [
      ["fullName", "email", "phone"],
      ["currentOccupation", "insuranceInterest"],
      ["motivation"],
      [],
    ];
    const ok = fields[step].length ? await trigger(fields[step]) : true;
    if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast.error("Please log in first");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/advisor-applications", data);
      toast.success("Application submitted successfully!");
      navigate("/dashboard");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return <Navigate to="/login" />;
  if (user.role === "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const inputClass =
    "mt-1 w-full border-0 border-b border-[#E5EAF0] bg-transparent py-3 text-sm outline-none focus:border-[#C69259]";

  return (
    <AppPage>
      <AppCard>
        <AppPageHeader
          eyebrow="Advisor network"
          title="Become a financial advisor"
          description={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}
          actions={<Shield className="hidden h-8 w-8 text-[#C69259] sm:block" />}
        />
        <div className="mb-6 mt-4 h-1 rounded-full bg-[#E5EAF0]">
          <div
            className="h-full rounded-full bg-[#12213E] transition-all"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && step < STEPS.length - 1) e.preventDefault();
          }}
        >
          {step === 0 && (
            <div className="space-y-5">
              <label className="block text-sm font-semibold text-[#12213E]">
                Full name
                <input {...register("fullName")} className={inputClass} placeholder="Jane Doe" />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
                )}
              </label>
              <label className="block text-sm font-semibold text-[#12213E]">
                Email
                <input {...register("email")} className={inputClass} placeholder="you@example.com" />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
              </label>
              <label className="block text-sm font-semibold text-[#12213E]">
                Phone
                <input {...register("phone")} className={inputClass} placeholder="+1 555 123 4567" />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
                )}
              </label>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <label className="block text-sm font-semibold text-[#12213E]">
                Current occupation
                <input
                  {...register("currentOccupation")}
                  className={inputClass}
                  placeholder="e.g. Teacher, Student"
                />
              </label>
              <label className="block text-sm font-semibold text-[#12213E]">
                Insurance interest
                <select {...register("insuranceInterest")} className={inputClass}>
                  <option value="life">Life Insurance</option>
                  <option value="critical_illness">Critical Illness</option>
                  <option value="disability">Disability</option>
                  <option value="general">General</option>
                </select>
              </label>
            </div>
          )}

          {step === 2 && (
            <label className="block text-sm font-semibold text-[#12213E]">
              Why do you want to join?
              <textarea
                {...register("motivation")}
                rows={6}
                className="mt-2 w-full rounded-xl border border-[#E5EAF0] bg-[#F7F9FB] px-3 py-3 text-sm outline-none focus:border-[#C69259]"
                placeholder="Share your motivation (at least 20 characters)"
              />
              {errors.motivation && (
                <p className="mt-1 text-xs text-red-500">{errors.motivation.message}</p>
              )}
            </label>
          )}

          {step === 3 && (
            <dl className="divide-y divide-[#E5EAF0] rounded-xl bg-[#F7F9FB] px-4 text-sm">
              {[
                ["Name", values.fullName],
                ["Email", values.email],
                ["Phone", values.phone],
                ["Occupation", values.currentOccupation || "-"],
                ["Interest", values.insuranceInterest],
                ["Motivation", values.motivation],
              ].map(([k, v]) => (
                <div key={k as string} className="grid grid-cols-3 gap-2 py-3">
                  <dt className="font-semibold text-[#6B7280]">{k}</dt>
                  <dd className="col-span-2 text-[#12213E]">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-[#E5EAF0] pt-5">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#12213E] disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={next}
                className="inline-flex items-center gap-2 rounded-xl bg-[#12213E] px-5 py-2.5 text-sm font-semibold text-white"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-[#C69259] px-5 py-2.5 text-sm font-bold text-[#12213E] disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit application"}
              </button>
            )}
          </div>
        </form>
      </AppCard>
    </AppPage>
  );
};

export default JoinNetwork;
