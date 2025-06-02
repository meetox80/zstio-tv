import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@/lib/prisma"
import { RequireAuth } from "@/lib/auth"
import { HasPermission } from "@/lib/permissions"

export async function GET(Request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const AuthCheck = await RequireAuth()
    if (!AuthCheck.authenticated) {
      return AuthCheck.response
    }
    
    const Session = AuthCheck.session
    if (!Session?.user?.name) {
      return NextResponse.json({ error: 'User information not available' }, { status: 401 })
    }
    
    const User = await Prisma.user.findUnique({
      where: { name: Session.user.name as string }
    })
    
    if (!User) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const SlideViewPermission = 1 << 1  // SLIDES_VIEW permission value
    
    if (!HasPermission(User.permissions, SlideViewPermission)) {
      return NextResponse.json({ error: 'Insufficient permissions to view slides' }, { status: 403 })
    }
    
    const ParamsObject = await Promise.resolve(params)
    
    if (!ParamsObject || typeof ParamsObject.id !== 'string') {
      return NextResponse.json({ error: "Invalid slide ID" }, { status: 400 })
    }
    
    const Id = ParamsObject.id
    const Slide = await Prisma.slide.findUnique({
      where: { Id }
    })

    if (!Slide) {
      return NextResponse.json({ error: "Slide not found" }, { status: 404 })
    }

    return NextResponse.json({ Slide })
  } catch (Error) {
    console.error("Error fetching slide:", Error)
    return NextResponse.json({ error: "Failed to fetch slide" }, { status: 500 })
  }
}

export async function PUT(Request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const AuthCheck = await RequireAuth()
    if (!AuthCheck.authenticated) {
      return AuthCheck.response
    }
    
    const Session = AuthCheck.session
    if (!Session?.user?.name) {
      return NextResponse.json({ error: 'User information not available' }, { status: 401 })
    }
    
    const User = await Prisma.user.findUnique({
      where: { name: Session.user.name as string }
    })
    
    if (!User) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const SlideEditPermission = 1 << 2  // SLIDES_EDIT permission value
    
    if (!HasPermission(User.permissions, SlideEditPermission)) {
      return NextResponse.json({ error: 'Insufficient permissions to edit slides' }, { status: 403 })
    }
    
    const ParamsObject = await Promise.resolve(params)
    
    if (!ParamsObject || typeof ParamsObject.id !== 'string') {
      return NextResponse.json({ error: "Invalid slide ID" }, { status: 400 })
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
    return NextResponse.json({ error: "Failed to update slide" }, { status: 500 })
  }
}

export async function DELETE(Request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const AuthCheck = await RequireAuth()
    if (!AuthCheck.authenticated) {
      return AuthCheck.response
    }
    
    const Session = AuthCheck.session
    if (!Session?.user?.name) {
      return NextResponse.json({ error: 'User information not available' }, { status: 401 })
    }
    
    const User = await Prisma.user.findUnique({
      where: { name: Session.user.name as string }
    })
    
    if (!User) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const SlideEditPermission = 1 << 2  // SLIDES_EDIT permission value
    
    if (!HasPermission(User.permissions, SlideEditPermission)) {
      return NextResponse.json({ error: 'Insufficient permissions to edit slides' }, { status: 403 })
    }
    
    const ParamsObject = await Promise.resolve(params)
    
    if (!ParamsObject || typeof ParamsObject.id !== 'string') {
      return NextResponse.json({ error: "Invalid slide ID" }, { status: 400 })
    }
    
    const Id = ParamsObject.id
    
    try {
      await Prisma.slide.delete({
        where: { Id }
      })
      
      return NextResponse.json({ success: true })
    } catch (DeleteError: any) {
      if (DeleteError.code === 'P2025') {
        return NextResponse.json({ error: "Slide not found" }, { status: 404 })
      }
      throw DeleteError
    }
  } catch (Error) {
    console.error("Error deleting slide:", Error)
    return NextResponse.json({ error: "Failed to delete slide" }, { status: 500 })
  }
} 