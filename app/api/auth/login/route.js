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

    } else if (role === 'coordinator') {
      const coord = await db.get(
        'SELECT id, name, email, assigned_sport FROM coordinators WHERE email = ? AND password = ?',
        [email, password]
      );
      if (coord) {
        return NextResponse.json({
          success: true,
          user: {
            id: coord.id,
            name: coord.name,
            email: coord.email,
            assigned_sport: coord.assigned_sport,
            role: 'coordinator'
          }
        });
      }
      // Check if email exists at all
      const coordExists = await db.get('SELECT id FROM coordinators WHERE email = ?', [email]);
      if (!coordExists) {
        return NextResponse.json({ error: 'ACCOUNT_NOT_FOUND' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Invalid coordinator credentials. Check your password.' }, { status: 401 });

    } else {
      // Student login
      const emailExists = await db.get('SELECT id FROM students WHERE email = ?', [email]);
      if (!emailExists) {
        return NextResponse.json({ error: 'ACCOUNT_NOT_FOUND' }, { status: 404 });
      }

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
