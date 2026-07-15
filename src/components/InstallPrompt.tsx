import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

const STORAGE_KEY = 'divine-arsenal-install-prompt-seen';

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    if (isStandalone()) return; // already installed, never prompt
    if (localStorage.getItem(STORAGE_KEY)) return; // already shown once on this device

    if (isIOS()) {
      // iOS has no beforeinstallprompt API — show manual instructions instead.
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    setShow(false);
    setShowIOSInstructions(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleInstall = async () => {
    if (isIOS()) {
      setShowIOSInstructions(true);
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    dismiss();
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-[9998] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-brand-blue-950 border border-brand-gold/30 rounded-2xl shadow-2xl p-5 text-white relative">
        <button onClick={dismiss} className="absolute top-3 right-3 text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>

        {!showIOSInstructions ? (
          <>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white p-1.5 shrink-0">
                <img src="/logo.png" alt="Divine Arsenal" className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="font-serif font-bold text-sm">Install Divine Arsenal</p>
                <p className="text-[11px] text-slate-400">Add it to your home screen for quick access.</p>
              </div>
            </div>
            <button
              onClick={handleInstall}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-brand-gold text-brand-blue-950 font-semibold text-xs uppercase tracking-wider hover:bg-brand-gold-light transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Install App</span>
            </button>
          </>
        ) : (
          <div>
            <p className="font-serif font-bold text-sm mb-2">Install on iPhone/iPad</p>
            <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside">
              <li>Tap the Share icon in Safari's toolbar</li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" — that's it!</li>
            </ol>
            <button
              onClick={dismiss}
              className="w-full mt-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors"
            >
              Got it
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
