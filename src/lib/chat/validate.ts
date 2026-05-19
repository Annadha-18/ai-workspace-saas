import type { Content } from "@google/generative-ai";
import type { ChatMessage, ChatRequestBody } from "./types";

const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 12_000;
const MAX_TOTAL_CHARS = 80_000;

const ALLOWED_MODELS = new Set([
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-1.5-pro",
]);

export const DEFAULT_MODEL = "gemini-2.0-flash";

export class ChatValidationError extends Error {
  constructor(
    message: string,
    readonly status = 400
  ) {
    super(message);
    this.name = "ChatValidationError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseMessage(raw: unknown, index: number): ChatMessage {
  if (!isRecord(raw)) {
    throw new ChatValidationError(`messages[${index}] must be an object`);
  }

  const role = raw.role;
  const content = raw.content;

  if (role !== "user" && role !== "assistant" && role !== "system") {
    throw new ChatValidationError(
      `messages[${index}].role must be "user", "assistant", or "system"`
    );
  }

  if (typeof content !== "string" || content.trim().length === 0) {
    throw new ChatValidationError(
      `messages[${index}].content must be a non-empty string`
    );
  }

  if (content.length > MAX_MESSAGE_LENGTH) {
    throw new ChatValidationError(
      `messages[${index}].content exceeds ${MAX_MESSAGE_LENGTH} characters`
    );
  }

  return { role, content: content.trim() };
}

export function parseChatRequestBody(body: unknown): {
  messages: ChatMessage[];
  model: string;
} {
  if (!isRecord(body)) {
    throw new ChatValidationError("Request body must be a JSON object");
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    throw new ChatValidationError("messages must be a non-empty array");
  }

  if (body.messages.length > MAX_MESSAGES) {
    throw new ChatValidationError(`At most ${MAX_MESSAGES} messages allowed`);
  }

  const messages = body.messages.map(parseMessage);

  let totalChars = 0;
  for (const message of messages) {
    totalChars += message.content.length;
  }
  if (totalChars > MAX_TOTAL_CHARS) {
    throw new ChatValidationError(
      `Total message content exceeds ${MAX_TOTAL_CHARS} characters`
    );
  }

  const last = messages[messages.length - 1];
  if (last.role !== "user") {
    throw new ChatValidationError("The last message must be from the user");
  }

  let model = DEFAULT_MODEL;
  if (body.model !== undefined) {
    if (typeof body.model !== "string" || !ALLOWED_MODELS.has(body.model)) {
      throw new ChatValidationError("Invalid or unsupported model");
    }
    model = body.model;
  }

  return { messages, model };
}

/** Split system messages from conversation history for Gemini. */
export function toGeminiContents(messages: ChatMessage[]): {
  systemInstruction?: string;
  contents: Content[];
} {
  const systemParts: string[] = [];
  const contents: Content[] = [];

  for (const message of messages) {
    if (message.role === "system") {
      systemParts.push(message.content);
      continue;
    }

    contents.push({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    });
  }

  if (contents.length === 0) {
    throw new ChatValidationError("At least one user or assistant message is required");
  }

  return {
    systemInstruction: systemParts.length > 0 ? systemParts.join("\n\n") : undefined,
    contents,
  };
}

export type { ChatRequestBody };
