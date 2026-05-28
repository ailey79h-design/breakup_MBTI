import { Suspense } from "react";

import { ExploreApp } from "@/components/explore/ExploreApp";

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <p className="text-center text-sm text-rose-400 py-20">불러오는 중…</p>
      }
    >
      <ExploreApp />
    </Suspense>
  );
}
