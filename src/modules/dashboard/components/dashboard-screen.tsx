"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { LandingHero } from "@/modules/dashboard/components/landing-hero";
import { StudentDashboard } from "@/modules/dashboard/components/student-dashboard";
import { CreatorDashboard } from "@/modules/dashboard/components/creator-dashboard";
import {
  useCurrentUser,
  useSignin,
  useSignup,
} from "@/modules/auth/hooks/use-auth";

export function DashboardScreen() {
  const { data: authData, isLoading: loadingUser, isError } = useCurrentUser();
  const signin = useSignin();
  const signup = useSignup();
  const isAuthenticated = !!authData?.user && !isError;

  if (loadingUser) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-8">
        <LandingHero
          onSignin={(payload) => signin.mutateAsync(payload)}
          onSignup={(payload) => signup.mutateAsync(payload)}
          loading={signin.isPending || signup.isPending}
        />
      </div>
    );
  }

  // Route to appropriate dashboard based on role
  if (authData.user.role === "STUDENT") {
    return <StudentDashboard />;
  }

  if (authData.user.role === "CREATOR" || authData.user.role === "ADMIN") {
    return <CreatorDashboard />;
  }

  // Fallback for unknown roles
  return (
    <div className="space-y-8">
      <p>Unknown role: {authData.user.role}</p>
    </div>
  );
}
