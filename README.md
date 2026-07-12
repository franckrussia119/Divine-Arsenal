# Divine Arsenal

A discipleship / prayer / community platform: courses with lessons, a blog, a
prayer wall, a personal journal, counselor messaging, and a community feed —
all backed by a **real PostgreSQL database** with **real user accounts**
(sign up / log in). Nothing lives only in the browser anymore: refresh the
page, close the tab, or have two different people open it at once, and
everything is still there, correctly separated per account.

## What changed from the original prototype

The original version was a single React app with all its "data" hardcoded in
`src/data.ts`. It looked complete but nothing ever saved. This version adds:

- A **Postgres database** (via [Prisma](https://www.prisma.io/)) — see `prisma/schema.prisma`
- A real **Express API** (`server/`) with routes for auth, courses, blog, prayers, journal, messages, and the community feed
- **Real accounts**: email + password, hashed with bcrypt, sessions via JWT
- **Docker** files so it can be built and deployed as a container (works with Coolify)

### Known limitations (good next steps, not yet built)
- The "Gather" sub-feed and the live-video "Sanctuary" chat inside the Community City tab are still local-only simulations (not persisted) — the main community feed (posts, likes, prayer-agreements, comments) *is* fully real and persisted.
- There's one shared counselor "inbox" — messages route to a single designated counselor account rather than a full multi-counselor assignment system.
- No password-reset email flow yet (if someone forgets their password today, you'd reset it directly in the database).

---

## 1. Run it locally

You have two options. If you don't want to install Node.js at all, use **Option A**.

### Option A — Docker only (recommended if you're not a developer)

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

1. Open a terminal in this project folder.
2. Copy the environment template and set a real secret:
   ```
   cp .env.example .env
   ```
   Open `.env` and replace `JWT_SECRET` with a long random string (any random
   sentence of gibberish works — this is what secures login sessions).
3. Start everything:
   ```
   docker compose up --build
   ```
4. The first time only, load the demo content into the database (open a second terminal, keep the first one running):
   ```
   docker compose exec app npx tsx prisma/seed.ts
   ```
5. Open **http://localhost:4000** in your browser.

Demo logins it creates (password for all of them: `Password123!`):
- Student: `daniel@divinearsenal.org`
- Counselor: `sarah@divinearsenal.org`
- Admin: `joel@divinearsenal.org`

You can also just sign up your own account from the app itself — new sign-ups
become Students by default.

To stop it: `Ctrl+C`, then `docker compose down` (add `-v` to also wipe the database).

### Option B — Node.js + Docker (for active development)

**Prerequisites:** Node.js 20+, and Docker Desktop just for the database.

1. `cp .env.example .env` and set `JWT_SECRET`.
2. Start only the database: `docker compose up db -d`
3. Install dependencies: `npm install`
4. Push the schema to the database: `npm run prisma:migrate:dev` (first time it'll ask for a migration name — anything like `init` is fine)
5. Seed demo content: `npm run db:seed`
6. Run the app (frontend + backend together, with hot reload): `npm run dev`
7. Open **http://localhost:3000**

---

## 2. Push it to GitHub

If you've never used git before, here's the whole flow:

1. Create a new empty repository on [github.com](https://github.com/new) — don't check any of the "add a README/.gitignore" boxes, since this project already has its own.
2. In your terminal, in this project folder:
   ```
   git init
   git add .
   git commit -m "Divine Arsenal: real database, real accounts"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
   git push -u origin main
   ```
3. Refresh the GitHub page — your code is now there.

Your `.env` file is deliberately excluded from git (see `.gitignore`) so your
real `JWT_SECRET` and database password never get pushed publicly. Only
`.env.example` (the template, with placeholder values) is committed.

---

## 3. Deploy on Coolify

Coolify can build straight from your GitHub repo using the Dockerfile in this project.

1. In Coolify, click **+ New Resource → Application**, and connect it to your GitHub repo (Coolify will ask to install its GitHub App the first time).
2. Build pack: choose **Dockerfile** (Coolify should auto-detect the `Dockerfile` at the repo root).
3. Add a **Postgres database**: **+ New Resource → Database → PostgreSQL**. Once it's created, copy its **internal connection string** (Coolify shows this on the database's page — it'll look like `postgresql://user:pass@servicename:5432/dbname`).
4. Back on your application's **Environment Variables** page, add:
   - `DATABASE_URL` = the Postgres connection string from step 3
   - `JWT_SECRET` = a long random string (generate one with `openssl rand -base64 32` in any terminal)
   - `NODE_ENV` = `production`
   - `PORT` = `4000`
5. Under the application's **Networking** settings, set the port to `4000` (matches `EXPOSE 4000` in the Dockerfile) and attach your domain there.
6. Click **Deploy**. Coolify builds the image, and the container's start-up script (`docker-entrypoint.sh`) automatically syncs the database schema before starting the server — you don't need to run any migration command by hand.
7. Once it's live, seed demo content the same way as local Docker, but via Coolify's terminal for that service (Coolify → your app → **Terminal** tab):
   ```
   npx tsx prisma/seed.ts
   ```
   (Or skip this — real users can just sign up.)

From then on, pushing new commits to your GitHub repo's `main` branch and
clicking **Deploy** in Coolify (or turning on auto-deploy) ships updates.

---

## Project structure

```
prisma/schema.prisma     the database structure
prisma/seed.ts           demo accounts + sample content
server/                  the Express API (auth, courses, blog, prayers, journal, messages, community)
src/                     the React frontend
src/lib/api.ts           frontend's API client
src/context/AuthContext  signed-in user state, login/signup/logout
Dockerfile               builds frontend + backend into one container
docker-compose.yml       app + Postgres, for local dev or Coolify's Compose deploy option
```
