"use client";

import PhotoDetail from "../../../_components/photo-detail";
import { type OngoingItem } from "../data";

export default function OngoingDetailContent({ item }: { item: OngoingItem }) {
  return (
    <PhotoDetail
      item={{
        id: item.id,
        kind: item.kind,
        title: item.title,
        host: item.host,
        hostId: null,
        period: item.period,
        location: item.location,
        desc: item.desc,
        images: [item.image],
        participants: [],
      }}
      backHref="/ongoing"
    />
  );
}
