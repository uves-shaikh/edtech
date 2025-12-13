"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StudentDashboard } from "@/modules/dashboard/components/student-dashboard";
import { CreatorDashboard } from "@/modules/dashboard/components/creator-dashboard";
import { useCurrentUser } from "@/modules/auth/hooks/use-auth";

export function DashboardScreen() {
  const router = useRouter();
  const { data: authData, isLoading: loadingUser, isError } = useCurrentUser();
  const isAuthenticated = !!authData?.user && !isError;

  useEffect(() => {
    if (loadingUser) return;
    if (!isAuthenticated) {
      router.replace("/sign-in");
    }
  }, [isAuthenticated, loadingUser, router]);

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
      <Card>
        <CardHeader>
          <CardTitle>Redirecting to sign in</CardTitle>
          <CardDescription>
            You need to be signed in to access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.replace("/sign-in")}>
            Go to sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Role-based routing: students see enrollment-focused dashboard
  if (authData.user.role === "STUDENT") {
    return <StudentDashboard />;
  }

  // Creators and admins share the same course management interface
  if (authData.user.role === "CREATOR" || authData.user.role === "ADMIN") {
    return <CreatorDashboard />;
  }

  // Edge case: handle unexpected role values from database
  return (
    <Card>
      <CardHeader>
        <CardTitle>Unsupported role</CardTitle>
        <CardDescription>Unknown role: {authData.user.role}</CardDescription>
      </CardHeader>
    </Card>
  );
}
