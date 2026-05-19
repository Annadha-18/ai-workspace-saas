"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { DocumentAnalyzer } from "@/components/documents/document-analyzer";
import { DocumentList } from "@/components/documents/document-list";
import { PdfUploadZone } from "@/components/documents/pdf-upload-zone";
import type { DocumentListItem, DocumentRecord } from "@/lib/documents/types";

type DocumentsWorkspaceProps = {
  user: User;
};

export function DocumentsWorkspace({ user }: DocumentsWorkspaceProps) {
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (res.ok) {
        setDocuments(data.documents as DocumentListItem[]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDocuments();
  }, [fetchDocuments]);

  function handleUploaded(doc: DocumentRecord) {
    const item: DocumentListItem = {
      id: doc.id,
      file_name: doc.file_name,
      file_size: doc.file_size,
      page_count: doc.page_count,
      summary: doc.summary,
      created_at: doc.created_at,
    };
    setDocuments((prev) => [item, ...prev]);
    setSelectedId(doc.id);
  }

  function handleDeleted(id: string) {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  return (
    <>
      <DashboardTopbar
        user={user}
        title="Documents"
        description="Upload PDFs, extract text, summarize with AI, and ask questions."
      />

      <div className="space-y-6">
        <PdfUploadZone onUploaded={handleUploaded} />

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <DocumentList
              documents={documents}
              selectedId={selectedId}
              loading={loading}
              onSelect={setSelectedId}
              onDeleted={handleDeleted}
            />
          </div>
          <div className="lg:col-span-8">
            <DocumentAnalyzer documentId={selectedId} />
          </div>
        </div>
      </div>
    </>
  );
}
