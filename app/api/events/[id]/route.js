import { NextResponse } from 'next/server';
import { openDB } from '../../../../database/db';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const db = await openDB();
    const event = await db.get(`
      SELECT e.*,
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) as registered_count
      FROM events e
      WHERE e.id = ?
    `, [id]);
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('Fetch Single Event Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
