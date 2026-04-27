import { Suspense } from "react";
import ArchiveContent from "./content";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ArchiveContent />
    </Suspense>
  );
}
