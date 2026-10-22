import {
  generateReactHelpers,
  generateUploadDropzone,
} from "@uploadthing/react";

const apiBase =
  (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5000/api";

export const uploadthingUrl = `${String(apiBase).replace(/\/$/, "")}/uploadthing`;

/** Untyped helpers: router lives on the Express API */
export const { useUploadThing, uploadFiles } = generateReactHelpers({
  url: uploadthingUrl,
});

export const UploadDropzone = generateUploadDropzone({
  url: uploadthingUrl,
});
