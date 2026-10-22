/** Calm female TTS for Voice Ask — desktop + mobile (Chrome / Safari). */

const PREFERRED_FEMALE = [
  "microsoft aria",
  "microsoft jenny",
  "microsoft sara",
  "microsoft zira",
  "google uk english female",
  "google us english female",
  "samantha",
  "karen",
  "moira",
  "fiona",
  "tessa",
  "veena",
  "victoria",
  "allison",
  "ava",
  "zoe",
  "susan",
  "kathy",
  "serena",
  "nicky",
  "martha",
];

const MALE_HINTS =
  /\b(male|david|daniel|mark|alex|fred|thomas|george|james|john|tom|oliver|arthur|gordon|bruce|lee|ravi)\b/i;

const FEMALE_HINTS =
  /\b(female|woman|girl|samantha|karen|moira|fiona|zira|aria|jenny|sara|susan|kathy|victoria|allison|ava|zoe|tessa|serena|martha|veena|nicky)\b/i;

let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesReady: Promise<SpeechSynthesisVoice[]> | null = null;
let speakToken = 0;
let chromeKeepAlive: number | null = null;
let unlocked = false;
let speaking = false;
const speakingListeners = new Set<(active: boolean) => void>();

function setSpeaking(active: boolean): void {
  if (speaking === active) return;
  speaking = active;
  speakingListeners.forEach((fn) => fn(active));
}

/** Subscribe to TTS speaking state (for cinematic background while reading). */
export function subscribeSpeechSpeaking(listener: (active: boolean) => void): () => void {
  speakingListeners.add(listener);
  listener(speaking);
  return () => {
    speakingListeners.delete(listener);
  };
}

export function isSpeechSpeaking(): boolean {
  return speaking;
}

export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    navigator.maxTouchPoints > 0 ||
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  );
}

export function isIOSDevice(): boolean {
  if (typeof window === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return Promise.resolve([]);
  }
  if (voicesReady) return voicesReady;

  voicesReady = new Promise((resolve) => {
    const synth = window.speechSynthesis;
    const existing = synth.getVoices();
    if (existing.length > 0) {
      resolve(existing);
      return;
    }
    const done = () => {
      synth.removeEventListener("voiceschanged", done);
      resolve(synth.getVoices());
    };
    synth.addEventListener("voiceschanged", done);
    window.setTimeout(() => resolve(synth.getVoices()), 500);
  });

  return voicesReady;
}

function scoreVoice(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  const lang = (voice.lang || "").toLowerCase();
  let score = 0;

  if (!lang.startsWith("en")) return -1000;
  if (MALE_HINTS.test(name) && !FEMALE_HINTS.test(name)) return -500;

  if (lang.startsWith("en-ca")) score += 40;
  else if (lang.startsWith("en-us")) score += 36;
  else if (lang.startsWith("en-gb")) score += 34;
  else if (lang.startsWith("en-au") || lang.startsWith("en-ie") || lang.startsWith("en-za"))
    score += 30;
  else score += 18;

  const prefIndex = PREFERRED_FEMALE.findIndex((p) => name.includes(p));
  if (prefIndex >= 0) score += 80 - prefIndex;

  if (FEMALE_HINTS.test(name)) score += 35;
  if (/neural|natural|premium|enhanced|online/.test(name)) score += 28;
  if (voice.localService) score += 8;
  if (voice.default) score += 4;

  return score;
}

function pickFromList(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  const ranked = [...voices]
    .map((v) => ({ v, score: scoreVoice(v) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.v ?? voices.find((v) => v.lang.startsWith("en")) ?? null;
}

async function pickCalmFemaleVoice(): Promise<SpeechSynthesisVoice | null> {
  if (cachedVoice) return cachedVoice;
  const voices = await loadVoices();
  cachedVoice = pickFromList(voices);
  return cachedVoice;
}

function syncVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice;
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  cachedVoice = pickFromList(window.speechSynthesis.getVoices());
  return cachedVoice;
}

/** Warm the voice list so the first answer can speak without delay. */
export function prefetchSpeechVoices(): void {
  void pickCalmFemaleVoice();
}

/**
 * Must run inside a user tap/click (e.g. mic button).
 * Unlocks Web Speech on iOS / mobile Chrome so later answers can play.
 */
export function unlockSpeechPlayback(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  prefetchSpeechVoices();

  try {
    // Prime any AudioContext policies on Android Chrome
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AC) {
      const ctx = new AC();
      if (ctx.state === "suspended") void ctx.resume();
      void ctx.close();
    }
  } catch {
    /* ignore */
  }

  try {
    const warm = new SpeechSynthesisUtterance(" ");
    warm.volume = 0;
    warm.rate = 1;
    warm.pitch = 1;
    const voice = syncVoice();
    if (voice) {
      warm.voice = voice;
      warm.lang = voice.lang;
    } else {
      warm.lang = "en-US";
    }
    // Do NOT cancel — canceling during the gesture can undo the unlock on iOS
    window.speechSynthesis.speak(warm);
    unlocked = true;
  } catch {
    /* ignore */
  }
}

function clearChromeKeepAlive(): void {
  if (chromeKeepAlive != null) {
    window.clearInterval(chromeKeepAlive);
    chromeKeepAlive = null;
  }
}

export function stopSpeaking(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  speakToken += 1;
  clearChromeKeepAlive();
  setSpeaking(false);
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}

function attachUtterance(
  cleaned: string,
  voice: SpeechSynthesisVoice | null,
  token: number,
): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  if (token !== speakToken) return;

  const utterance = new SpeechSynthesisUtterance(cleaned);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang || "en-CA";
  } else {
    utterance.lang = isIOSDevice() ? "en-US" : "en-CA";
  }
  utterance.rate = 0.96;
  utterance.pitch = 1.02;
  utterance.volume = 1;

  utterance.onstart = () => {
    if (token === speakToken) setSpeaking(true);
  };
  utterance.onend = () => {
    clearChromeKeepAlive();
    if (token === speakToken) setSpeaking(false);
  };
  utterance.onerror = () => {
    clearChromeKeepAlive();
    if (token === speakToken) setSpeaking(false);
  };

  window.speechSynthesis.speak(utterance);
  // Some engines skip onstart — mark speaking shortly after queue
  window.setTimeout(() => {
    if (token === speakToken && window.speechSynthesis.speaking) {
      setSpeaking(true);
    }
  }, 60);

  try {
    window.speechSynthesis.resume();
  } catch {
    /* ignore */
  }

  // pause/resume keep-alive helps desktop Chrome; it can kill speech on iOS
  if (!isIOSDevice()) {
    clearChromeKeepAlive();
    chromeKeepAlive = window.setInterval(() => {
      if (token !== speakToken || !window.speechSynthesis.speaking) {
        clearChromeKeepAlive();
        if (token === speakToken) setSpeaking(false);
        return;
      }
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }, 9000);
  }
}

/**
 * Speak answer text. Prefer calling from a tap on mobile.
 * Also attempts auto-play after mic unlock (works on many Android devices).
 */
export function speakText(text: string, opts?: { fromUserGesture?: boolean }): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return;

  const token = ++speakToken;
  clearChromeKeepAlive();

  // Avoid cancel on iOS unless starting a fresh user-gesture speak
  if (!isIOSDevice() || opts?.fromUserGesture) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }

  const voiceNow = syncVoice();

  const run = (voice: SpeechSynthesisVoice | null) => {
    if (token !== speakToken) return;

    // Desktop Chrome: tiny delay after cancel helps playback
    // Mobile user gesture: speak ASAP (same tick / next frame)
    const delay = opts?.fromUserGesture ? 0 : isTouchDevice() ? 250 : 80;

    window.setTimeout(() => {
      if (token !== speakToken) return;
      if (!isIOSDevice()) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          /* ignore */
        }
      }
      attachUtterance(cleaned, voice, token);

      // If nothing started (common on iOS after mic), retry once shortly
      window.setTimeout(() => {
        if (token !== speakToken) return;
        if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
          attachUtterance(cleaned, voice || syncVoice(), token);
        }
      }, 400);
    }, delay);
  };

  if (voiceNow || opts?.fromUserGesture) {
    run(voiceNow);
    void pickCalmFemaleVoice().then((v) => {
      if (v && !voiceNow) cachedVoice = v;
    });
    return;
  }

  void pickCalmFemaleVoice().then((voice) => {
    if (token !== speakToken) return;
    run(voice);
  });
}

export function isSpeechUnlocked(): boolean {
  return unlocked;
}
