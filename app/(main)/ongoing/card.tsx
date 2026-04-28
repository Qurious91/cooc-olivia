import PhotoCard from "../../_components/photo-card";
import type { OngoingItem } from "./data";

export function OngoingCard({
  item,
  className = "",
}: {
  item: OngoingItem;
  className?: string;
}) {
  return (
    <PhotoCard
      image={item.image}
      kind={item.kind}
      title={item.title}
      host={item.host}
      period={item.period}
      location={item.location}
      href={`/ongoing/${item.id}`}
      className={className}
    />
  );
}
