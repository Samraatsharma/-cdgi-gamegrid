import { NextResponse } from 'next/server';
import { openDB } from '../../../../database/db';

export async function GET(req, { params }) {
  try {
    const db = await openDB();
    const event = await db.get('SELECT * FROM events WHERE id = ?', [params.id]);
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    return NextResponse.json({ success: true, event });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
