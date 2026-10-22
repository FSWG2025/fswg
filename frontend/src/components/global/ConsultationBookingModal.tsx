import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Clock,
  User,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/AuthProvider";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Service {
  _id: string;
  title: string;
  category: string;
}

interface Consultant {
  _id: string;
  name: string;
  expertise?: string;
}

const INTEREST_CATEGORIES = [
  { value: "rental_applicant", label: "Rental support" },
  { value: "insurance", label: "Insurance" },
  { value: "real_estate", label: "Real estate" },
  { value: "financial_education", label: "Financial education" },
  { value: "entrepreneurship", label: "Entrepreneurship" },
] as const;

const STEPS = [
  { id: 1, title: "Interest", fields: ["interest", "serviceId"] as const },
  { id: 2, title: "Schedule", fields: ["consultantId", "dateTime"] as const },
  { id: 3, title: "Details", fields: ["duration", "notes"] as const },
];

const fieldClass =
  "mt-1.5 w-full border-0 border-b border-[#E5EAF0] bg-transparent py-3 text-sm text-[#12213E] outline-none focus:border-[#C69259]";

const ConsultationBookingModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [formData, setFormData] = useState({
    interest: "",
    serviceId: "",
    consultantId: "",
    dateTime: "",
    duration: 60,
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!isOpen) return;
    api.get("/services").then(({ data }) => setServices(Array.isArray(data) ? data : data?.services || []));
    api.get("/users/consultants").then(({ data }) => setConsultants(data || []));
    setStep(1);
    setSuccess(false);
    setFormData({
      interest: "",
      serviceId: "",
      consultantId: "",
      dateTime: "",
      duration: 60,
      notes: "",
    });
  }, [isOpen]);

  const isStepValid = (stepId: number): boolean => {
    const stepConfig = STEPS.find((s) => s.id === stepId);
    if (!stepConfig) return false;
    return stepConfig.fields.every((field) => {
      if (field === "duration" || field === "notes" || field === "consultantId") return true;
      const value = formData[field];
      return value !== "" && value !== undefined;
    });
  };

  const handleNext = () => {
    if (!isStepValid(step)) {
      toast.error("Please fill in the required fields");
      return;
    }
    setStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!formData.interest || !formData.serviceId || !formData.dateTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await api.post("/consultations", {
        serviceId: formData.serviceId,
        consultantId: formData.consultantId || undefined,
        dateTime: new Date(formData.dateTime).toISOString(),
        duration: formData.duration,
        interest: formData.interest,
        notes: formData.notes,
      });
      setSuccess(true);
      toast.success("Consultation booked");
      setTimeout(() => {
        onClose();
        setSuccess(false);
        navigate("/bookings");
      }, 1400);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedService = services.find((s) => s._id === formData.serviceId);
  const selectedConsultant = consultants.find((c) => c._id === formData.consultantId);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#12213E]/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-[98%] overflow-y-auto rounded-t-2xl border border-[#E5EAF0] bg-white shadow-[0_16px_48px_rgba(18,33,62,0.12)] sm:max-h-[90vh] sm:rounded-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E5EAF0] bg-white px-5 py-4 sm:px-7">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C69259]">
              Bookings
            </p>
            <h2 className="text-lg font-extrabold text-[#12213E]">Book a consultation</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center text-[#6B7280] hover:text-[#12213E]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-6 sm:px-7">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="ok"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-10 text-center"
              >
                <CheckCircle className="mx-auto h-10 w-10 text-[#65A30D]" />
                <h3 className="mt-4 text-xl font-bold text-[#12213E]">Booking confirmed</h3>
                <p className="mt-2 text-sm text-[#6B7280]">Taking you to your consultations…</p>
              </motion.div>
            ) : (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.22 }}
              >
                <p className="text-sm text-[#6B7280]">
                  Step {step} of {STEPS.length}: {STEPS[step - 1].title}
                </p>
                <div className="mt-3 h-1 bg-[#E5EAF0]">
                  <div
                    className="h-full bg-[#12213E] transition-all"
                    style={{ width: `${(step / STEPS.length) * 100}%` }}
                  />
                </div>
                <div className="mt-3 flex gap-4">
                  {STEPS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => s.id < step && setStep(s.id)}
                      className={cn(
                        "border-b-2 pb-1 text-[11px] font-semibold",
                        s.id === step
                          ? "border-[#12213E] text-[#12213E]"
                          : s.id < step
                            ? "border-[#C69259] text-[#C69259]"
                            : "border-transparent text-[#9CA3AF]"
                      )}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>

                <div className="mt-8 space-y-5">
                  {step === 1 && (
                    <>
                      <label className="block text-sm font-semibold text-[#12213E]">
                        I am interested in *
                        <select
                          value={formData.interest}
                          onChange={(e) =>
                            setFormData({ ...formData, interest: e.target.value })
                          }
                          className={fieldClass}
                        >
                          <option value="">Select interest</option>
                          {INTEREST_CATEGORIES.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block text-sm font-semibold text-[#12213E]">
                        <span className="inline-flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-[#C69259]" /> Service *
                        </span>
                        <select
                          value={formData.serviceId}
                          onChange={(e) =>
                            setFormData({ ...formData, serviceId: e.target.value })
                          }
                          className={fieldClass}
                        >
                          <option value="">Select a service</option>
                          {services.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.title}
                            </option>
                          ))}
                        </select>
                      </label>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <label className="block text-sm font-semibold text-[#12213E]">
                        <span className="inline-flex items-center gap-2">
                          <User className="h-4 w-4 text-[#C69259]" /> Preferred consultant
                        </span>
                        <select
                          value={formData.consultantId}
                          onChange={(e) =>
                            setFormData({ ...formData, consultantId: e.target.value })
                          }
                          className={fieldClass}
                        >
                          <option value="">Any available advisor</option>
                          {consultants.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name}
                              {c.expertise ? ` · ${c.expertise}` : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block text-sm font-semibold text-[#12213E]">
                        <span className="inline-flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#C69259]" /> Date & time *
                        </span>
                        <input
                          type="datetime-local"
                          value={formData.dateTime}
                          onChange={(e) =>
                            setFormData({ ...formData, dateTime: e.target.value })
                          }
                          min={new Date().toISOString().slice(0, 16)}
                          className={fieldClass}
                        />
                      </label>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <label className="block text-sm font-semibold text-[#12213E]">
                        <span className="inline-flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[#C69259]" /> Duration (minutes)
                        </span>
                        <input
                          type="number"
                          value={formData.duration}
                          onChange={(e) =>
                            setFormData({ ...formData, duration: +e.target.value })
                          }
                          min={15}
                          step={15}
                          max={240}
                          className={fieldClass}
                        />
                      </label>
                      <label className="block text-sm font-semibold text-[#12213E]">
                        Notes for your advisor
                        <textarea
                          value={formData.notes}
                          onChange={(e) =>
                            setFormData({ ...formData, notes: e.target.value })
                          }
                          rows={4}
                          className="mt-1.5 w-full border-0 border-b border-[#E5EAF0] bg-transparent py-3 text-sm outline-none focus:border-[#C69259]"
                          placeholder="Topics you want to cover…"
                        />
                      </label>
                      <dl className="divide-y divide-[#E5EAF0] border-t border-[#E5EAF0] pt-2 text-sm">
                        {[
                          [
                            "Interest",
                            INTEREST_CATEGORIES.find((c) => c.value === formData.interest)
                              ?.label || "-",
                          ],
                          ["Service", selectedService?.title || "-"],
                          ["Advisor", selectedConsultant?.name || "Any available"],
                          [
                            "When",
                            formData.dateTime
                              ? new Date(formData.dateTime).toLocaleString()
                              : "-",
                          ],
                          ["Duration", `${formData.duration} min`],
                        ].map(([k, v]) => (
                          <div key={k as string} className="grid grid-cols-3 gap-2 py-2.5">
                            <dt className="font-semibold text-[#6B7280]">{k}</dt>
                            <dd className="col-span-2 text-[#12213E]">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    </>
                  )}
                </div>

                <div className="mt-10 flex flex-col-reverse gap-3 border-t border-[#E5EAF0] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.max(1, s - 1))}
                    disabled={step === 1}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-[#6B7280] transition hover:bg-[#F4F6F8] hover:text-[#12213E] disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  {step < STEPS.length ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#12213E] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(18,33,62,0.18)] transition hover:bg-[#0D1A2E] active:scale-[0.98] sm:w-auto sm:min-w-[180px]"
                    >
                      <span className="absolute inset-y-0 left-0 w-1 bg-[#C69259]" aria-hidden />
                      Continue
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#C69259] px-6 py-3.5 text-sm font-bold text-[#12213E] shadow-[0_8px_20px_rgba(198,146,89,0.28)] transition hover:bg-[#B07D4A] hover:text-white active:scale-[0.98] disabled:opacity-50 sm:w-auto sm:min-w-[200px]"
                    >
                      <span className="absolute inset-y-0 left-0 w-1 bg-[#12213E]" aria-hidden />
                      {loading ? "Booking…" : "Confirm booking"}
                      {!loading && (
                        <CheckCircle className="h-4 w-4 transition group-hover:scale-110" />
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConsultationBookingModal;
