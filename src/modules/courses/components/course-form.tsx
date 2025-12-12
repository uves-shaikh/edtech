"use client";

import { useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AiCourseAssistant } from "@/modules/courses/components/ai-course-assistant";
import type { Course } from "@/modules/courses/hooks/use-courses";
import {
  useCourseForm,
  useCreateCourse,
  useUpdateCourse,
} from "@/modules/courses/hooks/use-courses";
import type { CourseInput } from "@/modules/courses/schemas/course";

type Props = {
  mode: "create" | "edit";
  courseId?: string;
  defaultValues?: Partial<CourseInput> | Course;
  onCompleted?: () => void;
};

export function CourseForm({
  mode,
  courseId,
  defaultValues,
  onCompleted,
}: Props) {
  // Convert Course to CourseInput format if needed
  const formDefaults = useMemo<Partial<CourseInput> | undefined>(() => {
    if (!defaultValues) return undefined;
    return {
      title: defaultValues.title || "",
      description: defaultValues.description || "",
      category: defaultValues.category || "",
      level: (defaultValues.level as CourseInput["level"]) || "BEGINNER",
      price: defaultValues.price || 0,
      duration: defaultValues.duration || 1,
      imageUrl: defaultValues.imageUrl || "",
      isPublished: defaultValues.isPublished ?? false,
    };
  }, [defaultValues]);

  const { form } = useCourseForm(formDefaults);
  const typedForm = form as UseFormReturn<CourseInput, any, CourseInput>;
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse(courseId || "");

  useEffect(() => {
    if (formDefaults) {
      typedForm.reset(formDefaults);
    }
  }, [formDefaults, typedForm]);

  async function onSubmit(values: CourseInput) {
    try {
      const payload: CourseInput = {
        ...values,
        price: Number(values.price),
        duration: Number(values.duration),
      };

      if (mode === "create") {
        await createCourse.mutateAsync(payload);
        // Reset to empty form for new course creation
        typedForm.reset({
          title: "",
          description: "",
          category: "AI & Productivity",
          level: "BEGINNER",
          price: 0,
          duration: 1,
          imageUrl: "",
          isPublished: false,
        });
      } else if (courseId) {
        await updateCourse.mutateAsync(payload);
        // Reset to formDefaults for edit mode
        if (formDefaults) {
          typedForm.reset(formDefaults);
        }
      }

      onCompleted?.();
    } catch (error) {
      // Error is already handled by mutation's onError callback
      // Don't reset form or call onCompleted on error
    }
  }

  const loading = createCourse.isPending || updateCourse.isPending;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "New Course" : "Update Course"}
        </CardTitle>
        <CardDescription>
          Create and manage your course content.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...typedForm}>
          <AiCourseAssistant form={typedForm} />
          <form
            onSubmit={typedForm.handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <FormField
              control={typedForm.control}
              name="title"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="AI for Ops Managers" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={typedForm.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="What will learners achieve?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={typedForm.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="Productivity" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={typedForm.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Level</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                        <SelectItem value="INTERMEDIATE">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={typedForm.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (INR)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={typedForm.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (hours)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={typedForm.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover image URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://images.example.com/banner.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={typedForm.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Publish course</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Toggle to make this course visible to students.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-label="Publish course"
                      />
                    </FormControl>
                  </div>
                  <FormControl>
                    <input
                      type="hidden"
                      name={field.name}
                      value={field.value ? "true" : "false"}
                      onChange={() => {}}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2 flex items-center justify-end gap-2">
              <Button type="submit" disabled={loading}>
                {loading && (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                )}
                {mode === "create" ? "Create Course" : "Save changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
