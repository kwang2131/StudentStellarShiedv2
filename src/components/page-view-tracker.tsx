"use client";

import { useEffect, useEffectEvent } from "react";
import { usePathname } from "next/navigation";

import { fetchJson } from "@/lib/client/fetch-json";

export function PageViewTracker() {
  const pathname = usePathname();

  const report = useEffectEvent(async (path: string) => {
    await fetchJson("/api/analytics", {
      body: JSON.stringify({
        eventName: "PAGE_VIEW",
        path,
      }),
      method: "POST",
    }).catch(() => undefined);

    if (path === "/submission") {
      await fetchJson("/api/analytics", {
        body: JSON.stringify({
          eventName: "SUBMISSION_PAGE_VIEWED",
          path,
        }),
        method: "POST",
      }).catch(() => undefined);
    }

    if (path.startsWith("/verify/")) {
      await fetchJson("/api/analytics", {
        body: JSON.stringify({
          eventName: "VERIFY_PAGE_VIEWED",
          path,
        }),
        method: "POST",
      }).catch(() => undefined);
    }
  });

  useEffect(() => {
    void report(pathname);
  }, [pathname]);

  return null;
}
