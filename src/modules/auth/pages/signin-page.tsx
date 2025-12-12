"use client";

import Link from "next/link";

import { AuthCard } from "@/modules/auth/components/auth-card";
import { useSignin } from "@/modules/auth/hooks/use-auth";

export function SignInPage() {
  const signin = useSignin();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg space-y-4">
        <AuthCard
          variant="signin"
          loading={signin.isPending}
          onSubmit={(values) => signin.mutateAsync(values)}
        />
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-semibold text-primary hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

