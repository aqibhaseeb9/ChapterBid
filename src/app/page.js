'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, BookOpen, AlertCircle } from 'lucide-react';

export default function HomePage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchBooks = async (query = '') => {
    try {
      setLoading(true);
      const res = await fetch(`/api/books?search=${encodeURIComponent(query)}`);
      if (!res.ok) {
        throw new Error('Failed to retrieve book listings.');
      }
      const data = await res.json();
      setBooks(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the marketplace database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    fetchBooks(val);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Hero Section */}
      <div className="animate-scale-in relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-8 py-12 text-white shadow-xl dark:from-indigo-900 dark:via-indigo-900 dark:to-purple-950 transition-all duration-300">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl animate-fade-in-up">
            Find Your Next Chapter
          </h1>
          <p className="mt-3 text-lg text-indigo-100 animate-fade-in-up delay-100">
            Community-driven used book marketplace. Browse, bid, and buy directly from fellow book lovers.
          </p>

          {/* Search bar inside hero */}
          <div className="mt-7 animate-fade-in-up delay-150">
            <div className="relative group max-w-lg">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="h-5 w-5 text-indigo-300 group-focus-within:text-indigo-600 transition-colors duration-200" />
              </div>
              <input
                type="text"
                placeholder="Search by title or author…"
                value={search}
                onChange={handleSearchChange}
                className="block w-full rounded-2xl border-0 bg-white/95 py-3.5 pl-11 pr-4 text-slate-900 placeholder-slate-400 shadow-lg ring-2 ring-transparent transition-all duration-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-white/80 backdrop-blur-sm text-sm font-medium"
              />
            </div>
          </div>
        </div>

        {/* Decorative background icon */}
        <div className="absolute -right-10 -bottom-10 opacity-10 dark:opacity-20 pointer-events-none">
          <BookOpen className="h-80 w-80 rotate-12" />
        </div>
      </div>

      {/* Book count bar */}
      <div className="mb-6 flex items-center justify-between animate-fade-in-up delay-100">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Showing <span className="font-bold text-slate-700 dark:text-slate-200">{books.length}</span> {books.length === 1 ? 'book' : 'books'}
          {search && <span className="ml-1 text-indigo-500 dark:text-indigo-400">for &ldquo;{search}&rdquo;</span>}
        </p>
      </div>

      {/* Book Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent dark:border-indigo-400"></div>
        </div>
      ) : error ? (
        <div className="animate-scale-in rounded-2xl bg-red-50 p-6 text-center text-red-600 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle className="mx-auto h-12 w-12" />
          <h3 className="mt-2 text-lg font-semibold">Database Error</h3>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      ) : books.length === 0 ? (
        <div className="animate-scale-in rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center dark:border-slate-800">
          <BookOpen className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-700" />
          <h3 className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-300">No books found</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
            {search ? "We couldn't find any books matching your search query." : "There are currently no book listings available."}
          </p>
          {search && (
            <button
              onClick={() => { setSearch(''); fetchBooks(''); }}
              className="mt-4 inline-flex items-center rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition-all duration-200 dark:bg-indigo-950/50 dark:text-indigo-400"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books.map((book, idx) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              style={{ animationDelay: `${idx * 50}ms` }}
              className="animate-fade-in-up group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="relative aspect-3/4 w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                {book.thumbnail ? (
                  <img
                    src={book.thumbnail}
                    alt={book.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                    <BookOpen className="h-16 w-16" />
                    <span className="mt-2 text-xs font-medium">No Image</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 rounded-full bg-indigo-600/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  {book.bid_count} {book.bid_count === 1 ? 'bid' : 'bids'}
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400 transition-colors duration-300 line-clamp-1">
                    {book.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1 italic">
                    by {book.author}
                  </p>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {book.description}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    Suggested Price
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    ${book.suggested_price.toFixed(2)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}