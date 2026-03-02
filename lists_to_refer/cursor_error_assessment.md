You are a senior Next.js + Cloudflare production engineer.

Fix the project so that:

1. `next build` NEVER fails due to missing DATABASE_URL.
2. The root page "/" must not access the database during build time.
3. Prisma must only run at request time, never during static generation.
4. The fix must be minimal and production-safe.
5. Do NOT change unrelated files.
6. Do NOT remove database functionality.
7. Ensure compatibility with Cloudflare Workers deployment.

Perform the following steps carefully:

STEP 1 — Prevent prerendering of "/"
If app/page.tsx exists:
- Add at the top:
    export const dynamic = "force-dynamic";
- Ensure no top-level database calls execute during module load.

STEP 2 — Move database access out of build phase
- If Prisma is used directly inside page components,
  refactor so DB calls are:
    - either inside Route Handlers (app/api/*)
    - or inside async functions executed at request time
- Ensure there is NO DB access at module scope.

STEP 3 — Add safe environment guard
Create or update src/lib/env.ts with:

export function getEnv(name: string): string | undefined {
  return process.env[name];
}

export function requireEnvRuntime(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV !== "production") {
    console.warn(`${name} is not set (build phase safe mode).`);
  }
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`${name} is required.`);
  }
  return value!;
}

Do NOT cause build-time crashes.

STEP 4 — Ensure Prisma client is safe
If Prisma is instantiated globally, modify to:

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

Ensure no DB connection is attempted at import time if DATABASE_URL is missing during build.

STEP 5 — Verify build stability
After modifications:
- Ensure `npm run build` completes successfully.
- Do not introduce TypeScript errors.
- Do not downgrade Next.js version.

Finally:
Provide a concise summary of what was changed and why it fixes prerender DATABASE_URL errors.