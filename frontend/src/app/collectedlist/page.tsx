import { Suspense } from "react";
import CollectedlistContent from "./collectedlistContent";
export default function Page() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <div>Content</div>
      <CollectedlistContent />
    </Suspense>
  );
}
