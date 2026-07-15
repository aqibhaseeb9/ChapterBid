import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const book = db.prepare('SELECT * FROM Book WHERE id = ?').get(id);
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const images = db.prepare('SELECT image_path FROM BookImage WHERE book_id = ?').all(id);
    const bids = db.prepare('SELECT * FROM Bid WHERE book_id = ? ORDER BY bid_amount DESC, timestamp DESC').all(id);

    return NextResponse.json({
      ...book,
      images: images.map(img => img.image_path),
      bids
    });
  } catch (error) {
    console.error('Error fetching book details:', error);
    return NextResponse.json({ error: 'Failed to fetch book details' }, { status: 500 });
  }
}
