import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { requireDatabaseUrl, env } from "@/lib/env";

let prismaClient: PrismaClient | null = null;

export function getPrisma() {
  if (prismaClient) {
    return prismaClient;
  }

  requireDatabaseUrl();

  let adapter;
  try {
    const { env: cfEnv } = getCloudflareContext();
    const d1 = (cfEnv as unknown as { DB?: ConstructorParameters<typeof PrismaD1>[0] }).DB;
    if (d1) {
      adapter = new PrismaD1(d1);
    }
  } catch {
    // Not running in a Cloudflare Worker context. Fallback to default PrismaClient.
  }

  prismaClient = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });

  return prismaClient;
}

