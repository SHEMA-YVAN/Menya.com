# 🚀 Deploying MENYA

MENYA is **one app** (the server serves the website + API + uploads together), so you
deploy **one service**. Pick the option that fits you.

---

## ✅ Before you deploy (do this once)

1. Make sure the project runs locally:
   ```bash
   npm run setup     # installs frontend + backend deps
   npm run serve     # builds + runs the unified server on http://localhost:4000
   ```
   Open http://localhost:4000 — site works, `/admin` logs in with `admin` / `menya2026`.

2. Push the project to **GitHub** (Render/Railway deploy from a repo):
   ```bash
   git add .
   git commit -m "MENYA ready to deploy"
   git push
   ```

> ⚠️ Never commit `node_modules`, `dist`, `.env`, or `server/data.db` — the included
> `.gitignore` already excludes them.

---

## 🥇 Option 1 — Render (recommended, free tier, config included)

This repo already contains **`render.yaml`**, so Render sets everything up automatically
(build, start, and a 1 GB persistent disk for the database + uploaded PDFs).

1. Go to **https://render.com** → sign in with GitHub.
2. **New +** → **Blueprint**.
3. Select your **menya** repository → **Apply** / **Create Resources**.
4. Wait ~3–5 min for the build to finish (status becomes **Live**).
5. Open the service → **Environment** tab →
   - change **`ADMIN_PASSWORD`** to a strong password
   - confirm **`JWT_SECRET`** has a generated value
   - **Save Changes** (it redeploys).
6. Visit your URL: **`https://<your-app>.onrender.com`**
   - Admin portal: `https://<your-app>.onrender.com/admin`

**Free-tier note:** the service sleeps after ~15 min idle; the first request after
that takes ~30–50 s to wake. Upgrade to the **$7/mo** instance for always-on.

---

## 🥈 Option 2 — Railway (smooth, uses the Dockerfile)

1. Go to **https://railway.app** → **New Project** → **Deploy from GitHub repo**.
2. Pick your repo. Railway detects the **`Dockerfile`** and builds it.
3. Add a **Volume** mounted at **`/data`** (so DB + uploads persist).
4. Add environment variables:
   - `JWT_SECRET` = a long random string
   - `ADMIN_PASSWORD` = your strong password
   - `DB_PATH` = `/data/data.db`
   - `UPLOAD_DIR` = `/data/uploads`
   - `CORS_ORIGIN` = `*`
5. Deploy → open the generated URL. Admin is at `/admin`.

---

## 🥉 Option 3 — Any Docker host / VPS (Fly.io, Cloud Run, your own server)

```bash
docker build -t menya .
docker run -p 4000:4000 -v menya_data:/data \
  -e JWT_SECRET="a-long-random-secret" \
  -e ADMIN_PASSWORD="your-strong-password" \
  menya
```
Open `http://localhost:4000` (or your server's address).

---

## ❌ Do NOT use Vercel / Netlify (they will break this app)

Vercel and Netlify only host static/serverless sites. They **cannot run the always-on
server** and their filesystem is **read-only**, so the **admin login, the database, and
file uploads will not work** there. Use Render / Railway / a Docker host above.

---

## 🔑 Production environment variables (reference)

| Var | What it does | Example |
|---|---|---|
| `PORT` | Port the server listens on | `4000` (Render uses `10000`) |
| `JWT_SECRET` | Signs admin login tokens — **set a long random value** | `kf83…x9` |
| `ADMIN_USERNAME` | First admin account username | `admin` |
| `ADMIN_PASSWORD` | First admin account password — **change it** | `Str0ng!Pass` |
| `DB_PATH` | SQLite file path (put on the persistent disk) | `/data/data.db` |
| `UPLOAD_DIR` | Folder for uploaded PDFs/covers (persistent disk) | `/data/uploads` |
| `CORS_ORIGIN` | Allowed origins (`*` is fine for single-service) | `*` |

> The default admin account is only created on the **first run** (when the database is
> empty). Set `ADMIN_USERNAME` / `ADMIN_PASSWORD` **before** the first deploy, or change
> the password from the host's environment settings and redeploy with a fresh database.

---

## 🧾 Adding real content after deploy

The seeded books/papers/exercises are **samples**. To add real materials:
1. Log in at `/admin`.
2. Go to **Books** / **Past Papers** → **Add new** → fill details → attach the **PDF**
   (and a cover image for books) → **Save**.
3. **Exercises** → **Add new** → type the question, options, mark the correct one, add an
   explanation → **Save**.

Everything you add is stored on the server and is live for **all visitors** instantly.
