import { NextResponse } from 'next/server';
import { openDB } from '../../../../database/db';

export async function POST(req) {
  try {
    const { name, email, password, branch, year, roll_number, section, phone } = await req.json();

    if (!name || !email || !password || !branch || !year || !roll_number || !phone) {
      return NextResponse.json({ error: 'All primary fields are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const db = await openDB();
    
    // Check if email or roll number exists
    const existingUser = await db.get('SELECT id FROM students WHERE email = ? OR roll_number = ?', [email, roll_number]);
    if (existingUser) {
      return NextResponse.json({ error: 'Email or Roll Number already registered' }, { status: 400 });
    }

    // Insert new user with full profile
    const result = await db.run(
      'INSERT INTO students (name, email, password, branch, year, roll_number, section, phone, wins) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, password, branch, parseInt(year), roll_number, section, phone, 0]
    );

    return NextResponse.json({ 
      success: true, 
      user: { 
        id: result.lastID, 
        name, 
        email, 
        branch, 
        year, 
        roll_number, 
        section, 
        phone, 
        role: 'student' 
      } 
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
