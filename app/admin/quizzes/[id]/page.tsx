import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/page-header";
import { QuizForm } from "@/components/admin/quiz-form";
import { QuestionBuilder } from "@/components/admin/question-builder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { updateQuiz } from "@/lib/actions/quizzes";
import type { Batch, Question, Quiz } from "@/lib/types";

export default async function EditQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: quiz }, { data: batches }, { data: questions }] = await Promise.all([
    supabase.from("quizzes").select("*").eq("id", id).single(),
    supabase.from("batches").select("*").order("name", { ascending: true }),
    supabase
      .from("questions")
      .select("*, options:question_options(*)")
      .eq("quiz_id", id)
      .order("sort_order", { ascending: true }),
  ]);

  if (!quiz) notFound();

  return (
    <div>
      <PageHeader
        title={quiz.title}
        description="Manage quiz details and questions."
        action={
          quiz.published && (
            <Button variant="secondary" asChild>
              <Link href={`/quiz/${quiz.id}`} target="_blank">
                <ExternalLink className="h-4 w-4" />
                View public link
              </Link>
            </Button>
          )
        }
      />

      <Tabs defaultValue="questions">
        <TabsList>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="questions">
          <QuestionBuilder quizId={quiz.id} questions={(questions as Question[]) ?? []} />
        </TabsContent>

        <TabsContent value="details">
          <QuizForm
            quiz={quiz as Quiz}
            batches={(batches as Batch[]) ?? []}
            onSubmit={(formData) => updateQuiz(quiz.id, formData)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
