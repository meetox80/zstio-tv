import { NextResponse } from "next/server"
import { Prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const TestSlide = await Prisma.slide.create({
      data: {
        Name: "Test Slide",
        ImageData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        Duration: 5
      }
    })

    const AllSlides = await Prisma.slide.findMany()

    return NextResponse.json({ TestSlide, AllSlides })
  } catch (Error) {
    console.error("Error creating test slide:", Error)
    return NextResponse.json({ Error: "Failed to create test slide" }, { status: 500 })
  }
} 