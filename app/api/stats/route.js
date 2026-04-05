import { NextResponse } from 'next/server';
import { openDB } from '../../../database/db';

export async function GET() {
  try {
    const db = await openDB();

    const [studentsCount, totalRegs, openEventsCount, completedCount] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM students'),
      db.get('SELECT COUNT(*) as count FROM registrations'),
      db.get("SELECT COUNT(*) as count FROM events WHERE status = 'registration_open'"),
      db.get("SELECT COUNT(*) as count FROM events WHERE status = 'completed'"),
    ]);

    // Most popular sport
    const popularSport = await db.get(`
      SELECT e.sport, COUNT(r.id) as reg_count
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      GROUP BY e.sport
      ORDER BY reg_count DESC
      LIMIT 1
    `);

    // Event-wise breakdown
    const eventBreakdown = await db.all(`
      SELECT e.id, e.name, e.sport, e.status, e.max_participants,
        COUNT(r.id) as registrations
      FROM events e
      LEFT JOIN registrations r ON r.event_id = e.id
      GROUP BY e.id
      ORDER BY registrations DESC
      LIMIT 5
    `);

    return NextResponse.json({ 
      success: true,
      stats: {
        athletes: studentsCount.count,
        totalRegistrations: totalRegs.count,
        openEvents: openEventsCount.count,
        completedEvents: completedCount.count,
        mostPopularSport: popularSport?.sport || 'N/A',
        eventBreakdown,
      }
    });
  } catch (error) {
    console.error('Stats Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
