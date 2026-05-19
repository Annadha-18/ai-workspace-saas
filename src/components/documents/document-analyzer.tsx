"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  FileSearch,
  Loader2,
  Sparkles,
  Square,
} from "lucide-react";
import { toast } from "sonner";

import { ChatMessageBubble } from "@/components/dashboard/chat-message";
import { GlassCard } from "@/components/dashboard/glass-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { StreamEvent } from "@/lib/chat/types";
import type { DocumentRecord } from "@/lib/documents/types";
type QaMessage = {
  role: "user" | "assistant";
  content: string;
};

type DocumentAnalyzerProps = {
  documentId: string | null;
};

export function DocumentAnalyzer({ documentId }: DocumentAnalyzerProps) {
  const [document, setDocument] = useState<DocumentRecord | null>(null);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [qaMessages, setQaMessages] = useState<QaMessage[]>([]);
  const [asking, setAsking] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const qaScrollRef = useRef<HTMLDivElement>(null);

  const loadDocument = useCallback(async (id: string) => {
    setLoadingDoc(true);
    setQaMessages([]);
    setQuestion("");
    try {
      const res = await fetch(`/api/documents/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load document");
      const doc = data.document as DocumentRecord;
      setDocument(doc);
      setSummary(doc.summary);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load");
      setDocument(null);
    } finally {
      setLoadingDoc(false);
    }
  }, []);

  useEffect(() => {
    if (documentId) {
      void loadDocument(documentId);
    } else {
      setDocument(null);
      setSummary(null);
      setQaMessages([]);
    }
  }, [documentId, loadDocument]);

  async function handleSummarize() {
    if (!documentId) return;
    setSummarizing(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/summarize`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Summarization failed");
      setSummary(data.summary as string);
      toast.success("Summary generated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Summarization failed");
    } finally {
      setSummarizing(false);
    }
  }

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || !documentId || asking) return;

    const userMsg: QaMessage = { role: "user", content: trimmed };
    setQaMessages((prev) => [...prev, userMsg, { role: "assistant", content: "" }]);
    setQuestion("");
    setAsking(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`/api/documents/${documentId}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Request failed");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const event = JSON.parse(line.slice(6)) as StreamEvent;
          if (event.type === "text") {
            accumulated += event.text;
            setQaMessages((prev) => {
              const next = [...prev];
              next[next.length - 1] = { role: "assistant", content: accumulated };
              return next;
            });
          } else if (event.type === "error") {
            throw new Error(event.message);
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      toast.error(err instanceof Error ? err.message : "Question failed");
      setQaMessages((prev) => prev.slice(0, -1));
    } finally {
      setAsking(false);
      abortRef.current = null;
    }
  }

  useEffect(() => {
    qaScrollRef.current?.scrollTo({
      top: qaScrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [qaMessages]);

  if (!documentId) {
    return (
      <GlassCard className="flex min-h-[480px] flex-col items-center justify-center p-10 text-center">
        <FileSearch className="mb-4 size-12 text-muted-foreground/50" />
        <h3 className="font-semibold">Select a document</h3>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Choose a PDF from the list or upload a new one to summarize and ask
          questions.
        </p>
      </GlassCard>
    );
  }

  if (loadingDoc) {
    return (
      <GlassCard className="flex min-h-[480px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </GlassCard>
    );
  }

  if (!document) return null;

  const textPreview = document.extracted_text?.slice(0, 500) ?? "";

  return (
    <div className="space-y-4">
      <GlassCard className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-start sm:justify-between dark:border-white/5">
          <div className="min-w-0">
            <h3 className="truncate font-semibold">{document.file_name}</h3>
            <p className="text-xs text-muted-foreground">
              {document.page_count ? `${document.page_count} pages · ` : ""}
              {(document.extracted_text?.length ?? 0).toLocaleString()} characters
              extracted
            </p>
          </div>
          <Button
            onClick={() => void handleSummarize()}
            disabled={summarizing || !document.extracted_text}
            className="shrink-0 bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:from-violet-500 hover:to-blue-500"
          >
            {summarizing ? (
              <>
                <Loader2 className="animate-spin" />
                Summarizing…
              </>
            ) : (
              <>
                <Sparkles />
                {summary ? "Regenerate summary" : "AI Summarize"}
              </>
            )}
          </Button>
        </div>

        {textPreview ? (
          <details className="border-b border-white/10 dark:border-white/5">
            <summary className="cursor-pointer px-5 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">
              Preview extracted text
            </summary>
            <pre className="max-h-40 overflow-auto px-5 pb-4 text-xs text-muted-foreground whitespace-pre-wrap">
              {textPreview}
              {(document.extracted_text?.length ?? 0) > 500 ? "…" : ""}
            </pre>
          </details>
        ) : null}

        <div className="p-5">
          <h4 className="mb-3 text-sm font-semibold">AI Summary</h4>
          {summary ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="prose prose-sm dark:prose-invert max-w-none rounded-xl border border-white/15 bg-white/30 p-4 dark:bg-white/5"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
            </motion.div>
          ) : (
            <p className="rounded-xl border border-dashed border-white/20 bg-white/20 px-4 py-8 text-center text-sm text-muted-foreground dark:bg-white/5">
              Click &quot;AI Summarize&quot; to generate an intelligent summary of
              this PDF.
            </p>
          )}
        </div>
      </GlassCard>

      <GlassCard className="flex min-h-[360px] flex-col overflow-hidden">
        <div className="border-b border-white/10 px-5 py-4 dark:border-white/5">
          <h4 className="font-semibold">Ask about this PDF</h4>
          <p className="text-xs text-muted-foreground">
            Answers are grounded in the document content only.
          </p>
        </div>

        <div
          ref={qaScrollRef}
          className="flex-1 space-y-4 overflow-y-auto p-4"
        >
          {qaMessages.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              e.g. &quot;What are the main conclusions?&quot; or &quot;List action
              items from this document&quot;
            </p>
          ) : (
            <AnimatePresence initial={false}>
              {qaMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ChatMessageBubble
                    role={msg.role}
                    content={msg.content}
                    isStreaming={
                      asking &&
                      i === qaMessages.length - 1 &&
                      msg.role === "assistant"
                    }
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <form
          onSubmit={handleAsk}
          className="border-t border-white/10 bg-white/30 p-4 dark:border-white/5 dark:bg-white/[0.03]"
        >
          <div className="flex gap-2">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about this PDF…"
              disabled={asking || !document.extracted_text}
              rows={2}
              className="min-h-0 resize-none bg-white/50 dark:bg-white/5"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk(e);
                }
              }}
            />
            {asking ? (
              <Button
                type="button"
                size="icon-lg"
                variant="outline"
                onClick={() => abortRef.current?.abort()}
              >
                <Square className="size-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon-lg"
                disabled={!question.trim()}
                className="shrink-0 bg-gradient-to-br from-violet-600 to-blue-600 text-white"
              >
                <ArrowUp className="size-4" />
              </Button>
            )}
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
