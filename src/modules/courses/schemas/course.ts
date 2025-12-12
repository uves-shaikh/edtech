import { z } from "zod";

export const courseSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Add a short description"),
  category: z.string().min(2, "Category is required"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  price: z.coerce.number().min(0, "Price must be positive"),
  duration: z.coerce
    .number()
    .int("Duration must be a whole number")
    .min(1, "Duration must be at least 1 hour"),
  imageUrl: z.string().url("Provide a valid image URL"),
  isPublished: z.boolean().default(false),
});

export const courseUpdateSchema = courseSchema.partial();

export type CourseInput = z.infer<typeof courseSchema>;
export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;
