import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.resolve(process.cwd(), 'uploads');
const AVATARS_DIR = path.join(UPLOADS_DIR, 'avatars');
const VIDEOS_DIR = path.join(UPLOADS_DIR, 'videos');
const MEDIA_DIR = path.join(UPLOADS_DIR, 'media');
const AUDIO_DIR = path.join(UPLOADS_DIR, 'audio');

for (const dir of [UPLOADS_DIR, AVATARS_DIR, VIDEOS_DIR, MEDIA_DIR, AUDIO_DIR]) {
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

// General-purpose uploader for community posts (Zion Digital City) — any
// signed-in user, images, videos, or audio, capped at 50MB per your requirement.
export const uploadMedia = multer({
  storage: makeStorage(MEDIA_DIR),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    if (
      !file.mimetype.startsWith('image/') &&
      !file.mimetype.startsWith('video/') &&
      !file.mimetype.startsWith('audio/')
    ) {
      return cb(new Error('Only image, video, or audio files are allowed'));
    }
    cb(null, true);
  },
});

// Music tracks & podcast episodes can run long (a full audio-Bible chapter, a
// sermon), so this gets a bigger cap than the Digital City media uploader.
export const uploadAudio = multer({
  storage: makeStorage(AUDIO_DIR),
  limits: { fileSize: 150 * 1024 * 1024 }, // 150MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('audio/')) return cb(new Error('Only audio files are allowed'));
    cb(null, true);
  },
});

export { UPLOADS_DIR };
