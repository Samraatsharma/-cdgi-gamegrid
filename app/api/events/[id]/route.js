import { NextResponse } from 'next/server';
import { openDB } from '../../../../database/db';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const db = await openDB();

    // Join with coordinators table to get the coordinator's full info
    const event = await db.get(`
      SELECT e.*,
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) as registered_count,
        c.name AS coord_account_name,
        c.email AS coord_account_email,
        c.assigned_sport AS coord_assigned_sport
      FROM events e
      LEFT JOIN coordinators c ON c.assigned_sport = e.sport
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
