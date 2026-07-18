import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { messages } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) return NextResponse.json({ error: "AI service not configured" }, { status: 500 });

    const systemPrompt = `You are Shuraksha AI, an expert legal and safety assistant dedicated to women's rights and personal safety. 
Keep answers concise, actionable, and compassionate. Use markdown formatting to make the answer easy to read. If a question is entirely unrelated to safety, self-defense, or legal rights, politely decline to answer.`;

    // Map messages to Gemini's native multi-turn format, skipping the first hardcoded greeting
    const chatHistory = messages
      .filter((m: any, index: number) => !(index === 0 && m.role === "assistant"))
      .map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: chatHistory,
        }),
      }
    );

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "I am currently unavailable.";

    return NextResponse.json({ reply: resultText });
  } catch (error) {
    console.error("Assistant API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
