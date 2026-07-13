import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.resolve(process.cwd(), 'uploads');
const AVATARS_DIR = path.join(UPLOADS_DIR, 'avatars');
const VIDEOS_DIR = path.join(UPLOADS_DIR, 'videos');

for (const dir of [UPLOADS_DIR, AVATARS_DIR, VIDEOS_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

function makeStorage(dir: string) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${randomUUID()}${ext}`);
    },
  });
}

export const uploadAvatar = multer({
  storage: makeStorage(AVATARS_DIR),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'));
    cb(null, true);
  },
});

export const uploadVideo = multer({
  storage: makeStorage(VIDEOS_DIR),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) return cb(new Error('Only video files are allowed'));
    cb(null, true);
  },
});

export { UPLOADS_DIR };
