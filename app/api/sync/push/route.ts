import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Deferred. Cross-device sync is not included in local-first Phase 1." },
    { status: 410 }
  );
}
