import { NextResponse } from 'next/server';
import { readDatabase, writeDatabase, User } from '@/lib/db';
import { hashPassword, setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide all fields' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const db = readDatabase();
    const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 400 }
      );
    }

    const newUser: User = {
      id: `usr-${Math.random().toString(36).substr(2, 9)}`,
      name,
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      role: 'user', // Default role
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    writeDatabase(db);

    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    await setSessionCookie(safeUser);

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: safeUser,
    });
  } catch (err) {
    console.error('Registration API error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
