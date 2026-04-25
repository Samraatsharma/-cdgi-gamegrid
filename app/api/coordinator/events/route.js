import { NextResponse } from 'next/server';
import { openDB } from '../../../../database/db';

// GET /api/coordinator/events?sport=Cricket
// Returns all events + registrations for a given sport (coordinator's assigned sport)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sport = searchParams.get('sport');

    if (!sport) {
      return NextResponse.json({ error: 'Sport parameter is required' }, { status: 400 });
    }

    const db = await openDB();

    const events = await db.all(`
      SELECT e.*,
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) as registered_count
      FROM events e
      WHERE e.sport = ?
      ORDER BY e.date DESC
    `, [sport]);

    // For each event, fetch the participant list
    const eventsWithParticipants = await Promise.all(
      events.map(async (ev) => {
        const participants = await db.all(`
          SELECT s.id, s.name, s.email, s.roll_number, s.branch, s.year, s.section, s.phone,
                 r.id as reg_id, r.registered_at, r.payment_status
          FROM registrations r
          JOIN students s ON s.id = r.student_id
          WHERE r.event_id = ?
          ORDER BY s.name ASC
        `, [ev.id]);
        return { ...ev, participants };
      })
    );

    return NextResponse.json({ success: true, events: eventsWithParticipants });
  } catch (error) {
    console.error('Coordinator Events Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
