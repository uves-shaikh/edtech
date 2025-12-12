"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { SignInPage } from "@/modules/auth/pages/signin-page";
import { useCurrentUser } from "@/modules/auth/hooks/use-auth";

export default function Page() {
  const router = useRouter();
  const { data, isLoading } = useCurrentUser();
  const isAuthenticated = !!data?.user;

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, isLoading, router]);

  if (isAuthenticated) return null;

  return <SignInPage />;
}
