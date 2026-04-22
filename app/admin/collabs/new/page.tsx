import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CollabForm, { type KindOption, type ProfileOption } from "../collab-form";

export default async function NewCollabPage() {
  const supabase = await createClient();

  const [profilesRes, kindsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, name, affiliation")
      .order("name", { ascending: true }),
    supabase
      .from("collab_kinds")
      .select("key, label")
      .order("position", { ascending: true }),
  ]);

  const profiles = (profilesRes.data ?? []) as ProfileOption[];
  const kinds = (kindsRes.data ?? []) as KindOption[];

  return (
    <main className="px-8 py-8">
      <Link
        href="/admin/collabs"
        className="inline-flex items-center gap-1 text-xs text-text-5 hover:text-text-3 mb-5"
      >
        <ChevronLeft size={14} />
        협업 목록
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-1">새 협업</h1>
        <p className="mt-0.5 text-xs text-text-5">작성자를 지정해서 협업을 생성해요</p>
      </div>

      <div className="rounded-xl bg-surface border border-black/5 dark:border-white/5 p-6">
        <CollabForm
          mode="create"
          profiles={profiles}
          kinds={kinds}
          initial={{
            author_id: "",
            kind: "",
            author: "이름",
            title: "",
            description: "",
            location: "",
            period_start: "",
            period_end: "",
            status: "recruiting",
          }}
        />
      </div>
    </main>
  );
}
