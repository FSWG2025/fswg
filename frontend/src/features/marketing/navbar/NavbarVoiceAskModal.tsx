import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useVoiceAsk } from "@/hooks/useVoiceAsk";
import { paginateText } from "@/lib/paginateText";
import { prefetchSpeechVoices, stopSpeaking } from "@/lib/voiceSpeech";
import type { SiteSearchHit } from "@/lib/siteSearch";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelectRelated: (hit: SiteSearchHit) => void;
};

export default function NavbarVoiceAskModal({
  open,
  onClose,
  onSelectRelated,
}: Props) {
  const [speakOn, setSpeakOn] = useState(true);
  const [page, setPage] = useState(0);
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

  const pages = useMemo(
    () => (answer ? paginateText(answer.answer, 220) : []),
    [answer],
  );
  const pageCount = pages.length;
  const currentPage = Math.min(page, Math.max(pageCount - 1, 0));

  useEffect(() => {
    setPage(0);
  }, [answer?.answer]);

  const handleClose = useCallback(() => {
    stop();
    stopSpeaking();
    reset();
    setPage(0);
    onClose();
  }, [onClose, reset, stop]);

  useEffect(() => {
    if (!open) {
      reset();
      stopSpeaking();
      setPage(0);
      return;
    }
    prefetchSpeechVoices();
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
          <div className="absolute inset-0 bg-[#12213E]/45 backdrop-blur-md" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Voice ask"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[min(78vh,640px)] w-full max-w-md flex-col overflow-hidden rounded-t-[32px] bg-white shadow-[0_24px_80px_rgba(18,33,62,0.28)] sm:rounded-[32px]"
          >
            <div className="flex shrink-0 items-center justify-between px-4 pb-1 pt-4 sm:px-5">
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
                {speakOn ? (
                  <Volume2 className="h-5 w-5" />
                ) : (
                  <VolumeX className="h-5 w-5" />
                )}
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

            <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-5 pb-6 pt-2">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center sm:h-28 sm:w-28">
                <button
                  type="button"
                  disabled={!supported || processing}
                  onClick={() => {
                    if (listening) stop();
                    else {
                      if (answer) {
                        stopSpeaking();
                        reset();
                        setPage(0);
                      }
                      startListening();
                    }
                  }}
                  className={`flex h-20 w-20 items-center justify-center rounded-full text-white disabled:opacity-50 sm:h-24 sm:w-24 ${
                    listening || processing ? "bg-[#C69259]" : "bg-[#12213E]"
                  }`}
                  aria-pressed={listening}
                  aria-label={listening ? "Stop listening" : "Start listening"}
                >
                  {processing ? (
                    <Loader2 className="h-7 w-7 animate-spin sm:h-8 sm:w-8" />
                  ) : supported ? (
                    <Mic className="h-7 w-7 sm:h-8 sm:w-8" />
                  ) : (
                    <MicOff className="h-7 w-7 sm:h-8 sm:w-8" />
                  )}
                </button>
              </div>

              <p className="mt-2 shrink-0 text-center text-sm font-semibold text-[#12213E]">
                {statusLabel}
              </p>

              {liveText && !answer ? (
                <p className="mt-3 max-w-sm shrink-0 text-center text-sm leading-relaxed text-[#6B7280]">
                  “{liveText}
                  {interim ? "…" : ""}”
                </p>
              ) : null}

              {error ? (
                <p className="mt-3 max-w-sm shrink-0 text-center text-sm text-red-600" role="alert">
                  {error}
                </p>
              ) : null}

              {answer && pageCount > 0 ? (
                <div className="mt-5 w-full shrink-0 rounded-[22px] bg-[#F4F7FB] p-4 sm:p-5">
                  <p
                    key={currentPage}
                    className="min-h-[4.5rem] text-sm leading-relaxed text-[#374151]"
                  >
                    {pages[currentPage]}
                  </p>

                  {pageCount > 1 ? (
                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#E4EFF6] pt-3">
                      <button
                        type="button"
                        disabled={currentPage <= 0}
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#12213E] shadow-sm ring-1 ring-[#E4EFF6] disabled:opacity-35"
                        aria-label="Previous page"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Prev
                      </button>
                      <div className="flex items-center gap-1.5" aria-label={`Page ${currentPage + 1} of ${pageCount}`}>
                        {pages.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setPage(i)}
                            className={`h-1.5 rounded-full transition-all ${
                              i === currentPage
                                ? "w-4 bg-[#C69259]"
                                : "w-1.5 bg-[#D1D5DB]"
                            }`}
                            aria-label={`Go to page ${i + 1}`}
                            aria-current={i === currentPage ? "page" : undefined}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        disabled={currentPage >= pageCount - 1}
                        onClick={() =>
                          setPage((p) => Math.min(pageCount - 1, p + 1))
                        }
                        className="inline-flex items-center gap-1 rounded-full bg-[#12213E] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-35"
                        aria-label="Next page"
                      >
                        Next
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : null}

                  {answer.related.length > 0 && (
                    <ul className="mt-3 space-y-1 border-t border-[#E4EFF6] pt-3">
                      {answer.related.slice(0, 2).map((hit) => (
                        <li key={hit.id}>
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
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
