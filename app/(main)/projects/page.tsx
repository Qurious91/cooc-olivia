"use client";

import { Suspense } from "react";
import ProjectsContent from "./content";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProjectsContent />
    </Suspense>
  );
}
