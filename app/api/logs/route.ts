import { NextResponse } from "next/server";

function deprecated() {
  return NextResponse.json(
    { error: "Deprecated. Workout logs are now local-first (IndexedDB)." },
    { status: 410 }
  );
}

export async function POST() {
  return deprecated();
}

export async function GET() {
  return deprecated();
}
