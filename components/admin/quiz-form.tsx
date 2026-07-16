"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quizSchema, type QuizInput } from "@/lib/validations/quiz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Batch, Quiz } from "@/lib/types";
import type { ActionResult } from "@/lib/actions/batches";

interface QuizFormProps {
  quiz?: Quiz;
  batches: Batch[];
  onSubmit: (formData: FormData) => Promise<ActionResult & { id?: string }>;
}

export function QuizForm({ quiz, batches, onSubmit }: QuizFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuizInput>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: quiz?.title ?? "",
      description: quiz?.description ?? "",
      batch_id: quiz?.batch_id ?? "",
      duration_minutes: quiz?.duration_minutes ?? 30,
      published: quiz?.published ?? false,
    },
  });

  const published = watch("published");

  const handle = (data: QuizInput) => {
    setServerError(null);
    const formData = new FormData();
    formData.set("title", data.title);
    formData.set("description", data.description ?? "");
    formData.set("batch_id", data.batch_id);
    formData.set("duration_minutes", String(data.duration_minutes));
    if (data.published) formData.set("published", "on");

    startTransition(async () => {
      const result = await onSubmit(formData);
      if (result.success) {
        router.push(quiz ? `/admin/quizzes/${quiz.id}` : `/admin/quizzes/${result.id}`);
        router.refresh();
      } else {
        setServerError(result.error ?? "Something went wrong");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(handle)} className="space-y-5 max-w-xl">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" placeholder="Frontend Fundamentals Quiz" {...register("title")} />
        {errors.title && <p className="mt-1.5 text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" placeholder="Optional context shown to students" {...register("description")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="batch_id">Batch</Label>
          <Controller
            control={control}
            name="batch_id"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="batch_id">
                  <SelectValue placeholder="Select a batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.batch_id && (
            <p className="mt-1.5 text-xs text-destructive">{errors.batch_id.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="duration_minutes">Duration (minutes)</Label>
          <Input
            id="duration_minutes"
            type="number"
            min={1}
            {...register("duration_minutes")}
          />
          {errors.duration_minutes && (
            <p className="mt-1.5 text-xs text-destructive">{errors.duration_minutes.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
        <div>
          <Label htmlFor="published" className="mb-0">Published</Label>
          <p className="text-xs text-muted">Published quizzes are accessible to students.</p>
        </div>
        <Switch id="published" checked={published} onCheckedChange={(v) => setValue("published", v)} />
      </div>

      {serverError && <p className="text-xs text-destructive">{serverError}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : quiz ? "Save changes" : "Create quiz"}
      </Button>
    </form>
  );
}
