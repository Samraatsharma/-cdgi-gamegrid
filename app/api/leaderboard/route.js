import { NextResponse } from 'next/server';
import { openDB } from '../../../database/db';

export async function GET() {
  try {
    const db = await openDB();

    // Query to get student rankings with their registration counts
    const query = `
      SELECT 
        s.id, s.name, s.branch, s.year, s.wins,
        (SELECT COUNT(*) FROM registrations r WHERE r.student_id = s.id) as registrations
      FROM students s
      ORDER BY s.wins DESC, registrations DESC
      LIMIT 100
    `;

    const leaderboard = await db.all(query);

    return NextResponse.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Leaderboard Fetch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
