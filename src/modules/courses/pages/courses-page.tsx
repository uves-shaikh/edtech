"use client";

import { useMemo, useState } from "react";
import { BookOpen } from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { CourseFilters } from "@/modules/courses/components/course-filters";
import { useCourses } from "@/modules/courses/hooks/use-courses";
import { useEnrollCourse } from "@/modules/enrollments/hooks/use-enrollments";
import { useCurrentUser } from "@/modules/auth/hooks/use-auth";

export function CoursesPage() {
  const { data: authData } = useCurrentUser();
  const [filters, setFilters] = useState({
    search: "",
    level: "",
    category: "",
  });

  // Debounce search to reduce API calls while user types (500ms threshold)
  const debouncedSearch = useDebounce(filters.search, 500);

  // Separate debounced search from immediate filters: search debounced, level/category applied instantly
  const apiFilters = useMemo(
    () => ({
      search: debouncedSearch,
      level: filters.level,
      category: filters.category,
    }),
    [debouncedSearch, filters.level, filters.category]
  );

  const { data, isLoading } = useCourses(apiFilters);
  const courses = data?.data ?? [];
  const enrollCourse = useEnrollCourse();
  const isStudent = authData?.user.role === "STUDENT";

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Browse Courses</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Discover courses from expert creators
          </p>
        </div>
        <CourseFilters filters={filters} onChange={setFilters} />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="overflow-hidden pt-0">
              <Skeleton className="aspect-video w-full rounded-t-lg" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <BookOpen className="size-12 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">No courses found</CardTitle>
            <CardDescription>
              Try adjusting your filters to see more courses.
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="hover:shadow-md transition-shadow overflow-hidden pt-0"
            >
              <div className="aspect-video w-full overflow-hidden bg-muted">
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
                {course.creator && (
                  <Link
                    href={`/creators/${course.creator.id}`}
                    className="text-sm text-muted-foreground hover:underline mt-2"
                  >
                    By {course.creator.user.name}
                  </Link>
                )}
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
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="flex-1 sm:flex-initial"
                    >
                      <Link href={`/courses/${course.id}`}>View</Link>
                    </Button>
                    {isStudent && !course.isEnrolled && (
                      <Button
                        size="sm"
                        onClick={() => enrollCourse.mutate(course.id)}
                        disabled={enrollCourse.isPending}
                        className="flex-1 sm:flex-initial"
                      >
                        Enroll
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
