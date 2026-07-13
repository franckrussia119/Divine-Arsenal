import React, { useState } from 'react';
import { Flame, Mail, Lock, User as UserIcon, Church, Loader2, MessageCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../translations';

interface AuthScreenProps {
  onDone: () => void;
  onBack: () => void;
}

export default function AuthScreen({ onDone, onBack }: AuthScreenProps) {
  const { login, signup, verifyOtp, resendOtp, error, clearError, pendingEmail, clearPendingEmail } = useAuth();
  const { t, setLang } = useTranslation();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [homeChurch, setHomeChurch] = useState('');
  const [signupLanguage, setSignupLanguage] = useState<'en' | 'fr'>('en');
  const [otpCode, setOtpCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setNotice(null);
    try {
      if (mode === 'login') {
        await login(email, password);
        onDone();
      } else {
        setLang(signupLanguage); // adapt the app to their chosen language right away
        await signup(name, email, password, whatsapp, signupLanguage, homeChurch);
      }
    } catch {
      // error already surfaced via context
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await verifyOtp(pendingEmail!, otpCode);
      onDone();
    } catch {
      // error already surfaced via context
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!pendingEmail) return;
    try {
      await resendOtp(pendingEmail);
      setNotice(t('codeSent'));
    } catch {
      // error already surfaced via context
    }
  };

  // --- OTP verification step ---
  if (pendingEmail) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-brand-gold via-brand-gold-dark to-brand-blue-900 shadow-md mb-4">
              <ShieldCheck className="w-7 h-7 text-brand-blue-950" />
            </div>
            <h1 className="font-serif text-2xl text-brand-blue-950 font-bold">{t('verifyYourEmail')}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {t('otpSentTo')} <span className="font-semibold text-slate-700">{pendingEmail}</span>
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8">
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t('enterCode')}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.5em] text-2xl font-mono px-3 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold"
                  placeholder="000000"
                />
              </div>

              {error && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
              )}
              {notice && (
                <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{notice}</div>
              )}

              <button
                type="submit"
                disabled={submitting || otpCode.length !== 6}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-gold text-brand-blue-950 font-semibold text-sm tracking-wide uppercase shadow-lg shadow-brand-gold/10 hover:bg-brand-gold-light hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{t('verify')}</span>
              </button>
            </form>

            <button onClick={handleResend} className="w-full text-center text-sm text-brand-blue-900 font-semibold hover:underline mt-5">
              {t('resendCode')}
            </button>
          </div>

          <button
            onClick={() => { clearPendingEmail(); clearError(); }}
            className="w-full text-center text-xs text-slate-400 hover:text-slate-600 mt-6"
          >
            &larr; {t('back')}
          </button>
        </div>
      </div>
    );
  }

  // --- Login / Signup step ---
  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-brand-gold via-brand-gold-dark to-brand-blue-900 shadow-md mb-4">
            <Flame className="w-7 h-7 text-brand-blue-950" />
          </div>
          <h1 className="font-serif text-2xl text-brand-blue-950 font-bold">
            {mode === 'login' ? t('welcomeBack') : t('createYourAccount')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {mode === 'login' ? t('signInToContinue') : t('joinToSave')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t('fullName')}</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold"
                    placeholder="Daniel Okafor"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t('emailLabel')}</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t('passwordLabel')}</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold"
                  placeholder="At least 8 characters"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Language / Langue</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSignupLanguage('en')}
                      className={`py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                        signupLanguage === 'en'
                          ? 'bg-brand-gold text-brand-blue-950 border-brand-gold'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-brand-gold'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignupLanguage('fr')}
                      className={`py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                        signupLanguage === 'fr'
                          ? 'bg-brand-gold text-brand-blue-950 border-brand-gold'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-brand-gold'
                      }`}
                    >
                      Français
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t('whatsappLabel')}</label>
                  <div className="relative">
                    <MessageCircle className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold"
                      placeholder={t('whatsappPlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t('homeChurchOptional')}</label>
                  <div className="relative">
                    <Church className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={homeChurch}
                      onChange={(e) => setHomeChurch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold"
                      placeholder="Covenant Chapel, Lagos"
                    />
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-gold text-brand-blue-950 font-semibold text-sm tracking-wide uppercase shadow-lg shadow-brand-gold/10 hover:bg-brand-gold-light hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{mode === 'login' ? t('signIn') : t('createAccount')}</span>
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-500">
            {mode === 'login' ? (
              <>
                {t('noAccount')}{' '}
                <button onClick={() => { setMode('signup'); clearError(); }} className="text-brand-blue-900 font-semibold hover:underline">
                  {t('signUp')}
                </button>
              </>
            ) : (
              <>
                {t('haveAccount')}{' '}
                <button onClick={() => { setMode('login'); clearError(); }} className="text-brand-blue-900 font-semibold hover:underline">
                  {t('logIn')}
                </button>
              </>
            )}
          </div>
        </div>

        <button onClick={onBack} className="w-full text-center text-xs text-slate-400 hover:text-slate-600 mt-6">
          &larr; {t('back')}
        </button>
      </div>
    </div>
  );
}
