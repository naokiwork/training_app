import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Billing API is currently disabled. Please use client-side features only." },
    { status: 410 }
  );
}