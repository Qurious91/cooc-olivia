import PhotoCard from "../../_components/photo-card";
import type { ArchiveItem } from "./data";

export function ArchiveCard({
  item,
  className = "",
  imageClassName = "aspect-[4/3]",
}: {
  item: ArchiveItem;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <PhotoCard
      image={item.image}
      kind={item.kind}
      title={item.title}
      host={item.host}
      period={item.period}
      location={item.location}
      href={`/archive/${item.id}`}
      className={className}
      imageClassName={imageClassName}
    />
  );
}
