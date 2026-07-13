import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import courseRoutes from './routes/courses.js';
import blogRoutes from './routes/blog.js';
import prayerRoutes from './routes/prayers.js';
import journalRoutes from './routes/journal.js';
import messageRoutes from './routes/messages.js';
import communityRoutes from './routes/community.js';
import groupRoutes from './routes/groups.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/uploads.js';
import { UPLOADS_DIR } from './lib/uploads.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Uploaded avatars & lesson videos (served before the SPA catch-all below).
app.use('/uploads', express.static(UPLOADS_DIR));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/prayers', prayerRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);

// In production, the frontend is built into ../dist and served as static files,
// with a catch-all so client-side routing/refreshes still work.
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

app.listen(PORT, () => {
  console.log(`Divine Arsenal API listening on port ${PORT}`);
});
