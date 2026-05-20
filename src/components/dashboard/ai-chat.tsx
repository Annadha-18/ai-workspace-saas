"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  ArrowUp,
  Loader2,
  Sparkles,
  Square,
} from "lucide-react";

import { toast } from "sonner";

import { ChatMessageBubble } from "@/components/dashboard/chat-message";
import { GlassCard } from "@/components/dashboard/glass-card";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import type { ChatMessage } from "@/lib/chat/types";

import { chatSuggestions } from "@/lib/dashboard/data";

import { cn } from "@/lib/utils";

type AiChatProps = {
  compact?: boolean;
  className?: string;
};

export function AiChat({
  compact = false,
  className,
}: AiChatProps) {
  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [input, setInput] = useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const abortRef =
    useRef<AbortController | null>(null);

  const scrollRef =
    useRef<HTMLDivElement>(null);

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

      const userMessage: ChatMessage = {
        role: "user",
        content: trimmed,
      };

      setMessages((prev) => [
        ...prev,
        userMessage,
      ]);

      setInput("");

      setIsLoading(true);

      scrollToBottom();

      try {
        const controller =
          new AbortController();

        abortRef.current = controller;

        const response = await fetch(
          "/api/chat",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              message: trimmed,
            }),

            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to get AI response"
          );
        }

        const assistantMessage: ChatMessage =
          {
            role: "assistant",
            content:
              data.reply || "No response",
          };

        setMessages((prev) => [
          ...prev,
          assistantMessage,
        ]);

        scrollToBottom();
      } catch (err) {
        if (
          (err as Error).name ===
          "AbortError"
        )
          return;

        console.error(err);

        toast.error(
          err instanceof Error
            ? err.message
            : "Something went wrong"
        );
      } finally {
        setIsLoading(false);

        abortRef.current = null;
      }
    },
    [isLoading, scrollToBottom]
  );

  function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!input.trim()) return;

    void sendMessage(input);
  }

  return (
    <GlassCard
      className={cn(
        "flex flex-col overflow-hidden w-full",
        compact
          ? "min-h-[420px]"
          : "min-h-[calc(100svh-8rem)]",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: compact ? 0.32 : 0,
        duration: 0.4,
      }}
    >
      {/* HEADER */}

      <div className="flex items-center justify-between border-b border-white/10 px-4 md:px-5 py-4 dark:border-white/5">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 text-white">
            <Sparkles className="size-4" />
          </span>

          <div>
            <h3 className="font-semibold tracking-tight">
              AI Assistant
            </h3>

            <p className="text-xs text-muted-foreground">
              Powered by Groq AI
            </p>
          </div>
        </div>

        {compact ? (
          <Button
            variant="ghost"
            size="sm"
            asChild
          >
            <Link href="/dashboard/chat">
              Open full chat
            </Link>
          </Button>
        ) : null}
      </div>

      {/* CHAT */}

      <div
        ref={scrollRef}
        className={cn(
          "flex-1 overflow-y-auto p-4",
          compact
            ? "max-h-[280px]"
            : "min-h-0"
        )}
      >
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-2xl border border-dashed border-white/20 bg-white/30 px-6 py-8 dark:bg-white/5">
              <Sparkles className="mx-auto mb-3 size-8 text-violet-500" />

              <p className="font-medium">
                Ask anything to get started
              </p>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Your AI assistant is ready to help.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {chatSuggestions.map(
                (suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={isLoading}
                    onClick={() =>
                      void sendMessage(
                        suggestion
                      )
                    }
                    className="rounded-full border border-white/20 bg-white/40 px-3 py-1.5 text-xs transition-colors hover:bg-white/60 dark:bg-white/10 dark:hover:bg-white/15"
                  >
                    {suggestion}
                  </button>
                )
              )}
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={`${msg.role}-${i}`}
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                >
                  <ChatMessageBubble
                    role={msg.role}
                    content={msg.content}
                    isStreaming={false}
                  />
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-zinc-500 animate-pulse">
                  <Loader2 className="size-4 animate-spin" />
                  AI is thinking...
                </div>
              )}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* INPUT */}

      <form
        onSubmit={handleSubmit}
        className="border-t border-white/10 bg-white/30 p-3 md:p-4 dark:border-white/5 dark:bg-white/[0.03]"
      >
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            placeholder="Message your AI assistant..."
            disabled={isLoading}
            rows={compact ? 2 : 3}
            className="min-h-0 resize-none bg-white/50 dark:bg-white/5 text-sm md:text-base"
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey
              ) {
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
            >
              <Square className="size-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon-lg"
              disabled={!input.trim()}
              className="shrink-0 bg-gradient-to-br from-violet-600 to-blue-600 text-white"
            >
              <ArrowUp className="size-4" />
            </Button>
          )}
        </div>
      </form>
    </GlassCard>
  );
}