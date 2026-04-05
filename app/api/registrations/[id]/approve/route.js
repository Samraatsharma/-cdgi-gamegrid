import { NextResponse } from 'next/server';
import { openDB } from '../../../../../database/db';

export async function PATCH(req, context) {
  const { params } = context;
  const regId = params.id;
  
  try {
    const { status } = await req.json();
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid strict status.' }, { status: 400 });
    }

    const db = await openDB();
    await db.run('UPDATE registrations SET status = ? WHERE id = ?', [status, regId]);

    return NextResponse.json({ success: true, updated: status });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
