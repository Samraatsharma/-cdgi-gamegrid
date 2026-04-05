import { NextResponse } from 'next/server';
import { openDB } from '../../../database/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('student_id');
  const eventId = searchParams.get('event_id');

  try {
    const db = await openDB();
    let query = 'SELECT r.*, e.name as event_name, e.sport, s.name as student_name FROM registrations r JOIN events e ON r.event_id = e.id JOIN students s ON r.student_id = s.id';
    let params = [];
    
    if (studentId) {
      query += ' WHERE r.student_id = ?';
      params.push(studentId);
    } else if (eventId) {
      query += ' WHERE r.event_id = ?';
      params.push(eventId);
    }

    const registrations = await db.all(query, params);
    return NextResponse.json({ success: true, registrations });
  } catch (error) {
    console.error('Fetch Registrations Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { student_id, event_id } = await req.json();

    if (!student_id || !event_id) {
      return NextResponse.json({ error: 'Student ID and Event ID are required' }, { status: 400 });
    }

    const db = await openDB();

    // Check if event is approved
    const event = await db.get('SELECT status FROM events WHERE id = ?', [event_id]);
    if (!event || event.status !== 'approved') {
      return NextResponse.json({ error: 'Event is not approved for registration yet' }, { status: 400 });
    }

    const result = await db.run(
      'INSERT INTO registrations (student_id, event_id) VALUES (?, ?)',
      [student_id, event_id]
    );

    // Also add to trials
    await db.run(
      'INSERT INTO trials (student_id, event_id) VALUES (?, ?)',
      [student_id, event_id]
    );

    // Auto update logistics stats
    await db.run(
      `UPDATE logistics 
       SET total_students = total_students + 1,
           rooms = CAST((total_students + 1) / 3 AS INTEGER),
           food_required = total_students + 1
       WHERE event_id = ?`,
      [event_id]
    );

    return NextResponse.json({ success: true, registrationId: result.lastID });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
       return NextResponse.json({ error: 'Already registered for this event' }, { status: 400 });
    }
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
