import { NextResponse } from 'next/server';
import { openDB } from '../../../../database/db';

export async function POST(req) {
  try {
    const { name, email, password, course } = await req.json();

    if (!name || !email || !password || !course) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const db = await openDB();
    
    // Check if email exists
    const existingUser = await db.get('SELECT id FROM students WHERE email = ?', [email]);
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Insert new user
    const result = await db.run(
      'INSERT INTO students (name, email, password, course) VALUES (?, ?, ?, ?)',
      [name, email, password, course] // In practical apps, hash the password (e.g. bcrypt)
    );

    return NextResponse.json({ success: true, studentId: result.lastID });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
