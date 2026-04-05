import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'database', 'sportssphere.db');

let _db = null;

export async function openDB() {
  if (_db) return _db;
  _db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });
  // Enable foreign keys
  await _db.run('PRAGMA foreign_keys = ON');
  return _db;
}
