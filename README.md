# Divine Arsenal

A discipleship / prayer / community platform: free courses with video lessons,
a blog, a prayer wall, a personal journal, counselor messaging, a community
feed, and groups — all backed by a **real PostgreSQL database** with **real
user accounts** (email OTP verification, WhatsApp number collection, and a
Telegram notification whenever someone signs up).

## What's in this version

- **Real database** (Postgres + Prisma) — nothing lives only in the browser.
- **Real accounts with email verification** — sign up sends a 6-digit code by email (via Gmail SMTP or Resend — your choice, see below); the account only activates once verified. Signup now requires **confirming your password** (typed twice, must match) and every account gets an **auto-generated handle** like `Okafor-divine01` (surname + "-divine" + a number, incrementing automatically if that handle's taken). **Choose English or French right at signup** — the app switches to that language immediately and again automatically every time that person logs in.
- **Sign-out now asks for confirmation** ("Are you sure you want to sign out?") before actually logging you out, on both desktop and mobile.
- **WhatsApp number collected at signup**, and a **Telegram bot** pings you the moment a new (verified) user joins.
- **Role-gated signup** — self-signup is always a Student account. Only an existing Admin can create Counselor or Admin accounts (Admin dashboard → "Create Counselor / Admin Account").
- **Profile picture upload**, with a **real upload progress percentage** shown live (this applies to every upload in the app: avatar, course videos, music/podcast audio, and Zion Digital City photos/videos/audio).
- **All courses are free**, and Admins can create/edit them, including uploading an actual video file for the first lesson (more modules/lessons can be added afterward via the API).
- **Real photo, video, and audio uploads** in Zion Digital City (both the main feed and the Gather sub-feed) — 50MB max, actual files, not pasted links. Photo/video uploads also support taking a picture or recording video directly from the phone's camera, not just picking from the gallery.
- **Music and Podcast libraries** — new nav sections. Admins/Counselors upload tracks (organized by artist and genre — Worship, Gospel, Hymn, etc.) and podcast episodes (organized by theme — Teaching, Testimony, Audio Bible, Prayer, Q&A, etc. — and a free-text category like a book of the Bible). Everyone can browse and listen; audio is a real uploaded file (up to 150MB, since sermons/audio-Bible chapters run long).
- **Video view counts** — every video (course lessons, main feed, Gather) now shows a real "X views" counter that increments when someone actually presses play.
- **Facebook-style comments** — like any comment, and reply to it (one level of threading). Real-time notifications fire for both.
- **No fake default profile picture** — new accounts start with a neutral placeholder icon, not a stock photo pretending to be them. They have to upload their own photo to see anything personal on their profile.
- **Tap/click any picture to zoom** — blog article images, community post images (both feeds, and inside groups) all open full-size in a lightbox on click or tap.
- **Share button** on lessons, blog articles, and community posts — share to WhatsApp, copy a direct link, use the phone's native share sheet, or send it straight to another member on the platform (they get a notification with a link that opens the exact content).
- **Delete your own posts** (Admins can delete any post) in the main feed, Gather, and inside groups.
- **Real in-app notifications** — the bell icon shows real, live activity (comments, likes, prayer agreements, counselor replies, new courses/teachings/music/podcasts, live sessions, being added to a group), polling every 30 seconds.
- **Real device push notifications** — not just the in-app bell. Once someone enables it (a prompt appears after they're signed in), they get actual OS-level notifications on their phone/laptop lock screen for the same events — even when the app isn't open. Tapping one opens the app straight to that content. Requires a one-time VAPID key setup (see below) — without it, the in-app bell still works fine, device push is just disabled.
- **A persistent way to enable notifications** — Profile page now has an "Enable Notifications" button that works anytime (not just the one-time popup), plus a "Send Test Notification" button so you can verify it's actually working end-to-end.
- **Only one video/audio plays at a time** — playing any player anywhere in the app now automatically pauses every other one, app-wide (this was a real bug — nothing enforced it before).
- **Automatic video compression** — every uploaded video (course lessons, community posts, Gather) is now re-encoded on the server (scaled to max 1280px wide, compressed with H.264) before it's stored, so playback is much smoother and files take up far less space. Requires `ffmpeg` in the container, which the Dockerfile now installs automatically — no setup needed.
- **Groups** — anyone can create a group; others browse and join it Reddit-style. Group admins can add members directly by email, remove members, and each group has its own post feed.
- **Admin analytics** — total users, students, counselors, enrollments, per-course enrollment/progress, and a full list of students with what they're enrolled in.
- **Installable as a mobile app (PWA)** — a manifest, app icons generated from your logo, and a service worker mean visitors get "Add to Home Screen" / "Install App" on Android and iOS. A custom install banner now actively prompts first-time visitors to install it (shown once per device).
- **Working mobile navigation** — the nav previously had no mobile fallback at all; there's now a proper hamburger menu.
- **Facebook/Instagram-style visitor experience** — the homepage leads with real published teachings right after the hero (not buried under marketing sections), and an unauthenticated visitor gets prompted to sign up after ~4 minutes of browsing.
- **English / French** — a language switcher in the header; the mechanism (`src/translations.tsx`) covers navigation, auth, groups, and admin screens. Some older screens still have English-only strings — extending coverage there is a good next task, the pattern is already in place.
- Your logo is in the header, and the homepage hero now has a 3-photo auto-sliding background with the logo as the emblem on top.

### Known limitations (still local-only, not persisted)
- The live-video "Sanctuary" chat inside an actual live session is still local-only.
- No real-time "who's online" presence tracking (would need WebSockets).
- No password-reset email flow yet.
- Notifications are in-app only (polling) — no push notifications to the phone's lock screen yet; that would need a separate VAPID/push-subscription setup.

### Push notification setup (optional, but recommended)
1. On your own computer (needs Node.js), run: `npx web-push generate-vapid-keys`
2. It prints a Public Key and a Private Key — copy both.
3. In Coolify, set `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` to those values, and `VAPID_SUBJECT` to `mailto:youremail@yourdomain.com` (any email you control).
4. Redeploy. Signed-in users will now see a prompt to enable notifications, and get real ones on their device from then on.

If you skip this, everything else works fine — the app just won't send device-level push notifications, only the in-app bell.

### Email setup — two options
You now have a choice of email provider, controlled entirely by which environment variables you set. **If `SMTP_USER`/`SMTP_PASS` are set, that's used — Resend is only a fallback.**

**Option A — Gmail SMTP (recommended, works immediately, no domain needed):**
1. Use any Gmail account.
2. Turn on 2-Step Verification on that Google account (Google requires this for the next step).
3. Go to https://myaccount.google.com/apppasswords, create an app password, copy the 16-character code it gives you.
4. Set `SMTP_USER` to that Gmail address and `SMTP_PASS` to the 16-character app password (not your normal Gmail password).
5. Redeploy. This works for every recipient immediately — no domain, no DNS, no verification wait.

**Option B — Resend:** requires a verified domain (Resend dashboard → Domains) before it can deliver to anyone other than your own Resend account's email. See `.env.example` for the exact variables.

**Either way**, every OTP code is also printed to your server logs (Coolify → your app → Logs) as a fallback — search for `[email] OTP for`.

If email still isn't arriving after switching to SMTP, check Coolify's logs right after a signup attempt — you'll see either a successful send or a specific SMTP error (e.g. "Invalid login" usually means the app password was typed wrong or 2-Step Verification isn't actually on).

### A heads-up about video compression
Uploading a video now takes noticeably longer than before — the server is compressing it (resizing + re-encoding) before saving it, which trades upload speed for much smaller files and smoother playback afterward. For a typical few-minutes clip this adds anywhere from several seconds to a couple of minutes depending on length and your server's CPU. This happens synchronously as part of the upload request, so on a very slow/low-CPU server, an unusually long video could time out — if that ever happens, the fix would be moving compression to a background job, which isn't built yet.

### About the notifications
If the bell icon still isn't showing anything after this update, the most likely cause is the same one we've hit before: **the deployed app is running code from before this change.** Notifications need a brand-new database table (`Notification`) that only gets created when the container restarts with this updated `prisma/schema.prisma` — so push to GitHub and redeploy, the same way as always, and it should start working. If it's still empty after that, remember notifications only appear once something actually happens (someone comments/likes/prays on your post, a course is published, etc.) — a freshly seeded database won't have any yet.

---

## 1. New setup steps for this version

Beyond the database, you now need two more (free) external services.

### Resend (for OTP emails)
1. Sign up free at [resend.com](https://resend.com).
2. Create an API key.
3. For real production email, verify your own domain in Resend. To just get started immediately, use their built-in test sender `onboarding@resend.dev` as `RESEND_FROM_EMAIL` — it works right away but can only send to your own Resend account's email address until you verify a domain.

### Telegram bot (for new-signup notifications)
1. In Telegram, message **@BotFather**, send `/newbot`, and follow the prompts. It gives you a **bot token**.
2. Send your new bot any message (e.g. "hi").
3. Visit `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` in a browser — find `"chat":{"id": ...}` in the response. That number is your `TELEGRAM_ADMIN_CHAT_ID`.

Add both sets of values to your `.env` (see `.env.example` for the full list, including `UPLOADS_DIR` for profile pictures/videos).

---

## 2. Run it locally

### Option A — Docker only (recommended if you're not a developer)

1. `cp .env.example .env` and fill in `JWT_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`.
2. `docker compose up --build`
3. First time only, seed demo content: `docker compose exec app npx tsx prisma/seed.ts`
4. Open **http://localhost:4000**

Demo logins (password `Password123!` for all): `daniel@divinearsenal.org` (Student), `sarah@divinearsenal.org` (Counselor), `joel@divinearsenal.org` (Admin). These are pre-verified so you can log straight in without the OTP step.

### Option B — Node.js + Docker (for active development)

1. `cp .env.example .env` and fill in the same values as above.
2. `docker compose up db -d`
3. `npm install`
4. `npm run prisma:migrate:dev`
5. `npm run db:seed`
6. `npm run dev` → **http://localhost:3000**

---

## 3. Push it to GitHub

```
git init
git add .
git commit -m "Divine Arsenal: OTP signup, groups, admin analytics, uploads"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git push -u origin main
```

Your `.env` never gets pushed (see `.gitignore`) — only `.env.example`.

---

## 4. Deploy on Coolify

Same as before, with two additions:

1. Create the app (Dockerfile build pack) and a separate **Postgres** resource, same as previously.
2. On the app's **Environment Variables** tab, add all of: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`, `PORT=4000`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`, `UPLOADS_DIR=/app/uploads`. Mark `NODE_ENV` as **runtime-only** (not available at buildtime), same as before.
3. **New: add persistent storage for uploads.** On the app resource, find the **Storages** (or "Persistent Storage" / "Volumes") tab and add a new volume/mount with:
   - **Destination path**: `/app/uploads`
   - This is exactly like the Postgres volume — without it, uploaded profile pictures and videos would be wiped out on every redeploy.
4. Deploy. The container syncs the database schema automatically on startup, same as before.
5. Seed demo content the same way as local Docker, via Coolify's **Terminal** tab: `npx tsx prisma/seed.ts`.

---

## Project structure

```
prisma/schema.prisma     database structure (Users, Courses, Groups, Prayers, etc.)
prisma/seed.ts           demo accounts + sample content
server/                  Express API — auth (incl. OTP), courses, blog, prayers,
                          journal, messages, community, groups, admin, uploads
server/lib/email.ts      Resend OTP emails
server/lib/telegram.ts   Telegram new-signup notifications
server/lib/uploads.ts    multer config for avatars & lesson videos
src/                     React frontend
src/lib/api.ts           frontend's JSON API client
src/context/AuthContext  signed-in user state, OTP signup/verify/login/logout
src/translations.tsx     English/French dictionary + language switcher
public/logo.png          your logo, used in the header and homepage hero
Dockerfile               builds frontend + backend into one container
docker-compose.yml       app + Postgres, with an uploads volume
```

