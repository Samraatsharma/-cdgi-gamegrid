import { NextResponse } from 'next/server';
import { openDB } from '../../../database/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('student_id');
  const eventId = searchParams.get('event_id');

  try {
    const db = await openDB();
    let query = `
      SELECT r.id, r.student_id, r.event_id, r.registered_at, r.payment_status, r.payment_screenshot_url,
        e.name as event_name, e.sport, e.status, e.date, e.image_url, e.eligibility,
        e.max_participants, e.registered_count, e.entry_fee, e.coordinator_name, e.coordinator_contact
      FROM registrations r
      JOIN events e ON r.event_id = e.id
    `;
    const params = [];
    
    if (studentId) {
      query += ' WHERE r.student_id = ?';
      params.push(studentId);
    } else if (eventId) {
      query += ' WHERE r.event_id = ?';
      params.push(eventId);
    }
    query += ' ORDER BY r.registered_at DESC';

    const registrations = await db.all(query, params);
    return NextResponse.json({ success: true, registrations });
  } catch (error) {
    console.error('Fetch Registrations Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { student_id, event_id, payment_screenshot_url } = await req.json();

    if (!student_id || !event_id) {
      return NextResponse.json({ error: 'Student ID and Event ID are required' }, { status: 400 });
    }

    const db = await openDB();

    // 1. Fetch event and validate
    const event = await db.get('SELECT * FROM events WHERE id = ?', [event_id]);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // 2. Check if registration is open
    if (event.status !== 'registration_open') {
      const statusMessages = {
        upcoming: 'Registration for this event has not opened yet.',
        ongoing: 'This event is already underway — registration is closed.',
        completed: 'This event has already concluded.',
        registration_open: '',
      };
      const msg = statusMessages[event.status] || 'Registration is not available for this event.';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // 3. Check participant limit
    const currentCount = await db.get('SELECT COUNT(*) as count FROM registrations WHERE event_id = ?', [event_id]);
    if (currentCount.count >= event.max_participants) {
      return NextResponse.json({ error: `This event is full (${event.max_participants}/${event.max_participants} slots taken).` }, { status: 400 });
    }

    let payment_status = 'not_required';
    if (event.entry_fee > 0) {
      if (!payment_screenshot_url) {
        return NextResponse.json({ error: 'Payment screenshot is required as this event has an entry fee.' }, { status: 400 });
      }
      payment_status = 'pending';
    }

    // 4. Register student
    await db.run(
      'INSERT INTO registrations (student_id, event_id, payment_screenshot_url, payment_status) VALUES (?, ?, ?, ?)',
      [student_id, event_id, payment_screenshot_url || null, payment_status]
    );

    // [DELETED] Trials table no longer exists in current schema

    // 5. Update logistics count
    await db.run(
      `UPDATE logistics 
       SET total_students = (SELECT COUNT(*) FROM registrations WHERE event_id = ?),
           rooms = CAST((SELECT COUNT(*) FROM registrations WHERE event_id = ?) / 3 AS INTEGER),
           food_required = (SELECT COUNT(*) FROM registrations WHERE event_id = ?)
       WHERE event_id = ?`,
      [event_id, event_id, event_id, event_id]
    );

    // 6. Update registered_count on events table
    await db.run(
      'UPDATE events SET registered_count = (SELECT COUNT(*) FROM registrations WHERE event_id = ?) WHERE id = ?',
      [event_id, event_id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT' || error.message.includes('UNIQUE constraint')) {
      return NextResponse.json({ error: 'You are already registered for this event.' }, { status: 400 });
    }
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const registrationId = searchParams.get('id');
    const studentId = searchParams.get('student_id');
    const eventId = searchParams.get('event_id');

    if (!registrationId && !(studentId && eventId)) {
      return NextResponse.json({ error: 'Registration ID or student_id+event_id required' }, { status: 400 });
    }

    const db = await openDB();

    if (registrationId) {
      await db.run('DELETE FROM registrations WHERE id = ?', [registrationId]);
    } else {
      await db.run('DELETE FROM registrations WHERE student_id = ? AND event_id = ?', [studentId, eventId]);
    }

    // Update registered_count
    if (eventId) {
      await db.run(
        'UPDATE events SET registered_count = (SELECT COUNT(*) FROM registrations WHERE event_id = ?) WHERE id = ?',
        [eventId, eventId]
      );
      await db.run(
        `UPDATE logistics 
         SET total_students = (SELECT COUNT(*) FROM registrations WHERE event_id = ?),
             rooms = CAST((SELECT COUNT(*) FROM registrations WHERE event_id = ?) / 3 AS INTEGER),
             food_required = (SELECT COUNT(*) FROM registrations WHERE event_id = ?)
         WHERE event_id = ?`,
        [eventId, eventId, eventId, eventId]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cancel Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { id, payment_status } = await req.json();
    if (!id || !payment_status) {
      return NextResponse.json({ error: 'Missing ID or Status' }, { status: 400 });
    }

    const db = await openDB();
    await db.run('UPDATE registrations SET payment_status = ? WHERE id = ?', [payment_status, id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update Payment Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
