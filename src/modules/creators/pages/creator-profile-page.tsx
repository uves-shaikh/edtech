"use client";

import { use } from "react";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

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

type CreatorProfilePageProps = {
  params: Promise<{ id: string }>;
};

export function CreatorProfilePage({ params }: CreatorProfilePageProps) {
  const { id } = use(params);

  const { data, isLoading, error } = useQuery({
    queryKey: ["creator", id],
    queryFn: () => fetchJSON<{ data: any }>(`/api/creators/${id}`),
  });

  const creator = data?.data;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-destructive">Creator not found</p>
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
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="text-lg">
                {creator.user.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-xl sm:text-2xl">
                {creator.user.name}
              </CardTitle>
              <CardDescription className="text-sm">
                {creator.user.email}
              </CardDescription>
              {creator.expertise && (
                <p className="mt-2 text-sm">{creator.expertise}</p>
              )}
              {creator.bio && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {creator.bio}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Courses</h2>
        {creator.courses && creator.courses.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {creator.courses.map((course: any) => (
              <Card
                key={course.id}
                className="hover:shadow-md transition-shadow pt-0"
              >
                <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                  {course.imageUrl ? (
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="size-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="outline">{course.level}</Badge>
                    <Badge variant="secondary">{course.category}</Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">
                        ₹{course.price.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {course.duration}h • {course.enrollmentCount || 0}{" "}
                        enrolled
                      </p>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <Link href={`/courses/${course.id}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <BookOpen className="size-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No courses published yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
