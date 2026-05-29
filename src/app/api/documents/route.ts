import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/api";
import type { DocumentListItem } from "@/lib/documents/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const { data, error } = await auth.supabase
    .from("documents")
    .select("id, file_name, file_size, page_count, summary, created_at")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Failed to load documents. Run the Supabase migration?" },
      { status: 500 }
    );
  }

  return NextResponse.json({ documents: data as DocumentListItem[] });
}