import { openDB } from './db.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

async function setup() {
  console.log('🔧 Upgrading CDGI Sports Sphere SQLite Database...');
  
  const db = await openDB();

  // Drop existing tables for a clean one-time schema reset
  await db.exec(`
    DROP TABLE IF EXISTS results;
    DROP TABLE IF EXISTS logistics;
    DROP TABLE IF EXISTS attendance;
    DROP TABLE IF EXISTS team;
    DROP TABLE IF EXISTS trials;
    DROP TABLE IF EXISTS registrations;
    DROP TABLE IF EXISTS events;
    DROP TABLE IF EXISTS admin;
    DROP TABLE IF EXISTS students;
    DROP TABLE IF EXISTS notifications;
  `);

  console.log('✅ Cleared old tables.');

  // Create tables with expanded fields
  await db.exec(`
    CREATE TABLE students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      roll_number TEXT,
      branch TEXT NOT NULL,
      year INTEGER NOT NULL,
      section TEXT,
      phone TEXT,
      wins INTEGER DEFAULT 0
    );

    CREATE TABLE admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );

    CREATE TABLE events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sport TEXT NOT NULL,
      date TEXT NOT NULL,
      eligibility TEXT NOT NULL,
      allowed_branches TEXT DEFAULT 'All', -- Comma separated: CSE,IT,ME
      allowed_years TEXT DEFAULT 'All',     -- Comma separated: 1,2,3,4
      status TEXT DEFAULT 'registration_open',
      image_url TEXT,
      max_participants INTEGER DEFAULT 50,
      registered_count INTEGER DEFAULT 0,
      description TEXT DEFAULT ''
    );

    CREATE TABLE registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      registered_at TEXT DEFAULT (datetime('now')),
      UNIQUE(student_id, event_id),
      FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE
    );

    CREATE TABLE results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      winner_student_id INTEGER, -- For individual winners
      winner_text TEXT,         -- For team/department names
      details TEXT,
      UNIQUE(event_id),
      FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY(winner_student_id) REFERENCES students(id) ON DELETE SET NULL
    );

    CREATE TABLE notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER, -- NULL for global notifications
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info', -- info, success, warning, danger
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE logistics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      total_students INTEGER DEFAULT 0,
      ground TEXT,
      rooms INTEGER DEFAULT 0,
      food_required INTEGER DEFAULT 0,
      UNIQUE(event_id),
      FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE
    );
  `);

  console.log('✅ Created advanced schema. Inserting seed data...');

  // 1. Admin
  await db.run('INSERT INTO admin (username, password) VALUES (?, ?)', ['admin@gamegrid.com', 'admin123']);

  // 2. Students with extended profiles
  const students = [
    { name: 'Aarav Patel',   email: 'aarav@cdgi.edu',   pass: 'pass123', roll: 'CDGI-21-001', branch: 'CSE', year: 3, section: 'A', phone: '9876543210', wins: 2 },
    { name: 'Diya Sharma',   email: 'diya@cdgi.edu',    pass: 'pass123', roll: 'CDGI-22-042', branch: 'IT',  year: 2, section: 'B', phone: '9876543211', wins: 0 },
    { name: 'Kabir Singh',   email: 'kabir@cdgi.edu',   pass: 'pass123', roll: 'CDGI-23-112', branch: 'MBA', year: 1, section: 'C', phone: '9876543212', wins: 1 },
    { name: 'Ananya Gupta',  email: 'ananya@cdgi.edu',  pass: 'pass123', roll: 'CDGI-22-088', branch: 'BBA', year: 2, section: 'A', phone: '9876543213', wins: 0 },
    { name: 'Vihaan Verma',  email: 'vihaan@cdgi.edu',  pass: 'pass123', roll: 'CDGI-20-005', branch: 'CSE', year: 4, section: 'B', phone: '9876543214', wins: 3 },
  ];
  for (const s of students) {
    await db.run(
      'INSERT INTO students (name, email, password, roll_number, branch, year, section, phone, wins) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
      [s.name, s.email, s.pass, s.roll, s.branch, s.year, s.section, s.phone, s.wins]
    );
  }

  // 3. Events with Eligibility
  const events = [
    {
      name: 'Annual Inter-College Cricket Cup', sport: 'Cricket', date: '2026-05-10',
      status: 'registration_open', elig: 'All Undergrads', branches: 'All', years: '1,2,3,4',
      img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1600',
      desc: 'The biggest cricket event of the year.'
    },
    {
      name: 'CDGI Football League 2026', sport: 'Football', date: '2026-06-15',
      status: 'registration_open', elig: 'B.Tech Only', branches: 'CSE,IT,ME,CE,ECE', years: '2,3,4',
      img: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1600',
      desc: 'Inter-department football league. Heavy competition.'
    },
    {
      name: 'Summer Basketball Shootout', sport: 'Basketball', date: '2026-07-20',
      status: 'upcoming', elig: 'Open for All', branches: 'All', years: 'All',
      img: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1600',
      desc: 'Fast-paced basketball tournament.'
    },
    {
      name: 'Volleyball Championship', sport: 'Volleyball', date: '2026-08-05',
      status: 'upcoming', elig: 'Year 1 & 2 only', branches: 'All', years: '1,2',
      img: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1600',
      desc: 'Annual volleyball championship.'
    }
  ];
  
  for (const e of events) {
    const res = await db.run(
      'INSERT INTO events (name, sport, date, status, eligibility, allowed_branches, allowed_years, image_url, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [e.name, e.sport, e.date, e.status, e.elig, e.branches, e.years, e.img, e.desc]
    );
    await db.run('INSERT INTO logistics (event_id, ground) VALUES (?, ?)', [res.lastID, e.sport + ' Court 1']);
  }

  // Seed some registrations
  await db.run('INSERT INTO registrations (student_id, event_id) VALUES (1, 1), (2, 1), (5, 1)');
  await db.run('INSERT INTO registrations (student_id, event_id) VALUES (1, 2), (5, 2)');
  
  // Update counts
  await db.run(`UPDATE events SET registered_count = (SELECT COUNT(*) FROM registrations WHERE event_id = events.id)`);

  console.log('🚀 Advanced Database Ready.');
  process.exit(0);
}

setup();
