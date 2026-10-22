import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, FileText, Loader2, X } from "lucide-react";
import { motion } from "framer-motion";
import * as pdfjs from "pdfjs-dist";
import { resolveUploadUrl, uploadFilename } from "@/lib/uploadUrl";

// Vite-friendly worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

type Props = {
  src: string | null;
  onClose: () => void;
};

export default function InAppPdfViewer({ src, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const pdfRef = useRef<pdfjs.PDFDocumentProxy | null>(null);

  const name = src ? uploadFilename(src) : "Document";

  useEffect(() => {
    if (!src) {
      pdfRef.current = null;
      setPageCount(0);
      setPage(1);
      setError(null);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      setPage(1);
      try {
        const url = resolveUploadUrl(src);
        const token = localStorage.getItem("fswg_token");
        const res = await fetch(url, {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) throw new Error(`Could not load PDF (${res.status})`);
        const data = new Uint8Array(await res.arrayBuffer());

        // Reject HTML/error bodies disguised as PDFs
        const head = new TextDecoder().decode(data.slice(0, 5));
        if (!head.startsWith("%PDF")) {
          throw new Error("File is not a valid PDF");
        }

        const pdf = await pdfjs.getDocument({ data }).promise;
        if (cancelled) {
          pdf.destroy();
          return;
        }
        pdfRef.current = pdf;
        setPageCount(pdf.numPages);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load PDF");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      pdfRef.current?.destroy();
      pdfRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    const pdf = pdfRef.current;
    const canvas = canvasRef.current;
    if (!pdf || !canvas || !pageCount || error) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const pdfPage = await pdf.getPage(page);
        if (cancelled) return;

        const containerWidth =
          canvas.parentElement?.clientWidth || window.innerWidth - 32;
        const unscaled = pdfPage.getViewport({ scale: 1 });
        const scale = Math.min(2, Math.max(0.8, containerWidth / unscaled.width));
        const viewport = pdfPage.getViewport({ scale });

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;
        ctx.setTransform(outputScale, 0, 0, outputScale, 0, 0);

        await pdfPage.render({ canvasContext: ctx, viewport }).promise;
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to render page");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, pageCount, error, src]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-black/50 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="mx-auto flex h-full w-full max-w-4xl flex-col bg-white shadow-2xl sm:my-4 sm:h-[calc(100%-2rem)] sm:rounded-[24px]"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E8ECF1] px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-[#C69259]" />
            <p className="truncate text-sm font-bold text-[#12213E]">{name}</p>
          </div>
          <div className="flex items-center gap-2">
            {pageCount > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-[#E8ECF1] p-1.5 disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="min-w-[3.5rem] text-center text-[11px] font-semibold tabular-nums text-[#6B7280]">
                  {page}/{pageCount}
                </span>
                <button
                  type="button"
                  disabled={page >= pageCount}
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  className="rounded-lg border border-[#E8ECF1] p-1.5 disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-[#F3F4F6] p-2 text-[#6B7280] hover:bg-[#E5E7EB]"
              aria-label="Close PDF"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 overflow-auto bg-[#E8ECF1]">
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 text-sm text-[#6B7280]">
              <Loader2 className="h-6 w-6 animate-spin text-[#C69259]" />
              Loading PDF…
            </div>
          )}
          {error && (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
              <p className="text-sm font-semibold text-[#12213E]">
                Couldn’t open this PDF
              </p>
              <p className="text-xs text-[#6B7280]">{error}</p>
            </div>
          )}
          {!error && (
            <div className="flex justify-center p-3 sm:p-4">
              <canvas ref={canvasRef} className="max-w-full shadow-lg" />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
