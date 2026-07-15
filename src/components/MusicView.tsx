import React, { useEffect, useMemo, useState } from 'react';
import { Music, Upload, Plus, X, Loader2, Trash2 } from 'lucide-react';
import { Track, UserProfile } from '../types';
import { api } from '../lib/api';
import { uploadFile } from '../lib/uploadWithProgress';

const GENRES = ['Worship', 'Gospel', 'Hymn', 'Praise', 'Instrumental', 'Choir', 'Other'];

interface MusicViewProps {
  profile: UserProfile;
}

export default function MusicView({ profile }: MusicViewProps) {
  const canUpload = profile.role === 'Admin' || profile.role === 'Counselor';
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [genreFilter, setGenreFilter] = useState<string>('All');
  const [showUpload, setShowUpload] = useState(false);

  // Upload form state
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('Worship');
  const [audioUrl, setAudioUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    api.get<{ tracks: Track[] }>('/music').then((res) => setTracks(res.tracks)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const grouped = useMemo(() => {
    const filtered = genreFilter === 'All' ? tracks : tracks.filter((t) => t.genre === genreFilter);
    const byArtist = new Map<string, Track[]>();
    for (const t of filtered) {
      if (!byArtist.has(t.artist)) byArtist.set(t.artist, []);
      byArtist.get(t.artist)!.push(t);
    }
    return Array.from(byArtist.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [tracks, genreFilter]);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      const data = await uploadFile<{ url: string }>('/api/uploads/audio', 'audio', file, { onProgress: setProgress });
      setAudioUrl(data.url);
    } catch (err) {
      console.error('Audio upload failed:', err);
      alert('Could not upload that audio file.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !artist || !audioUrl) return;
    setSubmitting(true);
    try {
      const res = await api.post<{ track: Track }>('/music', { title, artist, genre, audioUrl });
      setTracks((prev) => [res.track, ...prev]);
      setTitle('');
      setArtist('');
      setAudioUrl('');
      setShowUpload(false);
    } catch (err: any) {
      alert(err?.message || 'Could not add that track.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this track?')) return;
    try {
      await api.delete(`/music/${id}`);
      setTracks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-16">
      <div className="bg-brand-blue-950 text-white py-7 sm:py-10 border-b border-brand-gold/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-brand-gold font-mono uppercase tracking-widest mb-1">
              <Music className="w-3.5 h-3.5" />
              <span>Music</span>
            </div>
            <h1 className="font-serif text-3xl font-bold">Worship & Music Library</h1>
          </div>
          {canUpload && (
            <button
              onClick={() => setShowUpload((s) => !s)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-gold text-brand-blue-950 font-semibold text-xs uppercase tracking-wider hover:bg-brand-gold-light"
            >
              {showUpload ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>Add Track</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {showUpload && canUpload && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Track title"
                className="p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-gold"
                required
              />
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Artist name"
                className="p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-gold"
                required
              />
            </div>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm"
            >
              {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>

            <label
              htmlFor="track-audio-upload"
              className="flex items-center justify-center space-x-2 w-full p-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-brand-gold text-slate-500 hover:text-brand-gold transition-colors text-sm"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? `Uploading… ${progress}%` : audioUrl ? 'Audio uploaded ✓' : 'Click to upload an audio file'}</span>
            </label>
            <input
              id="track-audio-upload"
              type="file"
              accept="audio/*"
              className="hidden"
              disabled={uploading}
              onChange={handleAudioUpload}
            />

            <button
              type="submit"
              disabled={submitting || !audioUrl}
              className="w-full py-3 bg-brand-blue-950 text-white font-bold uppercase tracking-wider rounded-xl hover:bg-brand-blue-900 disabled:opacity-60 flex items-center justify-center space-x-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Add Track</span>
            </button>
          </form>
        )}

        {/* Genre filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['All', ...GENRES].map((g) => (
            <button
              key={g}
              onClick={() => setGenreFilter(g)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                genreFilter === g ? 'bg-brand-gold text-brand-blue-950' : 'bg-white text-slate-500 border border-slate-200 hover:border-brand-gold'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : grouped.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border border-slate-200">
            <Music className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No music yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map(([artistName, artistTracks]) => (
              <div key={artistName}>
                <h3 className="font-serif text-lg font-bold text-brand-blue-950 mb-3">{artistName}</h3>
                <div className="space-y-3">
                  {artistTracks.map((track) => (
                    <div key={track.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 flex-wrap">
                      <div className="flex-1 min-w-[160px]">
                        <div className="text-sm font-semibold text-slate-800">{track.title}</div>
                        <span className="text-[10px] font-mono uppercase text-brand-gold-dark">{track.genre}</span>
                      </div>
                      <audio src={track.audioUrl} controls className="h-9 max-w-full flex-1 min-w-[220px]" />
                      {(profile.role === 'Admin') && (
                        <button onClick={() => handleDelete(track.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
