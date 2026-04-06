import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import pg from 'pg';
import path from 'path';

const { Pool } = pg;

const DB_PATH = path.join(process.cwd(), 'database', 'sportssphere.db');

let _db = null;

export async function openDB() {
  if (_db) return _db;

  // Use PostgreSQL if POSTGRES_URL is present (Vercel/Cloud)
  if (process.env.POSTGRES_URL || process.env.DATABASE_URL) {
    const pool = new Pool({
      connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    _db = {
      // Helper to convert SQLite ? to PG $1, $2, etc.
      getSql: (sql) => sql.replace(/\?/g, (match, offset, string) => `$${(string.slice(0, offset).match(/\?/g) || []).length + 1}`),

      get: async (sql, params = []) => {
        const res = await pool.query(_db.getSql(sql), params);
        return res.rows[0];
      },
      all: async (sql, params = []) => {
        const res = await pool.query(_db.getSql(sql), params);
        return res.rows;
      },
      run: async (sql, params = []) => {
        // PG doesn't have lastID like SQLite, so we tip the SQL if it's an INSERT
        let pgSql = _db.getSql(sql);
        if (pgSql.trim().toUpperCase().startsWith('INSERT') && !pgSql.toUpperCase().includes('RETURNING')) {
          pgSql += ' RETURNING id';
        }
        const res = await pool.query(pgSql, params);
        return { 
          lastID: res.rows[0]?.id || null, 
          changes: res.rowCount 
        };
      },
      exec: async (sql) => {
        await pool.query(sql);
      }
    };
  } else {
    // Local SQLite
    _db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });
    // Enable foreign keys
    await _db.run('PRAGMA foreign_keys = ON');
  }

  return _db;
}
