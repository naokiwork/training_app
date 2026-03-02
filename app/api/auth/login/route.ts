import { NextRequest, NextResponse } from "next/server";
import { allowRequest, getRateLimitKeyFromRequestLike } from "@/lib/rate-limit";
import { AuthSchema } from "@/lib/schemas";

// これを明示（Prisma を使うなら Node.js 前提）
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const key = `auth-login:${getRateLimitKeyFromRequestLike(request)}`;
    if (!allowRequest(key, 30, 60_000)) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    const parsed = AuthSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    // ✅ 重要：ここで初めて読み込む（ビルド時 import を避ける）
    const { AUTH_COOKIE, loginUser } = await import("@/lib/auth");

    const result = await loginUser(parsed.data.email, parsed.data.password);
    if (!result) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const response = NextResponse.json({ id: result.user.id, email: result.user.email });
    response.cookies.set({
      name: AUTH_COOKIE,
      value: result.token,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      expires: result.expiresAt,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
