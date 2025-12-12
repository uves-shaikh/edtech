"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { SigninPayload, SignupPayload } from "@/modules/auth/schemas/auth";
import { signinSchema, signupSchema } from "@/modules/auth/schemas/auth";

type UserResponse = {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
};

async function jsonFetcher<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const errorMessage = body.error || "Something went wrong";
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

export function useAuthForms() {
  const signinForm = useForm<SigninPayload>({
    resolver: zodResolver(signinSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupPayload>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "CREATOR",
    },
  });

  return { signinForm, signupForm };
}

export function useCurrentUser() {
  return useQuery<UserResponse>({
    queryKey: ["current-user"],
    queryFn: () => jsonFetcher<UserResponse>("/api/auth/me"),
    retry: false,
  });
}

export function useSignin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: SigninPayload) =>
      jsonFetcher<UserResponse>("/api/auth/sign-in", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      toast.success(`Welcome back, ${data.user.name}`);
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      router.push("/dashboard");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useSignup() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: SignupPayload) =>
      jsonFetcher<UserResponse>("/api/auth/sign-up", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      toast.success(`Account created for ${data.user.name}`);
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      router.push("/dashboard");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useSignout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/sign-out", { method: "POST" });
    },
    onSuccess: () => {
      queryClient.setQueryData(["current-user"], undefined);
      queryClient.resetQueries({ queryKey: ["current-user"] });
      toast.success("Signed out");
    },
  });
}
