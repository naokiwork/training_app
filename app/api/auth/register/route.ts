import { NextRequest, NextResponse } from "next/server";
import { allowRequest, getRateLimitKeyFromRequestLike } from "@/lib/rate-limit";
import { registerUser } from "@/lib/auth";
import { AuthSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    const key = `auth-register:${getRateLimitKeyFromRequestLike(request)}`;
    if (!allowRequest(key, 20, 60_000)) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    const parsed = AuthSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    const user = await registerUser(parsed.data.email, parsed.data.password);
    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
