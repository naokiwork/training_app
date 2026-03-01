import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Deprecated. Contributions are now computed locally." },
    { status: 410 }
  );
}
