import { Suspense } from "react";
import ExploreContent from "./content";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ExploreContent />
    </Suspense>
  );
}
