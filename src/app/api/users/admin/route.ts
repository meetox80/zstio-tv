import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const _Session = await getServerSession(authOptions);

    if (!_Session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (_Session.user.name !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const _Body = await req.json();
    
    if (!_Body.checkPassword || !_Body.password) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    
    const _AdminUser = await Prisma.user.findUnique({
      where: { name: "admin" },
    });
    
    if (!_AdminUser) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }
    
    const _PasswordMatch = await bcrypt.compare(
      _Body.password,
      _AdminUser.password || ""
    );
    
    return NextResponse.json({ isMatch: _PasswordMatch });
    
  } catch (_Error) {
    console.error("Error checking admin password:", _Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 