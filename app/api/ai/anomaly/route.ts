import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { locations, timeStopped, maxSpeed } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "No API Key" }, { status: 500 });

    const prompt = `You are a proactive safety AI. A user sharing their location has exhibited the following movement pattern:
- They have been stopped in one place for ${timeStopped} seconds.
- Their maximum recent speed was ${maxSpeed} meters/second.
Based on this limited data, is this highly anomalous for a typical pedestrian commute, indicating they might need to be checked on? 
Respond with exactly "true" if anomalous, or "false" if normal.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase();
    
    return NextResponse.json({ isAnomaly: resultText === "true" });
  } catch (error) {
    console.error("Anomaly API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
