export type QuestionType = "mcq" | "short_answer";

export interface Profile {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export interface Batch {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  created_at: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  batch_id: string | null;
  duration_minutes: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizWithMeta extends Quiz {
  batch_name: string | null;
  question_count: number;
  submission_count: number;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  sort_order: number;
}

export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: QuestionType;
  correct_answer: string;
  points: number;
  sort_order: number;
  created_at: string;
  options?: QuestionOption[];
}

export interface Submission {
  id: string;
  quiz_id: string;
  name: string;
  email: string;
  batch_name: string;
  score: number;
  total_points: number;
  percentage: number;
  submitted_at: string;
}

export interface SubmissionWithQuiz extends Submission {
  quiz_title: string;
}

export interface Answer {
  id: string;
  submission_id: string;
  question_id: string;
  answer: string | null;
  is_correct: boolean;
}

// Client-side shape used while a student is taking a quiz.
export interface PublicQuestion {
  id: string;
  question_text: string;
  question_type: QuestionType;
  points: number;
  sort_order: number;
  options: { id: string; option_text: string; sort_order: number }[];
}

export interface PublicQuiz {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  questions: PublicQuestion[];
}

export interface QuizAnswerState {
  [questionId: string]: string;
}
export interface QuestionReview {
  id: string;
  question_text: string;
  question_type: "mcq" | "short_answer";
  correct_answer: string;
  student_answer: string;
  is_correct: boolean;
}