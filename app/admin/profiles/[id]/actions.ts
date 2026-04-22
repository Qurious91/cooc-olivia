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

export type UpdateProfileInput = {
  id: string;
  name: string;
  role: string;
  affiliation: string;
  job_title: string;
  region: string;
  status: string;
  is_admin: boolean;
  keywords: string[];
};

export async function updateProfile(input: UpdateProfileInput) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("profiles")
    .update({
      name: input.name.trim() || null,
      role: input.role.trim() || null,
      affiliation: input.affiliation.trim() || null,
      job_title: input.job_title.trim() || null,
      region: input.region.trim() || null,
      status: input.status || null,
      is_admin: input.is_admin,
      keywords: input.keywords,
    })
    .eq("id", input.id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath(`/admin/profiles/${input.id}`);
  return { error: null };
}

export async function deleteProfile(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("profiles").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  redirect("/admin");
}
