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

    if (!document.extracted_text) {
      return NextResponse.json(
        {
          error: "No extracted text found",
        },
        { status: 400 }
      );
    }

    const summary = await askGroq([
      {
        role: "system",
        content: `
You are an expert PDF summarizer.

Generate:
- Executive Summary
- Key Points
- Important Insights
- Conclusion

Use markdown formatting.
`,
      },
      {
        role: "user",
        content: `
Document Name:
${document.file_name}

Document Content:
${truncateForContext(document.extracted_text.slice(0,10000))}
`,
      },
    ]);

    await auth.supabase
      .from("documents")
      .update({
        summary,
      })
      .eq("id", id);

    return NextResponse.json({
      summary,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error.message ||
          "Failed to generate summary",
      },
      { status: 500 }
    );
  }
}