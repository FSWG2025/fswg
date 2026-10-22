import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, X } from "lucide-react";

type Props = {
  isOpen: boolean;
  name?: string;
  onClose: () => void;
};

const WelcomeModal = ({ isOpen, name, onClose }: Props) => {
  const first = name?.trim().split(/\s+/)[0] || "there";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#12213E]/45 p-4 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-title"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[420px] overflow-hidden rounded-[28px] bg-white shadow-[0_28px_70px_rgba(18,33,62,0.28)]"
          >
            <div className="relative overflow-hidden bg-[#12213E] px-6 pb-10 pt-8 text-center text-white">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-[#C69259]/25 blur-2xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-10 left-6 h-28 w-28 rounded-full bg-white/10 blur-2xl"
              />
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
                <Sparkles className="h-6 w-6 text-[#C69259]" />
              </div>
              <p className="relative mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#C69259]">
                Welcome to First Step
              </p>
              <h2
                id="welcome-title"
                className="relative mt-2 text-2xl font-extrabold tracking-tight"
              >
                You just took the first step, {first}
              </h2>
            </div>

            <div className="px-6 pb-7 pt-6 text-center">
              <p className="text-sm leading-relaxed text-[#5B6575]">
                Every lasting fortune in Canada started with a single brave
                decision: and you just made yours. Your hub is ready for
                housing, protection, and wealth growth. Move with clarity. Build
                with patience. Thrive with First Step.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="cta-email mx-auto mt-6 justify-center"
              >
                <span className="whitespace-nowrap">Let&apos;s build</span>
                <span className="cta-email-arrow">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeModal;

export const WELCOME_STORAGE_KEY = "fswg_welcome_new_account";

export function markNewAccountWelcome(name?: string) {
  try {
    sessionStorage.setItem(
      WELCOME_STORAGE_KEY,
      JSON.stringify({ name: name || "", at: Date.now() }),
    );
  } catch {
    /* ignore */
  }
}

export function consumeNewAccountWelcome(): { name?: string } | null {
  try {
    const raw = sessionStorage.getItem(WELCOME_STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(WELCOME_STORAGE_KEY);
    const parsed = JSON.parse(raw);
    return { name: parsed?.name };
  } catch {
    return null;
  }
}
