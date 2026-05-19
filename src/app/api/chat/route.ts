import {
  GoogleGenerativeAIAbortError,
  GoogleGenerativeAIFetchError,
  GoogleGenerativeAIRequestInputError,
} from "@google/generative-ai";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/chat/rate-limit";
import { createChatStream, encodeStreamEvent } from "@/lib/chat/stream";
import type { StreamEvent } from "@/lib/chat/types";
import {
  ChatValidationError,
  parseChatRequestBody,
  toGeminiContents,
} from "@/lib/chat/validate";
import { getGeminiModel } from "@/lib/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const encoder = new TextEncoder();

function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

function toPublicError(error: unknown): { message: string; status: number } {
  if (error instanceof ChatValidationError) {
    return { message: error.message, status: error.status };
  }

  if (error instanceof GoogleGenerativeAIRequestInputError) {
    return { message: "Invalid request to the AI provider", status: 400 };
  }

  if (error instanceof GoogleGenerativeAIAbortError) {
    return { message: "Request was cancelled", status: 499 };
  }

  if (error instanceof GoogleGenerativeAIFetchError) {
    const status = error.status ?? 502;
    if (status === 429) {
      return { message: "AI provider rate limit exceeded. Try again shortly.", status: 429 };
    }
    if (status === 401 || status === 403) {
      return { message: "AI service configuration error", status: 503 };
    }
    return { message: "AI provider request failed", status: 502 };
  }

  if (error instanceof Error && error.message === "GEMINI_API_KEY is not configured") {
    return { message: "Chat service is not configured", status: 503 };
  }

  return { message: "An unexpected error occurred", status: 500 };
}

function isAuthorized(request: Request): boolean {
  const secret = process.env.CHAT_API_SECRET;
  if (!secret) return true;

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return false;
  return header.slice(7) === secret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return jsonError("Unauthorized", 401);
  }

  const ip = getClientIp(request);
  const rate = checkRateLimit(ip);
  if (!rate.ok) {
    return jsonError("Too many requests", 429, { retryAfter: rate.retryAfter });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  let messages;
  let model: string;
  try {
    ({ messages, model } = parseChatRequestBody(body));
  } catch (error) {
    const { message, status } = toPublicError(error);
    return jsonError(message, status);
  }

  let systemInstruction: string | undefined;
  let contents;
  try {
    ({ systemInstruction, contents } = toGeminiContents(messages));
  } catch (error) {
    const { message, status } = toPublicError(error);
    return jsonError(message, status);
  }

  const abortController = new AbortController();
  request.signal.addEventListener("abort", () => abortController.abort(), {
    once: true,
  });

  try {
    const gemini = getGeminiModel(model, systemInstruction);
    const result = await gemini.generateContentStream(
      { contents },
      { signal: abortController.signal }
    );

    const stream = createChatStream(result.stream, abortController.signal);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (abortController.signal.aborted) {
      return new Response(encoder.encode(encodeStreamEvent({
        type: "error",
        message: "Request cancelled",
      } satisfies StreamEvent)), {
        status: 499,
        headers: { "Content-Type": "text/event-stream; charset=utf-8" },
      });
    }

    const { message, status } = toPublicError(error);
    return jsonError(message, status);
  }
}

export function GET() {
  return jsonError("Method not allowed", 405);
}
