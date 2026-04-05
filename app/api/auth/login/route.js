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
        return NextResponse.json({ success: true, user: { id: admin.id, username: admin.username, role: 'admin' } });
      }
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    } else {
      const student = await db.get('SELECT * FROM students WHERE email = ? AND password = ?', [email, password]);
      if (student) {
        return NextResponse.json({ success: true, user: { id: student.id, name: student.name, email: student.email, role: 'student' } });
      }
      return NextResponse.json({ error: 'Invalid student credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
