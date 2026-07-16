-- ============================================================
-- ChapterBid Marketplace — Sample Dataset (Seed Data)
-- ============================================================
-- This file is executed automatically by src/lib/db.js on first run
-- (only when the Book table is empty).
-- To run manually: sqlite3 marketplace.db < seed.sql
-- ============================================================

-- Sample books
INSERT INTO Book (id, title, author, description, suggested_price) VALUES
  (1, 'The Stars Beyond', 'Elena Rostova',
   'An epic space opera chronicling humanity''s first voyage outside the Milky Way. Hardcover in pristine condition with minor wear on the dust jacket.',
   24.99),
  (2, 'Mastering JavaScript and Design Patterns', 'Douglas Crockford',
   'A must-have guide for modern JavaScript development. Covers closures, prototypes, asynchronous programming, and structural design patterns. Paperback, like-new.',
   35.00),
  (3, 'Whispers of the Wind', 'Julian Green',
   'A beautiful historical drama set in 19th-century Europe. Follows two families during the Industrial Revolution. Softcover with slightly yellowed pages.',
   12.50);

-- Cover images (paths relative to public/)
INSERT INTO BookImage (book_id, image_path) VALUES
  (1, '/uploads/sample_scifi_cover.png'),
  (2, '/uploads/sample_code_cover.png'),
  (3, '/uploads/sample_novel_cover.png');

-- Sample bids (Book 3 intentionally has none to test the no-bid UI state)
INSERT INTO Bid (book_id, bidder_name, bid_amount) VALUES
  (1, 'Alex Mercer',    26.00),
  (1, 'Sarah Connor',   28.50),
  (2, 'Linus Torvalds', 36.00);
