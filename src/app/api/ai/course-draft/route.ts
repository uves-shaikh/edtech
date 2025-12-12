import { NextRequest, NextResponse } from "next/server";
import { generateText, type LanguageModelV1 } from "ai";
import { google } from "@ai-sdk/google";

import { authenticate, ensureRole } from "@/lib/auth-guard";
import {
  aiCourseDraftRequestSchema,
  aiCourseDraftResponseSchema,
} from "@/modules/courses/schemas/ai-course";

export async function POST(request: NextRequest) {
  const auth = await authenticate(request);
  if ("response" in auth) return auth.response;

  const guard = ensureRole(auth.user, ["CREATOR", "ADMIN"]);
  if (guard) return guard;

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return NextResponse.json(
      { error: "Missing GOOGLE_GENERATIVE_AI_API_KEY" },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = aiCourseDraftRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid request" },
      { status: 400 }
    );
  }

  const { topic, audience, goals, level } = parsed.data;

  try {
    const model = google("gemini-2.5-flash");

    const result = await generateText({
      model: model as unknown as LanguageModelV1,
      system:
        "You are an instructional designer helping course creators craft concise, outcome-focused course drafts. Respond with valid JSON only, no markdown formatting.",
      prompt: [
        `Course topic: ${topic}`,
        `Audience: ${audience}`,
        `Level: ${level || "Not specified; infer best fit"}`,
        goals ? `Goals: ${goals}` : null,
        `Return a JSON object with these exact fields: title (string), description (string), category (string), level ("BEGINNER" | "INTERMEDIATE" | "ADVANCED"), priceSuggestion (number in INR), durationHours (number), outline (array of strings, 6-8 items), keywords (array of strings, 5-8 items), coverImagePrompt (string).`,
      ]
        .filter(Boolean)
        .join("\n"),
      temperature: 0.6,
    });

    // Parse JSON from response text
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI response did not contain valid JSON");
    }

    const parsedResponse = aiCourseDraftResponseSchema.safeParse(
      JSON.parse(jsonMatch[0])
    );

    if (!parsedResponse.success) {
      throw new Error("AI response did not match expected schema");
    }

    return NextResponse.json({ data: parsedResponse.data });
  } catch (error) {
    console.error("AI course draft error:", error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (
        error.message.includes("404") ||
        error.message.includes("Not Found")
      ) {
        return NextResponse.json(
          {
            error:
              "Model not found. Please check your API key and model configuration.",
          },
          { status: 404 }
        );
      }
      if (
        error.message.includes("API key") ||
        error.message.includes("401") ||
        error.message.includes("403")
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid or missing API key. Please check your GOOGLE_GENERATIVE_AI_API_KEY.",
          },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to generate course draft. Please try again." },
      { status: 500 }
    );
  }
}
