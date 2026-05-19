import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/api";
import { getDocumentForUser } from "@/lib/documents/db";
import { truncateForContext } from "@/lib/documents/text";
import { getGeminiModel } from "@/lib/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type RouteContext = { params: Promise<{ id: string }> };

const SUMMARIZE_PROMPT = `You are an expert document analyst. Produce a clear, structured summary of the PDF content in GitHub Flavored Markdown.

Include:
- A one-paragraph executive summary
- **Key points** (bullet list)
- **Important details** (entities, dates, numbers if present)
- **Conclusion** or recommended next steps if applicable

Base your answer only on the provided document text.`;

export async function POST(_request: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

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

  if (document.summary) {
    return NextResponse.json({ summary: document.summary });
  }

  try {
    const model = getGeminiModel("gemini-2.0-flash", SUMMARIZE_PROMPT);
    const contextText = truncateForContext(document.extracted_text);

    const result = await model.generateContent(
      `Document title: ${document.file_name}\n\n---\n\n${contextText}`
    );

    const summary = result.response.text();

    await auth.supabase
      .from("documents")
      .update({ summary })
      .eq("id", id)
      .eq("user_id", auth.user.id);

    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 502 }
    );
  }
}
