import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/prisma";
import { RequireAuth } from "@/lib/auth";
import { Permission } from "@/types/permissions";
import { HasPermission } from "@/lib/permissions";

export async function GET() {
  try {
    const Slides = await Prisma.slide.findMany({
      orderBy: {
        CreatedAt: "asc",
      },
    });

    return NextResponse.json({ Slides });
  } catch (Error) {
    console.error("Error fetching slides:", Error);
    return NextResponse.json(
      { error: "Failed to fetch slides" },
      { status: 500 },
    );
  }
}

export async function POST(Request: NextRequest) {
  try {
    const AuthCheck = await RequireAuth();
    if (!AuthCheck.authenticated) {
      return AuthCheck.response;
    }

    const Session = AuthCheck.session;
    if (!Session?.user?.name) {
      return NextResponse.json(
        { error: "User information not available" },
        { status: 401 },
      );
    }

    const User = await Prisma.user.findUnique({
      where: { name: Session.user.name as string },
    });

    if (!User) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const SlideEditPermission = 1 << 2; // SLIDES_EDIT permission value

    if (!HasPermission(User.permissions, SlideEditPermission)) {
      return NextResponse.json(
        { error: "Insufficient permissions to edit slides" },
        { status: 403 },
      );
    }

    const Data = await Request.json();
    const { Name, ImageData, Duration } = Data;

    if (!Name || !ImageData) {
      return NextResponse.json(
        { error: "Name and ImageData are required" },
        { status: 400 },
      );
    }

    const NewSlide = await Prisma.slide.create({
      data: {
        Name,
        ImageData,
        Duration: Duration || 5,
      },
    });

    return NextResponse.json({ Slide: NewSlide });
  } catch (Error) {
    console.error("Error creating slide:", Error);
    return NextResponse.json(
      { error: "Failed to create slide" },
      { status: 500 },
    );
  }
}
