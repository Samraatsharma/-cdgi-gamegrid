import { NextResponse } from 'next/server';
import { openDB } from '../../../database/db';

export async function GET() {
  try {
    const db = await openDB();
    const events = await db.all('SELECT * FROM events ORDER BY id DESC');
    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error('Fetch Event Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name, sport, date, eligibility, image_url } = await req.json();

    if (!name || !sport || !date || !eligibility) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const img = image_url || 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800';

    const db = await openDB();
    const result = await db.run(
      'INSERT INTO events (name, sport, date, eligibility, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, sport, date, eligibility, img]
    );

    // Initialize logistics for this event
    await db.run('INSERT INTO logistics (event_id) VALUES (?)', [result.lastID]);

    return NextResponse.json({ success: true, eventId: result.lastID });
  } catch (error) {
    console.error('Create Event Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
