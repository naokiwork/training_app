import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search") ?? "";
  const category = request.nextUrl.searchParams.get("category") ?? "";

  const exercises = await getPrisma().exercise.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search } },
                { purpose: { contains: search } },
              ],
            }
          : {},
        category ? { category } : {},
      ],
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      category: true,
    },
  });

  return NextResponse.json(exercises);
}
