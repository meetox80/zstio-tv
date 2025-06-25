import { NextRequest, NextResponse } from "next/server";
import { Permission } from "@/types/permissions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@/lib/prisma";
import { HasPermission } from "@/lib/permissions";
import bcrypt from "bcrypt";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return handlePasswordUpdate(req, params);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return handlePasswordUpdate(req, params);
}

async function handlePasswordUpdate(
  req: NextRequest,
  params: Promise<{ id: string }>,
) {
  try {
    const { id: _ParamsId } = await params;
    const _Session = await getServerSession(authOptions);

    if (!_Session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const _CurrentUser = await Prisma.user.findUnique({
      where: { name: _Session.user.name as string },
    });

    const _TargetUser = await Prisma.user.findUnique({
      where: { id: _ParamsId },
    });

    if (!_TargetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const _IsSelfUpdate = _CurrentUser?.id === _TargetUser.id;
    const _HasAdminPermission = _CurrentUser && HasPermission(_CurrentUser.permissions, Permission.USERS_MANAGE);
    
    if (!_IsSelfUpdate && !_HasAdminPermission) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }


    if (_TargetUser.name === "admin" && _CurrentUser?.name !== "admin") {
      return NextResponse.json(
        { error: "Cannot modify system admin user" },
        { status: 403 },
      );
    }

    const _Body = await req.json();

    if (
      !_Body.password ||
      typeof _Body.password !== "string" ||
      _Body.password.trim() === ""
    ) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );
    }

    if (_Body.password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 },
      );
    }

    const _HashedPassword = await bcrypt.hash(_Body.password, 12);

    await Prisma.user.update({
      where: { id: _ParamsId },
      data: { password: _HashedPassword },
    });

    return NextResponse.json({ success: true });
  } catch (_Error) {
    console.error("Error updating password:", _Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
