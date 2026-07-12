import React from 'react';
import { UserProfile, Course, PrayerPoint } from '../types';
import { Flame, BookOpen, Award, Shield, Sparkles, MessageSquare, Play, PlusCircle, CheckCircle, ArrowRight, Heart, HeartOff, PenTool } from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
  currentCourse: Course | undefined;
  activePrayers: PrayerPoint[];
  onTogglePrayer: (id: string) => void;
  onResumeLesson: (courseId: string, lessonId: string) => void;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({
  profile,
  currentCourse,
  activePrayers,
  onTogglePrayer,
  onResumeLesson,
  onNavigate
}: DashboardProps) {
  
  // Find current incomplete lesson
  const resumeLessonInfo = () => {
    if (!currentCourse) return null;
    for (const mod of currentCourse.modules) {
      for (const les of mod.lessons) {
        if (!les.completed) {
          return { module: mod, lesson: les };
        }
      }
    }
    // fallback to first lesson
    return { module: currentCourse.modules[0], lesson: currentCourse.modules[0].lessons[0] };
  };

  const resumeInfo = resumeLessonInfo();

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-16" id="student-dashboard">
      
      {/* 1. Header / Welcome banner */}
      <div className="bg-brand-blue-950 text-white py-10 border-b border-brand-gold/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 blur-2xl rounded-full"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-xs text-brand-gold font-mono uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Covenant Member Dashboard</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-white font-bold">
              Shalom, {profile.name}
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              "Set your mind on things above, where Christ is seated..." — Colossians 3:2
            </p>
          </div>

          {/* Core Stat Rings */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-brand-blue-900/60 p-4 rounded-2xl border border-brand-gold/10">
            <div className="text-center px-4">
              <span className="text-brand-gold font-mono text-xl font-bold block">{profile.streak}</span>
              <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">Devotion Streak</span>
            </div>
            <div className="text-center px-4 border-l border-white/10">
              <span className="text-brand-gold font-mono text-xl font-bold block">{profile.coursesCount}</span>
              <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">Active Courses</span>
            </div>
            <div className="text-center px-4 border-l border-white/10">
              <span className="text-brand-gold font-mono text-xl font-bold block">{profile.lessonsCount}</span>
              <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">Lessons Cleared</span>
            </div>
            <div className="text-center px-4 border-l border-white/10">
              <span className="text-brand-gold font-mono text-xl font-bold block">{profile.certificatesCount}</span>
              <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">Certificates</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Grid Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1 & 2 (Left/Center content) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* The Living Word (Daily Verse) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden" id="daily-verse-card">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-gold"></div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-brand-gold-dark uppercase tracking-widest font-mono flex items-center">
                  <Flame className="w-3.5 h-3.5 mr-1.5 animate-pulse" /> The Living Word
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">
                  Today's Verse
                </span>
              </div>
              <blockquote className="font-serif text-lg text-slate-800 italic leading-relaxed mb-3">
                "So that your days and the days of your children may be as many in the land that the Lord swore to your fathers to give them, as long as the heavens are above the earth."
              </blockquote>
              <div className="flex justify-between items-center">
                <cite className="text-xs font-semibold text-brand-blue-900 not-italic">
                  Deuteronomy 11:21
                </cite>
                <button
                  onClick={() => onNavigate('war-room')}
                  className="text-xs text-brand-gold-dark font-semibold hover:text-brand-gold flex items-center"
                >
                  <span>Journal Meditation</span>
                  <PenTool className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            </div>

            {/* Resume Current Course Curriculum */}
            {currentCourse && resumeInfo && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="resume-course-card">
                <div className="bg-brand-blue-900/5 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                      CONTINUE YOUR CURRICULUM
                    </span>
                    <h3 className="font-serif text-lg font-bold text-brand-blue-950 mt-0.5">
                      {currentCourse.title}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-brand-gold-dark bg-brand-gold/10 px-3 py-1 rounded-full">
                    {currentCourse.progress}% Completed
                  </span>
                </div>

                <div className="p-6">
                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-6">
                    <div 
                      className="bg-gradient-to-r from-brand-gold to-brand-gold-dark h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${currentCourse.progress}%` }}
                    ></div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        UP NEXT — {resumeInfo.module.title}
                      </span>
                      <h4 className="font-serif font-bold text-brand-blue-950 mt-1">
                        {resumeInfo.lesson.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Duration: {resumeInfo.lesson.duration} • Focus: Position & Authority
                      </p>
                    </div>
                    <button
                      onClick={() => onResumeLesson(currentCourse.id, resumeInfo.lesson.id)}
                      className="w-full sm:w-auto px-5 py-2.5 bg-brand-blue-950 hover:bg-brand-blue-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2 shadow-md hover:scale-[1.01] transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-white" />
                      <span>Resume Lesson</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions Shortcuts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="quick-actions-grid">
              
              <div 
                onClick={() => onNavigate('war-room')}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-brand-gold/40 hover:shadow-md cursor-pointer transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-blue-900/5 flex items-center justify-center text-brand-blue-900 mb-4 group-hover:bg-brand-gold/10 group-hover:text-brand-gold-dark transition-all">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-brand-blue-950 group-hover:text-brand-gold-dark transition-colors">
                  Go to War Room
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Post dynamic prayer shields, declare victories, and see answers.
                </p>
              </div>

              <div 
                onClick={() => onNavigate('war-room')} // and sub-tab journal
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-brand-gold/40 hover:shadow-md cursor-pointer transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-blue-900/5 flex items-center justify-center text-brand-blue-900 mb-4 group-hover:bg-brand-gold/10 group-hover:text-brand-gold-dark transition-all">
                  <PenTool className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-brand-blue-950 group-hover:text-brand-gold-dark transition-colors">
                  Personal Journal
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Write confidential spiritual journals, record covenants and dreams.
                </p>
              </div>

              <div 
                onClick={() => onNavigate('war-room')} // counsel tab
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-brand-gold/40 hover:shadow-md cursor-pointer transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-blue-900/5 flex items-center justify-center text-brand-blue-900 mb-4 group-hover:bg-brand-gold/10 group-hover:text-brand-gold-dark transition-all">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-brand-blue-950 group-hover:text-brand-gold-dark transition-colors">
                  Contact Counselors
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Start secure private messaging and request spiritual alignment counsel.
                </p>
              </div>

            </div>

          </div>

          {/* Column 3 (Right Sidebar content) */}
          <div className="space-y-8">
            
            {/* Active Prayer Points list */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm" id="active-prayers-sidebar">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-serif font-bold text-brand-blue-950 text-lg">My Prayer Shields</h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  {activePrayers.filter(p => p.status === 'active').length} Active
                </span>
              </div>

              <div className="space-y-4">
                {activePrayers.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No active prayer shields right now.</p>
                ) : (
                  activePrayers.map((prayer) => (
                    <div 
                      key={prayer.id} 
                      className={`p-4 rounded-xl border transition-all ${
                        prayer.status === 'answered' 
                          ? 'bg-emerald-50/50 border-emerald-200' 
                          : 'bg-slate-50 border-slate-200 hover:border-brand-gold/30'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className={`text-xs font-bold leading-tight font-sans ${
                          prayer.status === 'answered' ? 'text-emerald-950 line-through' : 'text-brand-blue-950'
                        }`}>
                          {prayer.title}
                        </h4>
                        <button
                          onClick={() => onTogglePrayer(prayer.id)}
                          className={`p-1 rounded-full shrink-0 transition-colors cursor-pointer ${
                            prayer.status === 'answered' 
                              ? 'text-emerald-600 bg-emerald-100/50' 
                              : 'text-slate-400 hover:text-brand-gold hover:bg-brand-gold/10'
                          }`}
                          title={prayer.status === 'answered' ? "Mark Active" : "Declare Answered!"}
                        >
                          <CheckCircle className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-normal">
                        {prayer.description}
                      </p>
                      
                      {prayer.status === 'answered' && prayer.testimonyNote && (
                        <div className="mt-2 text-[10px] text-emerald-700 bg-emerald-100/30 p-1.5 rounded border border-emerald-200/50 italic">
                          {prayer.testimonyNote}
                        </div>
                      )}

                      <div className="mt-3 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                        <span>{prayer.daysAgo}</span>
                        <span className="flex items-center text-brand-gold-dark font-sans font-semibold">
                          <Heart className="w-3 h-3 mr-1 fill-current" />
                          {prayer.prayingCount} supporting
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => onNavigate('war-room')}
                className="w-full py-2.5 mt-4 border border-brand-gold/30 hover:border-brand-gold text-brand-gold-dark text-xs font-bold uppercase tracking-wider rounded-xl transition-all block text-center cursor-pointer"
              >
                + ADD PRAYER SHIELD
              </button>
            </div>

            {/* Streak & Achievements Mini Widget */}
            <div className="bg-brand-blue-950 text-white p-6 rounded-2xl border border-brand-gold/20 relative overflow-hidden">
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-brand-gold/10 rounded-full blur-xl"></div>
              
              <h3 className="font-serif font-bold text-brand-gold text-base mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2" /> Spiritual Milestones
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold block">12-Day Devotion</span>
                    <span className="text-[10px] text-gray-400">Streak maintained successfully</span>
                  </div>
                  <span className="text-xs text-brand-gold font-mono font-bold">ACTIVE 🔥</span>
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <div>
                    <span className="text-xs font-semibold block">Apostolic Seal</span>
                    <span className="text-[10px] text-gray-400">Daniel Covenant Course completed</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono font-bold">CLAIMED 🏆</span>
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <div>
                    <span className="text-xs font-semibold block">Prayer Firebrand</span>
                    <span className="text-[10px] text-gray-400">Post 3 public prayer requests</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">2 / 3</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
