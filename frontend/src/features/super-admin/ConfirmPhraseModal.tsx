import { useState } from "react";
import { SUPER } from "./superTokens";

type Props = {
  open: boolean;
  title: string;
  phrase: string;
  description?: string;
  reasonRequired?: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    confirmPhrase: string;
    reason: string;
  }) => void | Promise<void>;
};

export default function ConfirmPhraseModal({
  open,
  title,
  phrase,
  description,
  reasonRequired,
  onClose,
  onConfirm,
}: Props) {
  const [typed, setTyped] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const armed =
    typed === phrase && (!reasonRequired || reason.trim().length >= 3);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#12213E]/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-phrase-title"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className={`${SUPER.panel} w-full max-w-md border-[#C69259]/50`}>
        <p className={SUPER.eyebrow}>Dangerous action</p>
        <h2 id="confirm-phrase-title" className={`mt-1 ${SUPER.title}`}>
          {title}
        </h2>
        {description ? <p className={`mt-2 ${SUPER.body}`}>{description}</p> : null}
        <p className="mt-4 text-xs text-[#6B7280]">
          Type{" "}
          <span className="font-mono font-semibold text-[#C69259]">{phrase}</span>{" "}
          to arm this control.
        </p>
        <input
          autoFocus
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          className={`${SUPER.input} mt-2 font-mono`}
          placeholder={phrase}
          aria-label={`Type ${phrase} to confirm`}
        />
        {reasonRequired !== false && (
          <>
            <label className="mt-3 block text-xs font-medium text-[#6B7280]">
              Reason (audited)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className={`${SUPER.input} mt-1`}
            />
          </>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#12213E]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!armed || busy}
            className={armed ? SUPER.dangerBtn : SUPER.armedBtn}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm({ confirmPhrase: typed, reason });
                setTyped("");
                setReason("");
                onClose();
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Working…" : armed ? "Execute" : "Arm control"}
          </button>
        </div>
      </div>
    </div>
  );
}
