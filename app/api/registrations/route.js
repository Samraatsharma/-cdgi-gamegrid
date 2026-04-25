import { NextResponse } from 'next/server';
import { openDB } from '../../../database/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('student_id');
  const eventId = searchParams.get('event_id');
  const paymentFilter = searchParams.get('payment_status');

  try {
    const db = await openDB();
    let query = `
      SELECT r.id, r.student_id, r.event_id, r.registered_at, r.payment_status, r.payment_screenshot_url,
        r.registration_type, r.team_name, r.team_members, r.transaction_id, r.payment_amount,
        r.payment_confidence, r.waitlist_position,
        e.name as event_name, e.sport, e.status, e.date, e.image_url, e.eligibility,
        e.max_participants, e.registered_count, e.entry_fee, e.coordinator_name, e.coordinator_contact,
        s.name as student_name, s.email as student_email, s.branch, s.year, s.roll_number
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      JOIN students s ON r.student_id = s.id
    `;
    const params = [];
    const conditions = [];
    
    if (studentId) {
      conditions.push('r.student_id = ?');
      params.push(studentId);
    }
    if (eventId) {
      conditions.push('r.event_id = ?');
      params.push(eventId);
    }
    if (paymentFilter) {
      conditions.push('r.payment_status = ?');
      params.push(paymentFilter);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
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
    const { 
      student_id, event_id, payment_screenshot_url, 
      transaction_id, payment_amount,
      registration_type, team_name, team_members 
    } = await req.json();

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
      };
      const msg = statusMessages[event.status] || 'Registration is not available for this event.';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // 3. Check participant limit — determine if waitlisted
    const confirmedCount = await db.get(
      'SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND waitlist_position = 0', 
      [event_id]
    );
    
    let waitlistPosition = 0;
    let isWaitlisted = false;

    if (confirmedCount.count >= event.max_participants) {
      // Event is full — add to waitlist
      const lastWaitlist = await db.get(
        'SELECT MAX(waitlist_position) as max_pos FROM registrations WHERE event_id = ? AND waitlist_position > 0',
        [event_id]
      );
      waitlistPosition = (lastWaitlist?.max_pos || 0) + 1;
      isWaitlisted = true;
    }

    // 4. Payment handling
    let payment_status = 'not_required';
    let payment_confidence = 'none';

    if (event.entry_fee > 0) {
      if (!payment_screenshot_url && !isWaitlisted) {
        return NextResponse.json({ error: 'Payment screenshot is required as this event has an entry fee.' }, { status: 400 });
      }
      
      if (payment_screenshot_url) {
        // Smart confidence scoring
        let score = 40; // Base for having screenshot
        
        if (transaction_id && transaction_id.trim().length >= 8) {
          score += 30; // Transaction ID provided
        }
        
        if (payment_amount && parseInt(payment_amount) === event.entry_fee) {
          score += 30; // Amount matches
        }

        payment_confidence = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
        payment_status = 'pending';
      } else {
        // Waitlisted — payment not yet needed
        payment_status = 'waitlisted';
      }
    }

    // 5. Team registration validation
    const regType = registration_type || 'individual';
    if (regType === 'team') {
      if (!team_name || !team_name.trim()) {
        return NextResponse.json({ error: 'Team name is required for team registration.' }, { status: 400 });
      }
    }

    // 6. Register student
    await db.run(
      `INSERT INTO registrations 
        (student_id, event_id, payment_screenshot_url, payment_status, 
         registration_type, team_name, team_members, transaction_id, payment_amount, 
         payment_confidence, waitlist_position) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        student_id, event_id, payment_screenshot_url || null, payment_status,
        regType, team_name || null, team_members ? JSON.stringify(team_members) : null,
        transaction_id || null, payment_amount ? parseInt(payment_amount) : null,
        payment_confidence, waitlistPosition
      ]
    );

    // 7. Update logistics count
    await db.run(
      `UPDATE logistics 
       SET total_students = (SELECT COUNT(*) FROM registrations WHERE event_id = ?),
           rooms = CAST((SELECT COUNT(*) FROM registrations WHERE event_id = ?) / 3 AS INTEGER),
           food_required = (SELECT COUNT(*) FROM registrations WHERE event_id = ?)
       WHERE event_id = ?`,
      [event_id, event_id, event_id, event_id]
    );

    // 8. Update registered_count on events table (only confirmed, not waitlisted)
    await db.run(
      'UPDATE events SET registered_count = (SELECT COUNT(*) FROM registrations WHERE event_id = ? AND waitlist_position = 0) WHERE id = ?',
      [event_id, event_id]
    );

    // 9. Create notification
    const student = await db.get('SELECT name FROM students WHERE id = ?', [student_id]);
    if (isWaitlisted) {
      await db.run(
        'INSERT INTO notifications (user_id, title, message, type, action_url) VALUES (?, ?, ?, ?, ?)',
        [student_id, 'Added to Waitlist', `You are #${waitlistPosition} on the waitlist for "${event.name}". You'll be notified when a slot opens.`, 'warning', `/events/${event_id}`]
      );
    } else {
      const notifMsg = event.entry_fee > 0
        ? `Registered for "${event.name}". Payment is under review (${payment_confidence} confidence).`
        : `Successfully registered for "${event.name}". See you at the event!`;
      await db.run(
        'INSERT INTO notifications (user_id, title, message, type, action_url) VALUES (?, ?, ?, ?, ?)',
        [student_id, 'Registration Confirmed', notifMsg, 'success', `/dashboard/student`]
      );
    }

    return NextResponse.json({ 
      success: true, 
      waitlisted: isWaitlisted, 
      waitlistPosition,
      paymentConfidence: payment_confidence 
    });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT' || error.message?.includes('UNIQUE constraint') || error.message?.includes('unique')) {
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

    // Get the registration before deleting (for waitlist promotion)
    let deletedReg;
    if (registrationId) {
      deletedReg = await db.get('SELECT * FROM registrations WHERE id = ?', [registrationId]);
      await db.run('DELETE FROM registrations WHERE id = ?', [registrationId]);
    } else {
      deletedReg = await db.get('SELECT * FROM registrations WHERE student_id = ? AND event_id = ?', [studentId, eventId]);
      await db.run('DELETE FROM registrations WHERE student_id = ? AND event_id = ?', [studentId, eventId]);
    }

    const targetEventId = deletedReg?.event_id || eventId;

    // Auto-promote from waitlist if a confirmed slot opened
    if (targetEventId && deletedReg && deletedReg.waitlist_position === 0) {
      const event = await db.get('SELECT * FROM events WHERE id = ?', [targetEventId]);
      const confirmedCount = await db.get(
        'SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND waitlist_position = 0',
        [targetEventId]
      );

      if (event && confirmedCount.count < event.max_participants) {
        // Find next in waitlist
        const nextInLine = await db.get(
          'SELECT * FROM registrations WHERE event_id = ? AND waitlist_position > 0 ORDER BY waitlist_position ASC LIMIT 1',
          [targetEventId]
        );

        if (nextInLine) {
          // Promote: set waitlist_position to 0
          await db.run('UPDATE registrations SET waitlist_position = 0 WHERE id = ?', [nextInLine.id]);

          // Create notification for promoted student
          await db.run(
            'INSERT INTO notifications (user_id, title, message, type, action_url) VALUES (?, ?, ?, ?, ?)',
            [nextInLine.student_id, 'Moved from Waitlist!', `Great news! A slot opened up for "${event.name}" and you've been automatically promoted from the waitlist to confirmed.`, 'success', '/dashboard/student']
          );

          // Reorder remaining waitlist positions
          const remaining = await db.all(
            'SELECT id FROM registrations WHERE event_id = ? AND waitlist_position > 0 ORDER BY waitlist_position ASC',
            [targetEventId]
          );
          for (let i = 0; i < remaining.length; i++) {
            await db.run('UPDATE registrations SET waitlist_position = ? WHERE id = ?', [i + 1, remaining[i].id]);
          }
        }
      }
    }

    // Update registered_count
    if (targetEventId) {
      await db.run(
        'UPDATE events SET registered_count = (SELECT COUNT(*) FROM registrations WHERE event_id = ? AND waitlist_position = 0) WHERE id = ?',
        [targetEventId, targetEventId]
      );
      await db.run(
        `UPDATE logistics 
         SET total_students = (SELECT COUNT(*) FROM registrations WHERE event_id = ?),
             rooms = CAST((SELECT COUNT(*) FROM registrations WHERE event_id = ?) / 3 AS INTEGER),
             food_required = (SELECT COUNT(*) FROM registrations WHERE event_id = ?)
         WHERE event_id = ?`,
        [targetEventId, targetEventId, targetEventId, targetEventId]
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
    const { id, payment_status, payment_confidence } = await req.json();
    if (!id || !payment_status) {
      return NextResponse.json({ error: 'Missing ID or Status' }, { status: 400 });
    }

    const db = await openDB();
    
    // Get registration details for notification
    const reg = await db.get(
      `SELECT r.*, e.name as event_name, s.name as student_name 
       FROM registrations r 
       JOIN events e ON r.event_id = e.id 
       JOIN students s ON r.student_id = s.id 
       WHERE r.id = ?`, 
      [id]
    );

    let updateQuery = 'UPDATE registrations SET payment_status = ?';
    const params = [payment_status];
    
    if (payment_confidence) {
      updateQuery += ', payment_confidence = ?';
      params.push(payment_confidence);
    }
    updateQuery += ' WHERE id = ?';
    params.push(id);

    await db.run(updateQuery, params);

    // Send notification to student
    if (reg) {
      const notifTitle = payment_status === 'verified' ? 'Payment Verified ✅' : 'Payment Rejected ❌';
      const notifMsg = payment_status === 'verified'
        ? `Your payment for "${reg.event_name}" has been verified. Your registration is now confirmed!`
        : `Your payment for "${reg.event_name}" was rejected. Please re-upload a valid payment screenshot or contact the coordinator.`;
      const notifType = payment_status === 'verified' ? 'success' : 'error';

      await db.run(
        'INSERT INTO notifications (user_id, title, message, type, action_url) VALUES (?, ?, ?, ?, ?)',
        [reg.student_id, notifTitle, notifMsg, notifType, '/dashboard/student']
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update Payment Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
