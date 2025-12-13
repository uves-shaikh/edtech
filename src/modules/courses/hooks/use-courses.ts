"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { CourseInput } from "@/modules/courses/schemas/course";
import { courseSchema } from "@/modules/courses/schemas/course";

export type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  price: number;
  duration: number;
  imageUrl: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    bio: string | null;
    expertise: string | null;
    user: {
      id: string;
      name: string;
      email: string;
    };
  } | null;
  enrollmentCount?: number;
  isEnrolled?: boolean;
};

type CourseFilters = {
  search?: string;
  level?: string;
};

async function fetchJSON<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "Request failed");
  }

  return response.json() as Promise<T>;
}

export function useCourseForm(initial?: Partial<CourseInput>) {
  const form = useForm<CourseInput, any, CourseInput>({
    resolver: zodResolver(courseSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      category: "AI & Productivity",
      level: "BEGINNER",
      price: 0,
      duration: 1,
      imageUrl: "",
      isPublished: false,
      ...initial,
    },
  });

  return { form };
}

export function useCourses(
  filters: CourseFilters,
  options?: { enabled?: boolean }
) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.level) params.set("level", filters.level);

  return useQuery<{ data: Course[] }>({
    queryKey: ["courses", filters],
    queryFn: () =>
      fetchJSON<{ data: Course[] }>(`/api/courses?${params.toString()}`),
    enabled: options?.enabled ?? true,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CourseInput) =>
      fetchJSON<{ data: Course }>("/api/courses", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      toast.success("Course created");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateCourse(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CourseInput) =>
      fetchJSON<{ data: Course }>(`/api/courses/${courseId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      toast.success("Course updated");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) =>
      fetchJSON(`/api/courses/${courseId}`, { method: "DELETE" }),
    onError: (error) => toast.error(error.message),
    onSuccess: () => {
      toast.success("Course deleted");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}
