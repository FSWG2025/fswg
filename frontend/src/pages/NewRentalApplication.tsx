import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/AuthProvider";
import { ArrowLeft, ArrowRight, CheckCircle2, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import RentalApplicationStepBody from "@/features/rentals/RentalApplicationStepBody";
import {
  ageFromDob,
  maxDobEighteen,
  rentalSchema,
  STEPS,
  type RentalFormValues,
} from "@/features/rentals/rentalApplicationForm";

const NewRentalApplication = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [references, setReferences] = useState([
    { name: "", relationship: "", phone: "" },
  ]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const housingKey = `fswg:housing:${user?._id || "guest"}`;
  const maxDob = useMemo(() => maxDobEighteen(), []);

  useEffect(() => {
    const urls = documents.map((f) =>
      f.type.startsWith("image/") ? URL.createObjectURL(f) : ""
    );
    setPreviewUrls(urls);
    return () => {
      urls.forEach((u) => u && URL.revokeObjectURL(u));
    };
  }, [documents]);

  const housingHint = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(housingKey) || "{}");
    } catch {
      return {};
    }
  }, [housingKey]);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    getValues,
    formState: { errors },
  } = useForm<RentalFormValues>({
    resolver: zodResolver(rentalSchema),
    defaultValues: {
      fullName: user?.name || "",
      age: undefined as unknown as number,
      dob: "",
      currentAddress: (user as any)?.address || "",
      phone: (user as any)?.phone || "",
      email: user?.email || "",
      employerName: "",
      position: "",
      monthlyIncome: undefined as unknown as number,
      employmentType: "full-time",
    },
    mode: "onChange",
  });

  useEffect(() => {
    // Prefill address note from housing prefs when empty
    if (!getValues("currentAddress") && housingHint.cities?.[0]) {
      /* leave address for user; cities shown as hint only */
    }
  }, [getValues, housingHint]);

  const values = watch();
  const selectedAge = watch("age");
  const selectedDob = watch("dob");

  const ageMismatch = useMemo(() => {
    const ageNum = Number(selectedAge);
    if (!selectedDob || !ageNum || Number.isNaN(ageNum)) return null;
    const fromDob = ageFromDob(selectedDob);
    if (fromDob < 0 || fromDob === ageNum) return null;
    return fromDob;
  }, [selectedAge, selectedDob]);

  useEffect(() => {
    if (selectedAge != null && selectedAge !== ("" as any) && selectedDob) {
      void trigger(["age", "dob"]);
    }
  }, [selectedAge, selectedDob, trigger]);

  const addReference = () =>
    setReferences([...references, { name: "", relationship: "", phone: "" }]);
  const removeReference = (idx: number) =>
    setReferences(references.filter((_, i) => i !== idx));
  const updateReference = (idx: number, field: string, value: string) => {
    const updated = [...references];
    updated[idx] = { ...updated[idx], [field]: value };
    setReferences(updated);
  };

  const validateStep = async () => {
    if (step === 0) {
      const ok = await trigger([
        "fullName",
        "age",
        "dob",
        "currentAddress",
        "phone",
        "email",
      ]);
      if (!ok) return false;

      const ageNum = Number(getValues("age"));
      const dob = getValues("dob");
      const fromDob = ageFromDob(dob);
      if (ageNum && dob && fromDob >= 0 && fromDob !== ageNum) {
        toast.error(
          `Your age is wrong. Date of birth shows you are ${fromDob}, not ${ageNum}.`,
        );
        return false;
      }
      if (fromDob >= 0 && fromDob < 18) {
        toast.error("You must be at least 18 years old to continue.");
        return false;
      }
      return true;
    }
    if (step === 1) {
      return trigger([
        "employerName",
        "position",
        "monthlyIncome",
        "employmentType",
      ]);
    }
    if (step === 2) {
      const validRefs = references.filter((r) => r.name && r.phone);
      if (validRefs.length < 1) {
        toast.error("Add at least one reference with name and phone");
        return false;
      }
      return true;
    }
    return true;
  };

  const next = async () => {
    const ok = await validateStep();
    if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (data: RentalFormValues) => {
    setSubmitting(true);
    try {
      const ageNum = Number(data.age);
      const fromDob = ageFromDob(data.dob);
      if (!ageNum || fromDob < 18 || fromDob !== ageNum) {
        toast.error(
          fromDob !== ageNum
            ? `Your age is wrong. Date of birth shows you are ${fromDob}, not ${ageNum}.`
            : "You must be at least 18 years old to apply.",
        );
        setStep(0);
        return;
      }

      const uploadedPaths: string[] = [];
      for (const file of documents) {
        if (
          file.type !== "application/pdf" &&
          !file.name.toLowerCase().endsWith(".pdf")
        ) {
          throw new Error(`${file.name} is not a PDF. Only PDF files are allowed.`);
        }
        const fd = new FormData();
        fd.append("document", file);
        // Do not set Content-Type: axios + interceptor attach the multipart boundary
        const { data: uploadRes } = await api.post("/upload/document", fd, {
          timeout: 60000,
        });
        if (!uploadRes?.filePath) {
          throw new Error(`Upload failed for ${file.name}`);
        }
        uploadedPaths.push(uploadRes.filePath);
      }

      await api.post(
        "/rental-applications",
        {
          personalInfo: {
            fullName: data.fullName,
            dob: data.dob,
            currentAddress: data.currentAddress,
            phone: data.phone,
            email: data.email,
          },
          employment: {
            employerName: data.employerName,
            position: data.position,
            monthlyIncome: data.monthlyIncome,
            employmentType: data.employmentType,
          },
          references: references.filter((r) => r.name && r.phone),
          documents: uploadedPaths,
        },
        { timeout: 30000 },
      );

      toast.success("Application submitted successfully!");
      navigate("/rental-applications");
    } catch (e: any) {
      const msg =
        e.response?.data?.message ||
        e.response?.data?.error ||
        e.message ||
        "Submission failed. Please try again.";
      toast.error(typeof msg === "string" ? msg : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-[#EEF2F6] py-5 sm:py-6 md:py-8">
      <div className="mx-auto w-[98%]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border border-[#E5EAF0] bg-white shadow-[0_1px_2px_rgba(18,33,62,0.04),0_8px_24px_rgba(18,33,62,0.04)]"
        >
          <div className="border-b border-[#1a2d4d] bg-[#12213E] px-5 py-6 text-white sm:px-8">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C69259]">
                  Rental support
                </p>
                <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  New application
                </h1>
                <p className="mt-1 text-sm text-white/65">
                  Step {step + 1} of {STEPS.length}: {STEPS[step].label}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/rental-applications")}
                className="rounded-2xl bg-white/10 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/15"
              >
                Exit
              </button>
            </div>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/15">
              <motion.div
                className="h-full rounded-full bg-[#C69259]"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const done = i < step;
                const active = i === step;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => i < step && setStep(i)}
                    className={cn(
                      "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition",
                      active && "bg-[#C69259] text-[#12213E]",
                      done && "bg-white/15 text-white",
                      !active && !done && "bg-white/5 text-white/40",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {(housingHint.cities?.length || housingHint.budgetMax) && (
            <div className="mx-5 mt-5 flex items-start gap-3 rounded-2xl bg-[#E8F5C8] px-4 py-3 sm:mx-8">
              <Home className="mt-0.5 h-4 w-4 shrink-0 text-[#3F6212]" />
              <p className="text-xs text-[#3F6212]">
                From your Housing Preferences:{" "}
                <strong>
                  {(housingHint.cities || []).join(", ") || "cities saved"}
                </strong>
                {housingHint.budgetMax
                  ? ` · budget up to $${housingHint.budgetMax}/mo`
                  : ""}
                .{" "}
                <button
                  type="button"
                  className="font-semibold underline"
                  onClick={() => navigate("/app/housing")}
                >
                  Edit prefs
                </button>
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-5 py-6 sm:px-8 sm:py-8"
            onKeyDown={(e) => {
              if (e.key === "Enter" && step < STEPS.length - 1) {
                e.preventDefault();
              }
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <RentalApplicationStepBody
                  step={step}
                  register={register}
                  errors={errors}
                  values={values}
                  ageMismatch={ageMismatch}
                  selectedAge={selectedAge}
                  maxDob={maxDob}
                  references={references}
                  addReference={addReference}
                  updateReference={updateReference}
                  removeReference={removeReference}
                  documents={documents}
                  setDocuments={setDocuments}
                  previewUrls={previewUrls}
                  navigate={navigate}
                />
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-[#EEF2F6] pt-6">
              <button
                type="button"
                onClick={back}
                disabled={step === 0}
                className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-[#12213E] disabled:opacity-30"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={next}
                  disabled={step === 0 && ageMismatch != null}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#12213E] px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#C69259] px-6 py-3 text-sm font-bold text-[#12213E] disabled:opacity-50"
                >
                  {submitting ? "Submitting…" : "Submit application"}
                  {!submitting && <CheckCircle2 className="h-4 w-4" />}
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default NewRentalApplication;
