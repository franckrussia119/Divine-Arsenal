import React, { useState } from 'react';
import { UserProfile, Course } from '../types';
import { Award, Shield, Key, Sparkles, CheckCircle, FileText, X, Download, HelpCircle, Flame, Mail, Phone, Church, Save, Calendar } from 'lucide-react';
import { uploadFile } from '../lib/uploadWithProgress';
import { subscribeToPush, isPushSupported } from '../lib/push';
import { api } from '../lib/api';
import { useTranslation } from '../translations';

interface ProfileViewProps {
  profile: UserProfile;
  enrolledCourses: Course[];
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

export default function ProfileView({
  profile,
  enrolledCourses,
  onUpdateProfile
}: ProfileViewProps) {
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editPhone, setEditPhone] = useState(profile.phone);
  const [editWhatsapp, setEditWhatsapp] = useState(profile.whatsapp);
  const [editChurch, setEditChurch] = useState(profile.homeChurch);
  const [editBio, setEditBio] = useState(profile.bio);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);
  const [notifBusy, setNotifBusy] = useState(false);
  const [notifMessage, setNotifMessage] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleEnableNotifications = async () => {
    if (!isPushSupported()) {
      setNotifMessage("This browser doesn't support notifications.");
      return;
    }
    setNotifBusy(true);
    setNotifMessage(null);
    const ok = await subscribeToPush();
    setNotifMessage(ok ? 'Notifications enabled on this device! 🎉' : 'Permission was not granted — check your browser settings.');
    setNotifBusy(false);
  };

  const handleTestNotification = async () => {
    setNotifBusy(true);
    setNotifMessage(null);
    try {
      await api.post('/push/test');
      setNotifMessage('Test notification sent — check your notification bar.');
    } catch (err: any) {
      setNotifMessage(err?.message || 'Could not send a test notification. Try enabling notifications first.');
    } finally {
      setNotifBusy(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    setAvatarProgress(0);
    try {
      const data = await uploadFile<{ user: any }>('/api/uploads/avatar', 'avatar', file, {
        onProgress: setAvatarProgress,
      });
      onUpdateProfile({ avatar: data.user.avatar });
    } catch (err) {
      console.error('Avatar upload failed:', err);
      alert('Could not upload that photo. Please try a smaller image file.');
    } finally {
      setAvatarUploading(false);
      setAvatarProgress(0);
      e.target.value = '';
    }
  };

  // Certificate Modal State
  const [showCertificate, setShowCertificate] = useState(false);
  const [selectedCertCourse, setSelectedCertCourse] = useState<Course | null>(null);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: editName,
      email: editEmail,
      phone: editPhone,
      whatsapp: editWhatsapp,
      homeChurch: editChurch,
      bio: editBio
    });
    setIsEditing(false);
  };

  // Find completed courses (progress === 100)
  const completedCourses = enrolledCourses.filter(c => c.progress === 100);

  const triggerCertificateModal = (course: Course) => {
    setSelectedCertCourse(course);
    setShowCertificate(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-16" id="student-profile-page">
      
      {/* 1. Header Hero Banner */}
      <div className="bg-brand-blue-950 text-white py-12 border-b border-brand-gold/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-gold/5 blur-3xl rounded-full"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full border-2 border-brand-gold p-1 shrink-0 relative group">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-full h-full rounded-full object-cover"
            />
            <label
              htmlFor="avatar-upload-input"
              className="absolute inset-1 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity duration-200 text-[10px] text-white font-semibold text-center px-1"
            >
              {avatarUploading ? `${t('uploading')} ${avatarProgress}%` : t('changePhoto')}
            </label>
            <input
              id="avatar-upload-input"
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              disabled={avatarUploading}
              onChange={handleAvatarChange}
            />
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start space-x-2 text-xs text-brand-gold font-mono uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{profile.plan} Member</span>
            </div>
            <h1 className="font-serif text-3xl font-bold">{profile.name}</h1>
            {profile.username && (
              <p className="text-xs text-brand-gold font-mono mt-0.5">@{profile.username}</p>
            )}
            <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
              {profile.bio || "No spiritual bio added yet. Click 'Edit profile' to share your covenant objectives."}
            </p>
          </div>

          <div className="shrink-0 flex space-x-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-xl border border-white/15 cursor-pointer"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main profile content (Left - 2 Columns) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Edit Profile Form */}
            {isEditing ? (
              <form onSubmit={handleProfileSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-brand-blue-950 text-lg mb-4">Edit Covenant Credentials</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full p-2.5 text-xs sm:text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full p-2.5 text-xs sm:text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">Phone Contact</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full p-2.5 text-xs sm:text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">{t('whatsappLabel')}</label>
                    <input
                      type="text"
                      value={editWhatsapp}
                      onChange={(e) => setEditWhatsapp(e.target.value)}
                      className="w-full p-2.5 text-xs sm:text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">Home Fellowship Church</label>
                    <input
                      type="text"
                      value={editChurch}
                      onChange={(e) => setEditChurch(e.target.value)}
                      className="w-full p-2.5 text-xs sm:text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">Spiritual Bio / Covenant Objective</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full h-24 p-2.5 text-xs sm:text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-gold"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-brand-blue-950 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-brand-blue-900 flex items-center space-x-1 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Credentials</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Informational View */
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <h3 className="font-serif font-bold text-brand-blue-950 text-lg">Covenant Credentials</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Email Address</span>
                      <span className="block text-sm font-semibold text-brand-blue-950 mt-0.5">{profile.email}</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Phone Contact</span>
                      <span className="block text-sm font-semibold text-brand-blue-950 mt-0.5">{profile.phone || 'No phone verified'}</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Church className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Home Fellowship Church</span>
                      <span className="block text-sm font-semibold text-brand-blue-950 mt-0.5">{profile.homeChurch || 'No church specified'}</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Spiritual Affiliation Date</span>
                      <span className="block text-sm font-semibold text-brand-blue-950 mt-0.5">{profile.joinedDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Completion Certificates Column */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-serif font-bold text-brand-blue-950 text-lg mb-4">My Completion Certificates</h3>
              
              {completedCourses.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                  <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p>You have not completed any courses yet. Fasting & Focus coursework can be completed by checking off all lessons!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedCourses.map((course) => (
                    <div 
                      key={course.id} 
                      className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/20 flex flex-col sm:flex-row items-center justify-between gap-4"
                    >
                      <div className="flex items-center space-x-3 text-center sm:text-left">
                        <span className="w-10 h-10 rounded-full bg-brand-gold/15 flex items-center justify-center text-brand-gold-dark border border-brand-gold/30">
                          🎓
                        </span>
                        <div>
                          <span className="text-[10px] font-mono text-emerald-800 font-bold uppercase tracking-wider">Completed Certificate Locked</span>
                          <h4 className="font-serif text-sm font-bold text-brand-blue-950 mt-0.5">{course.title}</h4>
                        </div>
                      </div>

                      <button
                        onClick={() => triggerCertificateModal(course)}
                        className="w-full sm:w-auto px-4 py-2.5 bg-brand-blue-950 hover:bg-brand-blue-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center space-x-1.5 shadow cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-brand-gold" />
                        <span>View Certificate</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Sidebar - Subscription Control & Streaks */}
          <div className="space-y-8">
            
            {/* Membership details */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-serif font-bold text-brand-blue-950 text-lg mb-4">Membership Plan</h3>
              
              <div className="p-4 bg-brand-blue-950 text-white rounded-xl border border-brand-gold/20 relative overflow-hidden">
                <span className="text-brand-gold text-[9px] font-mono uppercase tracking-widest font-bold">Covenant Tier</span>
                <h4 className="font-serif text-base font-bold mt-0.5">{profile.plan}</h4>
                <div className="mt-4 flex justify-between items-baseline">
                  <span className="font-mono text-2xl font-bold">{profile.planPrice}</span>
                  <span className="text-[10px] text-slate-300">Renewing: {profile.renewsDate}</span>
                </div>
              </div>

              {/* simulated payment upgrades */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <button
                  onClick={() => {
                    onUpdateProfile({ plan: 'All-Access Member', planPrice: '$15 / month' });
                    alert('You have renewed your $15 All-Access Member tier!');
                  }}
                  className="w-full py-2.5 bg-brand-gold text-brand-blue-950 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-brand-gold-light transition-colors block text-center"
                >
                  Renew Subscription
                </button>
                <button
                  onClick={() => {
                    onUpdateProfile({ plan: 'Free Covenant Tier', planPrice: '$0 / month' });
                    alert('Your premium subscription was downgraded to the Free tier. Access is restricted.');
                  }}
                  className="w-full py-2.5 border border-slate-200 hover:border-slate-300 text-slate-500 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors block text-center"
                >
                  Cancel Plan
                </button>
              </div>
            </div>

            {/* Notifications settings */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-serif font-bold text-brand-blue-950 text-lg mb-1">Notifications</h3>
              <p className="text-xs text-slate-500 mb-4">
                Get real alerts on this device — comments, likes, replies, new courses, and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleEnableNotifications}
                  disabled={notifBusy}
                  className="flex-1 py-2.5 bg-brand-gold text-brand-blue-950 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-brand-gold-light transition-colors disabled:opacity-60"
                >
                  {notifBusy ? 'Working…' : 'Enable Notifications'}
                </button>
                <button
                  onClick={handleTestNotification}
                  disabled={notifBusy}
                  className="flex-1 py-2.5 border border-slate-200 hover:border-slate-300 text-slate-500 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors disabled:opacity-60"
                >
                  Send Test Notification
                </button>
              </div>
              {notifMessage && <p className="text-[11px] text-slate-500 mt-3">{notifMessage}</p>}
            </div>

            {/* Streak milestones widget */}
            <div className="bg-brand-blue-950 text-white p-6 rounded-2xl border border-brand-gold/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-xl"></div>
              
              <h3 className="font-serif font-bold text-brand-gold text-base mb-4 flex items-center">
                <Flame className="w-5 h-5 mr-2 animate-bounce" /> {profile.streak} Day Devotion Streak
              </h3>
              
              <div className="space-y-3 text-xs">
                <p className="text-slate-300 leading-normal mb-4">
                  Daniel, you are currently in the top 3% of covenant warriors globally. Keep rising for the midnight watch to maintain your protective fire mantle!
                </p>

                <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
                  <div className="bg-brand-gold h-1.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono block text-right">
                  Next Milestone: 15-Day Shield (3 days left)
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 2. Certificate Modal rendering */}
      {showCertificate && selectedCertCourse && (
        <div className="fixed inset-0 z-50 bg-brand-blue-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl p-8 sm:p-12 rounded-3xl relative border-[12px] border-double border-brand-gold shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Close button */}
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-2 rounded-full cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Certificate Core Layout */}
            <div className="border border-brand-gold/40 p-6 sm:p-10 text-center relative overflow-hidden">
              {/* Spiritual crest background */}
              <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
                <Shield className="w-80 h-80 text-brand-blue-950" />
              </div>

              <div className="relative z-10 space-y-6">
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.3em] uppercase text-brand-gold-dark block">
                  DIVINE ARSENAL TRAINING ACADEMY
                </span>

                <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-brand-blue-950 leading-none">
                  CERTIFICATE OF SPIRITUAL TRAINING
                </h1>

                <div className="w-24 h-0.5 bg-brand-gold mx-auto my-4"></div>

                <p className="text-xs sm:text-sm italic font-serif text-slate-500">
                  This certifies before God and the Global Covenant Network that
                </p>

                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-gold-dark border-b border-brand-gold/20 pb-2 w-fit mx-auto px-8">
                  {profile.name}
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                  has successfully fulfilled the complete spiritual coursework, modules, examinations, and practical intercession watches for:
                </p>

                <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-blue-950 uppercase tracking-wide">
                  {selectedCertCourse.title}
                </h3>

                <p className="text-[10px] text-slate-400 font-mono italic max-w-md mx-auto">
                  "Study to show thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth." — 2 Timothy 2:15
                </p>

                {/* Official seal */}
                <div className="pt-10 max-w-md mx-auto border-t border-slate-100 text-center">
                  <span className="font-serif italic text-sm text-brand-blue-950 block">Divine Arsenal Corporation</span>
                  <span className="w-40 h-px bg-slate-300 block mx-auto my-1"></span>
                  <span className="text-[9px] text-slate-400 font-mono uppercase">Official Certification</span>
                </div>

                <div className="pt-8 flex flex-col sm:flex-row justify-center items-center gap-3">
                  <span className="text-[9px] text-slate-400 font-mono uppercase bg-slate-100 px-3 py-1 rounded">
                    CREDENTIAL ID: DA-{selectedCertCourse.id.slice(-8).toUpperCase()}
                  </span>
                  
                  <button
                    onClick={() => {
                      alert('Downloading PDF Completion Certificate containing secure verified metadata to your local drive...');
                    }}
                    className="px-4 py-2 bg-brand-blue-950 hover:bg-brand-blue-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl flex items-center space-x-1 shadow cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-brand-gold" />
                    <span>Download PDF Certificate</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
