import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const summarySchema = z.object({
  description: z.string().min(10, "Add more context for the AI"),
});

export async function POST(request: NextRequest) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return NextResponse.json(
      { error: "AI key not configured" },
      { status: 501 }
    );
  }

  try {
    const body = await request.json();
    const { description } = summarySchema.parse(body);

    const { text } = await generateText({
      model: google("models/gemini-1.5-flash"),
      prompt: `You are helping an edtech founder craft a landing page. Summarize the following course in 3 bullet lines, focusing on outcomes and credibility:\n\n${description}`,
    });

    return NextResponse.json({ summary: text.trim() });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    console.error("AI summary error", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
