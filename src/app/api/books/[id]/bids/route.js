import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { bidder_name, bid_amount } = await request.json();

    if (!bidder_name || bidder_name.trim() === '') {
      return NextResponse.json({ error: 'Bidder name is required' }, { status: 400 });
    }

    const amount = parseFloat(bid_amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Bid amount must be a positive number' }, { status: 400 });
    }

    // Check if book exists
    const book = db.prepare('SELECT * FROM Book WHERE id = ?').get(id);
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Check if there are existing bids and verify if the new bid is higher than the current highest bid
    const highestBidRow = db.prepare('SELECT MAX(bid_amount) as max_bid FROM Bid WHERE book_id = ?').get(id);
    const currentHighest = highestBidRow?.max_bid || 0;

    if (amount <= currentHighest) {
      return NextResponse.json({ 
        error: `Bid must be higher than the current highest bid of $${currentHighest.toFixed(2)}` 
      }, { status: 400 });
    }

    // Also check if bid is higher than or equal to the suggested price if it is the first bid
    if (currentHighest === 0 && amount < book.suggested_price) {
      return NextResponse.json({
        error: `Initial bid must be at least the suggested price of $${book.suggested_price.toFixed(2)}`
      }, { status: 400 });
    }

    const insertBid = db.prepare(`
      INSERT INTO Bid (book_id, bidder_name, bid_amount)
      VALUES (?, ?, ?)
    `);
    
    insertBid.run(id, bidder_name.trim(), amount);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error placing bid:', error);
    return NextResponse.json({ error: 'Failed to place bid' }, { status: 500 });
  }
}
