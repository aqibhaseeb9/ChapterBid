import { NextResponse } from 'next/server';
import db from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const query = `
      SELECT b.id, b.title, b.author, b.suggested_price, b.description,
             (SELECT image_path FROM BookImage WHERE book_id = b.id LIMIT 1) AS thumbnail,
             (SELECT COUNT(*) FROM Bid WHERE book_id = b.id) AS bid_count
      FROM Book b
      WHERE b.title LIKE ? OR b.author LIKE ?
      ORDER BY b.id DESC
    `;
    
    const books = db.prepare(query).all(`%${search}%`, `%${search}%`);
    return NextResponse.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title');
    const author = formData.get('author');
    const description = formData.get('description');
    const priceStr = formData.get('suggested_price');

    if (!title || !author || !description || !priceStr) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const price = parseFloat(priceStr);
    if (isNaN(price) || price < 0) {
      return NextResponse.json({ error: 'Suggested price must be a valid positive number' }, { status: 400 });
    }

    // Insert Book
    const insertBook = db.prepare(`
      INSERT INTO Book (title, author, description, suggested_price)
      VALUES (?, ?, ?, ?)
    `);
    const result = insertBook.run(title, author, description, price);
    const bookId = result.lastInsertRowid;

    // Handle Uploaded Images
    const files = formData.getAll('images');
    const insertImage = db.prepare(`
      INSERT INTO BookImage (book_id, image_path)
      VALUES (?, ?)
    `);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    let savedImagesCount = 0;
    for (const file of files) {
      if (file && file.size > 0 && typeof file.arrayBuffer === 'function') {
        if (savedImagesCount >= 3) break; // Limit to 3 images

        const buffer = Buffer.from(await file.arrayBuffer());
        // Clean up file name to prevent directory traversal or bad character issues
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
        const filePath = path.join(uploadDir, filename);

        await fs.promises.writeFile(filePath, buffer);
        
        const imagePath = `/uploads/${filename}`;
        insertImage.run(bookId, imagePath);
        savedImagesCount++;
      }
    }

    return NextResponse.json({ success: true, bookId });
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json({ error: 'Failed to create book listing' }, { status: 500 });
  }
}
