import { openDB } from './db.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

async function migrate() {
  const isPostgres = !!(process.env.POSTGRES_URL || process.env.DATABASE_URL);
  console.log(`🔧 Migrating CDGI Sports Sphere ${isPostgres ? 'PostgreSQL' : 'SQLite'} Database to V2...`);
  
  const db = await openDB();

  const columnsToAdd = [
    { name: 'venue', type: 'TEXT DEFAULT \'TBD\'' },
    { name: 'equipment', type: 'TEXT DEFAULT \'Standard Equipment\'' },
    { name: 'prize_pool', type: 'TEXT DEFAULT \'Certificates & Medals\'' },
    { name: 'rules', type: 'TEXT DEFAULT \'Standard College Rules Apply\'' },
    { name: 'event_format', type: 'TEXT DEFAULT \'Knockout\'' },
    { name: 'gender_category', type: 'TEXT DEFAULT \'Open for All\'' }
  ];

  for (const col of columnsToAdd) {
    try {
      await db.exec(`ALTER TABLE events ADD COLUMN ${col.name} ${col.type}`);
      console.log(`✅ Added column ${col.name} to events table.`);
    } catch (e) {
      if (e.message.includes('duplicate column name') || e.message.includes('already exists')) {
         console.log(`⚠️ Column ${col.name} already exists. Skipping.`);
      } else {
         console.error(`❌ Error adding column ${col.name}:`, e.message);
      }
    }
  }

  console.log('🚀 Migration to V2 Complete.');
  process.exit(0);
}

migrate();
