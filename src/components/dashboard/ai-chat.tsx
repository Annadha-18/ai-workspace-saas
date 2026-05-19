"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Loader2, Sparkles, Square } from "lucide-react";
import { toast } from "sonner";

import { ChatMessageBubble } from "@/components/dashboard/chat-message";
import { GlassCard } from "@/components/dashboard/glass-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ChatMessage } from "@/lib/chat/types";
import type { StreamEvent } from "@/lib/chat/types";
import { chatSuggestions } from "@/lib/dashboard/data";
import { cn } from "@/lib/utils";

type AiChatProps = {
  compact?: boolean;
  className?: string;
};

export function AiChat({ compact = false, className }: AiChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, []);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMessage: ChatMessage = { role: "user", content: trimmed };
      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      setInput("");
      setIsLoading(true);
      scrollToBottom();

      const assistantMessage: ChatMessage = { role: "assistant", content: "" };
      setMessages([...nextMessages, assistantMessage]);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: nextMessages }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Request failed" }));
          throw new Error(err.error ?? "Request failed");
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

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
            try {
              const event = JSON.parse(line.slice(6)) as StreamEvent;
              if (event.type === "text") {
                accumulated += event.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: accumulated,
                  };
                  return updated;
                });
                scrollToBottom();
              } else if (event.type === "error") {
                throw new Error(event.message);
              }
            } catch (parseErr) {
              if (parseErr instanceof SyntaxError) continue;
              throw parseErr;
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const message = err instanceof Error ? err.message : "Something went wrong";
        toast.error(message);
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [isLoading, messages, scrollToBottom]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void sendMessage(input);
  }

  return (
    <GlassCard
      className={cn("flex flex-col overflow-hidden", compact ? "min-h-[420px]" : "min-h-[calc(100svh-8rem)]", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: compact ? 0.32 : 0, duration: 0.4 }}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 dark:border-white/5">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 text-white">
            <Sparkles className="size-4" />
          </span>
          <div>
            <h3 className="font-semibold tracking-tight">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">
              Powered by Gemini · Markdown supported
            </p>
          </div>
        </div>
        {compact ? (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/chat">Open full chat</Link>
          </Button>
        ) : null}
      </div>

      <div
        ref={scrollRef}
        className={cn(
          "flex-1 space-y-4 overflow-y-auto p-4",
          compact ? "max-h-[280px]" : "min-h-0"
        )}
      >
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-2xl border border-dashed border-white/20 bg-white/30 px-6 py-8 dark:bg-white/5">
              <Sparkles className="mx-auto mb-3 size-8 text-violet-500" />
              <p className="font-medium">Ask anything to get started</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Your conversations stream in real time with formatted markdown responses.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {chatSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={isLoading}
                  onClick={() => void sendMessage(suggestion)}
                  className="rounded-full border border-white/20 bg-white/40 px-3 py-1.5 text-xs transition-colors hover:bg-white/60 dark:bg-white/10 dark:hover:bg-white/15"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={`${msg.role}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChatMessageBubble
                  role={msg.role}
                  content={msg.content}
                  isStreaming={
                    isLoading &&
                    i === messages.length - 1 &&
                    msg.role === "assistant"
                  }
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-white/10 bg-white/30 p-4 dark:border-white/5 dark:bg-white/[0.03]"
      >
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message your AI assistant…"
            disabled={isLoading}
            rows={compact ? 2 : 3}
            className="min-h-0 resize-none bg-white/50 dark:bg-white/5"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          {isLoading ? (
            <Button
              type="button"
              size="icon-lg"
              variant="outline"
              onClick={stopGeneration}
              aria-label="Stop"
            >
              <Square className="size-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon-lg"
              disabled={!input.trim()}
              className="shrink-0 bg-gradient-to-br from-violet-600 to-blue-600 text-white hover:from-violet-500 hover:to-blue-500"
              aria-label="Send"
            >
              <ArrowUp className="size-4" />
            </Button>
          )}
        </div>
        {isLoading ? (
          <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            Generating response…
          </p>
        ) : null}
      </form>
    </GlassCard>
  );
}
