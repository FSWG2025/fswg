/**
 * Short admin alert chime via Web Audio (no asset file).
 * Browsers block autoplay until a user gesture: call unlockAlertSound() on
 * first click of the bell / "Enable sounds".
 */

let ctx: AudioContext | null = null;
let unlocked = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

export function isAlertSoundUnlocked() {
  return unlocked;
}

/** Call from a click/tap handler so later critical alerts can play. */
export async function unlockAlertSound() {
  const audio = getCtx();
  if (!audio) return false;
  try {
    if (audio.state === "suspended") await audio.resume();
    unlocked = audio.state === "running";
    return unlocked;
  } catch {
    return false;
  }
}

/** Soft two-tone chime: critical admin alerts only. */
export async function playAlertSound() {
  const audio = getCtx();
  if (!audio || !unlocked) return;

  try {
    if (audio.state === "suspended") await audio.resume();
    const now = audio.currentTime;

    const beep = (freq: number, start: number, dur: number, gain = 0.08) => {
      const osc = audio.createOscillator();
      const g = audio.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(gain, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.connect(g);
      g.connect(audio.destination);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    };

    beep(880, now, 0.12, 0.07);
    beep(1174.66, now + 0.14, 0.16, 0.06);
  } catch {
    /* ignore autoplay / context errors */
  }
}

const SOUND_PREF_SUFFIX = "alertSound";

export function alertSoundPrefKey(userId: string) {
  return `fswg:prefs:${userId}:${SOUND_PREF_SUFFIX}`;
}

export function getAlertSoundPref(userId: string | undefined, isAdmin: boolean) {
  if (!userId) return false;
  try {
    const raw = localStorage.getItem(alertSoundPrefKey(userId));
    if (raw === null) return isAdmin; // default on for admins
    return raw === "1" || raw === "true";
  } catch {
    return isAdmin;
  }
}

export function setAlertSoundPref(userId: string, enabled: boolean) {
  localStorage.setItem(alertSoundPrefKey(userId), enabled ? "1" : "0");
}
