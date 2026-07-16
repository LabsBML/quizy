"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, ListChecks } from "lucide-react";
import { studentInfoSchema, type StudentInfoInput } from "@/lib/validations/submission";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDuration } from "@/lib/utils";
import type { PublicQuiz } from "@/lib/types";

interface StudentInfoFormProps {
  quiz: PublicQuiz;
  batchNames: string[];
  onStart: (info: StudentInfoInput) => void;
}

export function StudentInfoForm({ quiz, batchNames, onStart }: StudentInfoFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<StudentInfoInput>({
    resolver: zodResolver(studentInfoSchema),
    defaultValues: { name: "", email: "", batch_name: "" },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-lg font-semibold tracking-tight text-foreground">QUIZY</span>
        </div>

        <div className="rounded-lg border border-border p-6 shadow-card sm:p-8">
          <h1 className="text-xl font-semibold text-foreground">{quiz.title}</h1>
          {quiz.description && <p className="mt-2 text-sm text-muted">{quiz.description}</p>}

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-foreground">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(quiz.duration_minutes)}
            </span>
            <span className="flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-foreground">
              <ListChecks className="h-3.5 w-3.5" />
              {quiz.questions.length} question{quiz.questions.length === 1 ? "" : "s"}
            </span>
          </div>

          <form onSubmit={handleSubmit(onStart)} className="mt-7 space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Full name" {...register("name")} />
              {errors.name && <p className="mt-1.5 text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
              {errors.email && <p className="mt-1.5 text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="batch_name">Batch</Label>
              <Controller
                control={control}
                name="batch_name"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="batch_name">
                      <SelectValue placeholder="Select your batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batchNames.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.batch_name && (
                <p className="mt-1.5 text-xs text-destructive">{errors.batch_name.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg">
              Start Quiz
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
