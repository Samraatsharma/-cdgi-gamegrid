import { NextResponse } from 'next/server';
import { openDB } from '../../../database/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('event_id');

  try {
    const db = await openDB();
    const query = `
      SELECT t.*, s.name as student_name, s.course 
      FROM team t 
      JOIN students s ON t.student_id = s.id 
      WHERE t.event_id = ?
    `;
    const team = await db.all(query, [eventId]);
    return NextResponse.json({ success: true, team });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
