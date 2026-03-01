import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Deprecated. Progression suggestions should use local data." },
    { status: 410 }
  );
}
