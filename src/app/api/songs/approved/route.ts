import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(Request: NextRequest) {
  try {
    const Session = await getServerSession(authOptions);

    if (!Session || !Session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const PageParam = Request.nextUrl.searchParams.get("page");
    const LimitParam = Request.nextUrl.searchParams.get("limit");

    const Page = PageParam ? parseInt(PageParam, 10) : 1;
    const Limit = LimitParam ? parseInt(LimitParam, 10) : 10;
    const Skip = (Page - 1) * Limit;

    const ApprovedSongs = await Prisma.approvedSong.findMany({
      take: Limit,
      skip: Skip,
      orderBy: {
        CreatedAt: "desc",
      },
    });

    const Total = await Prisma.approvedSong.count();

    return NextResponse.json({
      songs: ApprovedSongs,
      pagination: {
        total: Total,
        page: Page,
        limit: Limit,
        pages: Math.ceil(Total / Limit),
      },
    });
  } catch (Error) {
    console.error("Error fetching approved songs:", Error);
    return NextResponse.json(
      { error: "Failed to fetch approved songs" },
      { status: 500 },
    );
  }
}
