"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) redirect("/home");
  return supabase;
}

export type CollabInput = {
  author_id: string;
  kind: string;
  author: string;
  title: string;
  description: string;
  location: string;
  period_start: string;
  period_end: string;
  status: string;
};

function normalize(input: CollabInput) {
  return {
    author_id: input.author_id,
    kind: input.kind,
    author: input.author,
    title: input.title.trim(),
    description: input.description.trim(),
    location: input.location.trim() || null,
    period_start: input.period_start || null,
    period_end: input.period_end || null,
    status: input.status,
  };
}

export async function createCollab(input: CollabInput) {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("collabs")
    .insert(normalize(input))
    .select("id")
    .single();
  if (error) return { error: error.message, id: null };
  revalidatePath("/admin/collabs");
  return { error: null, id: data.id };
}

export async function updateCollab(id: string, input: CollabInput) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("collabs")
    .update(normalize(input))
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/collabs");
  revalidatePath(`/admin/collabs/${id}`);
  return { error: null };
}

export async function deleteCollab(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("collabs").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/collabs");
  redirect("/admin/collabs");
}
