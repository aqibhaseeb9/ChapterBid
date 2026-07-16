# ChapterBid — Used Book Marketplace

ChapterBid is a responsive web application that allows users to post used books for sale, browse listings, and place bids. It features a clean, premium indigo/violet design system with smooth animations, dark mode support, and a polished split-layout bidding experience.

---

## 🛠️ Technology Stack

*   **Frontend & Routing**: [Next.js](https://nextjs.org/) (App Router, JavaScript)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Database**: [SQLite](https://sqlite.org/) (via `better-sqlite3` — no server required)
*   **Media Storage**: Local file system (`public/uploads`)

---

## 📁 Project Structure

```text
ChapterBid/
├── public/
│   └── uploads/                # Uploaded book photographs (served statically)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── books/
│   │   │       ├── route.js            # GET /api/books (list/search) & POST /api/books (create)
│   │   │       └── [id]/
│   │   │           ├── route.js        # GET /api/books/[id] (book details + bids)
│   │   │           └── bids/
│   │   │               └── route.js   # POST /api/books/[id]/bids (place a bid)
│   │   ├── books/
│   │   │   ├── [id]/
│   │   │   │   └── page.js            # Book details & bidding page (split layout)
│   │   │   └── new/
│   │   │       └── page.js            # Create listing form (drag-and-drop images)
│   │   ├── globals.css                # Global styles & animation keyframes
│   │   ├── layout.js                  # Root layout with sticky header & footer
│   │   └── page.js                    # Homepage — hero search, book grid
│   └── lib/
│       └── db.js                      # Opens SQLite connection, runs schema.sql & seed.sql
├── schema.sql                  # Database schema — table definitions (Book, BookImage, Bid)
├── seed.sql                    # Sample dataset — 3 books with images and bids
├── marketplace.db              # SQLite database file (auto-generated on first run)
├── package.json
└── README.md
```

---

## 🗄️ Database Schema

Three tables are created automatically on startup:

### `Book`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER | Primary key, autoincrement |
| `title` | TEXT | Not null |
| `author` | TEXT | Not null |
| `description` | TEXT | Not null |
| `suggested_price` | REAL | Minimum opening bid |

### `BookImage`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER | Primary key, autoincrement |
| `book_id` | INTEGER | FK → `Book(id)` ON DELETE CASCADE |
| `image_path` | TEXT | Path relative to `public/` |

### `Bid`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER | Primary key, autoincrement |
| `book_id` | INTEGER | FK → `Book(id)` ON DELETE CASCADE |
| `bidder_name` | TEXT | Not null |
| `bid_amount` | REAL | Must exceed current highest bid |
| `timestamp` | DATETIME | Defaults to current time |

---

## 🚀 Setup & Running Locally

### Prerequisites
[Node.js](https://nodejs.org/) v18+ is required.

### 1. Install dependencies
```bash
npm install
```

### 2. Start the development server
```bash
npm run dev
```
Then open [http://localhost:3000](http://localhost:3000).

### 3. Seed data
On first run, `marketplace.db` is created automatically and seeded with **3 sample book listings** (defined in `seed.sql`) complete with descriptions, cover images, and initial bids — no manual setup needed.

---

## 🗃️ Viewing / Editing the Database

The database is a single file: `marketplace.db` in the project root. Since it's SQLite:

| Tool | How |
|---|---|
| **DB Browser for SQLite** (recommended) | [sqlitebrowser.org](https://sqlitebrowser.org/dl/) — free GUI, works like SSMS. Open `marketplace.db`, browse/edit rows, run SQL. |
| **TablePlus** | [tableplus.com](https://tableplus.com/) — more polished UI, freemium |
| **VS Code Extension** | Install "SQLite Viewer" — click `marketplace.db` in the explorer for a read-only view inline |

> **Tip:** Stop the dev server before editing the database in an external tool to avoid file lock conflicts.

---

## 🎨 Design & Features

1. **Premium UI**: Indigo/violet colour palette with dark mode support, glassmorphism effects, and micro-animations throughout.
2. **Hero Search**: The search bar lives inside the hero banner on the homepage for immediate discoverability.
3. **Split Bidding Layout**: Book detail page shows the cover image on the left and all info, pricing, bid form, and bid history on the right — sticky on desktop.
4. **Live Step Indicator**: The "List a Book" form shows a 4-step progress tracker that lights up as you fill each section.
5. **Drag & Drop Uploads**: Book photos can be dragged directly onto the upload zone — up to 3 images per listing.
6. **Bid Timeline**: Bids are displayed as a vertical timeline with the leading bidder highlighted and badged.
7. **Automatic Seeding**: AI-generated book covers in `public/uploads` are seeded automatically on first run.
