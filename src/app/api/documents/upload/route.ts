import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/api";
import {
  DOCUMENTS_BUCKET,
  MAX_PDF_BYTES,
  PDF_MIME,
} from "@/lib/documents/constants";
import {
  normalizeExtractedText,
  truncateForStorage,
} from "@/lib/documents/text";
import type { DocumentRecord } from "@/lib/documents/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  const extractedTextRaw = formData.get("extractedText");
  const pageCountRaw = formData.get("pageCount");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "PDF file is required" }, { status: 400 });
  }

  if (file.type !== PDF_MIME) {
    return NextResponse.json(
      { error: "Only PDF files are supported" },
      { status: 400 }
    );
  }

  if (file.size > MAX_PDF_BYTES) {
    return NextResponse.json(
      { error: "File exceeds 15 MB limit" },
      { status: 400 }
    );
  }

  if (typeof extractedTextRaw !== "string" || !extractedTextRaw.trim()) {
    return NextResponse.json(
      { error: "Could not extract text from PDF" },
      { status: 400 }
    );
  }

  const extractedText = truncateForStorage(
    normalizeExtractedText(extractedTextRaw)
  );

  const pageCount =
    typeof pageCountRaw === "string" && pageCountRaw
      ? parseInt(pageCountRaw, 10)
      : null;

  const documentId = randomUUID();
  const storagePath = `${auth.user.id}/${documentId}.pdf`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await auth.supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(storagePath, buffer, {
      contentType: PDF_MIME,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      {
        error:
          uploadError.message.includes("Bucket not found")
            ? "Storage bucket missing. Create the 'documents' bucket in Supabase."
            : "Failed to upload file to storage",
      },
      { status: 500 }
    );
  }

  const { data, error: dbError } = await auth.supabase
    .from("documents")
    .insert({
      id: documentId,
      user_id: auth.user.id,
      file_name: file.name,
      storage_path: storagePath,
      file_size: file.size,
      page_count: Number.isFinite(pageCount) ? pageCount : null,
      extracted_text: extractedText,
    })
    .select("*")
    .single();

  if (dbError) {
    await auth.supabase.storage.from(DOCUMENTS_BUCKET).remove([storagePath]);
    return NextResponse.json(
      {
        error:
          "Failed to save document metadata. Run supabase/migrations/001_documents.sql",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ document: data as DocumentRecord }, { status: 201 });
}
