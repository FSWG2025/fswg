import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Mail,
  MapPin,
  Minus,
  Phone,
  Plus,
  Upload,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AGE_OPTIONS,
  FormField,
  maxDobEighteen,
} from "@/features/rentals/rentalApplicationForm";

type Ref = { name: string; relationship: string; phone: string };

type Props = {
  step: number;
  register: any;
  errors: any;
  values: any;
  ageMismatch: number | null;
  selectedAge: number | string | undefined;
  maxDob: string;
  references: Ref[];
  addReference: () => void;
  updateReference: (idx: number, key: keyof Ref, value: string) => void;
  removeReference: (idx: number) => void;
  documents: File[];
  setDocuments: (files: File[]) => void;
  previewUrls: string[];
  navigate: (path: string) => void;
};

export default function RentalApplicationStepBody(p: Props) {
  const {
    step, register, errors, values, ageMismatch, selectedAge, maxDob,
    references, addReference, updateReference, removeReference,
    documents, setDocuments, navigate,
  } = p;

  return (
    <>
                {step === 0 && (
                  <div className="space-y-5">
                    <h2 className="text-lg font-bold text-[#12213E]">
                      Personal information
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        icon={User}
                        label="Full Name"
                        placeholder="Jane Doe"
                        {...register("fullName")}
                        error={errors.fullName?.message}
                      />
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-[#12213E]">
                          <Calendar className="h-4 w-4 text-[#C69259]" />
                          Age
                        </label>
                        <select
                          {...register("age")}
                          className={cn(
                            "w-full rounded-2xl border bg-[#F7FBFE] px-4 py-3.5 text-gray-900 outline-none transition focus:ring-2 focus:ring-[#C69259]/20",
                            ageMismatch || errors.age
                              ? "border-red-400 focus:border-red-400"
                              : "border-[#EEF2F6] focus:border-[#C69259]",
                          )}
                        >
                          <option value="">Select your age</option>
                          {AGE_OPTIONS.map((n) => (
                            <option key={n} value={n}>
                              {n} years old
                            </option>
                          ))}
                        </select>
                        {(errors.age || ageMismatch != null) && (
                          <p className="mt-1 text-xs font-medium text-red-500">
                            {(errors.age?.message as string) ||
                              `Your age is wrong: date of birth shows you are ${ageMismatch}, not ${selectedAge}.`}
                          </p>
                        )}
                        {!errors.age && ageMismatch == null && (
                          <p className="text-xs text-[#6B7280]">
                            You must be 18 or older to apply.
                          </p>
                        )}
                      </div>
                      <FormField
                        icon={Calendar}
                        label="Date of Birth"
                        type="date"
                        max={maxDob}
                        {...register("dob")}
                        error={
                          errors.dob?.message ||
                          (ageMismatch != null
                            ? `Does not match selected age (${selectedAge}). Based on this date you are ${ageMismatch}.`
                            : undefined)
                        }
                      />
                      <FormField
                        icon={Phone}
                        label="Phone"
                        placeholder="(123) 456-7890"
                        {...register("phone")}
                        error={errors.phone?.message}
                      />
                      <FormField
                        icon={Mail}
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        {...register("email")}
                        error={errors.email?.message}
                      />
                      <div className="sm:col-span-2">
                        <FormField
                          icon={MapPin}
                          label="Current Address"
                          placeholder="Street, City, Province"
                          {...register("currentAddress")}
                          error={errors.currentAddress?.message}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-5">
                    <h2 className="text-lg font-bold text-[#12213E]">
                      Employment
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        icon={Building2}
                        label="Employer Name"
                        placeholder="Company Inc."
                        {...register("employerName")}
                        error={errors.employerName?.message}
                      />
                      <FormField
                        icon={Briefcase}
                        label="Position"
                        placeholder="Software Developer"
                        {...register("position")}
                        error={errors.position?.message}
                      />
                      <FormField
                        icon={DollarSign}
                        label="Monthly Income"
                        type="number"
                        placeholder="5000"
                        min={0}
                        {...register("monthlyIncome", { valueAsNumber: true })}
                        error={errors.monthlyIncome?.message}
                      />
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-[#12213E]">
                          <Clock className="h-4 w-4 text-[#C69259]" />
                          Employment Type
                        </label>
                        <select
                          {...register("employmentType")}
                          className="w-full rounded-2xl border border-[#EEF2F6] bg-[#F7FBFE] px-4 py-3.5 outline-none focus:border-[#C69259] focus:ring-2 focus:ring-[#C69259]/20"
                        >
                          <option value="full-time">Full-time</option>
                          <option value="part-time">Part-time</option>
                          <option value="self-employed">Self-employed</option>
                          <option value="unemployed">Unemployed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-lg font-bold text-[#12213E]">
                        References
                      </h2>
                      <button
                        type="button"
                        onClick={addReference}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-[#C69259]"
                      >
                        <Plus className="h-4 w-4" /> Add
                      </button>
                    </div>
                    <p className="text-sm text-[#6B7280]">
                      Add at least one personal or professional reference.
                    </p>
                    {references.map((ref, idx) => (
                      <div
                        key={idx}
                        className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-3"
                      >
                        <input
                          type="text"
                          placeholder="Name"
                          value={ref.name}
                          onChange={(e) =>
                            updateReference(idx, "name", e.target.value)
                          }
                          className="rounded-xl border border-[#EEF2F6] bg-[#F7FBFE] px-3 py-2.5 text-sm outline-none focus:border-[#C69259]"
                        />
                        <input
                          type="text"
                          placeholder="Relationship"
                          value={ref.relationship}
                          onChange={(e) =>
                            updateReference(idx, "relationship", e.target.value)
                          }
                          className="rounded-xl border border-[#EEF2F6] bg-[#F7FBFE] px-3 py-2.5 text-sm outline-none focus:border-[#C69259]"
                        />
                        <div className="flex gap-2">
                          <input
                            type="tel"
                            placeholder="Phone"
                            value={ref.phone}
                            onChange={(e) =>
                              updateReference(idx, "phone", e.target.value)
                            }
                            className="flex-1 rounded-xl border border-[#EEF2F6] bg-[#F7FBFE] px-3 py-2.5 text-sm outline-none focus:border-[#C69259]"
                          />
                          {references.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeReference(idx)}
                              className="rounded-xl p-2 text-red-500 hover:bg-red-50"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-5">
                    <h2 className="text-lg font-bold text-[#12213E]">
                      Supporting documents
                    </h2>
                    <p className="text-sm text-[#6B7280]">
                      Optional but recommended: ID, pay stubs, or employment
                      letter as PDF only.
                    </p>
                    <label className="flex cursor-pointer flex-col items-center rounded-[22px] border-2 border-dashed border-[#12213E]/15 bg-white px-6 py-10 transition hover:border-[#C69259]/40">
                      <Upload className="h-8 w-8 text-[#C69259]" />
                      <p className="mt-3 text-sm font-semibold text-[#12213E]">
                        Choose PDF files
                      </p>
                      <p className="mt-1 text-xs text-[#6B7280]">
                        PDF only · max 15MB each
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="application/pdf,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          if (!e.target.files) return;
                          const picked = Array.from(e.target.files);
                          const pdfs = picked.filter(
                            (f) =>
                              f.type === "application/pdf" ||
                              f.name.toLowerCase().endsWith(".pdf"),
                          );
                          if (pdfs.length !== picked.length) {
                            toast.error("Only PDF documents are accepted");
                          }
                          if (pdfs.length) {
                            setDocuments([...documents, ...pdfs]);
                          }
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {documents.length > 0 && (
                      <ul className="grid gap-3 sm:grid-cols-2">
                        {documents.map((file, idx) => {
                          return (
                            <li
                              key={`${file.name}-${idx}-${file.size}`}
                              className="relative overflow-hidden rounded-2xl border border-[#E5EAF0] bg-white shadow-sm"
                            >
                              <div className="flex aspect-[4/3] items-center justify-center bg-[#F4F6F8]">
                                <div className="flex flex-col items-center gap-2 px-4 text-center">
                                  <FileText className="h-10 w-10 text-[#C69259]" />
                                  <p className="text-xs font-semibold text-[#12213E]">
                                    PDF document
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 px-3 py-2.5">
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-[#12213E]">
                                    {file.name}
                                  </p>
                                  <p className="text-[11px] text-[#6B7280]">
                                    {(file.size / 1024).toFixed(0)} KB
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDocuments(
                                      documents.filter((_, i) => i !== idx),
                                    )
                                  }
                                  className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                  aria-label={`Remove ${file.name}`}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    <button
                      type="button"
                      onClick={() => navigate("/app/documents")}
                      className="text-sm font-semibold text-[#C69259]"
                    >
                      Open Document Vault →
                    </button>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-5">
                    <h2 className="text-lg font-bold text-[#12213E]">
                      Review & submit
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        ["Name", values.fullName],
                        [
                          "Age",
                          values.age != null && values.age !== ("" as any)
                            ? `${values.age} years`
                            : "",
                        ],
                        ["Date of birth", values.dob || ""],
                        ["Phone", values.phone],
                        ["Email", values.email],
                        ["Address", values.currentAddress],
                        ["Employer", values.employerName],
                        ["Position", values.position],
                        [
                          "Income",
                          values.monthlyIncome
                            ? `$${values.monthlyIncome}/mo`
                            : "-",
                        ],
                        ["Employment", values.employmentType],
                        [
                          "References",
                          `${references.filter((r) => r.name && r.phone).length} added`,
                        ],
                        ["Documents", `${documents.length} file(s)`],
                      ].map(([k, v]) => (
                        <div
                          key={k as string}
                          className="rounded-2xl bg-white px-4 py-3 shadow-sm"
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                            {k}
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-[#12213E]">
                            {v || "-"}
                          </p>
                        </div>
                      ))}
                    </div>
                    {documents.length > 0 && (
                      <div>
                        <p className="mb-2 text-sm font-semibold text-[#12213E]">
                          Attached files
                        </p>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {documents.map((file, idx) => (
                            <div
                              key={`review-${file.name}-${idx}`}
                              className="flex h-20 w-20 shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl border border-[#E5EAF0] bg-[#F4F6F8] px-1 text-center"
                            >
                              <FileText className="h-5 w-5 text-[#C69259]" />
                              <span className="mt-1 truncate text-[9px] text-[#6B7280]">
                                PDF
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-[#6B7280]">
                      By submitting, you confirm the information is accurate. An
                      advisor may contact you via Messages or your upcoming
                      consultation.
                    </p>
                  </div>
                )}
    </>
  );
}
