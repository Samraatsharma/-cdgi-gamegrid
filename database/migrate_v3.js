import { openDB } from './db.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

async function migrate() {
  const isPostgres = !!(process.env.POSTGRES_URL || process.env.DATABASE_URL);
  console.log(`🔧 Migrating CDGI Sports Sphere ${isPostgres ? 'PostgreSQL' : 'SQLite'} Database to V3 (Coordinator Role)...`);

  const db = await openDB();

  // 1. Create coordinators table
  try {
    if (isPostgres) {
      await db.exec(`
        CREATE TABLE IF NOT EXISTS coordinators (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          assigned_sport TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } else {
      await db.exec(`
        CREATE TABLE IF NOT EXISTS coordinators (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          assigned_sport TEXT NOT NULL,
          created_at TEXT DEFAULT (datetime('now'))
        );
      `);
    }
    console.log('✅ Created coordinators table (or already existed).');
  } catch (e) {
    console.error('❌ Error creating coordinators table:', e.message);
  }

  // 2. Add coordinator_id column to events table
  try {
    await db.exec(`ALTER TABLE events ADD COLUMN coordinator_id INTEGER`);
    console.log('✅ Added coordinator_id to events table.');
  } catch (e) {
    if (e.message.includes('duplicate column name') || e.message.includes('already exists')) {
      console.log('⚠️ coordinator_id column already exists. Skipping.');
    } else {
      console.error('❌ Error adding coordinator_id:', e.message);
    }
  }

  // 3. Seed a sample coordinator for each sport
  const sampleCoordinators = [
    { name: 'Prof. Rajan Verma', email: 'cricket.coord@cdgi.edu', password: 'coord123', sport: 'Cricket' },
    { name: 'Prof. Meena Patel', email: 'football.coord@cdgi.edu', password: 'coord123', sport: 'Football' },
    { name: 'Prof. Suresh Kumar', email: 'basketball.coord@cdgi.edu', password: 'coord123', sport: 'Basketball' },
    { name: 'Prof. Anjali Singh', email: 'volleyball.coord@cdgi.edu', password: 'coord123', sport: 'Volleyball' },
  ];

  for (const c of sampleCoordinators) {
    try {
      await db.run(
        'INSERT INTO coordinators (name, email, password, assigned_sport) VALUES (?, ?, ?, ?)',
        [c.name, c.email, c.password, c.sport]
      );
      console.log(`✅ Added coordinator: ${c.name} (${c.sport})`);
    } catch (e) {
      if (e.message.includes('UNIQUE') || e.message.includes('unique')) {
        console.log(`⚠️ Coordinator ${c.email} already exists. Skipping.`);
      } else {
        console.error(`❌ Error inserting coordinator ${c.name}:`, e.message);
      }
    }
  }

  console.log('🚀 Migration to V3 Complete. Coordinator role system is ready.');
  process.exit(0);
}

migrate();
