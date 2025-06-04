import { NextRequest, NextResponse } from "next/server";
import { Permission } from "@/types/permissions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@/lib/prisma";
import { HasPermission } from "@/lib/permissions";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

    if (
      !_CurrentUser ||
      !HasPermission(_CurrentUser.permissions, Permission.USERS_VIEW)
    ) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const _User = await Prisma.user.findUnique({
      where: { id: _ParamsId },
      select: {
        id: true,
        name: true,
        permissions: true,
        createdAt: true,
      },
    });

    if (!_User) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(_User);
  } catch (_Error) {
    console.error("Error fetching user:", _Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

    if (
      !_CurrentUser ||
      !HasPermission(_CurrentUser.permissions, Permission.USERS_MANAGE)
    ) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const _TargetUser = await Prisma.user.findUnique({
      where: { id: _ParamsId },
    });

    if (!_TargetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Protect the admin user from being modified
    if (_TargetUser.name === "admin") {
      return NextResponse.json(
        { error: "Cannot modify system admin user" },
        { status: 403 },
      );
    }

    const _Body = await req.json();
    const _UpdateData: any = {};

    if (_Body.name !== undefined) {
      if (typeof _Body.name !== "string" || _Body.name.trim() === "") {
        return NextResponse.json({ error: "Invalid name" }, { status: 400 });
      }

      // Prevent renaming to 'admin'
      if (_Body.name.toLowerCase() === "admin") {
        return NextResponse.json(
          { error: "Cannot use reserved username" },
          { status: 400 },
        );
      }

      const _ExistingUser = await Prisma.user.findUnique({
        where: { name: _Body.name },
      });

      if (_ExistingUser && _ExistingUser.id !== _ParamsId) {
        return NextResponse.json(
          { error: "User with this name already exists" },
          { status: 409 },
        );
      }

      _UpdateData.name = _Body.name;
    }

    if (_Body.permissions !== undefined) {
      if (typeof _Body.permissions !== "number") {
        return NextResponse.json(
          { error: "Invalid permissions" },
          { status: 400 },
        );
      }

      _UpdateData.permissions = _Body.permissions;
    }

    if (Object.keys(_UpdateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const _UpdatedUser = await Prisma.user.update({
      where: { id: _ParamsId },
      data: _UpdateData,
      select: {
        id: true,
        name: true,
        permissions: true,
        createdAt: true,
      },
    });

    return NextResponse.json(_UpdatedUser);
  } catch (_Error) {
    console.error("Error updating user:", _Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

    if (
      !_CurrentUser ||
      !HasPermission(_CurrentUser.permissions, Permission.USERS_MANAGE)
    ) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const _User = await Prisma.user.findUnique({
      where: { id: _ParamsId },
    });

    if (!_User) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Protect the admin user from being deleted
    if (_User.name === "admin") {
      return NextResponse.json(
        { error: "Cannot delete system admin user" },
        { status: 403 },
      );
    }

    await Prisma.user.delete({
      where: { id: _ParamsId },
    });

    return NextResponse.json({ success: true });
  } catch (_Error) {
    console.error("Error deleting user:", _Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
