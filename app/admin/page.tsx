import { Handshake, User, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [profileCount, collabCount] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("collabs").select("id", { count: "exact", head: true }),
  ]);

  return (
    <main className="px-4 py-6 min-[1100px]:px-8 min-[1100px]:py-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-text-1">대시보드</h1>
        <p className="mt-0.5 text-xs text-text-5">현재 데이터 요약</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <StatCard
          href="/admin/profiles"
          label="유저"
          value={profileCount.count ?? 0}
          Icon={User}
        />
        <StatCard
          href="/admin/collabs"
          label="협업"
          value={collabCount.count ?? 0}
          Icon={Handshake}
        />
      </div>
    </main>
  );
}

function StatCard({
  href,
  label,
  value,
  Icon,
}: {
  href: string;
  label: string;
  value: number;
  Icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl bg-surface border border-black/5 dark:border-white/5 p-5 hover:border-[#999f54]/40 transition-colors"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-5">{label}</span>
        <Icon size={16} className="text-text-6 group-hover:text-[#999f54]" strokeWidth={1.75} />
      </div>
      <div className="mt-2 text-3xl font-bold text-text-1 tabular-nums">
        {value.toLocaleString("ko-KR")}
      </div>
    </Link>
  );
}
