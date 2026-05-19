import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/api";
import { DOCUMENTS_BUCKET } from "@/lib/documents/constants";
import { getDocumentForUser } from "@/lib/documents/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const document = await getDocumentForUser(auth.supabase, auth.user.id, id);

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json({ document });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const document = await getDocumentForUser(auth.supabase, auth.user.id, id);

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  await auth.supabase.storage
    .from(DOCUMENTS_BUCKET)
    .remove([document.storage_path]);

  const { error } = await auth.supabase
    .from("documents")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
