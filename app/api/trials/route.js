import { NextResponse } from 'next/server';
import { openDB } from '../../../database/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('event_id');

  try {
    const db = await openDB();
    const query = `
      SELECT t.*, s.name as student_name, s.course, e.name as event_name 
      FROM trials t 
      JOIN students s ON t.student_id = s.id 
      JOIN events e ON t.event_id = e.id 
      WHERE t.event_id = ?
    `;
    const trials = await db.all(query, [eventId]);
    return NextResponse.json({ success: true, trials });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { id, attendance, selection_status, student_id, event_id } = await req.json();

    const db = await openDB();
    await db.run(
      'UPDATE trials SET attendance = ?, selection_status = ? WHERE id = ?',
      [attendance, selection_status, id]
    );

    if (selection_status === 'selected') {
      await db.run(
        'INSERT OR IGNORE INTO team (student_id, event_id) VALUES (?, ?)',
        [student_id, event_id]
      );
    } else if (selection_status === 'rejected') {
      await db.run(
        'DELETE FROM team WHERE student_id = ? AND event_id = ?',
        [student_id, event_id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update Trial Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
