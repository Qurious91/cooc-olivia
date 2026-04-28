"use client";

import PhotoDetail, {
  type PhotoDetailItem,
  type PhotoDetailParticipant,
} from "../../../_components/photo-detail";

export type ArchiveParticipant = PhotoDetailParticipant;
export type ArchiveDetailItem = PhotoDetailItem;

export default function ArchiveDetailContent({ item }: { item: ArchiveDetailItem }) {
  return <PhotoDetail item={item} backHref="/archive" />;
}
