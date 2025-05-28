import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@/lib/prisma"
import { RequireAuth } from "@/lib/auth"


export async function GET() {
  try {
    const Slides = await Prisma.slide.findMany({
      orderBy: {
        CreatedAt: "asc"
      }
    })

    return NextResponse.json({ Slides })
  } catch (Error) {
    console.error("Error fetching slides:", Error)
    return NextResponse.json({ Error: "Failed to fetch slides" }, { status: 500 })
  }
}

export async function POST(Request: NextRequest) {
  try {
    const AuthCheck = await RequireAuth()
    if (!AuthCheck.authenticated) {
      return AuthCheck.response
    }
    
    const Data = await Request.json()
    const { Name, ImageData, Duration } = Data

    if (!Name || !ImageData) {
      return NextResponse.json({ Error: "Name and ImageData are required" }, { status: 400 })
    }

    const NewSlide = await Prisma.slide.create({
      data: {
        Name,
        ImageData,
        Duration: Duration || 5
      }
    })

    return NextResponse.json({ Slide: NewSlide })
  } catch (Error) {
    console.error("Error creating slide:", Error)
    return NextResponse.json({ Error: "Failed to create slide" }, { status: 500 })
  }
} 