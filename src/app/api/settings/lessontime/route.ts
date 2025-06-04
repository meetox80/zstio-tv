import { NextResponse } from "next/server";
import { Prisma } from "../../../../lib/prisma";
import { RequireAuth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const AuthCheck = await RequireAuth();
    if (!AuthCheck.authenticated) {
      return AuthCheck.response;
    }

    if (!AuthCheck.session?.user) {
      return NextResponse.json(
        { error: "User not found in session" },
        { status: 401 },
      );
    }

    let CurrentUser;
    if (AuthCheck.session.user.id) {
      CurrentUser = await Prisma.user.findUnique({
        where: { id: AuthCheck.session.user.id },
      });
    } else if (AuthCheck.session.user.name) {
      CurrentUser = await Prisma.user.findUnique({
        where: { name: AuthCheck.session.user.name },
      });
    }

    if (!CurrentUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 },
      );
    }

    const UserPermissions =
      CurrentUser.name === "admin" ? 0x7fffffff : CurrentUser.permissions;
    const CanEditClassTimes =
      CurrentUser.name === "admin" || (UserPermissions & 64) === 64;

    if (!CanEditClassTimes) {
      return NextResponse.json(
        { error: "Insufficient permissions to edit lesson times" },
        { status: 403 },
      );
    }

    const Body = await request.json();
    const { lessonTime } = Body;

    if (![30, 45].includes(lessonTime)) {
      return NextResponse.json(
        { error: "Invalid lesson time provided" },
        { status: 400 },
      );
    }

    try {
      const UpdatedSettings = await Prisma.globalSettings.update({
        where: { id: 1 },
        data: { lessonTime },
      });

      return NextResponse.json({
        success: true,
        lessonTime: UpdatedSettings.lessonTime,
      });
    } catch (UpdateError: any) {
      if (UpdateError.code === "P2025") {
        const NewSettings = await Prisma.globalSettings.create({
          data: {
            id: 1,
            lessonTime,
          },
        });

        return NextResponse.json({
          success: true,
          lessonTime: NewSettings.lessonTime,
        });
      }

      return NextResponse.json(
        { error: "Failed to update settings" },
        { status: 500 },
      );
    }
  } catch (Error) {
    return NextResponse.json(
      { error: "Failed to save lesson time" },
      { status: 500 },
    );
  }
}
