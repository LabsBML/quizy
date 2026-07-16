"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { quizSchema } from "@/lib/validations/quiz";
import type { ActionResult } from "@/lib/actions/batches";

export async function createQuiz(formData: FormData): Promise<ActionResult & { id?: string }> {
  const parsed = quizSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    batch_id: formData.get("batch_id"),
    duration_minutes: formData.get("duration_minutes"),
    published: formData.get("published") === "on",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quizzes")
    .insert({
      title: parsed.data.title,
      description: parsed.data.description || null,
      batch_id: parsed.data.batch_id,
      duration_minutes: parsed.data.duration_minutes,
      published: parsed.data.published,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/quizzes");
  return { success: true, id: data.id };
}

export async function updateQuiz(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = quizSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    batch_id: formData.get("batch_id"),
    duration_minutes: formData.get("duration_minutes"),
    published: formData.get("published") === "on",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("quizzes")
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
      batch_id: parsed.data.batch_id,
      duration_minutes: parsed.data.duration_minutes,
      published: parsed.data.published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/quizzes");
  revalidatePath(`/admin/quizzes/${id}`);
  return { success: true };
}

export async function togglePublish(id: string, published: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("quizzes")
    .update({ published, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/quizzes");
  revalidatePath(`/admin/quizzes/${id}`);
  return { success: true };
}

export async function deleteQuiz(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("quizzes").delete().eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/quizzes");
  return { success: true };
}
