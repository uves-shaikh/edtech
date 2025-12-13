"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-context";
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
    credentials: "include",
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
  const { user, isLoading, isError, error, refetch } = useAuth();

  return {
    data: user ? { user } : undefined,
    user,
    isLoading,
    isError,
    error,
    refetch,
  };
}

export function useSignin() {
  const { setUser } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: SigninPayload) =>
      jsonFetcher<UserResponse>("/api/auth/sign-in", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: async (data) => {
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role as "STUDENT" | "CREATOR" | "ADMIN",
      });
      toast.success(`Welcome back, ${data.user.name}`);
      router.push("/dashboard");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useSignup() {
  const { setUser } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: SignupPayload) =>
      jsonFetcher<UserResponse>("/api/auth/sign-up", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role as "STUDENT" | "CREATOR" | "ADMIN",
      });
      toast.success(`Account created for ${data.user.name}`);
      router.push("/dashboard");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useSignout() {
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
      });
    },
    onSuccess: () => {
      setUser(null);
      toast.success("Signed out");
    },
  });
}
