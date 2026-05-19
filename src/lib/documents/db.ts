import type { SupabaseClient } from "@supabase/supabase-js";

import type { DocumentRecord } from "./types";

export async function getDocumentForUser(
  supabase: SupabaseClient,
  userId: string,
  documentId: string
): Promise<DocumentRecord | null> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as DocumentRecord | null;
}
