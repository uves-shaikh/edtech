"use client";

import { BookOpen, LogOut } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEnrollments } from "@/modules/enrollments/hooks/use-enrollments";
import { useCurrentUser, useSignout } from "@/modules/auth/hooks/use-auth";

export function StudentDashboard() {
  const { data: authData } = useCurrentUser();
  const signout = useSignout();
  const { data: enrollmentsData, isLoading } = useEnrollments();
  const enrollments = enrollmentsData?.data ?? [];

  return (
    <div className="space-y-8">
      <Card className="border-dashed bg-gradient-to-r from-slate-50 via-white to-blue-50 dark:from-zinc-900 dark:to-blue-900/10">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">Student Dashboard</CardTitle>
            <CardDescription className="text-base">
              Welcome back, {authData?.user.name}. Continue your learning journey.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => signout.mutate()}>
              <LogOut className="mr-2 size-4" />
              Sign out
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Enrolled Courses</CardDescription>
            <CardTitle className="text-3xl">{enrollments.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <BookOpen className="size-12 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">No enrollments yet</CardTitle>
            <CardDescription>
              Browse courses and start learning today!
            </CardDescription>
            <Button asChild className="mt-4">
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrollment) => (
            <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-2">{enrollment.course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {enrollment.course.description}
                    </CardDescription>
                  </div>
                  {enrollment.course.creator && (
                    <Link href={`/creators/${enrollment.course.creator.id}`}>
                      <Avatar className="ml-4">
                        <AvatarFallback>
                          {enrollment.course.creator.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge variant="outline">{enrollment.course.level}</Badge>
                  <Badge variant="secondary">{enrollment.course.category}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {enrollment.course.duration}h • ₹{enrollment.course.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                  </span>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/courses/${enrollment.course.id}`}>
                      View Course
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

