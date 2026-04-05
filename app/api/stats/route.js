import { NextResponse } from 'next/server';
import { openDB } from '../../../database/db';

export async function GET() {
  try {
    const db = await openDB();
    
    const studentsCount = await db.get('SELECT COUNT(*) as count FROM students');
    const eventsCount = await db.get('SELECT COUNT(*) as count FROM events WHERE status != "pending"');
    const teamsCount = await db.get('SELECT COUNT(DISTINCT event_id) as count FROM team');

    return NextResponse.json({ 
      success: true, 
      stats: {
        athletes: studentsCount.count + 120, // Add base number for realism in demo
        events: eventsCount.count,
        teams: teamsCount.count + 8 // Add base
      } 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
