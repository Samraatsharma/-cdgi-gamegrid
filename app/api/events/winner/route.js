import { NextResponse } from 'next/server';
import { openDB } from '../../../../database/db';

export async function POST(req) {
  try {
    const { event_id, winner_student_id, winner_text, details } = await req.json();

    if (!event_id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const db = await openDB();

    // 1. Check if a result already exists for this event
    const existingResult = await db.get('SELECT id FROM results WHERE event_id = ?', [event_id]);
    
    // 2. If a NEW winner is being declared (individual student)
    if (winner_student_id) {
      // Increment student's wins
      await db.run('UPDATE students SET wins = wins + 1 WHERE id = ?', [winner_student_id]);
    }

    // 3. Upsert into results table
    if (existingResult) {
       await db.run(
         'UPDATE results SET winner_student_id = ?, winner_text = ?, details = ? WHERE event_id = ?',
         [winner_student_id || null, winner_text || null, details || '', event_id]
       );
    } else {
       await db.run(
         'INSERT INTO results (event_id, winner_student_id, winner_text, details) VALUES (?, ?, ?, ?)',
         [event_id, winner_student_id || null, winner_text || null, details || '']
       );
    }

    // 4. Update event status to completed if it wasn't already
    await db.run('UPDATE events SET status = "completed" WHERE id = ?', [event_id]);

    return NextResponse.json({ success: true, message: 'Winner declared and status updated.' });
  } catch (error) {
    console.error('Declare Winner Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const event_id = searchParams.get('event_id');
    
    const db = await openDB();
    
    if (event_id) {
      const result = await db.get(`
        SELECT r.*, s.name as student_name, s.branch, s.roll_number 
        FROM results r 
        LEFT JOIN students s ON r.winner_student_id = s.id 
        WHERE r.event_id = ?
      `, [event_id]);
      return NextResponse.json({ success: true, result });
    }

    const results = await db.all(`
      SELECT r.*, e.name as event_name, e.sport, s.name as student_name 
      FROM results r 
      JOIN events e ON r.event_id = e.id 
      LEFT JOIN students s ON r.winner_student_id = s.id
    `);
    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
