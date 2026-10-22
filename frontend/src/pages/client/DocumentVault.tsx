import { useCallback, useEffect, useRef, useState } from "react";
import {
  FolderLock,
  Trash2,
  FileText,
  ExternalLink,
  Loader2,
  Upload,
  Image as ImageIcon,
  X,
} from "lucide-react";
import ClientToolShell from "@/components/client/ClientToolShell";
import { api } from "@/lib/api";
import { resolveUploadUrl } from "@/lib/uploadUrl";
import { toast } from "sonner";

type VaultDoc = {
  _id: string;
  name: string;
  url: string;
  key?: string;
  size?: number;
  uploadedAt: string;
};

type PendingFile = {
  id: string;
  file: File;
  previewUrl?: string;
  status: "uploading" | "error";
  error?: string;
};

const isImage = (name: string, mime?: string) =>
  Boolean(mime?.startsWith("image/")) || /\.(jpe?g|png|gif|webp)$/i.test(name);

export default function DocumentVault() {
  const [docs, setDocs] = useState<VaultDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/vault");
      setDocs(data.documents || []);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Could not load documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    return () => {
      pending.forEach((p) => {
        if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only revoke on unmount
  }, []);

  const registerVault = async (file: {
    name: string;
    url: string;
    size?: number;
  }) => {
    const { data } = await api.post("/vault", {
      name: file.name,
      url: file.url,
      size: file.size,
    });
    return data as VaultDoc;
  };

  const uploadOne = async (file: File) => {
    const id = `${file.name}-${file.size}-${Date.now()}-${Math.random()}`;
    const previewUrl = isImage(file.name, file.type)
      ? URL.createObjectURL(file)
      : undefined;

    setPending((prev) => [
      { id, file, previewUrl, status: "uploading" },
      ...prev,
    ]);

    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post("/upload", form);

      const filePath = data.filePath as string;
      const doc = await registerVault({
        name: data.fileName || file.name,
        url: filePath,
        size: data.fileSize ?? file.size,
      });

      setPending((prev) => {
        const row = prev.find((p) => p.id === id);
        if (row?.previewUrl) URL.revokeObjectURL(row.previewUrl);
        return prev.filter((p) => p.id !== id);
      });
      setDocs((prev) => [doc, ...prev.filter((d) => d._id !== doc._id)]);
      toast.success(`${file.name} saved to your vault`);
    } catch (err: any) {
      setPending((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                status: "error",
                error:
                  err.response?.data?.message ||
                  err.message ||
                  "Upload failed",
              }
            : p
        )
      );
      toast.error(err.response?.data?.message || `Could not upload ${file.name}`);
    }
  };

  const handleFiles = async (list: FileList | File[]) => {
    const files = Array.from(list).slice(0, 8);
    const allowed = files.filter(
      (f) =>
        f.type === "application/pdf" ||
        f.type.startsWith("image/") ||
        /\.(pdf|jpe?g|png)$/i.test(f.name)
    );
    if (allowed.length === 0) {
      toast.error("Use PDF, JPG, or PNG files");
      return;
    }
    if (allowed.length < files.length) {
      toast.message("Some files were skipped (only PDF, JPG, PNG)");
    }
    for (const file of allowed) {
      await uploadOne(file);
    }
  };

  const remove = async (id: string) => {
    try {
      await api.delete(`/vault/${id}`);
      setDocs((prev) => prev.filter((d) => d._id !== id));
    } catch {
      toast.error("Could not delete document");
    }
  };

  const dismissPending = (id: string) => {
    setPending((prev) => {
      const row = prev.find((p) => p.id === id);
      if (row?.previewUrl) URL.revokeObjectURL(row.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  const formatSize = (n?: number) => {
    if (!n) return "";
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  };

  const openUrl = (url: string) => resolveUploadUrl(url);

  return (
    <ClientToolShell
      eyebrow="In-app · 03"
      title="Document vault"
      description="Store ID, income, and rental documents securely for applications and consultations."
      icon={FolderLock}
    >
      <div className="space-y-6">
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          onClick={() => inputRef.current?.click()}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files?.length) void handleFiles(e.dataTransfer.files);
          }}
          className={`cursor-pointer rounded-2xl border border-dashed px-6 py-10 text-center transition ${
            dragging
              ? "border-[#C69259] bg-[#F3DFC7]/40"
              : "border-[#12213E]/20 bg-[#F7FBFE] hover:border-[#C69259]/50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) void handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
            <Upload className="h-5 w-5 text-[#C69259]" />
          </div>
          <p className="mt-4 text-sm font-semibold text-[#12213E]">
            Drop files here or click to upload
          </p>
          <p className="mt-1 text-xs text-[#6B7280]">
            PDF, JPG, or PNG · up to 8 at a time · max 16MB each
          </p>
        </div>

        {pending.length > 0 && (
          <ul className="space-y-2">
            {pending.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-[#E5EAF0] bg-white px-4 py-3"
              >
                {p.previewUrl ? (
                  <img
                    src={p.previewUrl}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#F7FBFE]">
                    <FileText className="h-5 w-5 text-[#C69259]" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#12213E]">
                    {p.file.name}
                  </p>
                  <p className="text-[11px] text-[#6B7280]">
                    {p.status === "uploading" ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Uploading… {formatSize(p.file.size)}
                      </span>
                    ) : (
                      <span className="text-red-600">{p.error || "Failed"}</span>
                    )}
                  </p>
                </div>
                {p.status === "error" && (
                  <button
                    type="button"
                    onClick={() => dismissPending(p.id)}
                    className="rounded-xl p-2 text-[#6B7280] hover:bg-[#F7FBFE]"
                    aria-label="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {loading ? (
          <div className="flex justify-center py-10 text-[#6B7280]">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <ul className="space-y-2">
            {docs.length === 0 && pending.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#6B7280]">
                No documents yet. Upload above to see them here immediately.
              </p>
            ) : (
              docs.map((d) => {
                const href = openUrl(d.url);
                const image = isImage(d.name);
                return (
                  <li
                    key={d._id}
                    className="flex items-center gap-3 rounded-xl border border-[#E5EAF0] bg-white px-4 py-3"
                  >
                    {image ? (
                      <img
                        src={href}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-lg object-cover bg-[#F7FBFE]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#F7FBFE]">
                        {/\.pdf$/i.test(d.name) ? (
                          <FileText className="h-5 w-5 text-[#C69259]" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-[#C69259]" />
                        )}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#12213E]">
                        {d.name}
                      </p>
                      <p className="text-[11px] text-[#6B7280]">
                        {new Date(d.uploadedAt).toLocaleString()}
                        {d.size ? ` · ${formatSize(d.size)}` : ""}
                      </p>
                    </div>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl p-2 text-[#12213E] hover:bg-[#F7FBFE]"
                      aria-label="Open document"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => void remove(d._id)}
                      className="rounded-xl p-2 text-red-500 hover:bg-red-50"
                      aria-label="Remove document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>
    </ClientToolShell>
  );
}
