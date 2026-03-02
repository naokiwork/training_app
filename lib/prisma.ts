import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { requireDatabaseUrl } from "@/lib/env"; // env から直接参照しない

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  requireDatabaseUrl(); // DB アクセス直前でチェック

  let adapter: PrismaD1 | undefined;
  try {
    const { env: cfEnv } = getCloudflareContext();
    const d1 = (cfEnv as unknown as { DB?: ConstructorParameters<typeof PrismaD1>[0] }).DB;
    if (d1) {
      adapter = new PrismaD1(d1);
    }
  } catch (e) {
    // Cloudflare Worker 環境ではない場合や D1 バインディングがない場合
    console.warn("Not running in Cloudflare Worker with D1 binding, falling back to default PrismaClient.", e);
  }

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });
}

export function getPrisma() {
  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
  };

  return globalForPrisma.prisma ?? createPrismaClient();
}

if (process.env.NODE_ENV !== "production") {
  (globalThis as unknown as { prisma: PrismaClient | undefined }).prisma = getPrisma();
}

