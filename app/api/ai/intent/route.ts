import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { transcript } = body;

    if (!transcript) {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set.");
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    const prompt = `You are an AI trained to detect distress signals in voice transcripts. Analyze the following transcript from a user of a personal safety app. If the transcript contains explicit cries for help, distress, panic, or indicates someone is in danger, being followed, harassed, or attacked, respond with exactly the word "true". If it is just normal conversation or a false alarm, respond with exactly "false". Do not include any other text or punctuation.

Transcript: "${transcript}"`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch from Gemini API");
      return NextResponse.json({ error: "Failed to analyze intent" }, { status: 500 });
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase();

    const isDistress = resultText === "true";

    return NextResponse.json({ isDistress });
  } catch (error) {
    console.error("Intent analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
