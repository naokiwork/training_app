import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, logoutByToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (token) {
    await logoutByToken(token);
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: AUTH_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
  return response;
}
