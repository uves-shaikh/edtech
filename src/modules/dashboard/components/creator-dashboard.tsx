"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseForm } from "@/modules/courses/components/course-form";
import { CourseTable } from "@/modules/courses/components/course-table";
import type { Course } from "@/modules/courses/hooks/use-courses";
import { useCourses } from "@/modules/courses/hooks/use-courses";
import { StatsCards } from "@/modules/dashboard/components/stats-cards";

export function CreatorDashboard() {
  const [draftCourse, setDraftCourse] = useState<Course | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: courseData, isLoading: loadingCourses } = useCourses(
    { search: "", level: "", category: "" },
    { enabled: true }
  );

  const stats = useMemo(() => {
    const courses = courseData?.data ?? [];
    const published = courses.filter((course) => course.isPublished).length;
    const avgPrice =
      courses.length === 0
        ? 0
        : courses.reduce(
            (sum, course) => sum + (Number(course.price) || 0),
            0
          ) / courses.length;
    const totalEnrollments = courses.reduce(
      (sum, course) => sum + (course.enrollmentCount || 0),
      0
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
