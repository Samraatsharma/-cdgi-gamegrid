import { NextResponse } from 'next/server';
import { openDB } from '../../../database/db';

export async function GET() {
  try {
    const db = await openDB();
    const events = await db.all(`
      SELECT e.*,
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) as registered_count
      FROM events e
      ORDER BY e.id DESC
    `);
    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error('Fetch Events Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { 
      name, sport, date, end_date, eligibility, image_url, max_participants, description, status, entry_fee, payment_qrcode, coordinator_name, coordinator_contact,
      venue, equipment, prize_pool, rules, event_format, gender_category 
    } = await req.json();

    if (!name || !sport || !date || !eligibility) {
      return NextResponse.json({ error: 'Name, sport, date, and eligibility are required' }, { status: 400 });
    }

    const img = image_url || 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800';
    const maxP = max_participants || 50;
    const desc = description || '';
    // Admin-created events are immediately open for registration
    const eventStatus = status || 'registration_open';

    const fee = entry_fee ? parseInt(entry_fee) : 0;
    const qr = payment_qrcode || null;
    const coord_name = coordinator_name || null;
    const coord_contact = coordinator_contact || null;
    
    // New Fields defaults
    const ev_venue = venue || 'TBD';
    const ev_equip = equipment || 'Standard Equipment';
    const ev_prize = prize_pool || 'Certificates & Medals';
    const ev_rules = rules || 'Standard College Rules Apply';
    const ev_format = event_format || 'Knockout';
    const ev_gender = gender_category || 'Open for All';

    const db = await openDB();
    const result = await db.run(
      'INSERT INTO events (name, sport, date, end_date, eligibility, image_url, status, max_participants, description, entry_fee, payment_qrcode, coordinator_name, coordinator_contact, venue, equipment, prize_pool, rules, event_format, gender_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, sport, date, end_date || date, eligibility, img, eventStatus, maxP, desc, fee, qr, coord_name, coord_contact, ev_venue, ev_equip, ev_prize, ev_rules, ev_format, ev_gender]
    );

    await db.run('INSERT INTO logistics (event_id) VALUES (?)', [result.lastID]);

    return NextResponse.json({ success: true, eventId: result.lastID });
  } catch (error) {
    console.error('Create Event Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { 
      id, name, sport, date, end_date, eligibility, image_url, status, max_participants, description, entry_fee, payment_qrcode, coordinator_name, coordinator_contact,
      venue, equipment, prize_pool, rules, event_format, gender_category
    } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const fee = entry_fee ? parseInt(entry_fee) : 0;
    const qr = payment_qrcode || null;
    const coord_name = coordinator_name || null;
    const coord_contact = coordinator_contact || null;
    
    // New Fields defaults
    const ev_venue = venue || 'TBD';
    const ev_equip = equipment || 'Standard Equipment';
    const ev_prize = prize_pool || 'Certificates & Medals';
    const ev_rules = rules || 'Standard College Rules Apply';
    const ev_format = event_format || 'Knockout';
    const ev_gender = gender_category || 'Open for All';

    const db = await openDB();
    await db.run(
      `UPDATE events 
       SET name = ?, sport = ?, date = ?, end_date = ?, eligibility = ?, image_url = ?, status = ?, max_participants = ?, description = ?, entry_fee = ?, payment_qrcode = ?, coordinator_name = ?, coordinator_contact = ?, venue = ?, equipment = ?, prize_pool = ?, rules = ?, event_format = ?, gender_category = ?
       WHERE id = ?`,
      [name, sport, date, end_date || date, eligibility, image_url, status || 'registration_open', max_participants || 50, description || '', fee, qr, coord_name, coord_contact, ev_venue, ev_equip, ev_prize, ev_rules, ev_format, ev_gender, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update Event Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const db = await openDB();
    await db.run('DELETE FROM events WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete Event Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
