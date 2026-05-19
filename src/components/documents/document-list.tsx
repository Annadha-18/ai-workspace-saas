"use client";

import { formatDistanceToNow } from "@/lib/utils/date";
import { motion } from "framer-motion";
import { FileText, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { GlassCard } from "@/components/dashboard/glass-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DocumentListItem } from "@/lib/documents/types";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type DocumentListProps = {
  documents: DocumentListItem[];
  selectedId: string | null;
  loading?: boolean;
  onSelect: (id: string) => void;
  onDeleted: (id: string) => void;
};

export function DocumentList({
  documents,
  selectedId,
  loading,
  onSelect,
  onDeleted,
}: DocumentListProps) {
  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm("Delete this document and its file from storage?")) return;

    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete document");
      return;
    }
    toast.success("Document deleted");
    onDeleted(id);
  }

  return (
    <GlassCard className="flex h-full min-h-[320px] flex-col overflow-hidden">
      <div className="border-b border-white/10 p-4 dark:border-white/5">
        <h3 className="font-semibold tracking-tight">Your documents</h3>
        <p className="text-xs text-muted-foreground">
          {documents.length} PDF{documents.length === 1 ? "" : "s"} uploaded
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <motion.div className="flex justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </motion.div>
        ) : documents.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">
            Upload a PDF to get started with AI analysis.
          </p>
        ) : (
          <ul className="space-y-1">
            {documents.map((doc, i) => (
              <motion.li
                key={doc.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <button
                  type="button"
                  onClick={() => onSelect(doc.id)}
                  className={cn(
                    "group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    selectedId === doc.id
                      ? "bg-gradient-to-r from-violet-600/90 to-blue-600/90 text-white shadow-md"
                      : "hover:bg-white/50 dark:hover:bg-white/10"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
                      selectedId === doc.id
                        ? "bg-white/20"
                        : "bg-violet-500/15 text-violet-600 dark:text-violet-400"
                    )}
                  >
                    <FileText className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{doc.file_name}</p>
                    <p
                      className={cn(
                        "text-xs",
                        selectedId === doc.id
                          ? "text-white/80"
                          : "text-muted-foreground"
                      )}
                    >
                      {formatBytes(doc.file_size)}
                      {doc.page_count ? ` · ${doc.page_count} pages` : ""}
                      {" · "}
                      {formatDistanceToNow(doc.created_at)}
                    </p>
                    {doc.summary && selectedId !== doc.id ? (
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        Summarized
                      </p>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className={cn(
                      "shrink-0 opacity-0 group-hover:opacity-100",
                      selectedId === doc.id && "text-white hover:bg-white/20"
                    )}
                    onClick={(e) => void handleDelete(e, doc.id)}
                    aria-label="Delete document"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </button>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </GlassCard>
  );
}
