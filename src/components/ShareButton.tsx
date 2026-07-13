import React, { useState, useEffect, useRef } from 'react';
import { Share2, MessageCircle, Link2, Send, Check, Search, X } from 'lucide-react';
import { api } from '../lib/api';

interface ShareButtonProps {
  title: string;
  /** Path relative to the site root, e.g. "/?view=blog&postId=abc123" */
  path: string;
  className?: string;
  dark?: boolean;
}

export default function ShareButton({ title, path, className, dark }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ id: string; name: string; avatar: string }[]>([]);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const shareUrl = `${window.location.origin}${path}`;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowUserSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      api.get<{ users: any[] }>(`/share/users?query=${encodeURIComponent(query)}`).then((res) => setResults(res.users)).catch(console.error);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleNativeShare = async () => {
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({ title, url: shareUrl });
        setOpen(false);
      } catch {
        // user cancelled — do nothing
      }
    }
  };

  const handleWhatsApp = () => {
    const text = `${title} — ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    setOpen(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToUser = async (userId: string) => {
    try {
      await api.post('/share', { toUserId: userId, title, url: shareUrl });
      setSentTo(userId);
      setTimeout(() => {
        setOpen(false);
        setShowUserSearch(false);
        setSentTo(null);
        setQuery('');
        setResults([]);
      }, 1200);
    } catch (err) {
      console.error('Share to user failed:', err);
    }
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className ?? ''}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
          dark
            ? 'border-slate-700 text-slate-400 hover:border-brand-gold hover:text-brand-gold'
            : 'border-slate-300 text-slate-600 hover:border-brand-gold hover:text-brand-gold-dark'
        }`}
        title="Share"
      >
        <Share2 className="w-3.5 h-3.5" />
        <span>Share</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-xl z-50 py-2 text-sm">
          {!showUserSearch ? (
            <>
              {typeof (navigator as any).share === 'function' && (
                <button
                  onClick={handleNativeShare}
                  className="w-full flex items-center space-x-2 px-4 py-2.5 hover:bg-slate-50 text-slate-700"
                >
                  <Share2 className="w-4 h-4 text-slate-500" />
                  <span>Share via…</span>
                </button>
              )}
              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center space-x-2 px-4 py-2.5 hover:bg-slate-50 text-slate-700"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={handleCopy}
                className="w-full flex items-center space-x-2 px-4 py-2.5 hover:bg-slate-50 text-slate-700"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Link2 className="w-4 h-4 text-slate-500" />}
                <span>{copied ? 'Link copied!' : 'Copy link'}</span>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => setShowUserSearch(true)}
                className="w-full flex items-center space-x-2 px-4 py-2.5 hover:bg-slate-50 text-slate-700"
              >
                <Send className="w-4 h-4 text-brand-gold-dark" />
                <span>Send to someone here</span>
              </button>
            </>
          ) : (
            <div className="px-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Send to a member</span>
                <button onClick={() => setShowUserSearch(false)}>
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name…"
                  autoFocus
                  className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-brand-gold"
                />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 pb-2">
                {results.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSendToUser(u.id)}
                    className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-50 text-left"
                  >
                    <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-xs text-slate-700 flex-1">{u.name}</span>
                    {sentTo === u.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
                {query.trim().length >= 2 && results.length === 0 && (
                  <p className="text-[11px] text-slate-400 px-2 py-1">No matches.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
