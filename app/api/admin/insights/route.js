import { NextResponse } from 'next/server';
import { openDB } from '../../../../database/db';

/**
 * GET /api/admin/insights — Professional analytics data for admin dashboard.
 * Returns: total events, registrations, revenue, fill rates, top sports, payment breakdown.
 */
export async function GET() {
  try {
    const db = await openDB();

    // Core metrics
    const [totalEvents, totalRegistrations, totalStudents, openEvents, ongoingEvents, completedEvents] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM events'),
      db.get('SELECT COUNT(*) as count FROM registrations'),
      db.get('SELECT COUNT(*) as count FROM students'),
      db.get("SELECT COUNT(*) as count FROM events WHERE status = 'registration_open'"),
      db.get("SELECT COUNT(*) as count FROM events WHERE status = 'ongoing'"),
      db.get("SELECT COUNT(*) as count FROM events WHERE status = 'completed'"),
    ]);

    // Revenue from entry fees (sum of entry_fee × registration count for each event)
    const revenueResult = await db.get(`
      SELECT COALESCE(SUM(e.entry_fee), 0) as total_revenue
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE e.entry_fee > 0
    `);

    // Average fill rate across all events
    const fillRateResult = await db.get(`
      SELECT 
        CASE WHEN COUNT(*) > 0 
          THEN ROUND(AVG(CAST(registered_count AS FLOAT) / CASE WHEN max_participants > 0 THEN max_participants ELSE 50 END * 100), 1)
          ELSE 0 
        END as avg_fill_rate
      FROM events
    `);

    // Top 5 sports by total registrations
    const topSports = await db.all(`
      SELECT e.sport, COUNT(r.id) as registrations
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      GROUP BY e.sport
      ORDER BY registrations DESC
      LIMIT 5
    `);

    // Payment status breakdown
    const paymentBreakdown = await db.all(`
      SELECT payment_status, COUNT(*) as count
      FROM registrations
      GROUP BY payment_status
    `);

    // Waitlist count
    const waitlistCount = await db.get(`
      SELECT COUNT(*) as count FROM registrations WHERE waitlist_position > 0
    `);

    // Recent registrations (last 10)
    const recentRegistrations = await db.all(`
      SELECT r.id, r.registered_at, r.payment_status, r.payment_confidence, r.waitlist_position,
        s.name as student_name, s.branch, s.year,
        e.name as event_name, e.sport
      FROM registrations r
      JOIN students s ON r.student_id = s.id
      JOIN events e ON r.event_id = e.id
      ORDER BY r.registered_at DESC
      LIMIT 10
    `);

    // Per-event breakdown for fill rate chart
    const eventBreakdown = await db.all(`
      SELECT e.id, e.name, e.sport, e.status, e.max_participants, e.entry_fee,
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) as registrations,
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.waitlist_position > 0) as waitlisted
      FROM events e
      ORDER BY registrations DESC
    `);

    return NextResponse.json({
      success: true,
      insights: {
        totalEvents: totalEvents.count,
        totalRegistrations: totalRegistrations.count,
        totalStudents: totalStudents.count,
        openEvents: openEvents.count,
        ongoingEvents: ongoingEvents.count,
        completedEvents: completedEvents.count,
        totalRevenue: revenueResult.total_revenue || 0,
        avgFillRate: fillRateResult.avg_fill_rate || 0,
        topSports,
        paymentBreakdown,
        waitlistCount: waitlistCount.count,
        recentRegistrations,
        eventBreakdown,
      },
    });
  } catch (error) {
    console.error('Admin Insights Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
