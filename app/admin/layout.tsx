import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AdminNav from "./nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) redirect("/home");

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-4">
      <header className="sticky top-0 z-40 flex items-center justify-between px-5 py-3 bg-background border-b border-[#999f54]/30">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-text-1">COOC</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-[#999f54]/15 dark:bg-[#999f54]/25 text-[#4a4d22] dark:text-[#d4d8a8] border border-[#999f54]/25">
            admin
          </span>
        </Link>
        <Link href="/home" className="text-xs text-text-5 hover:text-text-3">
          앱으로
        </Link>
      </header>
      <div className="flex flex-1">
        <aside className="w-56 shrink-0 border-r border-[#999f54]/30">
          <AdminNav />
        </aside>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
