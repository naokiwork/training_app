import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Deprecated. Volume analytics should use local data." },
    { status: 410 }
  );
}
