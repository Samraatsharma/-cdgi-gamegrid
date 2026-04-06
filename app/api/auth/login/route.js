import { NextResponse } from 'next/server';
import { openDB } from '../../../../database/db';

export async function POST(req) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Email, password, and role are required' }, { status: 400 });
    }

    const db = await openDB();

    if (role === 'admin') {
      const admin = await db.get('SELECT * FROM admin WHERE username = ? AND password = ?', [email, password]);
      if (admin) {
        return NextResponse.json({ 
          success: true, 
          user: { 
            id: admin.id, 
            username: admin.username, 
            role: 'admin' 
          } 
        });
      }
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    } else {
      // 1. Check if the email exists
      const emailExists = await db.get('SELECT id FROM students WHERE email = ?', [email]);
      if (!emailExists) {
        return NextResponse.json({ error: 'ACCOUNT_NOT_FOUND' }, { status: 404 });
      }

      // 2. Verify password
      const query = 'SELECT id, name, email, roll_number, branch, year, section, phone, wins FROM students WHERE email = ? AND password = ?';
      const studentData = await db.get(query, [email, password]);

      if (studentData) {
        return NextResponse.json({ 
          success: true, 
          user: { 
            ...studentData,
            role: 'student' 
          } 
        });
      }
      
      return NextResponse.json({ error: 'Invalid credentials. Check your password.' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
