import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/page-header";
import { QuizForm } from "@/components/admin/quiz-form";
import { createQuiz } from "@/lib/actions/quizzes";
import type { Batch } from "@/lib/types";

export default async function NewQuizPage() {
  const supabase = await createClient();
  const { data: batches } = await supabase
    .from("batches")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div>
      <PageHeader title="New quiz" description="Set up the quiz details, then add questions." />
      <QuizForm batches={(batches as Batch[]) ?? []} onSubmit={createQuiz} />
    </div>
  );
}
