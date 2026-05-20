import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Handle both formats safely
    let userMessage = "";

    if (body.message) {
      userMessage = body.message;
    } else if (
      body.messages &&
      Array.isArray(body.messages) &&
      body.messages.length > 0
    ) {
      userMessage = body.messages[body.messages.length - 1].content || "";
    }

    if (!userMessage) {
      return NextResponse.json(
        {
          error: "Message is required",
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
          model: "llama3-8b-8192",
          messages: [
            {
              role: "user",
              content: userMessage,
            },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);

      return NextResponse.json(
        {
          error: data.error?.message || "Groq API Error",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reply: data.choices?.[0]?.message?.content || "No response",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}