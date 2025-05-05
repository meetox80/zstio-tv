import { PrismaClient } from "@/generated/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const Prisma = new PrismaClient()
  
  try {
    const WidgetData = await Prisma.widgetsdata.findUnique({
      where: {
        id: 1
      }
    })

    if (!WidgetData) {
      await Prisma.widgetsdata.create({
        data: {
          id: 1,
          widget_text: "Przypominamy, że obowiązuje całkowity zakaz opuszczania terenu szkoły podczas zajęć i przerw międzylekcyjnych."
        }
      })
      
      return NextResponse.json({
        widget_text: "Przypominamy, że obowiązuje całkowity zakaz opuszczania terenu szkoły podczas zajęć i przerw międzylekcyjnych."
      })
    }

    return NextResponse.json({
      widget_text: WidgetData.widget_text
    })
  } catch (Error) {
    console.error("Error fetching widget text:", Error)
    return NextResponse.json(
      { error: "Failed to fetch widget text" },
      { status: 500 }
    )
  } finally {
    await Prisma.$disconnect()
  }
}

export async function POST(Request: NextRequest) {
  const Prisma = new PrismaClient()
  
  try {
    const Data = await Request.json()
    const { widget_text } = Data

    if (!widget_text) {
      return NextResponse.json(
        { error: "Missing widget_text parameter" },
        { status: 400 }
      )
    }

    await Prisma.widgetsdata.upsert({
      where: { id: 1 },
      update: { widget_text },
      create: {
        id: 1,
        widget_text
      }
    })

    return NextResponse.json({ success: true })
  } catch (Error) {
    console.error("Error updating widget text:", Error)
    return NextResponse.json(
      { error: "Failed to fetch widget text" },
      { status: 500 }
    )
  } finally {
    await Prisma.$disconnect()
  }
} 