"use client";

import { useRouter } from "next/navigation";

export default function ProfileRow({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <tr
      onClick={() => router.push(`/admin/profiles/${id}`)}
      className="cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
    >
      {children}
    </tr>
  );
}
