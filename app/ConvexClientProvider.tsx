"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

// The ConvexReactClient constructor throws on an empty URL, which crashes
// `next build` while prerendering pages (e.g. /_not-found) before env vars are
// configured. We must still mount <ConvexProvider> unconditionally because the
// component tree calls useMutation/useQuery, which require it. So fall back to a
// syntactically valid placeholder URL when NEXT_PUBLIC_CONVEX_URL is missing:
// the build succeeds, and at runtime a real URL takes over (with a clear
// console error if it's still unset).
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl && typeof window !== "undefined") {
  console.error(
    "NEXT_PUBLIC_CONVEX_URL is not set. Copy .env.example to .env.local and fill it in, then run `npx convex dev`."
  );
}

const convex = new ConvexReactClient(
  convexUrl || "https://placeholder.convex.cloud"
);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
