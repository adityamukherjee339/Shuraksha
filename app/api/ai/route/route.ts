import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { startStr, endStr } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    const prompt = `You are an AI personal safety routing assistant. The user wants to travel from "${startStr}" to "${endStr}". 
Analyze the potential safety risks of travelling between these general locations (hypothetically, assuming a typical urban environment). 
Provide a reassuring, and practical safety assessment (3-4 sentences maximum). Suggest one safety precaution. Keep it highly concise.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Unable to assess route safety.";

    return NextResponse.json({ assessment: resultText });
  } catch (error) {
    console.error("Route analysis error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
