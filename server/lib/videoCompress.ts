import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

/** Compresses a video in place: scales down to max 1280px wide, moderate
 * bitrate (CRF 28), and moves the metadata to the front of the file
 * (faststart) so it starts playing before fully downloading. Deletes the
 * original raw upload once the compressed version is ready. Returns the
 * new file's path. */
export function compressVideo(inputPath: string): Promise<string> {
  const dir = path.dirname(inputPath);
  const ext = path.extname(inputPath);
  const base = path.basename(inputPath, ext);
  const outputPath = path.join(dir, `${base}-c.mp4`);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .audioBitrate('128k')
      .outputOptions([
        '-crf 28',
        '-preset veryfast',
        // Scale down only if wider than 1280px; never upscale. -2 keeps height even (required by libx264).
        "-vf scale='min(1280,iw)':-2",
        '-movflags +faststart',
      ])
      .on('end', () => {
        fs.unlink(inputPath, () => {}); // best-effort cleanup of the original
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('[video-compress] ffmpeg failed, keeping original file:', err.message);
        reject(err);
      })
      .save(outputPath);
  });
}

/** Compresses if it's a video; otherwise returns the path unchanged.
 * Never lets a compression failure block the upload — falls back to the
 * original file so a slightly larger video is still better than none. */
export async function compressIfVideo(filePath: string, mimetype: string): Promise<string> {
  if (!mimetype.startsWith('video/')) return filePath;
  try {
    return await compressVideo(filePath);
  } catch {
    return filePath;
  }
}
