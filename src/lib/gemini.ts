import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
  type GenerativeModel,
} from "@google/generative-ai";

const MARKDOWN_SYSTEM_PROMPT = `You are a helpful AI assistant in a workspace chat.

Respond using GitHub Flavored Markdown when it improves clarity:
- Use fenced code blocks with language tags for code
- Use inline code for identifiers, commands, and short snippets
- Use headings, lists, tables, and blockquotes when appropriate
- Use **bold** and *italic* for emphasis
- Keep answers concise unless the user asks for detail`;

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return key;
}

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(getApiKey());
  }
  return genAI;
}

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export function getGeminiModel(
  modelId: string,
  systemInstruction?: string
): GenerativeModel {
  const parts: string[] = [MARKDOWN_SYSTEM_PROMPT];
  if (systemInstruction?.trim()) {
    parts.push(systemInstruction.trim());
  }

  return getClient().getGenerativeModel({
    model: modelId,
    safetySettings,
    systemInstruction: parts.join("\n\n"),
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    },
  });
}
