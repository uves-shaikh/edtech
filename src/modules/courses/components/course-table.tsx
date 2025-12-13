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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

import { useDebounce } from "@/hooks/use-debounce";
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
  });
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

  // Debounce search to reduce API calls while user types (500ms threshold)
  const debouncedSearch = useDebounce(filters.search, 500);

  // Separate debounced search from immediate filters: search debounced, level applied instantly
  const apiFilters = useMemo(
    () => ({
      search: debouncedSearch,
      level: filters.level,
    }),
    [debouncedSearch, filters.level]
  );

  const { data, isLoading } = useCourses(apiFilters);
  const courses = useMemo(() => data?.data ?? [], [data]);
  const deleteCourse = useDeleteCourse();

  const confirmDelete = () => {
    if (!courseToDelete) return;
    deleteCourse.mutate(courseToDelete, {
      onSuccess: () => setCourseToDelete(null),
    });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg sm:text-xl">Courses</CardTitle>
            <CardDescription className="text-sm">
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
                className="group relative h-full overflow-hidden border pt-0 transition-shadow hover:shadow-md"
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
                        onClick={() => setCourseToDelete(course.id)}
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
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
                    <div className="space-y-1">
                      <p className="font-semibold">
                        ₹{course.price.toFixed(2)}
                      </p>
                      <p className="text-muted-foreground">
                        {course.duration}h • {course.enrollmentCount || 0}{" "}
                        enrolled
                      </p>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-1 text-xs text-muted-foreground">
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

      <Dialog
        open={!!courseToDelete}
        onOpenChange={(open: boolean) => {
          if (!open) setCourseToDelete(null);
        }}
      >
        <DialogContent showCloseButton={!deleteCourse.isPending}>
          <DialogHeader>
            <DialogTitle>Delete course?</DialogTitle>
            <DialogDescription>
              This will permanently remove the course. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCourseToDelete(null)}
              disabled={deleteCourse.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteCourse.isPending}
              aria-busy={deleteCourse.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
