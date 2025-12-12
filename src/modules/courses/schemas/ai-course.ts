import { z } from "zod";

export const aiCourseDraftRequestSchema = z.object({
  topic: z.string().min(3, "Share a course topic or working title"),
  audience: z.string().min(3, "Describe your target audience"),
  goals: z.string().min(3, "List learning goals or outcomes").optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
});

export const aiCourseDraftResponseSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.string(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  priceSuggestion: z.number().nonnegative(),
  durationHours: z.number().positive(),
  outline: z.array(z.string()).min(3),
  keywords: z.array(z.string()).min(3).max(10),
  coverImagePrompt: z.string(),
});

export type AiCourseDraftRequest = z.infer<typeof aiCourseDraftRequestSchema>;
export type AiCourseDraftResponse = z.infer<typeof aiCourseDraftResponseSchema>;
