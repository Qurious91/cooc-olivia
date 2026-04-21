import { notFound } from "next/navigation";
import { ONGOING_DUMMY } from "../data";
import OngoingDetailContent from "./content";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = ONGOING_DUMMY.find((d) => d.id === id);
  if (!item) notFound();
  return <OngoingDetailContent item={item} />;
}
