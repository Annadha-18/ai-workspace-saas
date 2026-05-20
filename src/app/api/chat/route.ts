import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    let messages = [];

    // Supports:
    // { message: "hello" }
    // OR
    // { messages: [...] }

    if (body.message) {
      messages = [
        {
          role: "user",
          content: body.message,
        },
      ];
    } else if (
      body.messages &&
      Array.isArray(body.messages)
    ) {
      messages = body.messages.filter(
        (msg: any) =>
          msg.role &&
          msg.content &&
          typeof msg.content === "string"
      );
    }

    if (!messages.length) {
      return NextResponse.json(
        {
          error: "No valid messages provided",
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      }
    );

    const data = await response.json();

    console.log("Groq Response:", data);

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            "Groq API request failed",
        },
        { status: response.status }
      );
    }

    const aiReply =
      data?.choices?.[0]?.message?.content;

    if (!aiReply) {
      return NextResponse.json(
        {
          error: "Empty AI response",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reply: aiReply,
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);

    return NextResponse.json(
      {
        error: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}