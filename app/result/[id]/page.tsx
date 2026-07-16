import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ScoreCard } from "@/components/quiz/score-card";

// Public route: looked up by an unguessable submission id. Uses the
// service-role client since RLS on `submissions` is admin-only.
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
    />
  );
}
