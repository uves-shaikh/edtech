"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { CourseFilters } from "@/modules/courses/components/course-filters";
import type { Course } from "@/modules/courses/hooks/use-courses";
import {
  useCourses,
  useDeleteCourse,
} from "@/modules/courses/hooks/use-courses";

type Props = {
  onSelect: (course: Course) => void;
};

export function CourseTable({ onSelect }: Props) {
  const [filters, setFilters] = useState({
    search: "",
    level: "",
    category: "",
    isPublished: "",
  });
  const { data, isLoading } = useCourses(filters);
  const courses = useMemo(() => data?.data ?? [], [data]);
  const deleteCourse = useDeleteCourse();

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Courses</CardTitle>
            <CardDescription>
              Manage your courses and track their status.
            </CardDescription>
          </div>
          <CourseFilters filters={filters} onChange={setFilters} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <CourseGridSkeleton />
        ) : courses.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyMedia variant="icon">
              <BookOpen />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No courses yet</EmptyTitle>
              <EmptyDescription>
                Add a course to see it appear in your catalog.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              Keep your first course ready with title, image, and price.
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="group relative h-full overflow-hidden border p-0 transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {course.imageUrl ? (
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="size-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    <Badge
                      variant={course.isPublished ? "default" : "secondary"}
                    >
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                    <Badge variant="outline">{course.level}</Badge>
                  </div>
                </div>

                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <CardTitle className="line-clamp-2 text-base">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label="Edit course"
                        onClick={() => onSelect(course)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label="Delete course"
                        disabled={deleteCourse.isPending}
                        aria-busy={deleteCourse.isPending}
                        onClick={() => deleteCourse.mutate(course.id)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{course.category}</Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div className="space-y-1">
                      <p className="font-semibold">
                        ₹{course.price.toFixed(2)}
                      </p>
                      <p className="text-muted-foreground">
                        {course.duration}h • {course.enrollmentCount || 0}{" "}
                        enrolled
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                      <span>
                        Created{" "}
                        {new Date(course.createdAt).toLocaleDateString()}
                      </span>
                      <span>
                        Updated{" "}
                        {new Date(course.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CourseGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[...Array(6)].map((_, index) => (
        <Card key={index} className="overflow-hidden p-0">
          <Skeleton className="aspect-video w-full" />
          <CardHeader className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
