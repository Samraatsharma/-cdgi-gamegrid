import { NextResponse } from 'next/server';
import { openDB } from '../../../database/db';

export async function GET() {
  try {
    const db = await openDB();
    const query = `
      SELECT r.*, e.name as event_name, e.sport 
      FROM results r
      JOIN events e ON r.event_id = e.id
    `;
    const results = await db.all(query);
    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { event_id, winner, details } = await req.json();
    const db = await openDB();
    await db.run(
      'INSERT INTO results (event_id, winner, details) VALUES (?, ?, ?)',
      [event_id, winner, details]
    );
    await db.run('UPDATE events SET status = ? WHERE id = ?', ['completed', event_id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Results Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
