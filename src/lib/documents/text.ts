import { MAX_GEMINI_CONTEXT_CHARS, MAX_STORED_TEXT_CHARS } from "./constants";

export function normalizeExtractedText(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function truncateForStorage(text: string): string {
  if (text.length <= MAX_STORED_TEXT_CHARS) return text;
  return (
    text.slice(0, MAX_STORED_TEXT_CHARS) +
    "\n\n[Text truncated for storage limits.]"
  );
}

export function truncateForContext(text: string): string {
  if (text.length <= MAX_GEMINI_CONTEXT_CHARS) return text;
  return (
    text.slice(0, MAX_GEMINI_CONTEXT_CHARS) +
    "\n\n[Document truncated for AI context limits.]"
  );
}
