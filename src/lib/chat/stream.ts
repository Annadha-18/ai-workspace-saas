import type { StreamEvent } from "./types";

export function encodeStreamEvent(event: StreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export function createChatStream(
  stream: AsyncIterable<{ text: () => string }>,
  signal: AbortSignal
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (signal.aborted) {
            controller.close();
            return;
          }

          let text: string;
          try {
            text = chunk.text();
          } catch {
            continue;
          }

          if (text) {
            controller.enqueue(
              encoder.encode(encodeStreamEvent({ type: "text", text }))
            );
          }
        }

        controller.enqueue(
          encoder.encode(encodeStreamEvent({ type: "done" }))
        );
        controller.close();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Stream failed";
        controller.enqueue(
          encoder.encode(encodeStreamEvent({ type: "error", message }))
        );
        controller.close();
      }
    },
    cancel() {
      // Client disconnected; upstream abort is handled via signal in route.
    },
  });
}
