import { NextResponse } from 'next/server'
import { Prisma } from '@/lib/prisma'
import { RequireAuth } from '@/lib/auth'
import { HasPermission } from '@/lib/permissions'
import { Permission } from '@/app/dashboard/components/UsersTab'

export async function GET() {
  try {
    const AuthCheck = await RequireAuth()
    if (!AuthCheck.authenticated || !AuthCheck.session?.user?.name) {
      return NextResponse.json({ 
        error: 'Authentication required',
        session: AuthCheck.session 
      }, { status: 401 })
    }

    // Get user from session
    const SessionUser = {
      name: AuthCheck.session.user.name,
      permissions: AuthCheck.session.user.permissions,
    }

    // Get fresh user data from database
    const DbUser = await Prisma.user.findUnique({
      where: { name: AuthCheck.session.user.name as string }
    })

    if (!DbUser) {
      return NextResponse.json({ 
        error: 'User not found in database',
        sessionUser: SessionUser
      }, { status: 404 })
    }

    // Check all permissions
    const PermissionsCheck = {
      DASHBOARD_ACCESS: HasPermission(DbUser.permissions, Permission.DASHBOARD_ACCESS),
      SLIDES_VIEW: HasPermission(DbUser.permissions, Permission.SLIDES_VIEW),
      SLIDES_EDIT: HasPermission(DbUser.permissions, Permission.SLIDES_EDIT),
      SONG_REQUESTS_VIEW: HasPermission(DbUser.permissions, Permission.SONG_REQUESTS_VIEW),
      SONG_REQUESTS_MANAGE: HasPermission(DbUser.permissions, Permission.SONG_REQUESTS_MANAGE),
      CLASS_TIMES_VIEW: HasPermission(DbUser.permissions, Permission.CLASS_TIMES_VIEW),
      CLASS_TIMES_EDIT: HasPermission(DbUser.permissions, Permission.CLASS_TIMES_EDIT),
      USERS_VIEW: HasPermission(DbUser.permissions, Permission.USERS_VIEW),
      USERS_MANAGE: HasPermission(DbUser.permissions, Permission.USERS_MANAGE),
      SETTINGS_VIEW: HasPermission(DbUser.permissions, Permission.SETTINGS_VIEW),
      SETTINGS_EDIT: HasPermission(DbUser.permissions, Permission.SETTINGS_EDIT)
    }

    // Run raw tests on number values to verify permission logic
    const TestValue = DbUser.permissions
    const RawTests = {
      permissionValue: TestValue,
      binaryString: TestValue.toString(2).padStart(16, '0'),
      specificTestSongManage: {
        SONG_REQUESTS_MANAGE_VALUE: Permission.SONG_REQUESTS_MANAGE,
        bitwiseAnd: TestValue & Permission.SONG_REQUESTS_MANAGE,
        result: (TestValue & Permission.SONG_REQUESTS_MANAGE) === Permission.SONG_REQUESTS_MANAGE
      }
    }

    return NextResponse.json({
      sessionUser: SessionUser,
      databaseUser: DbUser,
      permissionsCheck: PermissionsCheck,
      rawTests: RawTests,
      permissionValues: {
        DASHBOARD_ACCESS: Permission.DASHBOARD_ACCESS,
        SLIDES_VIEW: Permission.SLIDES_VIEW,
        SLIDES_EDIT: Permission.SLIDES_EDIT,
        SONG_REQUESTS_VIEW: Permission.SONG_REQUESTS_VIEW,
        SONG_REQUESTS_MANAGE: Permission.SONG_REQUESTS_MANAGE,
        CLASS_TIMES_VIEW: Permission.CLASS_TIMES_VIEW,
        CLASS_TIMES_EDIT: Permission.CLASS_TIMES_EDIT,
        USERS_VIEW: Permission.USERS_VIEW,
        USERS_MANAGE: Permission.USERS_MANAGE,
        SETTINGS_VIEW: Permission.SETTINGS_VIEW,
        SETTINGS_EDIT: Permission.SETTINGS_EDIT,
        ADMINISTRATOR: Permission.ADMINISTRATOR
      }
    })
  } catch (Error: any) {
    console.error('Error in debug permissions route:', Error)
    return NextResponse.json({ 
      error: Error.message || 'An error occurred',
      stack: Error.stack
    }, { status: 500 })
  }
} 