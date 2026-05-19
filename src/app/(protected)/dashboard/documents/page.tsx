import { DocumentsWorkspace } from "@/components/documents/documents-workspace";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Documents",
};

export default async function DocumentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return <DocumentsWorkspace user={user} />;
}
