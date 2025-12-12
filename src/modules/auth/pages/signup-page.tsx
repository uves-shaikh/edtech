"use client";

import Link from "next/link";

import { AuthCard } from "@/modules/auth/components/auth-card";
import { useSignup } from "@/modules/auth/hooks/use-auth";

export function SignUpPage() {
  const signup = useSignup();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg space-y-4">
        <AuthCard
          variant="signup"
          loading={signup.isPending}
          onSubmit={(values) => signup.mutateAsync(values)}
        />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

