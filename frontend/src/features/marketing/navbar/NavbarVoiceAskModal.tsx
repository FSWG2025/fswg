import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Loader2, Mic, MicOff, Volume2, VolumeX, X } from "lucide-react";
import { useVoiceAsk } from "@/hooks/useVoiceAsk";
import { stopSpeaking } from "@/lib/voiceAskAnswers";
import type { SiteSearchHit } from "@/lib/siteSearch";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelectRelated: (hit: SiteSearchHit) => void;
};

const ringTransition = (delay: number) => ({
  duration: 1.65,
  repeat: Infinity,
  ease: "easeOut" as const,
  delay,
});

export default function NavbarVoiceAskModal({
  open,
  onClose,
  onSelectRelated,
}: Props) {
  const [speakOn, setSpeakOn] = useState(true);
  const {
    supported,
    status,
    interim,
    transcript,
    error,
    answer,
    startListening,
    stop,
    reset,
  } = useVoiceAsk({ speakAnswers: speakOn });

  const handleClose = useCallback(() => {
    stop();
    stopSpeaking();
    reset();
    onClose();
  }, [onClose, reset, stop]);

  useEffect(() => {
    if (!open) {
      reset();
      stopSpeaking();
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, reset, handleClose]);

  const listening = status === "listening";
  const processing = status === "processing";
  const liveText = interim || transcript;

  const statusLabel = listening
    ? "Listening… pause when you are done"
    : processing
      ? "Finding an answer…"
      : supported
        ? "Tap the mic and ask your question"
        : "Voice is not available in this browser";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="absolute inset-0 bg-[#12213E]/45 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Voice ask"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-[32px] bg-white shadow-[0_24px_80px_rgba(18,33,62,0.28)] sm:rounded-[32px]"
          >
            <div className="flex items-center justify-between px-4 pb-1 pt-4 sm:px-5">
              <button
                type="button"
                onClick={() => {
                  const next = !speakOn;
                  setSpeakOn(next);
                  if (!next) stopSpeaking();
                }}
                className="rounded-full p-2.5 text-[#6B7280] transition hover:bg-[#F4F7FB] hover:text-[#12213E]"
                aria-label={speakOn ? "Mute spoken answers" : "Unmute spoken answers"}
              >
                <motion.span
                  key={speakOn ? "on" : "off"}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  className="block"
                >
                  {speakOn ? (
                    <Volume2 className="h-5 w-5" />
                  ) : (
                    <VolumeX className="h-5 w-5" />
                  )}
                </motion.span>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full p-2.5 text-[#6B7280] transition hover:bg-[#F4F7FB] hover:text-[#12213E]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-1 flex-col items-center overflow-y-auto px-5 pb-8 pt-2">
              <div className="relative flex h-36 w-36 items-center justify-center">
                {listening && (
                  <>
                    {[0, 0.45, 0.9].map((delay) => (
                      <motion.span
                        key={delay}
                        className="absolute inset-0 rounded-full bg-[#C69259]/25"
                        initial={{ scale: 0.9, opacity: 0.5 }}
                        animate={{ scale: 1.6, opacity: 0 }}
                        transition={ringTransition(delay)}
                      />
                    ))}
                  </>
                )}

                <button
                  type="button"
                  disabled={!supported || processing}
                  onClick={() => {
                    if (listening) stop();
                    else {
                      if (answer) {
                        stopSpeaking();
                        reset();
                      }
                      startListening();
                    }
                  }}
                  className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full text-white transition-colors disabled:opacity-50 ${
                    listening
                      ? "bg-[#C69259] shadow-[0_12px_40px_rgba(198,146,89,0.4)]"
                      : "bg-[#12213E] shadow-[0_12px_40px_rgba(18,33,62,0.28)]"
                  }`}
                  aria-pressed={listening}
                  aria-label={listening ? "Stop listening" : "Start listening"}
                >
                  {processing ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : supported ? (
                    <Mic className="h-8 w-8" />
                  ) : (
                    <MicOff className="h-8 w-8" />
                  )}
                </button>
              </div>

              <p className="mt-2 text-center text-sm font-semibold text-[#12213E]">
                {statusLabel}
              </p>

              {liveText ? (
                <p className="mt-3 max-w-sm text-center text-sm leading-relaxed text-[#6B7280]">
                  “{liveText}
                  {interim ? "…" : ""}”
                </p>
              ) : null}

              {error ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 max-w-sm text-center text-sm text-red-600"
                  role="alert"
                >
                  {error}
                </motion.p>
              ) : null}

              <AnimatePresence>
                {answer ? (
                  <motion.div
                    initial={{ opacity: 0, y: 16, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    className="mt-6 w-full overflow-hidden"
                  >
                    <div className="rounded-[22px] bg-[#F4F7FB] p-4 sm:p-5">
                      <p className="text-sm leading-relaxed text-[#374151]">
                        {answer.answer}
                      </p>
                      {answer.related.length > 0 && (
                        <ul className="mt-4 space-y-1 border-t border-[#E4EFF6] pt-3">
                          {answer.related.slice(0, 3).map((hit, i) => (
                            <motion.li
                              key={hit.id}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.05 * i }}
                            >
                              <button
                                type="button"
                                onClick={() => onSelectRelated(hit)}
                                className="flex w-full items-center justify-between gap-2 rounded-xl px-2 py-2 text-left transition hover:bg-white"
                              >
                                <span className="min-w-0 truncate text-sm font-semibold text-[#12213E]">
                                  {hit.title}
                                </span>
                                <ArrowRight className="h-4 w-4 shrink-0 text-[#C69259]" />
                              </button>
                            </motion.li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
