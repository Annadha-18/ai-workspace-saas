import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/api";
import { getDocumentForUser } from "@/lib/documents/db";
import { truncateForContext } from "@/lib/documents/text";
import { askGroq } from "@/lib/groq";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireUser();

    if (auth.error) {
      return auth.error;
    }

    const { id } = await params;

    const body = await request.json();

    const question = body.question;

    if (!question) {
      return NextResponse.json(
        {
          error: "Question is required",
        },
        { status: 400 }
      );
    }

    const document = await getDocumentForUser(
      auth.supabase,
      auth.user.id,
      id
    );

    if (!document) {
      return NextResponse.json(
        {
          error: "Document not found",
        },
        { status: 404 }
      );
    }

    const answer = await askGroq([
      {
        role: "system",
        content: `
You are a PDF question-answering assistant.

Answer ONLY using the provided PDF content.

If the answer is not present in the document,
say:
"The answer was not found in the document."
`,
      },
      {
        role: "user",
        content: `
PDF Content:
${truncateForContext(
  (document.extracted_text || "").slice(0, 8000)
)}

Question:
${question}
`,
      },
    ]);

    return NextResponse.json({
      answer,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error.message ||
          "Failed to process question",
      },
      { status: 500 }
    );
  }
}