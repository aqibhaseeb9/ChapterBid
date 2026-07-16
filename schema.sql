-- ============================================================
-- ChapterBid Marketplace — Database Schema
-- Engine: SQLite 3 (via better-sqlite3)
-- ============================================================
-- This file is executed automatically by src/lib/db.js on startup.
-- To recreate manually: sqlite3 marketplace.db < schema.sql
-- ============================================================

-- Stores each used book listed on the marketplace
CREATE TABLE IF NOT EXISTS Book (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  title           TEXT    NOT NULL,
  author          TEXT    NOT NULL,
  description     TEXT    NOT NULL,
  suggested_price REAL    NOT NULL
);

-- Stores one or more cover image paths per book
CREATE TABLE IF NOT EXISTS BookImage (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id    INTEGER NOT NULL,
  image_path TEXT    NOT NULL,
  FOREIGN KEY (book_id) REFERENCES Book(id) ON DELETE CASCADE
);

-- Stores bids placed by buyers on a specific book
CREATE TABLE IF NOT EXISTS Bid (
  id          INTEGER  PRIMARY KEY AUTOINCREMENT,
  book_id     INTEGER  NOT NULL,
  bidder_name TEXT     NOT NULL,
  bid_amount  REAL     NOT NULL,
  timestamp   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES Book(id) ON DELETE CASCADE
);
