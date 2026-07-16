interface ScoreCardProps {
  studentName: string;
  quizTitle: string;
  score: number;
  totalPoints: number;
  percentage: number;
}

export function ScoreCard({ studentName, quizTitle, score, totalPoints, percentage }: ScoreCardProps) {
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

          <p className="mt-6 text-xs text-muted">
            Your responses have been recorded. You may close this window.
          </p>
        </div>
      </div>
    </div>
  );
}
