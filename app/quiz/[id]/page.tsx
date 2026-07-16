import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import type { PublicQuestion, PublicQuiz } from "@/lib/types";

// This route is public (no student login), so reads are done with the
// service-role client on the server. RLS on these tables is admin-only;
// this route is the sole, deliberate, server-side bypass, and it never
// selects the `correct_answer` column, so answers can't leak to the client.
export default async function PublicQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, title, description, duration_minutes, published")
    .eq("id", id)
    .single();

  if (!quiz || !quiz.published) notFound();

  const { data: questions } = await supabase
    .from("questions")
    .select("id, question_text, question_type, points, sort_order, options:question_options(id, option_text, sort_order)")
    .eq("quiz_id", id)
    .order("sort_order", { ascending: true });

  const { data: batches } = await supabase
    .from("batches")
    .select("name")
    .eq("active", true)
    .order("name", { ascending: true });

  const publicQuiz: PublicQuiz = {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    duration_minutes: quiz.duration_minutes,
    questions: ((questions as PublicQuestion[]) ?? []).map((q) => ({
      ...q,
      options: (q.options ?? []).slice().sort((a, b) => a.sort_order - b.sort_order),
    })),
  };

  return (
    <QuizRunner
      quiz={publicQuiz}
      batchNames={(batches ?? []).map((b) => b.name)}
    />
  );
}
