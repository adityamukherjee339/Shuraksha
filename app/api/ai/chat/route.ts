import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("GROQ_API_KEY is not set.");
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    const systemMessage = {
      role: "system",
      content: "You are playing the role of a concerned friend on a phone call. The user is in a potentially uncomfortable or unsafe situation and is pretending to talk to you to deter harassment. Keep your responses very short, conversational, and natural, as if on a real phone call. Do not use AI tropes or offer AI assistance. Pretend you are waiting for them or checking on their location. Keep responses under 2 sentences. Example: 'Hey! I am at the restaurant waiting for you, where are you?'"
    };

    const apiMessages = [systemMessage, ...messages];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      console.error("Failed to fetch from Groq API:", await response.text());
      return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
