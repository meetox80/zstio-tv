import { NextResponse } from "next/server";
import { Prisma } from "../../../lib/prisma";
import { RequireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const AuthCheck = await RequireAuth();
    if (!AuthCheck.authenticated) {
      return AuthCheck.response;
    }

    let GlobalSettings;

    try {
      GlobalSettings = await Prisma.globalSettings.findUnique({
        where: { id: 1 },
      });
    } catch (Error) {
      console.error("Error finding global settings:", Error);
    }

    if (!GlobalSettings) {
      GlobalSettings = await Prisma.globalSettings.create({
        data: {
          id: 1,
          lessonTime: 45,
        },
      });
    }

    return NextResponse.json({
      lessonTime: GlobalSettings.lessonTime,
    });
  } catch (Error) {
    console.error("Error fetching global settings:", Error);
    return NextResponse.json(
      { error: "Failed to fetch global settings" },
      { status: 500 },
    );
  }
}
