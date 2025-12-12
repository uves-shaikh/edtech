"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Course } from "@/modules/courses/hooks/use-courses";

type Creator = {
  id: string;
  bio: string | null;
  expertise: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  courses?: Course[];
  courseCount?: number;
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

export function useCreator(userId?: string) {
  const params = new URLSearchParams();
  if (userId) params.set("userId", userId);

  return useQuery<{ data: Creator }>({
    queryKey: ["creator", userId],
    queryFn: () =>
      fetchJSON<{ data: Creator }>(`/api/creators?${params.toString()}`),
    enabled: !!userId,
  });
}

export function useCreatorById(id: string) {
  return useQuery<{ data: Creator }>({
    queryKey: ["creator", id],
    queryFn: () => fetchJSON<{ data: Creator }>(`/api/creators/${id}`),
  });
}

export function useCreators() {
  return useQuery<{ data: Creator[] }>({
    queryKey: ["creators"],
    queryFn: () => fetchJSON<{ data: Creator[] }>("/api/creators"),
  });
}

export function useUpdateCreator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { bio?: string; expertise?: string }) =>
      fetchJSON<{ data: Creator }>("/api/creators", {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["creator"] });
      queryClient.invalidateQueries({ queryKey: ["creators"] });
    },
    onError: (error) => toast.error(error.message),
  });
}

