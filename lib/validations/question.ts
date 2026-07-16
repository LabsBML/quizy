import { z } from "zod";

const optionSchema = z.object({
  option_text: z.string().trim().min(1, "Option text is required"),
});

export const questionSchema = z
  .object({
    question_text: z.string().trim().min(3, "Question must be at least 3 characters"),
    question_type: z.enum(["mcq", "short_answer"]),
    points: z.coerce.number().int().min(1).max(100).default(1),
    options: z.array(optionSchema).optional(),
    correct_option_index: z.coerce.number().int().min(0).optional(),
    correct_answer: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.question_type === "mcq") {
      if (!data.options || data.options.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Add at least 2 options",
          path: ["options"],
        });
      }
      if (
        data.correct_option_index === undefined ||
        !data.options ||
        data.correct_option_index < 0 ||
        data.correct_option_index >= (data.options?.length ?? 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select the correct option",
          path: ["correct_option_index"],
        });
      }
    } else {
      if (!data.correct_answer || data.correct_answer.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter the correct answer",
          path: ["correct_answer"],
        });
      }
    }
  });

export type QuestionInput = z.infer<typeof questionSchema>;
