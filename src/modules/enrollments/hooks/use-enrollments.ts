"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Course } from "@/modules/courses/hooks/use-courses";

type Enrollment = {
  id: string;
  courseId: string;
  enrolledAt: string;
  course: Course;
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

export function useEnrollments(courseId?: string) {
  const params = new URLSearchParams();
  if (courseId) params.set("courseId", courseId);

  return useQuery<{ data: Enrollment[] }>({
    queryKey: ["enrollments", courseId],
    queryFn: () =>
      fetchJSON<{ data: Enrollment[] }>(
        `/api/enrollments?${params.toString()}`,
      ),
  });
}

export function useEnrollCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) =>
      fetchJSON<{ data: Enrollment }>("/api/enrollments", {
        method: "POST",
        body: JSON.stringify({ courseId }),
      }),
    onSuccess: () => {
      toast.success("Successfully enrolled in course");
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUnenrollCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) =>
      fetchJSON(`/api/enrollments/${courseId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Successfully unenrolled from course");
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error) => toast.error(error.message),
  });
}

