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

    const AllApprovedSongs = await Prisma.approvedSong.findMany({});

    const SongsWithVoteCount = AllApprovedSongs.map((Song) => ({
      ...Song,
      VoteCount: Song.Upvotes - Song.Downvotes,
    }));

    SongsWithVoteCount.sort((a, b) => b.VoteCount - a.VoteCount);

    const PaginatedSongs = SongsWithVoteCount.slice(Skip, Skip + Limit);

    const Total = AllApprovedSongs.length;

    return NextResponse.json({
      songs: PaginatedSongs,
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
