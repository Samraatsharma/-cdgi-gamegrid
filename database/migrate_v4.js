import { openDB } from './db.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

async function migrate() {
  const isPostgres = !!(process.env.POSTGRES_URL || process.env.DATABASE_URL);
  console.log(`🔧 Migrating CDGI Sports Sphere ${isPostgres ? 'PostgreSQL' : 'SQLite'} Database to V4 (Advanced Features)...`);

  const db = await openDB();

  // List of columns to add to registrations
  const regColumns = [
    { name: 'registration_type', def: "TEXT DEFAULT 'individual'" },
    { name: 'team_name', def: 'TEXT' },
    { name: 'team_members', def: 'TEXT' },
    { name: 'transaction_id', def: 'TEXT' },
    { name: 'payment_amount', def: 'INTEGER' },
    { name: 'payment_confidence', def: "TEXT DEFAULT 'none'" },
    { name: 'waitlist_position', def: 'INTEGER DEFAULT 0' },
  ];

  for (const col of regColumns) {
    try {
      await db.exec(`ALTER TABLE registrations ADD COLUMN ${col.name} ${col.def}`);
      console.log(`✅ Added registrations.${col.name}`);
    } catch (e) {
      if (e.message.includes('duplicate column name') || e.message.includes('already exists')) {
        console.log(`⚠️ registrations.${col.name} already exists. Skipping.`);
      } else {
        console.error(`❌ Error adding registrations.${col.name}:`, e.message);
      }
    }
  }

  // Add user_role to notifications for targeted routing
  try {
    await db.exec(`ALTER TABLE notifications ADD COLUMN user_role TEXT DEFAULT 'student'`);
    console.log('✅ Added notifications.user_role');
  } catch (e) {
    if (e.message.includes('duplicate column name') || e.message.includes('already exists')) {
      console.log('⚠️ notifications.user_role already exists. Skipping.');
    } else {
      console.error('❌ Error adding notifications.user_role:', e.message);
    }
  }

  // Add action_url to notifications for actionable links
  try {
    await db.exec(`ALTER TABLE notifications ADD COLUMN action_url TEXT`);
    console.log('✅ Added notifications.action_url');
  } catch (e) {
    if (e.message.includes('duplicate column name') || e.message.includes('already exists')) {
      console.log('⚠️ notifications.action_url already exists. Skipping.');
    } else {
      console.error('❌ Error adding notifications.action_url:', e.message);
    }
  }

  console.log('🚀 Migration to V4 Complete. Advanced features are ready.');
  process.exit(0);
}

migrate();
