import { NextResponse } from 'next/server';
import { openDB } from '../../../../../database/db';

export async function PATCH(req, context) {
  const { params } = context;
  const eventId = params.id;
  
  try {
    const { status } = await req.json();

    if (!['pending', 'approved', 'rejected', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const db = await openDB();
    await db.run('UPDATE events SET status = ? WHERE id = ?', [status, eventId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Approve Event Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
