# MENYA — Learn. Practice. Excel.

A centralized digital learning platform for Rwandan learners from **Primary 1 (P1) to Senior 6 (S6)**.
Curriculum books · National exam past papers · Interactive exercises — all free, no account needed.

Built with **Vue 3 (Composition API)**, **Vue Router**, **Tailwind CSS**, and **Lucide icons**.

---

## 🧩 Architecture (one app, not two)

MENYA is a **single application**: an Express server that serves **both** the Vue
website **and** the JSON API (plus uploaded PDFs/covers) from the **same URL**.
There is no second server to run and no CORS to configure. Content added in the
admin portal is saved to a database and is live for **every visitor**.

```
Browser ──▶  Express server (one origin)
                 ├─ /            → the Vue website (built files)
                 ├─ /admin       → the admin portal (same app)
                 ├─ /api/...     → JSON API (books, papers, exercises, login)
                 └─ /uploads/... → uploaded PDF & cover files
```

---

## ✅ How to run

**Requirements:** Node.js 18+ (LTS) from https://nodejs.org

### First time — install everything (frontend + backend)
```bash
cd menya
npm run setup      # installs deps for the app AND the server
```

### Option A — Development (live reload, two processes, one command)
```bash
npm run dev
```
- Opens the site at **http://localhost:5173** (Vite, hot reload)
- Starts the API on **http://localhost:4000** automatically
- Vite proxies `/api` to the server, so it behaves exactly like production
- Admin portal: **http://localhost:5173/admin** (login: `admin` / `menya2026`)

### Option B — Production mode locally (one unified server)
```bash
npm run serve      # builds the site, then runs ONE server for everything
```
- Everything (website + admin + API + uploads) on **http://localhost:4000**
- This is exactly how it runs when deployed.

> **Tip:** `npm run serve` is the best way to preview the real production behaviour.

### Troubleshooting
| Problem | Fix |
|---|---|
| `'vite'/'node' is not recognized` | Run `npm run setup` first; install Node.js |
| Admin shows “Server offline” | The API isn’t running — use `npm run dev` or `npm run serve` |
| Port in use | Change `PORT` (server) or let Vite pick the next free port |

---

## 🗂 Project structure

```
menya/
├─ index.html               # Entry HTML + no-flash theme script + fonts
├─ vite.config.js           # Vite config + "@" alias to /src
├─ tailwind.config.js       # Brand palette, fonts, animations
├─ postcss.config.js
└─ src/
   ├─ main.js               # App bootstrap
   ├─ App.vue               # Shell: Navbar + RouterView + Footer
   ├─ assets/main.css       # Tailwind + design-system component classes
   ├─ router/index.js       # Routes (lazy-loaded pages)
   ├─ composables/          # useTheme, useResourceFilter, useScrollReveal, useToast
   ├─ data/                 # Mock JS data: books, pastPapers, exercises, team, site
   ├─ components/
   │  ├─ layout/            # Navbar, Footer
   │  ├─ ui/                # ThemeToggle, SearchBar, FilterPanel, PreviewModal, etc.
   │  ├─ cards/             # BookCard, PastPaperCard, ResourceCard, TeamMemberCard
   │  └─ sections/          # HeroSection, StatisticsSection
   ├─ lib/api.js            # Frontend API client (talks to the backend)
   └─ pages/                # Home, Books, PastPapers, Exercises, About, Contact, 404
                            #   + pages/admin/ (Dashboard, Books, PastPapers, Exercises)

server/                     # Backend API + serves the built frontend
├─ src/
│  ├─ index.js             # Express app
│  ├─ db.js                # SQLite schema + default admin
│  ├─ auth.js              # JWT login + requireAuth middleware
│  ├─ upload.js            # Multer file-upload config
│  ├─ seed.js / seedData.js# First-run sample data
│  └─ routes/              # books.js, papers.js, exercises.js
├─ uploads/                # Stored PDFs & cover images
└─ data.db                 # SQLite database (created on first run)
```

## ✨ Features
- Responsive on mobile / tablet / desktop
- Light & dark mode with `localStorage` persistence (no flash on load)
- Search + multi-facet filtering (level, subject, year)
- Interactive quiz engine with instant feedback, explanations & score tracking
- PDF preview modals + download toasts
- Scroll-reveal animations, polished hover states, accessible focus styles
## 👤 User Accounts & Data Storage

MENYA supports **user accounts** (students) alongside admins.

### Where accounts are stored
All accounts live in the **SQLite database file**:
- **Locally:** `server/data.db` (the `users` table; bookmarks in the `bookmarks` table)
- **In production (Render/Docker):** on the **persistent disk** at the path set by
  `DB_PATH` (e.g. `/var/data/data.db`) — so accounts survive restarts and redeploys.

Passwords are **hashed with bcrypt** (never stored in plain text). Sessions use a
signed **JWT** (7-day expiry) kept in the browser's localStorage.

### What logged-in students can do (privileges)
- **Download** books & past papers — *downloading requires a free account* (browsing
  and previewing stay open to everyone). This is enforced on the server.
- **Bookmark** books & papers and access them from their dashboard.
- Manage their **profile** and **change their password**.
- A personalised **welcome** greeting + "Remember me" sessions.

### Resilience (no blank pages)
- Every page degrades gracefully if the backend is unreachable: loading skeletons →
  clear **offline state with a Retry button**, plus a site-wide reconnect banner.
- API requests **time out** after 10s so a hung server never freezes the UI.
- A global **error boundary** shows a friendly screen instead of a white page if
  anything unexpected throws.

### What admins can do
- Everything students can, **plus** the full admin panel (manage books, papers,
  exercises) and a **Users** page to view, promote/demote, and remove accounts.

### Roles
`student` (default on sign-up) and `admin`. The first admin is created from
`ADMIN_USERNAME` / `ADMIN_PASSWORD` on first run; admins can promote others.

---

## 🔐 Admin Portal

A real admin portal (with proper username/password login) lets staff manage content.

- **Open it:** the **“Admin Portal”** link in the site footer, or go to **`/admin`**.
- **Default login:** `admin` / `menya2026` → **change this** in `server/.env`
  (`ADMIN_USERNAME`, `ADMIN_PASSWORD`) or in your host's environment variables.

### What admins can do (saved to the database, live for everyone)
- **Books** — add / edit / delete, with real **PDF + cover image uploads**.
- **Past Papers** — add / edit / delete, with real **PDF uploads**.
- **Exercises** — add / edit / delete MCQs: question, subject/level/difficulty,
  options A–D, mark the **correct** one, and an explanation. (No file needed.)

### API endpoints (same origin)
| Method | Route | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/login` | — | Returns a JWT |
| `GET` | `/api/books` `/api/papers` `/api/exercises` | — | Public lists |
| `POST/PUT/DELETE` | `/api/books/:id` … | ✅ JWT | Admin create/update/delete |
| `GET` | `/uploads/...` | — | Serves uploaded PDFs & cover images |

---

## 🚀 Deploy (one service — website + API together)

Because it's a single app, you deploy **one service**. Recommended hosts give you a
persistent disk so the database and uploaded files survive restarts.

### Option 1 — Render (easiest, free tier, config included)
1. Push this project to **GitHub**.
2. On **Render** → **New + → Blueprint** → select your repo → **Apply**.
   (`render.yaml` is already included — it builds the frontend, runs the server,
   and mounts a 1 GB persistent disk for the DB + uploads.)
3. After the first deploy, open the service's **Environment** tab and change
   `ADMIN_PASSWORD` (and confirm `JWT_SECRET` was generated).
4. Visit your `*.onrender.com` URL. Admin portal is at `/admin`.

> **Note on the free tier:** Render free services sleep after inactivity and the
> first request may take ~30s to wake. Upgrade to a paid instance for always-on.

### Option 2 — Docker (Railway, Fly.io, Cloud Run, a VPS…)
A `Dockerfile` is included. Build and run anywhere, mounting a volume at `/data`:
```bash
docker build -t menya .
docker run -p 4000:4000 -v menya_data:/data \
  -e JWT_SECRET="a-long-random-secret" \
  -e ADMIN_PASSWORD="your-strong-password" \
  menya
```
Then open `http://localhost:4000`.

### Production environment variables
| Var | Purpose | Example |
|---|---|---|
| `PORT` | Port to listen on | `4000` |
| `JWT_SECRET` | Signs admin tokens — **set a long random value** | `9f3a…` |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | First admin account | `admin` / `Str0ng!` |
| `DB_PATH` | SQLite file location (put on persistent disk) | `/data/data.db` |
| `UPLOAD_DIR` | Uploads folder (persistent disk) | `/data/uploads` |
| `CORS_ORIGIN` | Allowed origins (`*` is fine for single-service) | `*` |

### ⚠️ About Vercel / Netlify
Vercel and Netlify host **static/serverless** sites — they **cannot** run this
always-on Express server, and their filesystem is read-only, so **uploads and the
database would not work** there. Use **Render / Railway / Fly.io / a VPS** (above)
so the admin portal and file uploads function correctly. (If you specifically need
Vercel, the backend must be rewritten to use a hosted DB + object storage like
Supabase — ask and that can be done.)

---

## 📝 Notes
- Content is served from the API. In dev, run `npm run dev` (starts both); in prod,
  one server serves everything.
- `src/data/*.js` provides static UI content (subjects, levels, copy) and the
  backend's first-run seed (`server/src/seedData.js`).
- Team names/bios/links in `src/data/team.js` are professional placeholders — edit
  them with your real group details.
