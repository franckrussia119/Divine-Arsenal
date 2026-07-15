import React, { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { isPushSupported, subscribeToPush } from '../lib/push';

const STORAGE_KEY = 'divine-arsenal-push-prompt-seen';

export default function NotificationPermissionPrompt() {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isPushSupported()) return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    if (Notification.permission !== 'default') return; // already granted or denied

    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleEnable = async () => {
    setBusy(true);
    await subscribeToPush();
    setBusy(false);
    dismiss();
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:w-96 z-[9997] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 relative">
        <button onClick={dismiss} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-brand-gold/15 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-brand-gold-dark" />
          </div>
          <div>
            <p className="font-serif font-bold text-sm text-brand-blue-950">Stay in the loop</p>
            <p className="text-[11px] text-slate-500">Get notified about replies, likes, and new content — even when the app is closed.</p>
          </div>
        </div>
        <button
          onClick={handleEnable}
          disabled={busy}
          className="w-full py-2.5 rounded-xl bg-brand-gold text-brand-blue-950 font-semibold text-xs uppercase tracking-wider hover:bg-brand-gold-light transition-colors disabled:opacity-60"
        >
          {busy ? 'Enabling…' : 'Enable Notifications'}
        </button>
      </div>
    </div>
  );
}
