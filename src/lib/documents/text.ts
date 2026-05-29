import {
  MAX_GROQ_CONTEXT_CHARS,
  MAX_STORED_TEXT_CHARS,
} from "./constants";

export function normalizeExtractedText(text: string): string {
  return text
    .replace(/\u0000/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateForStorage(text: string): string {
  if (text.length <= MAX_STORED_TEXT_CHARS) {
    return text;
  }

  return (
    text.slice(0, MAX_STORED_TEXT_CHARS) +
    "\n\n[Document truncated for storage]"
  );
}

export function truncateForContext(text: string): string {
  if (text.length <= MAX_GROQ_CONTEXT_CHARS) {
    return text;
  }

  return (
    text.slice(0, MAX_GROQ_CONTEXT_CHARS) +
    "\n\n[Document truncated for AI processing]"
  );
}