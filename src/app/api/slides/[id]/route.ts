import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@/lib/prisma"
import { RequireAuth } from "@/lib/auth"


export async function GET(Request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ParamsObject = await Promise.resolve(params)
    
    if (!ParamsObject || typeof ParamsObject.id !== 'string') {
      return NextResponse.json({ Error: "Invalid slide ID" }, { status: 400 })
    }
    
    const Id = ParamsObject.id
    const Slide = await Prisma.slide.findUnique({
      where: { Id }
    })

    if (!Slide) {
      return NextResponse.json({ Error: "Slide not found" }, { status: 404 })
    }

    return NextResponse.json({ Slide })
  } catch (Error) {
    console.error("Error fetching slide:", Error)
    return NextResponse.json({ Error: "Failed to fetch slide" }, { status: 500 })
  }
}

export async function PUT(Request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const AuthCheck = await RequireAuth()
    if (!AuthCheck.authenticated) {
      return AuthCheck.response
    }
    
    const ParamsObject = await Promise.resolve(params)
    
    if (!ParamsObject || typeof ParamsObject.id !== 'string') {
      return NextResponse.json({ Error: "Invalid slide ID" }, { status: 400 })
    }
    
    const Id = ParamsObject.id
    const Data = await Request.json()
    const { Name, ImageData, Duration } = Data

    const UpdatedSlide = await Prisma.slide.update({
      where: { Id },
      data: {
        Name: Name,
        ImageData: ImageData,
        Duration: Duration
      }
    })

    return NextResponse.json({ Slide: UpdatedSlide })
  } catch (Error) {
    console.error("Error updating slide:", Error)
    return NextResponse.json({ Error: "Failed to update slide" }, { status: 500 })
  }
}

export async function DELETE(Request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const AuthCheck = await RequireAuth()
    if (!AuthCheck.authenticated) {
      return AuthCheck.response
    }
    
    const ParamsObject = await Promise.resolve(params)
    
    if (!ParamsObject || typeof ParamsObject.id !== 'string') {
      return NextResponse.json({ Error: "Invalid slide ID" }, { status: 400 })
    }
    
    const Id = ParamsObject.id
    
    try {
      await Prisma.slide.delete({
        where: { Id }
      })
      
      return NextResponse.json({ Success: true })
    } catch (DeleteError: any) {
      if (DeleteError.code === 'P2025') {
        return NextResponse.json({ Error: "Slide not found" }, { status: 404 })
      }
      throw DeleteError
    }
  } catch (Error) {
    console.error("Error deleting slide:", Error)
    return NextResponse.json({ Error: "Failed to delete slide" }, { status: 500 })
  }
} 