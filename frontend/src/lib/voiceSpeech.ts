/** Reliable calm female TTS for Voice Ask (Chrome-safe). */

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
    window.setTimeout(() => resolve(synth.getVoices()), 400);
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

async function pickCalmFemaleVoice(): Promise<SpeechSynthesisVoice | null> {
  if (cachedVoice) return cachedVoice;
  const voices = await loadVoices();
  if (!voices.length) return null;

  const ranked = [...voices]
    .map((v) => ({ v, score: scoreVoice(v) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);

  cachedVoice = ranked[0]?.v ?? voices.find((v) => v.lang.startsWith("en")) ?? null;
  return cachedVoice;
}

/** Warm the voice list so the first answer can speak without delay. */
export function prefetchSpeechVoices(): void {
  void pickCalmFemaleVoice();
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
  window.speechSynthesis.cancel();
}

/**
 * Speak with a calm, natural English female voice when available.
 * Uses a short delay after cancel so Chrome actually plays audio.
 */
export function speakText(text: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return;

  const token = ++speakToken;
  clearChromeKeepAlive();
  window.speechSynthesis.cancel();

  void pickCalmFemaleVoice().then((voice) => {
    if (token !== speakToken) return;

    const start = () => {
      if (token !== speakToken) return;
      if (typeof window === "undefined" || !window.speechSynthesis) return;

      // Cancel again just before speak; Chrome needs a beat after cancel.
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(cleaned);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || "en-CA";
      } else {
        utterance.lang = "en-CA";
      }
      utterance.rate = 0.96;
      utterance.pitch = 1.02;
      utterance.volume = 1;

      utterance.onend = () => {
        clearChromeKeepAlive();
      };
      utterance.onerror = () => {
        clearChromeKeepAlive();
      };

      window.speechSynthesis.speak(utterance);
      // Chrome can start in a paused state after cancel / mic use
      try {
        window.speechSynthesis.resume();
      } catch {
        /* ignore */
      }

      clearChromeKeepAlive();
      chromeKeepAlive = window.setInterval(() => {
        if (token !== speakToken || !window.speechSynthesis.speaking) {
          clearChromeKeepAlive();
          return;
        }
        // Known Chrome workaround to keep long utterances alive
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }, 9000);
    };

    window.setTimeout(start, 120);
  });
}
