import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/api";
import { checkRateLimit, getClientIp } from "@/lib/chat/rate-limit";
import { createChatStream, encodeStreamEvent } from "@/lib/chat/stream";
import type { StreamEvent } from "@/lib/chat/types";
import { getDocumentForUser } from "@/lib/documents/db";
import { truncateForContext } from "@/lib/documents/text";
import { getGeminiModel } from "@/lib/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const encoder = new TextEncoder();

type RouteContext = { params: Promise<{ id: string }> };

const DOCUMENT_QA_PROMPT = `You are a helpful assistant that answers questions about a PDF document.

Rules:
- Answer only using information from the document context provided.
- If the answer is not in the document, say you cannot find it in the PDF.
- Use GitHub Flavored Markdown when helpful.
- Be concise and accurate.`;

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const ip = getClientIp(request);
  const rate = checkRateLimit(ip);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many requests", retryAfter: rate.retryAfter },
      { status: 429 }
    );
  }

  const { id } = await context.params;
  const document = await getDocumentForUser(auth.supabase, auth.user.id, id);

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  if (!document.extracted_text?.trim()) {
    return NextResponse.json(
      { error: "No extractable text in this document" },
      { status: 400 }
    );
  }

  let body: { question?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const question = body.question?.trim();
  if (!question) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }

  if (question.length > 4000) {
    return NextResponse.json(
      { error: "Question exceeds 4000 characters" },
      { status: 400 }
    );
  }

  const abortController = new AbortController();
  request.signal.addEventListener("abort", () => abortController.abort(), {
    once: true,
  });

  const contextText = truncateForContext(document.extracted_text);
  const systemInstruction = `${DOCUMENT_QA_PROMPT}\n\nDocument: "${document.file_name}"\n\n--- DOCUMENT TEXT ---\n${contextText}\n--- END DOCUMENT ---`;

  try {
    const gemini = getGeminiModel("gemini-2.0-flash", systemInstruction);
    const result = await gemini.generateContentStream(
      {
        contents: [
          {
            role: "user",
            parts: [{ text: question }],
          },
        ],
      },
      { signal: abortController.signal }
    );

    const stream = createChatStream(result.stream, abortController.signal);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    if (abortController.signal.aborted) {
      return new Response(
        encoder.encode(
          encodeStreamEvent({
            type: "error",
            message: "Request cancelled",
          } satisfies StreamEvent)
        ),
        {
          status: 499,
          headers: { "Content-Type": "text/event-stream; charset=utf-8" },
        }
      );
    }

    return NextResponse.json(
      { error: "Failed to process question" },
      { status: 502 }
    );
  }
}
