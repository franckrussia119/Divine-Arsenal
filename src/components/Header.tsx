import React, { useState } from 'react';
import { Shield, Sparkles, BookOpen, Flame, Bell, LogIn, LogOut, ChevronDown, Award, Sparkle, Compass, User as UserIcon, Globe } from 'lucide-react';
import { UserRole, UserProfile } from '../types';
import { useTranslation } from '../translations';

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

  const notifications = [
    { id: 1, text: 'Sister Sarah replied to your counseling query.', time: '2h ago' },
    { id: 2, text: 'New lesson unlocked: "Activating the Armor of God".', time: '1d ago' },
    { id: 3, text: 'Congratulations on keeping a 12-day devotion streak!', time: '1d ago' }
  ];

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
                  onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                  className="p-2 text-gray-300 hover:text-brand-gold hover:bg-brand-blue-900/40 rounded-full relative transition-colors duration-200"
                  id="notifications-bell"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-brand-gold ring-2 ring-brand-blue-950" />
                </button>

                {showNotificationMenu && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl bg-brand-blue-900 border border-brand-gold/30 shadow-xl py-2 text-sm text-gray-200 z-50">
                    <div className="px-4 py-2 border-b border-brand-gold/10 flex justify-between items-center">
                      <span className="font-semibold text-brand-gold">Notifications</span>
                      <span className="text-[10px] bg-brand-gold/15 text-brand-gold px-2 py-0.5 rounded-full">New</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.map((n) => (
                        <div key={n.id} className="px-4 py-3 hover:bg-brand-blue-950/50 border-b border-brand-gold/5 transition-colors duration-150">
                          <p className="text-xs text-gray-200">{n.text}</p>
                          <span className="text-[10px] text-gray-400 block mt-1 font-mono">{n.time}</span>
                        </div>
                      ))}
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
                  onClick={onLogout}
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
    </header>
  );
}
