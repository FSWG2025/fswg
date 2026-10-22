import { forwardRef } from "react";
import { z } from "zod";
import { User, Building2, Users, FileText, CheckCircle2 } from "lucide-react";

export function ageFromDob(dob: string): number {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return -1;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age -= 1;
  return age;
}

/** Max DOB for applicants who are at least 18 today (YYYY-MM-DD) */
export function maxDobEighteen(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
}

export const AGE_OPTIONS = Array.from({ length: 83 }, (_, i) => i + 18); // 18–100

export const rentalSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    age: z.preprocess(
      (val) =>
        val === "" || val === undefined || val === null
          ? undefined
          : Number(val),
      z
        .number({
          required_error: "Please select your age",
          invalid_type_error: "Please select your age",
        })
        .int()
        .min(18, "You must be at least 18 years old to apply")
        .max(100, "Please enter a valid age"),
    ),
    dob: z.string().min(1, "Date of birth is required"),
    currentAddress: z.string().min(5, "Address is required"),
    phone: z.string().min(10, "Valid phone number is required"),
    email: z.string().email("Invalid email address"),
    employerName: z.string().min(2, "Employer name is required"),
    position: z.string().min(2, "Position is required"),
    monthlyIncome: z.preprocess(
      (val) =>
        val === "" || val === undefined || Number.isNaN(val)
          ? undefined
          : Number(val),
      z
        .number({ invalid_type_error: "Must be a number" })
        .positive("Must be a positive number"),
    ),
    employmentType: z.enum([
      "full-time",
      "part-time",
      "self-employed",
      "unemployed",
    ]),
  })
  .superRefine((data, ctx) => {
    const fromDob = ageFromDob(data.dob);
    if (data.dob && fromDob < 18 && fromDob >= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "You must be at least 18 years old to apply",
        path: ["dob"],
      });
    }
    if (
      typeof data.age === "number" &&
      !Number.isNaN(data.age) &&
      data.dob &&
      fromDob >= 0 &&
      fromDob !== data.age
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Your age is wrong: date of birth shows you are ${fromDob}, not ${data.age}`,
        path: ["age"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Does not match selected age (${data.age}). Based on this date you are ${fromDob}.`,
        path: ["dob"],
      });
    }
  });

export type RentalFormValues = z.infer<typeof rentalSchema>;

export const STEPS = [
  { id: "personal", label: "Personal", icon: User },
  { id: "employment", label: "Employment", icon: Building2 },
  { id: "references", label: "References", icon: Users },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "review", label: "Review", icon: CheckCircle2 },
] as const;

type FormFieldProps = {
  icon: React.FC<{ className?: string }>;
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ icon: Icon, label, error, ...rest }, ref) => (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-sm font-semibold text-[#12213E]">
        <Icon className="h-4 w-4 text-[#C69259]" />
        {label}
      </label>
      <input
        ref={ref}
        className="w-full rounded-2xl border border-[#EEF2F6] bg-[#F7FBFE] px-4 py-3.5 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-[#C69259] focus:ring-2 focus:ring-[#C69259]/20"
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  ),
);
FormField.displayName = "FormField";

