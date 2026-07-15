'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Upload, X, Loader2, AlertCircle,
  BookOpen, DollarSign, AlignLeft, ImagePlus, CheckCircle2,
} from 'lucide-react';

// ── Step indicator data ────────────────────────────────────────────────────────
const STEPS = [
  { icon: BookOpen,    label: 'Book Info'    },
  { icon: DollarSign,  label: 'Pricing'      },
  { icon: AlignLeft,   label: 'Description'  },
  { icon: ImagePlus,   label: 'Photos'       },
];

export default function NewBookPage() {
  const router = useRouter();

  const [title,       setTitle]       = useState('');
  const [author,      setAuthor]      = useState('');
  const [description, setDescription] = useState('');
  const [price,       setPrice]       = useState('');
  const [images,      setImages]      = useState([]);
  const [previews,    setPreviews]    = useState([]);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState(null);
  const [dragOver,    setDragOver]    = useState(false);

  const fileInputRef = useRef(null);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const addFiles = (selectedFiles) => {
    const arr = Array.from(selectedFiles);
    if (images.length + arr.length > 3) {
      setError('You can upload a maximum of 3 photographs.');
      return;
    }
    const updatedImages   = [...images, ...arr];
    const newPreviews     = arr.map(f => URL.createObjectURL(f));
    const updatedPreviews = [...previews, ...newPreviews];
    setImages(updatedImages);
    setPreviews(updatedPreviews);
    setError(null);
  };

  const handleImageChange = (e) => addFiles(e.target.files);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index]);
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  // Derive which steps are "done" for the progress indicator
  const stepsComplete = [
    !!(title.trim() && author.trim()),
    !!price,
    !!description.trim(),
    images.length > 0,
  ];

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !author.trim() || !description.trim() || !price) {
      setError('All fields are required before publishing.');
      return;
    }
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      setError('Suggested price must be a valid positive number.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title',           title.trim());
      formData.append('author',          author.trim());
      formData.append('description',     description.trim());
      formData.append('suggested_price', numericPrice);
      images.forEach(img => formData.append('images', img));

      const res  = await fetch('/api/books', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit listing.');

      router.push('/');
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while creating the listing.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Shared input classes ───────────────────────────────────────────────────
  const inputCls = `
    block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm
    text-slate-900 placeholder-slate-400 shadow-sm
    transition-all duration-200
    focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10
    dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100
    dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-800/80
  `;

  const labelCls = `
    block text-xs font-bold uppercase tracking-widest
    text-slate-400 dark:text-slate-500 mb-2
  `;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">

      {/* Back link */}
      <Link
        href="/"
        className="animate-fade-in-up inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors duration-200 mb-8 group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
        Back to browse
      </Link>

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div className="animate-fade-in-up mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          List a Book
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Fill in the details below and publish your book to the ChapterBid marketplace.
        </p>
      </div>

      {/* ── Progress Steps ─────────────────────────────────────────────────── */}
      <div className="animate-fade-in-up delay-100 mb-10 grid grid-cols-4 gap-3">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const done = stepsComplete[i];
          return (
            <div
              key={i}
              className={`
                flex flex-col items-center gap-2 rounded-2xl border px-3 py-3
                transition-all duration-300
                ${done
                  ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-800/50 dark:bg-indigo-950/30'
                  : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60'}
              `}
            >
              <div className={`
                flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300
                ${done
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/40'
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'}
              `}>
                {done
                  ? <CheckCircle2 className="h-5 w-5" />
                  : <Icon className="h-5 w-5" />}
              </div>
              <span className={`
                hidden sm:block text-[11px] font-bold uppercase tracking-wider text-center
                ${done ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}
              `}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Main form card ─────────────────────────────────────────────────── */}
      <div className="animate-scale-in delay-150 rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 overflow-hidden">

        {/* Card header accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-7">

          {/* Error alert */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-400 animate-scale-in">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Row 1: Title & Author ──────────────────────────────────────── */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Book Title</label>
              <input
                type="text"
                required
                placeholder="e.g. The Great Gatsby"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Author Name</label>
              <input
                type="text"
                required
                placeholder="e.g. F. Scott Fitzgerald"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* ── Row 2: Price ──────────────────────────────────────────────── */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Suggested Price</label>
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
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className={`${inputCls} pl-8`}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                This is the minimum opening bid price.
              </p>
            </div>
            <div className="flex flex-col justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                💡 <span className="font-bold text-slate-700 dark:text-slate-300">Tip:</span> Set a fair price based on condition. Books in good condition typically sell for 40–60% of their retail price.
              </p>
            </div>
          </div>

          {/* ── Description ───────────────────────────────────────────────── */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className={labelCls.trim()}>Description</label>
              <span className={`text-xs font-medium transition-colors duration-200 ${description.length > 20 ? 'text-indigo-500' : 'text-slate-300 dark:text-slate-600'}`}>
                {description.length} chars
              </span>
            </div>
            <textarea
              required
              rows={4}
              placeholder="Describe the book's condition, edition, and any notes — e.g. hardcover, slight cover crease, no highlights inside…"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className={`${inputCls} resize-none leading-relaxed`}
            />
          </div>

          {/* ── Image Upload ───────────────────────────────────────────────── */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className={labelCls.trim()}>
                Book Photographs
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                  {images.length} / 3
                </span>
              </label>
              <span className="text-xs text-slate-400 dark:text-slate-500">Optional · Max 5 MB each</span>
            </div>

            {/* Drop zone */}
            {images.length < 3 && (
              <label
                onDragOver={e => { e.preventDefault(); setDragOver(true);  }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`
                  group relative mb-4 flex cursor-pointer flex-col items-center justify-center
                  gap-3 rounded-2xl border-2 border-dashed px-6 py-10
                  transition-all duration-300
                  ${dragOver
                    ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-950/30 scale-[1.01]'
                    : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/20'}
                `}
              >
                <div className={`
                  flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300
                  ${dragOver
                    ? 'bg-indigo-600 text-white scale-110'
                    : 'bg-white text-slate-400 shadow-sm group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:bg-slate-700 dark:text-slate-500 dark:group-hover:bg-indigo-900/40 dark:group-hover:text-indigo-400'}
                `}>
                  <Upload className="h-6 w-6" />
                </div>

                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors duration-200">
                    {dragOver ? 'Drop to upload' : 'Click or drag photos here'}
                  </p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    PNG, JPG, WEBP · Up to {3 - images.length} more photo{3 - images.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}

            {/* Preview grid */}
            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {previews.map((preview, index) => (
                  <div
                    key={index}
                    className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm dark:border-slate-700 dark:bg-slate-800 animate-scale-in"
                  >
                    <img
                      src={preview}
                      alt={`Book photo ${index + 1}`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-lg opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 hover:bg-white hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    {/* Index badge */}
                    <div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                      Photo {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Action buttons ─────────────────────────────────────────────── */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
            <Link
              href="/"
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:bg-indigo-500 hover:scale-105 hover:shadow-indigo-300/50 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Publish Listing
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
