'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
const NextLink = Link;
import { ArrowLeft, BookOpen, User, Gavel, AlertCircle, CheckCircle, TrendingUp, Clock } from 'lucide-react';

export default function BookDetailsPage({ params }) {
  const resolvedParams = use(params);
  const bookId = resolvedParams.id;

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [bidderName, setBidderName] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [submittingBid, setSubmittingBid] = useState(false);
  const [bidError, setBidError] = useState(null);
  const [bidSuccess, setBidSuccess] = useState(false);

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Fetch book details
  const fetchBookDetails = async () => {
    try {
      const res = await fetch(`/api/books/${bookId}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Book listing not found.');
        }
        throw new Error('Failed to retrieve book details.');
      }
      const data = await res.json();
      setBook(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while loading details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookDetails();
  }, [bookId]);

  // Submit Bid Handler
  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setBidError(null);
    setBidSuccess(false);

    if (!bidderName.trim()) {
      setBidError('Please enter your name.');
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setBidError('Please enter a valid positive bid amount.');
      return;
    }

    const currentHighest = book.bids && book.bids.length > 0 ? book.bids[0].bid_amount : 0;

    if (amount <= currentHighest) {
      setBidError(`Your bid must be higher than the current highest bid of $${currentHighest.toFixed(2)}.`);
      return;
    }

    if (currentHighest === 0 && amount < book.suggested_price) {
      setBidError(`The first bid must be at least the suggested price of $${book.suggested_price.toFixed(2)}.`);
      return;
    }

    setSubmittingBid(true);

    try {
      const res = await fetch(`/api/books/${bookId}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bidder_name: bidderName.trim(),
          bid_amount: amount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place bid.');
      }

      setBidSuccess(true);
      setBidAmount('');
      setBidderName('');
      await fetchBookDetails();
    } catch (err) {
      console.error(err);
      setBidError(err.message || 'An error occurred while submitting your bid.');
    } finally {
      setSubmittingBid(false);
    }
  };

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent dark:border-indigo-400" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">Loading book details…</p>
        </div>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────────
  if (error || !book) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center animate-fade-in-up">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-8 dark:border-red-900/30 dark:bg-red-950/30">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 dark:text-red-400" />
          <h3 className="mt-4 text-lg font-semibold text-red-700 dark:text-red-300">Error Loading Listing</h3>
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error || 'The book listing could not be found.'}</p>
          <NextLink
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Browse
          </NextLink>
        </div>
      </div>
    );
  }

  const highestBid = book.bids && book.bids.length > 0 ? book.bids[0] : null;

  // ── Main Page ──────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* Back navigation */}
      <NextLink
        href="/"
        className="animate-fade-in-up inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors duration-200 mb-8 group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
        Back to browse
      </NextLink>

      {/* ── Two-Column Split Layout ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[420px_1fr] lg:gap-12 items-start">

        {/* ── LEFT COLUMN: Book Cover & Thumbnails ─────────────────────────── */}
        <div className="animate-fade-in-up lg:sticky lg:top-24">

          {/* Main Image */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-800 shadow-2xl shadow-slate-300/50 dark:shadow-slate-900/60 aspect-[3/4]">
            {book.images && book.images.length > 0 ? (
              <>
                <img
                  key={activeImageIndex}
                  src={book.images[activeImageIndex]}
                  alt={book.title}
                  onLoad={() => setImageLoaded(true)}
                  className="h-full w-full object-cover transition-all duration-500 ease-out animate-scale-in"
                />
                {/* Subtle gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent pointer-events-none rounded-b-3xl" />
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                <BookOpen className="h-20 w-20" />
                <span className="mt-3 text-sm font-medium tracking-wide uppercase">No Photos</span>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {book.images && book.images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {book.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`
                    relative flex-shrink-0 h-16 w-16 overflow-hidden rounded-xl transition-all duration-300
                    ${activeImageIndex === index
                      ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105 dark:ring-offset-slate-950'
                      : 'opacity-60 hover:opacity-100 hover:scale-105'}
                  `}
                >
                  <img src={img} alt={`${book.title} view ${index + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Bid counter badge below image */}
          <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-slate-100 dark:bg-slate-800/60 px-4 py-3">
            <TrendingUp className="h-4 w-4 text-indigo-500" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {book.bids ? book.bids.length : 0} {(book.bids?.length ?? 0) === 1 ? 'bid' : 'bids'} placed
            </span>
          </div>
        </div>

        {/* ── RIGHT COLUMN: All Content ─────────────────────────────────────── */}
        <div className="flex flex-col gap-6 animate-fade-in-up delay-100">

          {/* Title & Author */}
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl leading-tight">
              {book.title}
            </h1>
            <p className="mt-2 text-base font-medium italic text-slate-500 dark:text-slate-400">
              by {book.author}
            </p>
          </div>

          {/* Price Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Suggested Price */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/60 transition-all duration-300 hover:shadow-md">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Suggested Price
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-slate-100">
                ${book.suggested_price.toFixed(2)}
              </p>
            </div>

            {/* Current Highest Bid */}
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm dark:border-indigo-700/40 dark:bg-indigo-950/30 transition-all duration-300 hover:shadow-md">
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
                Current Highest Bid
              </p>
              {highestBid ? (
                <div className="mt-2">
                  <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                    ${highestBid.bid_amount.toFixed(2)}
                  </p>
                  <p className="mt-0.5 text-xs text-indigo-500 dark:text-indigo-400 truncate">
                    by {highestBid.bidder_name}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-sm font-medium text-slate-400 dark:text-slate-500">No bids yet</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Description
            </h2>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {book.description}
            </p>
          </div>

          {/* ── Place a Bid ─────────────────────────────────────────────────── */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/60 transition-all duration-300">
            {/* Header */}
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/50">
                <Gavel className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Place a Bid</h2>
            </div>
            <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
              {highestBid
                ? `Your bid must exceed the current highest of $${highestBid.bid_amount.toFixed(2)}.`
                : `Start the bidding! Minimum bid is $${book.suggested_price.toFixed(2)}.`}
            </p>

            {/* Error/Success Alerts */}
            {bidError && (
              <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-400 animate-scale-in">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{bidError}</span>
              </div>
            )}

            {bidSuccess && (
              <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-400 animate-scale-in">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>Your bid has been placed successfully!</span>
              </div>
            )}

            <form onSubmit={handlePlaceBid} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Name Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jane Doe"
                    value={bidderName}
                    onChange={(e) => setBidderName(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all duration-200 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-700"
                  />
                </div>

                {/* Amount Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Bid Amount
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-sm font-bold text-slate-400 dark:text-slate-500">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="0.00"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-8 pr-4 text-sm text-slate-900 placeholder-slate-400 transition-all duration-200 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-700"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingBid}
                className="w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:bg-indigo-500 hover:scale-[1.02] hover:shadow-indigo-300/50 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
              >
                {submittingBid ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Submitting Bid…
                  </span>
                ) : (
                  'Submit Bid'
                )}
              </button>
            </form>
          </div>

          {/* ── Bid History ─────────────────────────────────────────────────── */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700">
                  <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Bid History
                </h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                {book.bids ? book.bids.length : 0}
              </span>
            </div>

            {!book.bids || book.bids.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 py-8 text-center dark:border-slate-700">
                <Gavel className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
                <p className="mt-2 text-sm italic text-slate-400 dark:text-slate-500">
                  No bids yet. Be the first!
                </p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[22px] top-0 bottom-0 w-px bg-slate-100 dark:bg-slate-700" />
                <div className="space-y-3">
                  {book.bids.map((bid, index) => (
                    <div
                      key={bid.id}
                      className="relative flex items-start gap-4 transition-all duration-300 animate-fade-in-up"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      {/* Icon */}
                      <div className={`
                        relative z-10 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-base
                        transition-all duration-300 shadow-sm
                        ${index === 0
                          ? 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-indigo-900/50'
                          : 'bg-white border-2 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-600'}
                      `}>
                        {index === 0 ? '🏆' : <User className="h-4 w-4" />}
                      </div>

                      {/* Details */}
                      <div className={`
                        flex-1 rounded-2xl px-4 py-3 transition-all duration-300
                        ${index === 0
                          ? 'bg-indigo-50 border border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900/40'
                          : 'bg-slate-50 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-700'}
                      `}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className={`text-sm font-semibold ${index === 0 ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'}`}>
                              {bid.bidder_name}
                            </span>
                            {index === 0 && (
                              <span className="ml-2 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                                Leading
                              </span>
                            )}
                          </div>
                          <span className={`text-sm font-bold flex-shrink-0 ${index === 0 ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                            ${bid.bid_amount.toFixed(2)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                          {new Date(bid.timestamp).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
        {/* ── END RIGHT COLUMN ─────────────────────────────────────────────── */}

      </div>
    </div>
  );
}