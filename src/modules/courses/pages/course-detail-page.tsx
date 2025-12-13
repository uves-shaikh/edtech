"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen, Clock, DollarSign, User } from "lucide-react";
import Link from "next/link";
import { use } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/modules/auth/hooks/use-auth";
import {
  useEnrollCourse,
  useUnenrollCourse,
} from "@/modules/enrollments/hooks/use-enrollments";

async function fetchJSON<T>(url: string) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "Request failed");
  }

  return response.json() as Promise<T>;
}

type CourseDetailPageProps = {
  params: Promise<{ id: string }>;
};

export function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = use(params);
  console.log("id", id);
  const { data: authData } = useCurrentUser();
  const enrollCourse = useEnrollCourse();
  const unenrollCourse = useUnenrollCourse();

  const { data, isLoading, error } = useQuery({
    queryKey: ["course", id],
    queryFn: () => fetchJSON<{ data: any }>(`/api/courses/${id}`),
  });

  const course = data?.data;
  const isStudent = authData?.user.role === "STUDENT";
  const isEnrolled = course?.isEnrolled;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-destructive">Course not found</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="pt-0">
            <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
              {course.imageUrl ? (
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <BookOpen className="size-16 text-muted-foreground" />
                </div>
              )}
            </div>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="outline">{course.level}</Badge>
                <Badge variant="secondary">{course.category}</Badge>
                {course.isPublished ? (
                  <Badge>Published</Badge>
                ) : (
                  <Badge variant="secondary">Draft</Badge>
                )}
              </div>
              <CardTitle className="text-2xl sm:text-3xl">
                {course.title}
              </CardTitle>
              {course.creator && (
                <div className="flex items-center gap-2 mt-4">
                  <Avatar>
                    <AvatarFallback>
                      {course.creator.user.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Link
                      href={`/creators/${course.creator.id}`}
                      className="font-medium hover:underline"
                    >
                      {course.creator.user.name}
                    </Link>
                    {course.creator.expertise && (
                      <p className="text-sm text-muted-foreground">
                        {course.creator.expertise}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <Separator className="my-4" />
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-base sm:text-lg">{course.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-semibold">₹{course.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">{course.duration} hours</p>
                </div>
              </div>
              {course.enrollmentCount !== undefined && (
                <div className="flex items-center gap-2">
                  <User className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Enrollments</p>
                    <p className="font-semibold">{course.enrollmentCount}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {isStudent && course.isPublished && (
            <Card>
              <CardContent className="pt-6">
                {isEnrolled ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      You are enrolled in this course
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => unenrollCourse.mutate(course.id)}
                      disabled={unenrollCourse.isPending}
                    >
                      Unenroll
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => enrollCourse.mutate(course.id)}
                    disabled={enrollCourse.isPending}
                  >
                    Enroll Now
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
