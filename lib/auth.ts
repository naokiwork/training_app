import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { env } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";

const AUTH_COOKIE = "ta_session";
const AUTH_DAYS = 30;

// ✅ import 時に評価しない。必要な時にだけ確認する
function assertDbUrl() {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }
}

function hashPassword(password: string, salt?: string) {
  const usedSalt = salt ?? randomBytes(16).toString("hex");
  const derived = scryptSync(password, usedSalt, 64).toString("hex");
  return `${usedSalt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const input = scryptSync(password, salt, 64).toString("hex");
  return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(input, "hex"));
}

function createSessionToken() {
  return randomUUID().replace(/-/g, "") + randomBytes(16).toString("hex");
}

export async function registerUser(email: string, password: string) {
  assertDbUrl();
  const normalized = email.trim().toLowerCase();
  const passwordHash = hashPassword(password);
  return getPrisma().user.create({
    data: { email: normalized, passwordHash },
    select: { id: true, email: true },
  });
}

export async function loginUser(email: string, password: string) {
  assertDbUrl();
  const normalized = email.trim().toLowerCase();
  const user = await getPrisma().user.findUnique({ where: { email: normalized } });
  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;
  await getPrisma().authSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });

  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + AUTH_DAYS * 24 * 60 * 60 * 1000);
  await getPrisma().authSession.create({
    data: { userId: user.id, token, expiresAt },
  });
  return { user: { id: user.id, email: user.email }, token, expiresAt };
}

export async function getUserIdFromRequest(request: NextRequest) {
  assertDbUrl();
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  const session = await getPrisma().authSession.findUnique({
    where: { token },
    select: { userId: true, expiresAt: true },
  });
  if (!session) return null;
  if (session!.expiresAt.getTime() < Date.now()) {
    await getPrisma().authSession.delete({ where: { token } }).catch(() => {});
    return null;
  }
  return session.userId;
}

export async function getUserIdFromCookieStore() {
  assertDbUrl();
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  const session = await getPrisma().authSession.findUnique({
    where: { token },
    select: { userId: true, expiresAt: true },
  });
  if (!session) return null;
  if (session!.expiresAt.getTime() < Date.now()) {
    await getPrisma().authSession.delete({ where: { token } }).catch(() => {});
    return null;
  }
  return session.userId;
}

export async function logoutByToken(token: string) {
  assertDbUrl();
  await getPrisma().authSession.deleteMany({ where: { token } });
}

export { AUTH_COOKIE };
