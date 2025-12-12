"use client";

import { useEffect } from "react";
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
import type { CourseInput } from "@/modules/courses/schemas/course";
import type { Course } from "@/modules/courses/hooks/use-courses";
import {
  useCourseForm,
  useCreateCourse,
  useUpdateCourse,
} from "@/modules/courses/hooks/use-courses";

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
  const { form } = useCourseForm(defaultValues);
  const typedForm = form as UseFormReturn<CourseInput, any, CourseInput>;
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse(courseId || "");

  useEffect(() => {
    if (defaultValues) {
      // Convert Course type to CourseInput if needed
      const formValues: Partial<CourseInput> = {
        title: defaultValues.title || "",
        description: defaultValues.description || "",
        category: defaultValues.category || "",
        level: (defaultValues.level as CourseInput["level"]) || "BEGINNER",
        price: defaultValues.price || 0,
        duration: defaultValues.duration || 1,
        imageUrl: defaultValues.imageUrl || "",
        isPublished: defaultValues.isPublished ?? false,
      };
      typedForm.reset(formValues);
    }
  }, [defaultValues, typedForm]);

  async function onSubmit(values: CourseInput) {
    const payload: CourseInput = {
      ...values,
      price: Number(values.price),
      duration: Number(values.duration),
    };

    if (mode === "create") {
      await createCourse.mutateAsync(payload);
    } else if (courseId) {
      await updateCourse.mutateAsync(payload);
    }

    onCompleted?.();
    typedForm.reset(defaultValues);
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
      <CardContent>
        <Form {...typedForm}>
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
                    <input type="hidden" {...field} />
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
