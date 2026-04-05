import { NextResponse } from 'next/server';
import { openDB } from '../../../database/db';

export async function GET(req) {
  try {
    const db = await openDB();
    const query = `
      SELECT l.*, e.name as event_name, e.sport 
      FROM logistics l
      JOIN events e ON l.event_id = e.id
    `;
    const logistics = await db.all(query);
    return NextResponse.json({ success: true, logistics });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { event_id, ground } = await req.json();
    const db = await openDB();
    await db.run('UPDATE logistics SET ground = ? WHERE event_id = ?', [ground, event_id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
