import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AdminMobileMenu from "./mobile-menu";
import AdminSearch from "./search";
import AdminSidebar from "./sidebar";

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
    <div className="min-h-[100dvh] flex flex-col bg-background text-text-4">
      <header className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 min-[1100px]:px-5 min-[1100px]:py-0 min-[1100px]:h-14 bg-background border-b border-[#999f54]/30">
        <Link href="/admin" className="shrink-0 flex items-center gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-text-1">COOC</span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#999f54]/15 dark:bg-[#999f54]/25 text-[#4a4d22] dark:text-[#d4d8a8] border border-[#999f54]/25">
            admin
          </span>
        </Link>
        <AdminSearch className="flex-1 min-w-0 max-w-xl min-[1100px]:ml-auto" />
        <div className="shrink-0 flex items-center gap-1 ml-auto">
          <Link href="/home" className="text-xs text-text-5 hover:text-text-3 py-1">
            앱으로
          </Link>
          <AdminMobileMenu />
        </div>
      </header>
      <div className="flex flex-1">
        <AdminSidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
