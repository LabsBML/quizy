"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizTimer } from "@/components/quiz/quiz-timer";
import { QuestionCard } from "@/components/quiz/question-card";
import { StudentInfoForm } from "@/components/quiz/student-info-form";
import type { PublicQuiz, QuizAnswerState } from "@/lib/types";
import type { StudentInfoInput } from "@/lib/validations/submission";

interface QuizRunnerProps {
  quiz: PublicQuiz;
  batchNames: string[];
}

interface StoredState {
  studentInfo: StudentInfoInput;
  answers: QuizAnswerState;
  currentIndex: number;
  startedAt: number;
}

function storageKey(quizId: string) {
  return `quizy:${quizId}`;
}

export function QuizRunner({ quiz, batchNames }: QuizRunnerProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<"intro" | "active" | "submitting">("intro");
  const [studentInfo, setStudentInfo] = useState<StudentInfoInput | null>(null);
  const [answers, setAnswers] = useState<QuizAnswerState>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const submittedRef = useRef(false);

  const durationSeconds = quiz.duration_minutes * 60;

  // Restore progress from localStorage on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(quiz.id));
      if (raw) {
        const parsed: StoredState = JSON.parse(raw);
        setStudentInfo(parsed.studentInfo);
        setAnswers(parsed.answers);
        setCurrentIndex(parsed.currentIndex);
        setStartedAt(parsed.startedAt);
        setPhase("active");
      }
    } catch {
      // Ignore malformed local storage state.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = useCallback(
    (next: Partial<StoredState>) => {
      if (!studentInfo && !next.studentInfo) return;
      const state: StoredState = {
        studentInfo: next.studentInfo ?? studentInfo!,
        answers: next.answers ?? answers,
        currentIndex: next.currentIndex ?? currentIndex,
        startedAt: next.startedAt ?? startedAt ?? Date.now(),
      };
      window.localStorage.setItem(storageKey(quiz.id), JSON.stringify(state));
    },
    [quiz.id, studentInfo, answers, currentIndex, startedAt]
  );

  const handleStart = (info: StudentInfoInput) => {
    const now = Date.now();
    setStudentInfo(info);
    setStartedAt(now);
    setPhase("active");
    window.localStorage.setItem(
      storageKey(quiz.id),
      JSON.stringify({ studentInfo: info, answers: {}, currentIndex: 0, startedAt: now })
    );
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    const next = { ...answers, [questionId]: value };
    setAnswers(next);
    persist({ answers: next });
  };

  const goTo = (index: number) => {
    setCurrentIndex(index);
    persist({ currentIndex: index });
  };

  const submitQuiz = useCallback(async () => {
    if (submittedRef.current || !studentInfo) return;
    submittedRef.current = true;
    setPhase("submitting");

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiz_id: quiz.id,
          name: studentInfo.name,
          email: studentInfo.email,
          batch_name: studentInfo.batch_name,
          answers: quiz.questions.map((q) => ({
            question_id: q.id,
            answer: answers[q.id] ?? "",
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");

      window.localStorage.removeItem(storageKey(quiz.id));
      router.push(`/result/${data.submissionId}`);
    } catch (err) {
      submittedRef.current = false;
      setPhase("active");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }, [studentInfo, quiz.id, quiz.questions, answers, router]);

  const initialSeconds = useMemo(() => {
    if (!startedAt) return durationSeconds;
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    return Math.max(0, durationSeconds - elapsed);
  }, [startedAt, durationSeconds]);

  if (phase === "intro") {
    return <StudentInfoForm quiz={quiz} batchNames={batchNames} onStart={handleStart} />;
  }

  const currentQuestion = quiz.questions[currentIndex];
  const isLast = currentIndex === quiz.questions.length - 1;
  const isFirst = currentIndex === 0;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[768px] items-center justify-between px-6 py-4">
          <span className="text-base font-semibold tracking-tight text-foreground">QUIZY</span>
          {startedAt && (
            <QuizTimer
              initialSeconds={initialSeconds}
              onExpire={submitQuiz}
            />
          )}
        </div>
        <div className="mx-auto max-w-[768px] px-6 pb-3">
          <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10 sm:py-14">
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            index={currentIndex}
            total={quiz.questions.length}
            value={answers[currentQuestion.id] ?? ""}
            onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
          />
        )}
        {error && (
          <p className="mx-auto mt-6 max-w-[768px] text-center text-sm text-destructive">{error}</p>
        )}
      </main>

      <footer className="sticky bottom-0 border-t border-border bg-white px-6 py-4">
        <div className="mx-auto flex max-w-[768px] items-center justify-between gap-3">
          <Button
            variant="secondary"
            onClick={() => goTo(currentIndex - 1)}
            disabled={isFirst || phase === "submitting"}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {isLast ? (
            <Button onClick={submitQuiz} disabled={phase === "submitting"}>
              {phase === "submitting" ? "Submitting..." : "Submit"}
            </Button>
          ) : (
            <Button onClick={() => goTo(currentIndex + 1)} disabled={phase === "submitting"}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
