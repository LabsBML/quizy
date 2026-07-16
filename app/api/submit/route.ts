import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { submitQuizSchema } from "@/lib/validations/submission";
import { normalizeAnswer } from "@/lib/utils";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = submitQuizSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid submission" },
      { status: 400 }
    );
  }

  const { quiz_id, name, email, batch_name, answers } = parsed.data;
  const supabase = createAdminClient();

  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("id, published")
    .eq("id", quiz_id)
    .single();

  if (quizError || !quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }
  if (!quiz.published) {
    return NextResponse.json({ error: "This quiz is not available" }, { status: 403 });
  }

  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("id, correct_answer, question_type, points")
    .eq("quiz_id", quiz_id);

  if (questionsError || !questions || questions.length === 0) {
    return NextResponse.json({ error: "Unable to load quiz questions" }, { status: 500 });
  }

  // Grade entirely server-side; the client only supplies raw answers.
  let score = 0;
  let totalPoints = 0;
  const gradedAnswers = questions.map((question) => {
    totalPoints += question.points;
    const submitted = answers.find((a) => a.question_id === question.id)?.answer ?? "";

    const isCorrect =
      question.question_type === "mcq"
        ? submitted === question.correct_answer
        : normalizeAnswer(submitted) === normalizeAnswer(question.correct_answer);

    if (isCorrect) score += question.points;

    return {
      question_id: question.id,
      answer: submitted,
      is_correct: isCorrect,
    };
  });

  const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 10000) / 100 : 0;

  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .insert({
      quiz_id,
      name,
      email,
      batch_name,
      score,
      total_points: totalPoints,
      percentage,
    })
    .select("id")
    .single();

  if (submissionError || !submission) {
    return NextResponse.json({ error: "Unable to save submission" }, { status: 500 });
  }

  const { error: answersError } = await supabase.from("answers").insert(
    gradedAnswers.map((a) => ({ ...a, submission_id: submission.id }))
  );

  if (answersError) {
    return NextResponse.json({ error: "Unable to save answers" }, { status: 500 });
  }

  return NextResponse.json({ submissionId: submission.id });
}
