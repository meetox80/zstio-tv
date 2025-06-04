import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/prisma";
import { RequireAuth } from "@/lib/auth";
import { HasPermission } from "@/lib/permissions";

const _PERMISSION_SLIDE_VIEW = 1 << 1;
const _PERMISSION_SLIDE_EDIT = 1 << 2;

export async function GET(
  Request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const _AuthResult = await RequireAuth();
    if (!_AuthResult.authenticated) {
      if (!_AuthResult.response)
        return NextResponse.json(
          { Error: "Authentication failed" },
          { status: 500 },
        );
      return _AuthResult.response;
    }

    const _Session = _AuthResult.session;
    if (!_Session?.user?.name)
      return NextResponse.json(
        { Error: "User data unavailable" },
        { status: 401 },
      );

    const _User = await Prisma.user.findUnique({
      where: { name: _Session.user.name },
    });
    if (!_User)
      return NextResponse.json({ Error: "User not found" }, { status: 404 });

    if (!HasPermission(_User.permissions, _PERMISSION_SLIDE_VIEW))
      return NextResponse.json(
        { Error: "Insufficient permissions" },
        { status: 403 },
      );

    const _Slide = await Prisma.slide.findUnique({ where: { Id: id } });
    if (!_Slide)
      return NextResponse.json({ Error: "Slide not found" }, { status: 404 });

    return NextResponse.json({ Slide: _Slide });
  } catch (Error) {
    console.error("Fetch error:", Error);
    return NextResponse.json(
      { Error: "Slide retrieval failed" },
      { status: 500 },
    );
  }
}

export async function PUT(
  Request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const _AuthResult = await RequireAuth();
    if (!_AuthResult.authenticated) {
      if (!_AuthResult.response)
        return NextResponse.json(
          { Error: "Authentication failed" },
          { status: 500 },
        );
      return _AuthResult.response;
    }

    const _Session = _AuthResult.session;
    if (!_Session?.user?.name)
      return NextResponse.json(
        { Error: "User data unavailable" },
        { status: 401 },
      );

    const _User = await Prisma.user.findUnique({
      where: { name: _Session.user.name },
    });
    if (!_User)
      return NextResponse.json({ Error: "User not found" }, { status: 404 });

    if (!HasPermission(_User.permissions, _PERMISSION_SLIDE_EDIT))
      return NextResponse.json(
        { Error: "Insufficient permissions" },
        { status: 403 },
      );

    const _UpdateData = await Request.json();

    const _UpdatedSlide = await Prisma.slide.update({
      where: { Id: id },
      data: {
        Name: _UpdateData.Name,
        ImageData: _UpdateData.ImageData,
        Duration: _UpdateData.Duration,
      },
    });

    return NextResponse.json({ Slide: _UpdatedSlide });
  } catch (Error) {
    console.error("Update error:", Error);
    return NextResponse.json({ Error: "Slide update failed" }, { status: 500 });
  }
}

export async function DELETE(
  Request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const _AuthResult = await RequireAuth();
    if (!_AuthResult.authenticated) {
      if (!_AuthResult.response)
        return NextResponse.json(
          { Error: "Authentication failed" },
          { status: 500 },
        );
      return _AuthResult.response;
    }

    const _Session = _AuthResult.session;
    if (!_Session?.user?.name)
      return NextResponse.json(
        { Error: "User data unavailable" },
        { status: 401 },
      );

    const _User = await Prisma.user.findUnique({
      where: { name: _Session.user.name },
    });
    if (!_User)
      return NextResponse.json({ Error: "User not found" }, { status: 404 });

    if (!HasPermission(_User.permissions, _PERMISSION_SLIDE_EDIT))
      return NextResponse.json(
        { Error: "Insufficient permissions" },
        { status: 403 },
      );

    try {
      await Prisma.slide.delete({ where: { Id: id } });
      return NextResponse.json({ Success: true });
    } catch (DeleteError) {
      if ((DeleteError as any).code === "P2025") {
        return NextResponse.json({ Error: "Slide not found" }, { status: 404 });
      }
      throw DeleteError;
    }
  } catch (Error) {
    console.error("Deletion error:", Error);
    return NextResponse.json(
      { Error: "Slide deletion failed" },
      { status: 500 },
    );
  }
}
