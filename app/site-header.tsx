import Link from "next/link";
import HeaderActions from "./header-actions";

export default function SiteHeader() {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-[#999f54]/40 dark:border-[#999f54]/30">
      <Link href="/home" className="text-2xl font-bold tracking-tight text-text-1">COOC</Link>
      <HeaderActions />
    </header>
  );
}
