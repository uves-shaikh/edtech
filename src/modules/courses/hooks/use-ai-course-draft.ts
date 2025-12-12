"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  aiCourseDraftRequestSchema,
  aiCourseDraftResponseSchema,
  type AiCourseDraftRequest,
  type AiCourseDraftResponse,
} from "@/modules/courses/schemas/ai-course";

async function fetchAiDraft(
  payload: AiCourseDraftRequest
): Promise<AiCourseDraftResponse> {
  const response = await fetch("/api/ai/course-draft", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || "Failed to generate course draft");
  }

  const parsed = aiCourseDraftResponseSchema.safeParse(body.data);
  if (!parsed.success) {
    throw new Error("AI response was invalid");
  }

  return parsed.data;
}

export function useAiCourseDraft() {
  return useMutation({
    mutationFn: async (input: AiCourseDraftRequest) => {
      const payload = aiCourseDraftRequestSchema.parse(input);
      return fetchAiDraft(payload);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "AI request failed");
    },
  });
}
