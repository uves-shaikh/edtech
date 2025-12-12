"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAiCourseDraft } from "@/modules/courses/hooks/use-ai-course-draft";
import type { CourseInput } from "@/modules/courses/schemas/course";

type Props = {
  form: UseFormReturn<CourseInput, any, CourseInput>;
};

const levelOptions = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

export function AiCourseAssistant({ form }: Props) {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [goals, setGoals] = useState("");
  const [level, setLevel] = useState<CourseInput["level"] | "">("");
  const aiDraft = useAiCourseDraft();

  async function handleGenerate() {
    if (!topic.trim() || !audience.trim()) {
      toast.error("Add a topic and audience for better AI output");
      return;
    }

    const levelInput = level || form.getValues("level");
    const draft = await aiDraft.mutateAsync({
      topic: topic.trim(),
      audience: audience.trim(),
      goals: goals.trim() || undefined,
      level: levelInput || undefined,
    });

    form.setValue("title", draft.title);
    form.setValue("description", draft.description);
    form.setValue("category", draft.category);
    form.setValue("level", draft.level);
    form.setValue("price", Number(draft.priceSuggestion.toFixed(2)));
    form.setValue("duration", Math.max(1, Math.round(draft.durationHours)));

    toast.success("Draft applied to the form");
  }

  const suggestion = aiDraft.data;

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="size-4" />
          AI course assistant
        </CardTitle>
        <CardDescription>
          Start from an idea and let AI draft the course basics. You can edit
          anything after it fills the form.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <FormItem>
            <FormLabel>Course idea</FormLabel>
            <FormControl>
              <Input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="AI for product managers, Prompt engineering, ..."
              />
            </FormControl>
          </FormItem>
          <FormItem>
            <FormLabel>Audience</FormLabel>
            <FormControl>
              <Input
                value={audience}
                onChange={(event) => setAudience(event.target.value)}
                placeholder="Junior PMs, college students, ops teams..."
              />
            </FormControl>
          </FormItem>
        </div>

        <div className="grid gap-3 md:grid-cols-[2fr,1fr]">
          <FormItem>
            <FormLabel>Desired outcomes</FormLabel>
            <FormControl>
              <Textarea
                rows={2}
                value={goals}
                onChange={(event) => setGoals(event.target.value)}
                placeholder="Learners will be able to ship a chatbot MVP..."
              />
            </FormControl>
          </FormItem>
          <FormItem>
            <FormLabel>Level hint</FormLabel>
            <FormControl>
              <Select
                value={level || "auto"}
                onValueChange={(value) =>
                  setLevel(
                    value === "auto" ? "" : (value as CourseInput["level"])
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Auto-detect" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  {levelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={aiDraft.isPending}
            aria-busy={aiDraft.isPending}
          >
            {aiDraft.isPending && (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            )}
            Generate draft
          </Button>
          {suggestion && (
            <p className="text-sm text-muted-foreground">
              Filled title, description, level, price, and duration from AI.
            </p>
          )}
        </div>

        {suggestion && (
          <div className="space-y-3 rounded-lg border bg-muted/40 p-3">
            <div>
              <p className="text-sm font-medium">Outline</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {suggestion.outline.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestion.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary">
                  {keyword}
                </Badge>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              Cover prompt: {suggestion.coverImagePrompt}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
