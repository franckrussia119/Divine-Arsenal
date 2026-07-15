import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, BookOpen, Flame, Bell, LogIn, LogOut, ChevronDown, Award, Sparkle, Compass, User as UserIcon, Globe, Menu, X, Home, Users, Music, Mic, GraduationCap, LayoutDashboard, ShieldAlert } from 'lucide-react';
import { UserRole, UserProfile } from '../types';
import { useTranslation } from '../translations';
import { api } from '../lib/api';

interface HeaderProps {
  currentRole: UserRole;
  currentTab: string;
  onChangeTab: (tab: string) => void;
  profile: UserProfile | null;
  onSignIn: () => void;
  onLogout: () => void;
}

export default function Header({
  currentRole,
  currentTab,
  onChangeTab,
  profile,
  onSignIn,
  onLogout
}: HeaderProps) {
  const { lang, setLang, t } = useTranslation();
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const mobileNavItems: { label: string; tab: string; icon: React.ComponentType<{ className?: string }> }[] =
    currentRole === 'Visitor'
      ? [
          { label: t('home'), tab: 'visitor-home', icon: Home },
          { label: t('digitalCity'), tab: 'community-city', icon: Globe },
          { label: t('teachings'), tab: 'blog', icon: BookOpen },
        ]
      : currentRole === 'Student'
      ? [
          { label: t('dashboard'), tab: 'dashboard', icon: LayoutDashboard },
          { label: t('digitalCity'), tab: 'community-city', icon: Globe },
          { label: t('myCourses'), tab: 'my-courses', icon: GraduationCap },
          { label: t('profile'), tab: 'profile', icon: UserIcon },
          { label: t('groups'), tab: 'groups', icon: Users },
          { label: t('warRoom'), tab: 'war-room', icon: Shield },
          { label: t('teachings'), tab: 'blog', icon: BookOpen },
          { label: t('music'), tab: 'music', icon: Music },
          { label: t('podcast'), tab: 'podcast', icon: Mic },
        ]
      : currentRole === 'Counselor'
      ? [
          { label: t('carePortal'), tab: 'counselor-dashboard', icon: Compass },
          { label: t('digitalCity'), tab: 'community-city', icon: Globe },
          { label: t('groups'), tab: 'groups', icon: Users },
          { label: t('profile'), tab: 'profile', icon: UserIcon },
          { label: t('music'), tab: 'music', icon: Music },
          { label: t('podcast'), tab: 'podcast', icon: Mic },
        ]
      : [
          { label: t('adminConsole'), tab: 'admin-dashboard', icon: ShieldAlert },
          { label: t('digitalCity'), tab: 'community-city', icon: Globe },
          { label: t('groups'), tab: 'groups', icon: Users },
          { label: t('profile'), tab: 'profile', icon: UserIcon },
          { label: t('music'), tab: 'music', icon: Music },
          { label: t('podcast'), tab: 'podcast', icon: Mic },
        ];

  const [notifications, setNotifications] = useState<{ id: string; message: string; timeAgo: string; read: boolean; link?: string }[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = () => {
    if (!profile) return;
    api
      .get<{ notifications: any[]; unreadCount: number }>('/notifications')
      .then((res) => {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (!profile) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const handleOpenNotifications = () => {
    const opening = !showNotificationMenu;
    setShowNotificationMenu(opening);
    if (opening && unreadCount > 0) {
      api.post('/notifications/read-all').then(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }).catch(console.error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-blue-950 border-b border-brand-gold/20 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Branding */}
          <div 
            onClick={() => onChangeTab(currentRole === 'Visitor' ? 'visitor-home' : 'dashboard')} 
            className="flex items-center space-x-3 cursor-pointer group"
            id="logo-brand-container"
          >
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-white shadow-md shadow-brand-gold/10 group-hover:scale-105 transition-all duration-300 overflow-hidden p-1">
              <img src="/logo.png" alt="Divine Arsenal" className="w-full h-full object-contain" />
              <div className="absolute inset-0 rounded-xl border border-brand-gold-light/40 scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div>
              <span className="font-serif text-xl tracking-widest text-brand-gold font-bold block">
                DIVINE ARSENAL
              </span>
              <span className="font-mono text-[9px] tracking-widest text-gray-400 block -mt-1">
                EQUIPPING SPIRITUAL WARRIORS
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1" id="main-nav-links">
            {currentRole === 'Visitor' ? (
              <>
                <button
                  onClick={() => onChangeTab('visitor-home')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    currentTab === 'visitor-home' 
                      ? 'text-brand-gold bg-brand-blue-900/40 border-b border-brand-gold/40' 
                      : 'text-gray-300 hover:text-white hover:bg-brand-blue-900/20'
                  }`}
                  id="tab-visitor-home"
                >
                  {t('home')}
                </button>
                <button
                  onClick={() => onChangeTab('community-city')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    currentTab === 'community-city' 
                      ? 'text-brand-gold bg-brand-blue-900/40 border-b border-brand-gold/40' 
                      : 'text-gray-300 hover:text-white hover:bg-brand-blue-900/20'
                  }`}
                  id="tab-visitor-city"
                >
                  {t('digitalCity')}
                </button>
                <button
                  onClick={() => onChangeTab('blog')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    currentTab === 'blog' 
                      ? 'text-brand-gold bg-brand-blue-900/40 border-b border-brand-gold/40' 
                      : 'text-gray-300 hover:text-white hover:bg-brand-blue-900/20'
                  }`}
                  id="tab-visitor-blog"
                >
                  {t('teachings')}
                </button>
                <button
                  onClick={() => {
                    onChangeTab('visitor-home');
                    setTimeout(() => document.getElementById('courses-section')?.scrollIntoView({ behavior: 'smooth' }), 0);
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-gray-300 hover:text-white hover:bg-brand-blue-900/20`}
                  id="tab-visitor-courses"
                >
                  {t('myCourses')}
                </button>
              </>
            ) : currentRole === 'Student' ? (
              <>
                <button
                  onClick={() => onChangeTab('dashboard')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    currentTab === 'dashboard' 
                      ? 'text-brand-gold bg-brand-blue-900/40' 
                      : 'text-gray-300 hover:text-white hover:bg-brand-blue-900/20'
                  }`}
                  id="tab-student-dashboard"
                >
                  {t('dashboard')}
                </button>
                <button
                  onClick={() => onChangeTab('community-city')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    currentTab === 'community-city' 
                      ? 'text-brand-gold bg-brand-blue-900/40' 
                      : 'text-gray-300 hover:text-white hover:bg-brand-blue-900/20'
                  }`}
                  id="tab-student-city"
                >
                  {t('digitalCity')}
                </button>
                <button
                  onClick={() => onChangeTab('groups')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    currentTab === 'groups' 
                      ? 'text-brand-gold bg-brand-blue-900/40' 
                      : 'text-gray-300 hover:text-white hover:bg-brand-blue-900/20'
                  }`}
                  id="tab-student-groups"
                >
                  {t('groups')}
                </button>
                <button
                  onClick={() => onChangeTab('my-courses')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    currentTab === 'my-courses' 
                      ? 'text-brand-gold bg-brand-blue-900/40' 
                      : 'text-gray-300 hover:text-white hover:bg-brand-blue-900/20'
                  }`}
                  id="tab-student-courses"
                >
                  {t('myCourses')}
                </button>
                <button
                  onClick={() => onChangeTab('war-room')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    currentTab === 'war-room' 
                      ? 'text-brand-gold bg-brand-blue-900/40' 
                      : 'text-gray-300 hover:text-white hover:bg-brand-blue-900/20'
                  }`}
                  id="tab-student-warroom"
                >
                  {t('warRoom')}
                </button>
                <button
                  onClick={() => onChangeTab('blog')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    currentTab === 'blog' 
                      ? 'text-brand-gold bg-brand-blue-900/40' 
                      : 'text-gray-300 hover:text-white hover:bg-brand-blue-900/20'
                  }`}
                  id="tab-student-blog"
                >
                  {t('teachings')}
                </button>
                <button
                  onClick={() => onChangeTab('music')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    currentTab === 'music' 
                      ? 'text-brand-gold bg-brand-blue-900/40' 
                      : 'text-gray-300 hover:text-white hover:bg-brand-blue-900/20'
                  }`}
                  id="tab-student-music"
                >
                  {t('music')}
                </button>
                <button
                  onClick={() => onChangeTab('podcast')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    currentTab === 'podcast' 
                      ? 'text-brand-gold bg-brand-blue-900/40' 
                      : 'text-gray-300 hover:text-white hover:bg-brand-blue-900/20'
                  }`}
                  id="tab-student-podcast"
                >
                  {t('podcast')}
                </button>
                <button
                  onClick={() => onChangeTab('profile')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    currentTab === 'profile' 
                      ? 'text-brand-gold bg-brand-blue-900/40' 
                      : 'text-gray-300 hover:text-white hover:bg-brand-blue-900/20'
                  }`}
                  id="tab-student-profile"
                >
                  {t('profile')}
                </button>
              </>
            ) : currentRole === 'Counselor' ? (
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onChangeTab('counselor-dashboard')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    currentTab === 'counselor-dashboard' ? 'text-brand-gold bg-brand-blue-900/40' : 'text-gray-300 hover:text-white hover:bg-brand-blue-900/20'
                  }`}
                  id="tab-counselor-dashboard"
                >
                  {t('carePortal')}
                </button>
                <button
                  onClick={() => onChangeTab('community-city')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    currentTab === 'community-city' ? 'text-brand-gold bg-brand-blue-900/40' : 'text-gray-300 hover:text-white hover:bg-brand-blue-900/20'
                  }`}
                  id="tab-counselor-city"
                >
                  {t('digitalCity')}
                </button>
                <button
                  onClick={() => onChangeTab('groups')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    currentTab === 'groups' ? 'text-brand-gold bg-brand-blue-900/40' : 'text-gray-300 hover:text-white hover:bg-brand-blue-900/20'
                  }`}
                  id="tab-counselor-groups"
                >
                  {t('groups')}
                </button>
                <button
                  onClick={() => onChangeTab('music')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    currentTab === 'music' ? 'text-brand-gold bg-brand-blue-900/40' : 'text-gray-300 hover:text-white hover:bg-brand-blue-900/20'
                  }`}
                  id="tab-counselor-music"
                >
                  {t('music')}
                </button>
                <button
                  onClick={() => onChangeTab('podcast')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    currentTab === 'podcast' ? 'text-brand-gold bg-brand-blue-900/40' : 'text-gray-300 hover:text-white hover:bg-brand-blue-900/20'
                  }`}
                  id="tab-counselor-podcast"
                >
                  {t('podcast')}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onChangeTab('admin-dashboard')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    currentTab === 'admin-dashboard' ? 'text-brand-gold bg-brand-blue-900/40' : 'text-gray-300 hover:text-white hover:bg-brand-blue-900/20'
                  }`}
                  id="tab-admin-dashboard"
                >
                  {t('adminConsole')}
                </button>
                <button
                  onClick={() => onChangeTab('community-city')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    currentTab === 'community-city' ? 'text-brand-gold bg-brand-blue-900/40' : 'text-gray-300 hover:text-white hover:bg-brand-blue-900/20'
                  }`}
                  id="tab-admin-city"
                >
                  {t('digitalCity')}
                </button>
                <button
                  onClick={() => onChangeTab('groups')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    currentTab === 'groups' ? 'text-brand-gold bg-brand-blue-900/40' : 'text-gray-300 hover:text-white hover:bg-brand-blue-900/20'
                  }`}
                  id="tab-admin-groups"
                >
                  {t('groups')}
                </button>
                <button
                  onClick={() => onChangeTab('music')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    currentTab === 'music' ? 'text-brand-gold bg-brand-blue-900/40' : 'text-gray-300 hover:text-white hover:bg-brand-blue-900/20'
                  }`}
                  id="tab-admin-music"
                >
                  {t('music')}
                </button>
                <button
                  onClick={() => onChangeTab('podcast')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    currentTab === 'podcast' ? 'text-brand-gold bg-brand-blue-900/40' : 'text-gray-300 hover:text-white hover:bg-brand-blue-900/20'
                  }`}
                  id="tab-admin-podcast"
                >
                  {t('podcast')}
                </button>
              </div>
            )}
          </nav>

          {/* Actions & Role Switcher */}
          <div className="flex items-center space-x-4">

            {/* Language Switcher */}
            <div className="flex items-center bg-brand-blue-900/60 rounded-full border border-brand-gold/30 p-0.5" id="language-switcher">
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded-full text-[10px] font-bold font-mono transition-all ${
                  lang === 'en'
                    ? 'bg-brand-gold text-brand-blue-950'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                onClick={() => setLang('fr')}
                className={`px-2 py-1 rounded-full text-[10px] font-bold font-mono transition-all ${
                  lang === 'fr'
                    ? 'bg-brand-gold text-brand-blue-950'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Français"
              >
                FR
              </button>
            </div>

            {/* Notification Bell */}
            {profile && (
              <div className="relative">
                <button 
                  onClick={handleOpenNotifications}
                  className="p-2 text-gray-300 hover:text-brand-gold hover:bg-brand-blue-900/40 rounded-full relative transition-colors duration-200"
                  id="notifications-bell"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-brand-gold text-brand-blue-950 text-[9px] font-bold ring-2 ring-brand-blue-950">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotificationMenu && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl bg-brand-blue-900 border border-brand-gold/30 shadow-xl py-2 text-sm text-gray-200 z-50">
                    <div className="px-4 py-2 border-b border-brand-gold/10 flex justify-between items-center">
                      <span className="font-semibold text-brand-gold">Notifications</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-6 text-xs text-gray-400 text-center">Nothing yet.</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              if (n.link) {
                                setShowNotificationMenu(false);
                                window.location.href = n.link;
                              }
                            }}
                            className={`px-4 py-3 border-b border-brand-gold/5 transition-colors duration-150 ${
                              n.link ? 'cursor-pointer hover:bg-brand-blue-950/50' : ''
                            }`}
                          >
                            <p className="text-xs text-gray-200">{n.message}</p>
                            <span className="text-[10px] text-gray-400 block mt-1 font-mono">{n.timeAgo}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Avatar / Sign In Button */}
            {!profile ? (
              <button
                onClick={onSignIn}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-gold text-brand-blue-950 font-semibold text-xs tracking-wider uppercase shadow-lg shadow-brand-gold/10 hover:bg-brand-gold-light hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                id="sign-in-visitor-btn"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="hidden lg:block text-right">
                  <div className="text-xs font-semibold text-gray-100">{profile.name}</div>
                  <div className="text-[10px] text-brand-gold font-mono flex items-center justify-end space-x-1">
                    <Flame className="w-3 h-3 animate-pulse" />
                    <span>{profile.streak} Day Streak</span>
                  </div>
                </div>
                <div 
                  onClick={() => onChangeTab('profile')}
                  className="w-10 h-10 rounded-full border border-brand-gold/40 p-0.5 cursor-pointer hover:border-brand-gold transition-colors duration-200"
                  id="profile-avatar-trigger"
                >
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-brand-blue-900/40 rounded-full transition-colors duration-200"
                  title="Sign Out"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
      {/* Mobile bottom tab bar — replaces the old hamburger dropdown */}
      <div
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-brand-blue-950 border-t border-brand-gold/20"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        id="mobile-bottom-nav"
      >
        <div className="flex items-stretch">
          {mobileNavItems.slice(0, 4).map((item) => {
            const ItemIcon = item.icon;
            const active = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => { onChangeTab(item.tab); setShowMoreSheet(false); }}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${
                  active ? 'text-brand-gold' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <ItemIcon className="w-5 h-5" />
                <span className="text-[9.5px] font-medium leading-none truncate max-w-[64px]">{item.label}</span>
              </button>
            );
          })}

          {!profile && (
            <button
              onClick={onSignIn}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-brand-gold"
            >
              <LogIn className="w-5 h-5" />
              <span className="text-[9.5px] font-medium leading-none">{t('signIn') ?? 'Sign In'}</span>
            </button>
          )}

          {profile && mobileNavItems.length > 4 && (
            <button
              onClick={() => setShowMoreSheet((s) => !s)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${
                showMoreSheet ? 'text-brand-gold' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Menu className="w-5 h-5" />
              <span className="text-[9.5px] font-medium leading-none">More</span>
            </button>
          )}
        </div>
      </div>

      {/* "More" sheet — the rest of the nav items that don't fit in the bottom bar */}
      {showMoreSheet && (
        <div
          className="md:hidden fixed inset-0 z-[9998] bg-black/50 flex items-end"
          onClick={() => setShowMoreSheet(false)}
        >
          <div
            className="w-full bg-brand-blue-950 rounded-t-2xl border-t border-brand-gold/20 pt-4 px-4 pb-6"
            style={{ marginBottom: 'calc(56px + env(safe-area-inset-bottom))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4"></div>
            <div className="grid grid-cols-4 gap-y-4 gap-x-2">
              {mobileNavItems.slice(4).map((item) => {
                const ItemIcon = item.icon;
                const active = currentTab === item.tab;
                return (
                  <button
                    key={item.tab}
                    onClick={() => { onChangeTab(item.tab); setShowMoreSheet(false); }}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                      active ? 'bg-brand-gold text-brand-blue-950' : 'bg-white/5 text-gray-300'
                    }`}>
                      <ItemIcon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-gray-300 text-center leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => { setShowMoreSheet(false); setShowLogoutConfirm(true); }}
              className="w-full mt-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Sign-out confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="font-serif text-lg font-bold text-brand-blue-950 mb-2">Sign out?</h3>
            <p className="text-sm text-slate-500 mb-6">Are you sure you want to sign out of Divine Arsenal?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowLogoutConfirm(false); onLogout(); }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
              >
                Yes, sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
