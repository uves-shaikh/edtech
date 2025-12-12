"use client";

import { LogOut, Plus } from "lucide-react";
import { useState, useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CourseForm } from "@/modules/courses/components/course-form";
import { CourseTable } from "@/modules/courses/components/course-table";
import type { Course } from "@/modules/courses/hooks/use-courses";
import { useCourses } from "@/modules/courses/hooks/use-courses";
import { StatsCards } from "@/modules/dashboard/components/stats-cards";
import {
  useCurrentUser,
  useSignout,
} from "@/modules/auth/hooks/use-auth";

export function CreatorDashboard() {
  const { data: authData } = useCurrentUser();
  const signout = useSignout();
  const [draftCourse, setDraftCourse] = useState<Course | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: courseData, isLoading: loadingCourses } = useCourses(
    { search: "", level: "", category: "", isPublished: "" },
    { enabled: true },
  );

  const stats = useMemo(() => {
    const courses = courseData?.data ?? [];
    const published = courses.filter((course) => course.isPublished).length;
    const avgPrice =
      courses.length === 0
        ? 0
        : courses.reduce(
            (sum, course) => sum + (Number(course.price) || 0),
            0,
          ) / courses.length;
    const totalEnrollments = courses.reduce(
      (sum, course) => sum + (course.enrollmentCount || 0),
      0,
    );

    return {
      total: courses.length,
      published,
      avgPrice,
      totalEnrollments,
    };
  }, [courseData]);

  return (
    <div className="space-y-8">
      <Card className="border-dashed bg-gradient-to-r from-slate-50 via-white to-emerald-50 dark:from-zinc-900 dark:to-emerald-900/10">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">Creator Workspace</CardTitle>
            <CardDescription className="text-base">
              Welcome back, {authData?.user.name}. Create and manage your
              courses.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => signout.mutate()}>
              <LogOut className="mr-2 size-4" />
              Sign out
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>Role: {authData?.user.role}</span>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <span className="hidden sm:block">
              Email: {authData?.user.email}
            </span>
          </div>
        </CardContent>
      </Card>

      <StatsCards
        total={stats.total}
        published={stats.published}
        avgPrice={stats.avgPrice}
        totalEnrollments={stats.totalEnrollments}
        loading={loadingCourses}
      />

      {showForm ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {draftCourse?.id ? "Edit Course" : "Create New Course"}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setDraftCourse(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CourseForm
              mode={draftCourse?.id ? "edit" : "create"}
              courseId={draftCourse?.id}
              defaultValues={draftCourse ?? undefined}
              onCompleted={() => {
                setShowForm(false);
                setDraftCourse(null);
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Courses</h2>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 size-4" />
              New Course
            </Button>
          </div>
          <CourseTable
            onSelect={(course) => {
              setDraftCourse(course);
              setShowForm(true);
            }}
          />
        </div>
      )}
    </div>
  );
}

