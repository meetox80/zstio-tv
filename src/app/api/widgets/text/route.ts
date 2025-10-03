import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Permission } from "@/types/permissions";
import { HasPermission } from "@/lib/permissions";
import { Prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const WidgetData = await Prisma.widgetsdata.findUnique({
      where: { id: 1 },
    });

    return NextResponse.json({
      widget_text:
        WidgetData?.widget_text ||
        "Przypominamy, że obowiązuje całkowity zakaz opuszczania terenu szkoły podczas zajęć i przerw międzylekcyjnych.",
    });
  } catch (Error) {
    return NextResponse.json(
      { error: "Failed to fetch widget text" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const Session = await getServerSession(authOptions);

  if (!Session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const UserPermissions = Session.user.permissions || 0;
  const CanEditWidgetText = HasPermission(
    UserPermissions,
    Permission.ADMINISTRATOR,
  );

  if (!CanEditWidgetText) {
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 },
    );
  }

  try {
    const Data = await request.json();
    const { widget_text } = Data;

    if (!widget_text || typeof widget_text !== "string") {
      return NextResponse.json(
        { error: "Widget text is required and must be a string" },
        { status: 400 },
      );
    }

    await Prisma.widgetsdata.upsert({
      where: { id: 1 },
      update: { widget_text },
      create: { id: 1, widget_text },
    });

    return NextResponse.json({ success: true, widget_text });
  } catch (Error) {
    return NextResponse.json(
      { error: "Failed to update widget text" },
      { status: 500 },
    );
  }
}
