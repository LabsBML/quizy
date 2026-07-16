import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ScoreCard } from "@/components/quiz/score-card";
import type { QuestionReview, QuestionType } from "@/lib/types";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = createAdminClient();

  const { data: submission } = await supabase
    .from("submissions")
    .select("*, quizzes(title)")
    .eq("id", id)
    .single();

  if (!submission) notFound();

  const { data: responses } = await supabase
    .from("responses")
    .select(`
      is_correct,
      answer,
      questions (
        id,
        question_text,
        correct_answer,
        question_type
      )
    `)
    .eq("submission_id", id);

  const reviews: QuestionReview[] = [];

  responses?.forEach((response) => {
    const question = Array.isArray(response.questions)
      ? response.questions[0]
      : response.questions;

    if (!question) return;

    reviews.push({
      id: String(question.id),
      question_text: String(question.question_text),
      question_type: question.question_type as QuestionType,
      correct_answer: String(question.correct_answer),
      student_answer: response.answer ?? "",
      is_correct: Boolean(response.is_correct),
    });
  });

  const quizTitle = Array.isArray(submission.quizzes)
    ? submission.quizzes[0]?.title
    : (submission.quizzes as { title: string } | null)?.title;

  return (
    <ScoreCard
      studentName={submission.name}
      quizTitle={quizTitle ?? "Quiz"}
      score={submission.score}
      totalPoints={submission.total_points}
      percentage={submission.percentage}
      reviews={reviews}
    />
  );
}