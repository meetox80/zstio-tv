import { NextResponse } from "next/server";
import { Prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const CurrentDate = new Date();
    const DaysLabels = [];
    const DaysFormatted = [];

    for (let i = 4; i >= 0; i--) {
      const DateObj = new Date(CurrentDate);
      DateObj.setDate(CurrentDate.getDate() - i);

      const DisplayLabel = DateObj.toLocaleDateString("en-US", {
        weekday: "long",
      });
      DaysLabels.push(DisplayLabel);

      const Day = String(DateObj.getDate()).padStart(2, "0");
      const Month = String(DateObj.getMonth() + 1).padStart(2, "0");
      const Year = DateObj.getFullYear();
      const FormattedDate = `${Day}-${Month}-${Year}`;
      DaysFormatted.push(FormattedDate);
    }

    const StatRecords = await Prisma.statistics.findMany({
      where: {
        Date: {
          in: DaysFormatted,
        },
      },
    });

    const SpotifyPlaysValues = [];
    const SongRequestsValues = [];

    for (const DayFormatted of DaysFormatted) {
      const DayStats = StatRecords.find(
        (record) => record.Date === DayFormatted,
      );

      if (DayStats) {
        SpotifyPlaysValues.push(DayStats.SpotifyPlays);
        SongRequestsValues.push(DayStats.SongRequests);
      } else {
        SpotifyPlaysValues.push(0);
        SongRequestsValues.push(0);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        labels: DaysLabels,
        spotifyPlays: SpotifyPlaysValues,
        songRequests: SongRequestsValues,
      },
    });
  } catch (Error) {
    console.error("Error fetching statistics history:", Error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch statistics history",
      },
      { status: 500 },
    );
  }
}
