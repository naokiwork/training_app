import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    { error: "Auth API is currently disabled. Please use client-side features only." },
    { status: 410 }
  );
}