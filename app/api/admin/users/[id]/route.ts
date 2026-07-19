import { NextResponse } from 'next/server';
import { readDatabase, writeDatabase } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedUser();
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { role } = await request.json();

    if (!role || (role !== 'admin' && role !== 'user')) {
      return NextResponse.json(
        { success: false, message: 'Invalid or missing role' },
        { status: 400 }
      );
    }

    // Protection check: Prevent locking out seed administrator
    if (id === 'usr-admin') {
      return NextResponse.json(
        { success: false, message: 'Security block: Primary Administrator role cannot be modified.' },
        { status: 400 }
      );
    }

    // Protection check: Cannot modify own role (prevent accidental lockouts)
    if (id === admin.id) {
      return NextResponse.json(
        { success: false, message: 'Security block: You cannot modify your own administrator role.' },
        { status: 400 }
      );
    }

    const db = readDatabase();
    const userIndex = db.users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    db.users[userIndex].role = role;
    writeDatabase(db);

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role} successfully.`,
      user: {
        id: db.users[userIndex].id,
        name: db.users[userIndex].name,
        email: db.users[userIndex].email,
        role: db.users[userIndex].role,
      }
    });
  } catch (err) {
    console.error('Admin User ID PUT API error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
