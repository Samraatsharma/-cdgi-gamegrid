import { NextResponse } from 'next/server';
import { openDB } from '../../../database/db';

// GET — Fetch notifications for a user
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    const role = searchParams.get('role') || 'student';
    const unreadOnly = searchParams.get('unread') === 'true';

    const db = await openDB();
    let query = 'SELECT * FROM notifications WHERE (user_id = ? OR user_id IS NULL)';
    const params = [userId || 0];

    if (unreadOnly) query += ' AND is_read = 0';
    query += ' ORDER BY created_at DESC LIMIT 50';

    const notifications = await db.all(query, params);
    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    console.error('Notifications GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST — Create a notification
export async function POST(req) {
  try {
    const { user_id, title, message, type = 'info', user_role = 'student', action_url } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    const db = await openDB();
    const result = await db.run(
      'INSERT INTO notifications (user_id, title, message, type, user_role, action_url) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id || null, title, message, type, user_role, action_url || null]
    );

    return NextResponse.json({ success: true, id: result.lastID });
  } catch (error) {
    console.error('Notifications POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH — Mark notification as read / unread
export async function PATCH(req) {
  try {
    const { id, is_read, mark_all_read, user_id } = await req.json();

    const db = await openDB();

    if (mark_all_read && user_id) {
      await db.run('UPDATE notifications SET is_read = 1 WHERE user_id = ? OR user_id IS NULL', [user_id]);
    } else if (id !== undefined) {
      await db.run('UPDATE notifications SET is_read = ? WHERE id = ?', [is_read ? 1 : 0, id]);
    } else {
      return NextResponse.json({ error: 'Missing ID or mark_all_read flag' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notifications PATCH Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE — Clear notifications
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');

    const db = await openDB();
    if (userId) {
      await db.run('DELETE FROM notifications WHERE user_id = ? OR user_id IS NULL', [userId]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notifications DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
