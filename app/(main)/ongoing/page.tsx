import { Suspense } from "react";
import OngoingContent from "./content";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OngoingContent />
    </Suspense>
  );
}
