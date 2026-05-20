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
  try {
    // =========================
    // AUTH
    // =========================
    const auth = await requireUser();

    if (auth.error) {
      return auth.error;
    }

    // =========================
    // PARSE FORM DATA
    // =========================
    let formData: FormData;

    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { error: "Invalid form data" },
        { status: 400 }
      );
    }

    const file = formData.get("file");
    const extractedTextRaw = formData.get("extractedText");
    const pageCountRaw = formData.get("pageCount");

    // =========================
    // VALIDATE FILE
    // =========================
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "PDF file is required" },
        { status: 400 }
      );
    }

    if (file.type !== PDF_MIME) {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "Uploaded file is empty" },
        { status: 400 }
      );
    }

    if (file.size > MAX_PDF_BYTES) {
      return NextResponse.json(
        {
          error: `File exceeds ${Math.floor(
            MAX_PDF_BYTES / (1024 * 1024)
          )} MB limit`,
        },
        { status: 400 }
      );
    }

    // =========================
    // VALIDATE EXTRACTED TEXT
    // =========================
    if (
      typeof extractedTextRaw !== "string" ||
      !extractedTextRaw.trim()
    ) {
      return NextResponse.json(
        { error: "Could not extract text from PDF" },
        { status: 400 }
      );
    }

    const normalizedText = normalizeExtractedText(extractedTextRaw);

    if (!normalizedText.trim()) {
      return NextResponse.json(
        { error: "Extracted PDF text is empty" },
        { status: 400 }
      );
    }

    const extractedText = truncateForStorage(normalizedText);

    // =========================
    // PAGE COUNT
    // =========================
    let pageCount: number | null = null;

    if (typeof pageCountRaw === "string" && pageCountRaw.trim()) {
      const parsed = Number.parseInt(pageCountRaw, 10);

      if (Number.isFinite(parsed) && parsed > 0) {
        pageCount = parsed;
      }
    }

    // =========================
    // GENERATE IDS
    // =========================
    const documentId = randomUUID();

    const storagePath = `${auth.user.id}/${documentId}.pdf`;

    // =========================
    // CONVERT FILE TO BUFFER
    // =========================
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // =========================
    // UPLOAD TO SUPABASE STORAGE
    // =========================
    const { error: uploadError } = await auth.supabase.storage
      .from(DOCUMENTS_BUCKET)
      .upload(storagePath, buffer, {
        contentType: PDF_MIME,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);

      return NextResponse.json(
        {
          error: uploadError.message.includes("Bucket not found")
            ? "Storage bucket missing. Create the 'documents' bucket in Supabase."
            : "Failed to upload file to storage",
        },
        { status: 500 }
      );
    }

    // =========================
    // SAVE DOCUMENT RECORD
    // =========================
    const { data, error: dbError } = await auth.supabase
      .from("documents")
      .insert({
        id: documentId,
        user_id: auth.user.id,
        file_name: file.name,
        storage_path: storagePath,
        file_size: file.size,
        page_count: pageCount,
        extracted_text: extractedText,
      })
      .select("*")
      .single();

    // =========================
    // HANDLE DB ERROR
    // =========================
    if (dbError) {
      console.error("Database insert error:", dbError);

      // cleanup uploaded file
      await auth.supabase.storage
        .from(DOCUMENTS_BUCKET)
        .remove([storagePath]);

      return NextResponse.json(
        {
          error:
            "Failed to save document metadata. Make sure migrations are applied.",
        },
        { status: 500 }
      );
    }

    // =========================
    // SUCCESS RESPONSE
    // =========================
    return NextResponse.json(
      {
        success: true,
        document: data as DocumentRecord,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload route error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}