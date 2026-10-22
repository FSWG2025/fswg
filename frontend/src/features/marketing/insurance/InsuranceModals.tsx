import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle, FileCheck, X } from "lucide-react";
import { benefits, licensingSteps } from "./insuranceContent";

type Props = {
  licensingOpen: boolean;
  benefitsOpen: boolean;
  onCloseLicensing: () => void;
  onCloseBenefits: () => void;
  onStartApplication: () => void;
  onGetInsurance: () => void;
  onBecomeAdvisor: () => void;
};

export default function InsuranceModals({
  licensingOpen,
  benefitsOpen,
  onCloseLicensing,
  onCloseBenefits,
  onStartApplication,
  onGetInsurance,
  onBecomeAdvisor,
}: Props) {
  return (
    <>
      <AnimatePresence>
        {licensingOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseLicensing}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-2xl sm:p-10"
            >
              <button
                type="button"
                onClick={onCloseLicensing}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C69259] to-[#D4A96A] shadow-lg">
                  <FileCheck className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold text-[#12213E]">Your Licensing Journey</h2>
                <p className="mt-2 text-gray-500">
                  From application to first client, we&apos;re with you every step.
                </p>
              </div>
              <div className="mb-8 space-y-6">
                {licensingSteps.map((step, idx) => (
                  <div key={step.title} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#C69259] bg-[#C69259]/10 text-sm font-bold text-[#C69259]">
                        {idx + 1}
                      </div>
                      {idx < licensingSteps.length - 1 && (
                        <div className="mt-2 w-0.5 flex-1 bg-[#C69259]/20" />
                      )}
                    </div>
                    <div className="pb-6">
                      <h3 className="text-lg font-bold text-[#12213E]">{step.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={onStartApplication} className="cta-email">
                <span className="whitespace-nowrap">Start Your Application</span>
                <span className="cta-email-arrow">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {benefitsOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseBenefits}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[32px] bg-white p-6 shadow-2xl sm:p-8"
            >
              <button
                type="button"
                onClick={onCloseBenefits}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
              <h2 className="pr-10 text-2xl font-extrabold text-[#12213E]">Benefits of joining</h2>
              <p className="mt-2 text-sm text-[#6B7280]">
                What you gain when you become part of our advisor network.
              </p>
              <div className="mt-6 space-y-4">
                {benefits.map((b) => (
                  <div key={b.title} className="rounded-2xl bg-[#F7FBFE] p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#C69259]" />
                      <div>
                        <p className="font-bold text-[#12213E]">{b.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-[#6B7280]">{b.body}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={onGetInsurance} className="cta-email">
                  <span className="whitespace-nowrap">Get Insurance</span>
                  <span className="cta-email-arrow">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
                <button type="button" onClick={onBecomeAdvisor} className="cta-email">
                  <span className="whitespace-nowrap">Become Advisor</span>
                  <span className="cta-email-arrow">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
