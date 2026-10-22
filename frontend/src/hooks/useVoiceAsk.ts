import { useCallback, useEffect, useRef, useState } from "react";
import {
  createSpeechRecognition,
  isSpeechRecognitionSupported,
  type SpeechRecognitionLike,
} from "@/lib/speechRecognition";
import {
  answerVoiceQuestion,
  speakText,
  stopSpeaking,
  type VoiceAnswer,
} from "@/lib/voiceAskAnswers";

export type VoiceAskStatus =
  | "idle"
  | "listening"
  | "processing"
  | "answered"
  | "unsupported"
  | "error";

type Options = {
  speakAnswers?: boolean;
  /** Pause length before auto-answering (ms). Default 2000. */
  silenceMs?: number;
  onAnswer?: (answer: VoiceAnswer) => void;
};

const DEFAULT_SILENCE_MS = 2000;

export function useVoiceAsk(options: Options = {}) {
  const { speakAnswers = true, silenceMs = DEFAULT_SILENCE_MS, onAnswer } = options;
  const [supported] = useState(() => isSpeechRecognitionSupported());
  const [status, setStatus] = useState<VoiceAskStatus>(() =>
    isSpeechRecognitionSupported() ? "idle" : "unsupported",
  );
  const [interim, setInterim] = useState("");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<VoiceAnswer | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const activeRef = useRef(false);
  const finalRef = useRef("");
  const interimRef = useRef("");
  const silenceTimerRef = useRef<number | null>(null);
  const answeredRef = useRef(false);
  const speakRef = useRef(speakAnswers);
  const onAnswerRef = useRef(onAnswer);
  const silenceMsRef = useRef(silenceMs);
  speakRef.current = speakAnswers;
  onAnswerRef.current = onAnswer;
  silenceMsRef.current = silenceMs;

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current != null) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const applyAnswer = useCallback((text: string) => {
    if (answeredRef.current) return;
    const cleaned = text.trim();
    if (!cleaned) {
      setError("I did not catch that. Tap the mic and try again.");
      setStatus("error");
      return;
    }
    answeredRef.current = true;
    activeRef.current = false;
    clearSilenceTimer();
    setStatus("processing");
    setTranscript(cleaned);
    setInterim("");
    interimRef.current = "";
    const result = answerVoiceQuestion(cleaned);
    setAnswer(result);
    setStatus("answered");
    onAnswerRef.current?.(result);
    if (speakRef.current) {
      speakText(result.answer);
    }
  }, [clearSilenceTimer]);

  const stop = useCallback(() => {
    clearSilenceTimer();
    try {
      recognitionRef.current?.stop();
    } catch {
      /* already stopped */
    }
  }, [clearSilenceTimer]);

  const reset = useCallback(() => {
    stopSpeaking();
    clearSilenceTimer();
    activeRef.current = false;
    answeredRef.current = false;
    finalRef.current = "";
    interimRef.current = "";
    try {
      recognitionRef.current?.abort();
    } catch {
      /* ignore */
    }
    setInterim("");
    setTranscript("");
    setAnswer(null);
    setError(null);
    setStatus(supported ? "idle" : "unsupported");
  }, [clearSilenceTimer, supported]);

  const askTyped = useCallback(
    (text: string) => {
      stopSpeaking();
      clearSilenceTimer();
      activeRef.current = false;
      answeredRef.current = false;
      finalRef.current = "";
      interimRef.current = "";
      try {
        recognitionRef.current?.abort();
      } catch {
        /* ignore */
      }
      setError(null);
      applyAnswer(text);
    },
    [applyAnswer, clearSilenceTimer],
  );

  const startListening = useCallback(() => {
    if (!supported) {
      setStatus("unsupported");
      setError(
        "Voice is not supported in this browser. Type your question below instead.",
      );
      return;
    }

    stopSpeaking();
    clearSilenceTimer();
    setError(null);
    setInterim("");
    setAnswer(null);
    finalRef.current = "";
    interimRef.current = "";
    answeredRef.current = false;

    // continuous + silence timer: answer after ~2s pause
    const recognition = createSpeechRecognition({
      lang: "en-CA",
      continuous: true,
      interimResults: true,
    });
    if (!recognition) {
      setStatus("unsupported");
      return;
    }

    recognitionRef.current = recognition;
    activeRef.current = true;

    const scheduleSilenceStop = () => {
      clearSilenceTimer();
      silenceTimerRef.current = window.setTimeout(() => {
        const text = `${finalRef.current} ${interimRef.current}`.trim();
        if (!text || !activeRef.current || answeredRef.current) return;
        // Prefer finalizing via stop → onend; also apply immediately if needed
        try {
          recognitionRef.current?.stop();
        } catch {
          applyAnswer(text);
        }
      }, silenceMsRef.current);
    };

    recognition.onstart = () => {
      setStatus("listening");
    };

    recognition.onresult = (event) => {
      if (!activeRef.current || answeredRef.current) return;

      let interimText = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i][0]?.transcript ?? "";
        if (event.results[i].isFinal) finalText += piece;
        else interimText += piece;
      }
      if (finalText) {
        finalRef.current = `${finalRef.current} ${finalText}`.trim();
        setTranscript(finalRef.current);
      }
      interimRef.current = interimText;
      setInterim(interimText);

      // Any speech activity resets the 2s pause clock
      if (finalText || interimText) {
        scheduleSilenceStop();
      }
    };

    recognition.onerror = (event) => {
      clearSilenceTimer();
      const code = event.error || "unknown";
      if (code === "aborted") {
        activeRef.current = false;
        if (!answeredRef.current) setStatus("idle");
        return;
      }
      // continuous sessions sometimes emit no-speech between phrases — ignore if we have text
      if (code === "no-speech") {
        const text = `${finalRef.current} ${interimRef.current}`.trim();
        if (text) {
          applyAnswer(text);
          return;
        }
        activeRef.current = false;
        setError("No speech detected. Tap the mic and ask again.");
        setStatus("error");
        return;
      }
      activeRef.current = false;
      if (code === "not-allowed" || code === "service-not-allowed") {
        setError(
          "Microphone permission is blocked. Allow mic access, or type your question.",
        );
      } else if (code === "network") {
        setError("Voice service needs a network connection. Try typing instead.");
      } else {
        setError("Something went wrong with voice input. Try typing instead.");
      }
      setStatus("error");
    };

    recognition.onend = () => {
      clearSilenceTimer();
      const wasActive = activeRef.current;
      activeRef.current = false;
      const text = `${finalRef.current} ${interimRef.current}`.trim();
      if (wasActive && text && !answeredRef.current) {
        applyAnswer(text);
        return;
      }
      if (!answeredRef.current) {
        setStatus((prev) => {
          if (prev === "listening" || prev === "processing") return "idle";
          return prev;
        });
      }
    };

    try {
      recognition.start();
    } catch {
      clearSilenceTimer();
      setError("Could not start the microphone. Try again in a moment.");
      setStatus("error");
      activeRef.current = false;
    }
  }, [applyAnswer, clearSilenceTimer, supported]);

  useEffect(() => {
    return () => {
      activeRef.current = false;
      clearSilenceTimer();
      stopSpeaking();
      try {
        recognitionRef.current?.abort();
      } catch {
        /* ignore */
      }
    };
  }, [clearSilenceTimer]);

  return {
    supported,
    status,
    interim,
    transcript,
    error,
    answer,
    startListening,
    stop,
    reset,
    askTyped,
    stopSpeaking,
  };
}
