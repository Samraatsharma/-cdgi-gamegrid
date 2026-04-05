import { NextResponse } from 'next/server';
import { openDB } from '../../../../database/db';

export async function GET() {
  try {
    const db = await openDB();
    // 3-way strict relational JOIN to fetch student registration context
    const query = `
      SELECT r.id, s.name as student_name, s.email as student_email, s.course as student_course,
             e.name as event_name, e.sport as event_sport, e.date as event_date, 
             r.status 
      FROM registrations r
      JOIN students s ON r.student_id = s.id
      JOIN events e ON r.event_id = e.id
      ORDER BY CASE WHEN r.status = 'pending' THEN 1 ELSE 2 END, r.id DESC
    `;
    const registrations = await db.all(query);
    return NextResponse.json({ success: true, registrations });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch relational registrations' }, { status: 500 });
  }
}
