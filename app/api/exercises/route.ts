import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Exercise API is currently disabled. Please use client-side features only." },
    { status: 410 }
  );
}