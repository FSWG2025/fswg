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
import {
  isTouchDevice,
  prefetchSpeechVoices,
  speakText,
  stopSpeaking,
  unlockSpeechPlayback,
} from "@/lib/voiceSpeech";
import type { SiteSearchHit } from "@/lib/siteSearch";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelectRelated: (hit: SiteSearchHit) => void;
};

/** Keep answer pages short so the sheet stays ~40–45vh. */
const PAGE_CHARS = 130;

export default function NavbarVoiceAskModal({
  open,
  onClose,
  onSelectRelated,
}: Props) {
  const [speakOn, setSpeakOn] = useState(true);
  const [page, setPage] = useState(0);
  const [heardForAnswer, setHeardForAnswer] = useState(false);
  const [touchUi] = useState(() => isTouchDevice());
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
    () => (answer ? paginateText(answer.answer, PAGE_CHARS) : []),
    [answer],
  );
  const pageCount = pages.length;
  const currentPage = Math.min(page, Math.max(pageCount - 1, 0));
  const hasAnswer = Boolean(answer && pageCount > 0);

  useEffect(() => {
    setPage(0);
    setHeardForAnswer(false);
  }, [answer?.answer]);

  const handleClose = useCallback(() => {
    stop();
    stopSpeaking();
    reset();
    setPage(0);
    setHeardForAnswer(false);
    onClose();
  }, [onClose, reset, stop]);

  useEffect(() => {
    if (!open) {
      reset();
      stopSpeaking();
      setPage(0);
      setHeardForAnswer(false);
      return;
    }
    prefetchSpeechVoices();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, reset, handleClose]);

  const playAnswer = useCallback(() => {
    if (!answer?.answer || !speakOn) return;
    speakText(answer.answer, { fromUserGesture: true });
    setHeardForAnswer(true);
  }, [answer?.answer, speakOn]);

  const onMicClick = () => {
    unlockSpeechPlayback();
    if (listening) {
      stop();
      return;
    }
    if (answer) {
      stopSpeaking();
      reset();
      setPage(0);
      setHeardForAnswer(false);
    }
    startListening();
  };

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
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-end sm:justify-center sm:p-4 sm:pb-8"
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
            className="relative flex h-[45vh] max-h-[45vh] w-full max-w-md flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_24px_80px_rgba(18,33,62,0.28)] sm:rounded-[28px]"
          >
            <div className="flex shrink-0 items-center justify-between px-3 pb-0 pt-2.5 sm:px-4">
              <button
                type="button"
                onClick={() => {
                  const next = !speakOn;
                  setSpeakOn(next);
                  if (!next) stopSpeaking();
                }}
                className="rounded-full p-2 text-[#6B7280] transition hover:bg-[#F4F7FB] hover:text-[#12213E]"
                aria-label={speakOn ? "Mute spoken answers" : "Unmute spoken answers"}
              >
                {speakOn ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full p-2 text-[#6B7280] transition hover:bg-[#F4F7FB] hover:text-[#12213E]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col items-center px-3 pb-3 pt-1 sm:px-4">
              {/* Centered mic + status (compact so the sheet stays ~45vh) */}
              <div className="flex w-full shrink-0 flex-col items-center">
                <button
                  type="button"
                  disabled={!supported || processing}
                  onClick={onMicClick}
                  className={`flex h-14 w-14 items-center justify-center rounded-full text-white disabled:opacity-50 ${
                    listening || processing ? "bg-[#C69259]" : "bg-[#12213E]"
                  }`}
                  aria-pressed={listening}
                  aria-label={listening ? "Stop listening" : "Start listening"}
                >
                  {processing ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : supported ? (
                    <Mic className="h-6 w-6" />
                  ) : (
                    <MicOff className="h-6 w-6" />
                  )}
                </button>
                <p className="mt-2 text-center text-sm font-semibold text-[#12213E]">
                  {statusLabel}
                </p>
                {liveText && !hasAnswer ? (
                  <p className="mt-1 line-clamp-2 max-w-sm text-center text-xs leading-snug text-[#6B7280]">
                    “{liveText}
                    {interim ? "…" : ""}”
                  </p>
                ) : null}
                {error ? (
                  <p className="mt-1 max-w-sm text-center text-xs text-red-600" role="alert">
                    {error}
                  </p>
                ) : null}
              </div>

              {hasAnswer ? (
                <div className="mt-2 flex min-h-0 w-full flex-1 flex-col rounded-[18px] bg-[#F4F7FB] p-3">
                  {speakOn ? (
                    <button
                      type="button"
                      onClick={playAnswer}
                      className="mb-2 flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#12213E] px-3 py-2 text-xs font-semibold text-white"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      {touchUi && !heardForAnswer
                        ? "Tap to hear"
                        : heardForAnswer
                          ? "Hear again"
                          : "Hear answer"}
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={playAnswer}
                    className="min-h-0 w-full flex-1 overflow-hidden text-left"
                    aria-label="Play spoken answer"
                  >
                    <p className="text-center text-[13px] leading-snug text-[#374151]">
                      {pages[currentPage]}
                    </p>
                  </button>

                  {pageCount > 1 ? (
                    <div className="mt-2 flex shrink-0 items-center justify-between gap-2 border-t border-[#E4EFF6] pt-2">
                      <button
                        type="button"
                        disabled={currentPage <= 0}
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#12213E] ring-1 ring-[#E4EFF6] disabled:opacity-35"
                        aria-label="Previous page"
                      >
                        <ArrowLeft className="h-3 w-3" />
                        Prev
                      </button>
                      <span className="text-[11px] font-semibold text-[#9CA3AF]">
                        {currentPage + 1}/{pageCount}
                      </span>
                      <button
                        type="button"
                        disabled={currentPage >= pageCount - 1}
                        onClick={() =>
                          setPage((p) => Math.min(pageCount - 1, p + 1))
                        }
                        className="inline-flex items-center gap-1 rounded-full bg-[#12213E] px-2.5 py-1 text-[11px] font-semibold text-white disabled:opacity-35"
                        aria-label="Next page"
                      >
                        Next
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  ) : null}

                  {answer!.related[0] ? (
                    <button
                      type="button"
                      onClick={() => onSelectRelated(answer!.related[0]!)}
                      className="mt-2 flex w-full shrink-0 items-center justify-between gap-2 border-t border-[#E4EFF6] pt-2 text-left"
                    >
                      <span className="min-w-0 truncate text-[11px] font-semibold text-[#12213E]">
                        {answer!.related[0]!.title}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#C69259]" />
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
