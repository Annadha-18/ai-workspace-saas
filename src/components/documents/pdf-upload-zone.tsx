"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { GlassCard } from "@/components/dashboard/glass-card";
import { extractTextFromPdfFile } from "@/lib/pdf/extract-text-client";
import { cn } from "@/lib/utils";
import type { DocumentRecord } from "@/lib/documents/types";

const MAX_BYTES = 15 * 1024 * 1024;

type UploadPhase = "idle" | "parsing" | "uploading" | "done" | "error";

type PdfUploadZoneProps = {
  onUploaded: (document: DocumentRecord) => void;
  disabled?: boolean;
};

export function PdfUploadZone({ onUploaded, disabled }: PdfUploadZoneProps) {
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [progressLabel, setProgressLabel] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  const processFile = useCallback(
    async (file: File) => {
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are supported");
        return;
      }
      if (file.size > MAX_BYTES) {
        toast.error("File must be 15 MB or smaller");
        return;
      }

      setFileName(file.name);
      setPhase("parsing");
      setProgressLabel("Extracting text from PDF…");

      try {
        const { text, pageCount } = await extractTextFromPdfFile(file);

        if (!text.trim()) {
          throw new Error(
            "No text found. This PDF may be scanned images only."
          );
        }

        setPhase("uploading");
        setProgressLabel("Uploading to secure storage…");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("extractedText", text);
        formData.append("pageCount", String(pageCount));

        const res = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        });

        const payload = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(payload.error ?? "Upload failed");
        }

        setPhase("done");
        setProgressLabel("Upload complete");
        toast.success(`${file.name} uploaded successfully`);
        onUploaded(payload.document as DocumentRecord);

        setTimeout(() => {
          setPhase("idle");
          setFileName(null);
          setProgressLabel("");
        }, 2000);
      } catch (err) {
        setPhase("error");
        const message = err instanceof Error ? err.message : "Upload failed";
        setProgressLabel(message);
        toast.error(message);
      }
    },
    [onUploaded]
  );

  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0];
      if (file) void processFile(file);
    },
    [processFile]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: { "application/pdf": [".pdf"] },
      maxFiles: 1,
      disabled: disabled || phase === "parsing" || phase === "uploading",
    });

  const isBusy = phase === "parsing" || phase === "uploading";

  return (
    <GlassCard className="overflow-hidden">
      <div
        {...getRootProps()}
        className={cn(
          "relative cursor-pointer p-8 transition-colors sm:p-10",
          isDragActive && !isDragReject && "bg-violet-500/10",
          isDragReject && "bg-destructive/10",
          isBusy && "pointer-events-none opacity-90",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.55_0.2_264/0.12),transparent_70%)]" />

        <div className="relative flex flex-col items-center text-center">
          <motion.div
            animate={
              isDragActive
                ? { scale: 1.08, rotate: 2 }
                : { scale: 1, rotate: 0 }
            }
            className={cn(
              "mb-4 flex size-16 items-center justify-center rounded-2xl shadow-lg",
              "bg-gradient-to-br from-violet-600 to-blue-600 text-white",
              "shadow-violet-500/25"
            )}
          >
            {isBusy ? (
              <Loader2 className="size-7 animate-spin" />
            ) : phase === "done" ? (
              <CheckCircle2 className="size-7" />
            ) : phase === "error" ? (
              <AlertCircle className="size-7" />
            ) : (
              <Upload className="size-7" />
            )}
          </motion.div>

          <h3 className="text-lg font-semibold tracking-tight">
            {isDragActive ? "Drop your PDF here" : "Upload a PDF document"}
          </h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Drag and drop or click to browse. We extract text, store securely in
            Supabase, and enable AI summarization and Q&amp;A.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-white/20 bg-white/40 px-2.5 py-1 dark:bg-white/10">
              PDF only
            </span>
            <span className="rounded-full border border-white/20 bg-white/40 px-2.5 py-1 dark:bg-white/10">
              Max 15 MB
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/40 px-2.5 py-1 dark:bg-white/10">
              <FileText className="size-3" />
              Text extraction
            </span>
          </div>
        </div>

        <AnimatePresence>
          {(isBusy || phase === "done" || phase === "error") && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                "relative mt-6 rounded-xl border px-4 py-3 text-sm",
                phase === "error"
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : phase === "done"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "border-white/20 bg-white/40 dark:bg-white/10"
              )}
            >
              {fileName ? (
                <p className="truncate font-medium">{fileName}</p>
              ) : null}
              <p className="mt-0.5 text-muted-foreground">{progressLabel}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}
