import React, { useEffect, useMemo, useState } from 'react';
import { Mic, Upload, Plus, X, Loader2, Trash2 } from 'lucide-react';
import { PodcastEpisode, UserProfile } from '../types';
import { api } from '../lib/api';
import { uploadFile } from '../lib/uploadWithProgress';

const THEMES = ['Teaching', 'Testimony', 'Audio Bible', 'Prayer', 'Q&A', 'Prophecy', 'Worship Talk', 'Other'];

interface PodcastViewProps {
  profile: UserProfile;
}

export default function PodcastView({ profile }: PodcastViewProps) {
  const canUpload = profile.role === 'Admin' || profile.role === 'Counselor';
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [themeFilter, setThemeFilter] = useState<string>('All');
  const [showUpload, setShowUpload] = useState(false);

  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('Teaching');
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    api.get<{ episodes: PodcastEpisode[] }>('/podcast').then((res) => setEpisodes(res.episodes)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = useMemo(
    () => (themeFilter === 'All' ? episodes : episodes.filter((e) => e.theme === themeFilter)),
    [episodes, themeFilter]
  );

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
    if (!title || !audioUrl) return;
    setSubmitting(true);
    try {
      const res = await api.post<{ episode: PodcastEpisode }>('/podcast', { title, theme, category, description, audioUrl });
      setEpisodes((prev) => [res.episode, ...prev]);
      setTitle('');
      setDescription('');
      setAudioUrl('');
      setShowUpload(false);
    } catch (err: any) {
      alert(err?.message || 'Could not add that episode.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this episode?')) return;
    try {
      await api.delete(`/podcast/${id}`);
      setEpisodes((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-16">
      <div className="bg-brand-blue-950 text-white py-10 border-b border-brand-gold/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-brand-gold font-mono uppercase tracking-widest mb-1">
              <Mic className="w-3.5 h-3.5" />
              <span>Podcast</span>
            </div>
            <h1 className="font-serif text-3xl font-bold">Teachings & Audio Bible</h1>
          </div>
          {canUpload && (
            <button
              onClick={() => setShowUpload((s) => !s)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-gold text-brand-blue-950 font-semibold text-xs uppercase tracking-wider hover:bg-brand-gold-light"
            >
              {showUpload ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>Add Episode</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {showUpload && canUpload && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Episode title"
              className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-gold"
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm"
              >
                {THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category (e.g. Book of John)"
                className="p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-gold"
              />
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Episode description (optional)"
              className="w-full h-20 p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-gold"
            />

            <label
              htmlFor="episode-audio-upload"
              className="flex items-center justify-center space-x-2 w-full p-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-brand-gold text-slate-500 hover:text-brand-gold transition-colors text-sm"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? `Uploading… ${progress}%` : audioUrl ? 'Audio uploaded ✓' : 'Click to upload an audio file'}</span>
            </label>
            <input
              id="episode-audio-upload"
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
              <span>Add Episode</span>
            </button>
          </form>
        )}

        {/* Theme filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['All', ...THEMES].map((th) => (
            <button
              key={th}
              onClick={() => setThemeFilter(th)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                themeFilter === th ? 'bg-brand-gold text-brand-blue-950' : 'bg-white text-slate-500 border border-slate-200 hover:border-brand-gold'
              }`}
            >
              {th}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <Mic className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No episodes yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((ep) => (
              <div key={ep.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{ep.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono uppercase text-brand-gold-dark">{ep.theme}</span>
                      <span className="text-[10px] text-slate-400">· {ep.category}</span>
                    </div>
                  </div>
                  {(profile.role === 'Admin') && (
                    <button onClick={() => handleDelete(ep.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {ep.description && <p className="text-xs text-slate-500 mb-3">{ep.description}</p>}
                <audio src={ep.audioUrl} controls className="w-full h-9" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
