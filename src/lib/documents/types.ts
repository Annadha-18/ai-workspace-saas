export type DocumentRecord = {
  id: string;
  user_id: string;
  file_name: string;
  storage_path: string;
  file_size: number;
  page_count: number | null;
  extracted_text: string | null;
  summary: string | null;
  created_at: string;
};

export type DocumentListItem = Pick<
  DocumentRecord,
  "id" | "file_name" | "file_size" | "page_count" | "summary" | "created_at"
>;
