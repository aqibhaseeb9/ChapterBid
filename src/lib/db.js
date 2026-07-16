import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'marketplace.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Load and execute schema.sql (creates tables if they don't exist)
const schemaPath = path.join(process.cwd(), 'schema.sql');
db.exec(fs.readFileSync(schemaPath, 'utf8'));

// Seed from seed.sql only if the database is empty
const { count } = db.prepare('SELECT count(*) as count FROM Book').get();
if (count === 0) {
  console.log('[db] Seeding initial marketplace data from seed.sql...');
  const seedPath = path.join(process.cwd(), 'seed.sql');
  db.exec(fs.readFileSync(seedPath, 'utf8'));
}

console.log('[db] Database ready at', dbPath);

export default db;
