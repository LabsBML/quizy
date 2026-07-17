interface QuestionReview {
  id: string;
  question_text: string;
  question_type: "mcq" | "short_answer";
  correct_answer: string;
  student_answer: string;
  is_correct: boolean;
  options?: {
    id: string;
    option_text: string;
    sort_order: number;
  }[];
}

interface ScoreCardProps {
  studentName: string;
  quizTitle: string;
  score: number;
  totalPoints: number;
  percentage: number;
  reviews: QuestionReview[];
}
export function ScoreCard({
  studentName,
  quizTitle,
  score,
  totalPoints,
  percentage,
  reviews,
}: ScoreCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-md text-center">
        <span className="text-lg font-semibold tracking-tight text-foreground">QUIZY</span>

        <div className="mt-8 rounded-lg border border-border p-8 shadow-card sm:p-10">
          <p className="text-sm text-muted">{quizTitle}</p>
          <p className="mt-1 text-sm text-muted">Nice work, {studentName.split(" ")[0]}.</p>

          <div className="mt-8">
            <p className="text-5xl font-semibold tracking-tight text-foreground">
              {score} <span className="text-2xl font-medium text-muted">/ {totalPoints}</span>
            </p>
            <p className="mt-3 text-lg font-medium text-primary">{percentage}%</p>
          </div>

          <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
            />
          </div>
         <div className="mt-8 space-y-4 text-left">
  <h3 className="text-sm font-semibold">Answer Review</h3>

  {reviews.map((review, index) => (
    <div
      key={review.id}
      className="rounded-lg border border-border p-4"
    >
      <p className="text-sm font-medium">
        Q{index + 1}. {review.question_text}
      </p>

      {review.question_type === "mcq" &&
        review.options &&
        review.options.length > 0 && (
          <div className="mt-3 grid gap-2">
            {[...review.options]
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((option, i) => {
                const isCorrect =
                  option.option_text === review.correct_answer;

                const isStudentAnswer =
                  option.option_text === review.student_answer;

                return (
                  <div
                    key={option.id}
                    className={`rounded-md border px-3 py-2 text-xs ${
                      isCorrect
                        ? "border-green-200 bg-green-50 text-green-700"
                        : isStudentAnswer
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-border text-muted"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}. {option.option_text}
                  </div>
                );
              })}
          </div>
        )}

      <div className="mt-3 space-y-1 text-xs">
        <p>
          <span className="text-muted">Your answer:</span>{" "}
          <span
            className={
              review.is_correct
                ? "font-medium text-green-600"
                : "font-medium text-red-600"
            }
          >
            {review.student_answer || "Not answered"}
          </span>
        </p>

        <p>
          <span className="text-muted">Correct answer:</span>{" "}
          <span className="font-medium text-green-600">
            {review.correct_answer}
          </span>
        </p>
      </div>
    </div>
  ))}
</div>

          <p className="mt-6 text-xs text-muted">
            Your responses have been recorded. You may close this window.
          </p>
        </div>
      </div>
    </div>
  );
}
