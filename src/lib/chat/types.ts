/** Client-facing message role (maps to Gemini `user` / `model`). */
export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatRequestBody {
  messages: ChatMessage[];
  /** Override default model (must stay on allowlist). */
  model?: string;
}

export type StreamEvent =
  | { type: "text"; text: string }
  | { type: "done"; finishReason?: string }
  | { type: "error"; message: string };
