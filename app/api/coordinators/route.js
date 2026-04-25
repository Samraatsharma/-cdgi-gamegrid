import { NextResponse } from 'next/server';
import { openDB } from '../../../database/db';

// GET /api/coordinators - list all coordinators
export async function GET(req) {
  try {
    const db = await openDB();
    const { searchParams } = new URL(req.url);
    const sport = searchParams.get('sport');

    let coordinators;
    if (sport) {
      coordinators = await db.all(
        'SELECT id, name, email, assigned_sport, created_at FROM coordinators WHERE assigned_sport = ? ORDER BY name ASC',
        [sport]
      );
    } else {
      coordinators = await db.all(
        'SELECT id, name, email, assigned_sport, created_at FROM coordinators ORDER BY assigned_sport, name ASC'
      );
    }

    return NextResponse.json({ success: true, coordinators });
  } catch (error) {
    console.error('Fetch Coordinators Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/coordinators - create a new coordinator
export async function POST(req) {
  try {
    const { name, email, password, assigned_sport } = await req.json();

    if (!name || !email || !password || !assigned_sport) {
      return NextResponse.json(
        { error: 'Name, email, password, and assigned sport are required' },
        { status: 400 }
      );
    }

    const db = await openDB();

    // Check if email already in use
    const existing = await db.get('SELECT id FROM coordinators WHERE email = ?', [email]);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered as a coordinator' }, { status: 409 });
    }

    const result = await db.run(
      'INSERT INTO coordinators (name, email, password, assigned_sport) VALUES (?, ?, ?, ?)',
      [name, email, password, assigned_sport]
    );

    return NextResponse.json({ success: true, coordinatorId: result.lastID });
  } catch (error) {
    console.error('Create Coordinator Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/coordinators - update a coordinator
export async function PATCH(req) {
  try {
    const { id, name, email, password, assigned_sport } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const db = await openDB();
    await db.run(
      'UPDATE coordinators SET name = ?, email = ?, password = ?, assigned_sport = ? WHERE id = ?',
      [name, email, password, assigned_sport, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update Coordinator Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/coordinators?id=X
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const db = await openDB();
    await db.run('DELETE FROM coordinators WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete Coordinator Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
