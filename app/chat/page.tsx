import { Suspense } from "react";
import ChatContent from "./content";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ChatContent />
    </Suspense>
  );
}
