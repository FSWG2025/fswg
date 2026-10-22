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
  onAnswer?: (answer: VoiceAnswer) => void;
};

export function useVoiceAsk(options: Options = {}) {
  const { speakAnswers = true, onAnswer } = options;
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
  const speakRef = useRef(speakAnswers);
  const onAnswerRef = useRef(onAnswer);
  speakRef.current = speakAnswers;
  onAnswerRef.current = onAnswer;

  const applyAnswer = useCallback((text: string) => {
    const cleaned = text.trim();
    if (!cleaned) {
      setError("I did not catch that. Tap the mic and try again.");
      setStatus("error");
      return;
    }
    setStatus("processing");
    setTranscript(cleaned);
    setInterim("");
    const result = answerVoiceQuestion(cleaned);
    setAnswer(result);
    setStatus("answered");
    onAnswerRef.current?.(result);
    if (speakRef.current) {
      speakText(result.answer);
    }
  }, []);

  const stop = useCallback(() => {
    // Keep activeRef true so onend can still apply the final transcript.
    try {
      recognitionRef.current?.stop();
    } catch {
      /* already stopped */
    }
  }, []);

  const reset = useCallback(() => {
    stopSpeaking();
    activeRef.current = false;
    finalRef.current = "";
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
  }, [supported]);

  const askTyped = useCallback(
    (text: string) => {
      stopSpeaking();
      activeRef.current = false;
      finalRef.current = "";
      try {
        recognitionRef.current?.abort();
      } catch {
        /* ignore */
      }
      setError(null);
      applyAnswer(text);
    },
    [applyAnswer],
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
    setError(null);
    setInterim("");
    setAnswer(null);
    finalRef.current = "";

    const recognition = createSpeechRecognition({
      lang: "en-CA",
      continuous: false,
      interimResults: true,
    });
    if (!recognition) {
      setStatus("unsupported");
      return;
    }

    recognitionRef.current = recognition;
    activeRef.current = true;

    recognition.onstart = () => {
      setStatus("listening");
    };

    recognition.onresult = (event) => {
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
      setInterim(interimText);
    };

    recognition.onerror = (event) => {
      activeRef.current = false;
      const code = event.error || "unknown";
      if (code === "aborted") {
        setStatus("idle");
        return;
      }
      if (code === "no-speech") {
        setError("No speech detected. Tap the mic and ask again.");
        setStatus("error");
        return;
      }
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
      const wasActive = activeRef.current;
      activeRef.current = false;
      const text = finalRef.current.trim();
      if (wasActive && text) {
        applyAnswer(text);
        return;
      }
      setStatus((prev) => {
        if (prev === "listening" || prev === "processing") return "idle";
        return prev;
      });
    };

    try {
      recognition.start();
    } catch {
      setError("Could not start the microphone. Try again in a moment.");
      setStatus("error");
      activeRef.current = false;
    }
  }, [applyAnswer, supported]);

  useEffect(() => {
    return () => {
      activeRef.current = false;
      stopSpeaking();
      try {
        recognitionRef.current?.abort();
      } catch {
        /* ignore */
      }
    };
  }, []);

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
