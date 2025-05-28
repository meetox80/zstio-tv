import { NextResponse } from 'next/server';
import { Prisma } from '../../../../lib/prisma';
import { RequireAuth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const AuthCheck = await RequireAuth();
    if (!AuthCheck.authenticated) {
      return AuthCheck.response;
    }
    
    const Body = await request.json();
    const { lessonTime } = Body;
    
    if (![30, 45].includes(lessonTime)) {
      return NextResponse.json(
        { error: 'Invalid lesson time provided' },
        { status: 400 }
      );
    }
    
    try {
      const UpdatedSettings = await Prisma.globalSettings.update({
        where: { id: 1 },
        data: { lessonTime }
      });
      
      return NextResponse.json({ 
        success: true, 
        lessonTime: UpdatedSettings.lessonTime 
      });
    } catch (Error) {
      if ((Error as any).code === 'P2025') {
        const NewSettings = await Prisma.globalSettings.create({
          data: {
            id: 1,
            lessonTime
          }
        });
        
        return NextResponse.json({ 
          success: true, 
          lessonTime: NewSettings.lessonTime 
        });
      }
      throw Error;
    }
  } catch (Error) {
    console.error('Error saving lesson time:', Error);
    return NextResponse.json(
      { error: 'Failed to save lesson time' },
      { status: 500 }
    );
  }
}