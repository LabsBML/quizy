import { z } from "zod";

export const studentInfoSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email address"),
  batch_name: z.string().trim().min(1, "Select your batch"),
});

export type StudentInfoInput = z.infer<typeof studentInfoSchema>;

export const submitQuizSchema = z.object({
  quiz_id: z.string().uuid(),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  batch_name: z.string().trim().min(1),
  answers: z.array(
    z.object({
      question_id: z.string().uuid(),
      answer: z.string().max(2000),
    })
  ),
});

export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
