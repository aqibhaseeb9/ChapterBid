import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'marketplace.db');

// Ensure database directory exists (though process.cwd() is always there)
const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS Book (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    description TEXT NOT NULL,
    suggested_price REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS BookImage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER,
    image_path TEXT NOT NULL,
    FOREIGN KEY(book_id) REFERENCES Book(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS Bid (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER,
    bidder_name TEXT NOT NULL,
    bid_amount REAL NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(book_id) REFERENCES Book(id) ON DELETE CASCADE
  );
`);

// Seed data helper
function seed() {
  const row = db.prepare('SELECT count(*) as count FROM Book').get();
  if (row.count === 0) {
    console.log('Seeding initial marketplace data...');
    
    // Insert sample books
    const insertBook = db.prepare(`
      INSERT INTO Book (title, author, description, suggested_price)
      VALUES (?, ?, ?, ?)
    `);
    
    const insertImage = db.prepare(`
      INSERT INTO BookImage (book_id, image_path)
      VALUES (?, ?)
    `);
    
    const insertBid = db.prepare(`
      INSERT INTO Bid (book_id, bidder_name, bid_amount)
      VALUES (?, ?, ?)
    `);

    // Book 1: Sci-fi
    const book1Id = insertBook.run(
      'The Stars Beyond',
      'Elena Rostova',
      'An epic space opera chronicling humanity\'s first voyage outside the Milky Way. Hardcover in pristine condition with minor wear on the dust jacket. Perfect for collectors of modern space exploration fiction.',
      24.99
    ).lastInsertRowid;
    insertImage.run(book1Id, '/uploads/sample_scifi_cover.png');
    insertBid.run(book1Id, 'Alex Mercer', 26.00);
    insertBid.run(book1Id, 'Sarah Connor', 28.50);

    // Book 2: Coding
    const book2Id = insertBook.run(
      'Mastering JavaScript and Design Patterns',
      'Douglas Crockford',
      'A must-have guide for modern JavaScript development. Covers closures, prototypes, asynchronous programming, and structural design patterns. Paperback edition, like-new condition, no highlights.',
      35.00
    ).lastInsertRowid;
    insertImage.run(book2Id, '/uploads/sample_code_cover.png');
    insertBid.run(book2Id, 'Linus Torvalds', 36.00);
    
    // Book 3: Novel / Classic
    const book3Id = insertBook.run(
      'Whispers of the Wind',
      'Julian Green',
      'A beautiful historical drama set in 19th-century Europe. Follows the intertwining lives of two families during the Industrial Revolution. Softcover with slightly yellowed pages, adding a classic feel.',
      12.50
    ).lastInsertRowid;
    insertImage.run(book3Id, '/uploads/sample_novel_cover.png');
    // No bids yet for Book 3 to test no-bid scenario!
  }
}

seed();

export default db;
