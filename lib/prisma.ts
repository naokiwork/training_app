import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  try {
    const { env } = getCloudflareContext();
    const d1 = (env as unknown as { DB?: ConstructorParameters<typeof PrismaD1>[0] }).DB;
    if (d1) {
      const adapter = new PrismaD1(d1);
      return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
      });
    }
  } catch {
    // Not running in a Cloudflare Worker context.
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

export function prismaFromCloudflareBinding() {
  const { env } = getCloudflareContext();
  const d1 = (env as unknown as { DB: ConstructorParameters<typeof PrismaD1>[0] }).DB;
  const adapter = new PrismaD1(d1);
  return new PrismaClient({ adapter });
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
