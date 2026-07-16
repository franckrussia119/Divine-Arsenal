import React, { useState, useEffect } from 'react';
import { Course, Lesson, CourseModule, JournalEntry } from '../types';
import { ChevronLeft, CheckCircle2, Circle, Play, BookOpen, Flame, Compass, MessageSquare, Save, CheckCircle, ChevronDown, ListPlus, Notebook, Eye } from 'lucide-react';
import ShareButton from './ShareButton';
import { api } from '../lib/api';

interface CourseLessonViewProps {
  course: Course;
  onBack: () => void;
  onToggleLessonCompleted: (courseId: string, lessonId: string) => void;
  onAddJournalEntry: (text: string, category: string, linkedLessonId?: string) => void;
}

export default function CourseLessonView({
  course,
  onBack,
  onToggleLessonCompleted,
  onAddJournalEntry
}: CourseLessonViewProps) {
  // Find first uncompleted lesson as default, or fallback to first lesson
  const findDefaultLesson = (): { mod: CourseModule; les: Lesson } => {
    for (const mod of course.modules) {
      for (const les of mod.lessons) {
        if (!les.completed) return { mod, les };
      }
    }
    return { mod: course.modules[0], les: course.modules[0].lessons[0] };
  };

  const defaultSelection = findDefaultLesson();
  const [activeModule, setActiveModule] = useState<CourseModule>(defaultSelection.mod);
  const [activeLesson, setActiveLesson] = useState<Lesson>(defaultSelection.les);
  const [activeTab, setActiveTab] = useState<'scripture' | 'practices' | 'reflection' | 'discussion'>('scripture');
  
  // Journal text
  const [reflectionText, setReflectionText] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Discussion comments state — local-only for now (not yet persisted to the database)
  const [comments, setComments] = useState<{ id: number; author: string; date: string; text: string }[]>([]);
  const [newComment, setNewComment] = useState('');

  // View tracking for this lesson's video
  const [lessonViews, setLessonViews] = useState(activeLesson.views ?? 0);
  const [viewedLessons, setViewedLessons] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLessonViews(activeLesson.views ?? 0);
  }, [activeLesson.id]);

  const handleVideoPlay = async () => {
    if (viewedLessons.has(activeLesson.id)) return;
    setViewedLessons((prev) => new Set(prev).add(activeLesson.id));
    try {
      const data = await api.post<{ views: number }>(`/courses/${course.id}/lessons/${activeLesson.id}/view`);
      setLessonViews(data.views);
    } catch (err) {
      console.error('View tracking failed:', err);
    }
  };

  const handleSaveReflection = () => {
    if (!reflectionText.trim()) return;
    onAddJournalEntry(
      reflectionText,
      'REFLECTION',
      activeLesson.id
    );
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    setReflectionText('');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([
      {
        id: comments.length + 1,
        author: 'Daniel Okafor',
        date: 'Just now',
        text: newComment
      },
      ...comments
    ]);
    setNewComment('');
  };

  const handleLessonSelect = (mod: CourseModule, les: Lesson) => {
    setActiveModule(mod);
    setActiveLesson(les);
    setIsSaved(false);
    setReflectionText('');
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800" id="lesson-view-container">
      
      {/* 1. Header Bar */}
      <div className="bg-brand-blue-950 text-white px-4 sm:px-6 py-4 border-b border-brand-gold/20 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Training</span>
        </button>

        <div className="text-center">
          <span className="text-[10px] text-brand-gold font-mono uppercase tracking-widest font-semibold block">
            {course.title}
          </span>
          <span className="text-xs text-slate-400 font-sans block mt-0.5">
            Module: {activeModule.title}
          </span>
        </div>

        <div className="text-xs text-brand-gold font-semibold bg-brand-gold/15 px-3 py-1.5 border border-brand-gold/20 rounded-full font-mono">
          {course.progress}% PROGRESS
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Lesson Player + Tabs (Left/Center - Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Video Player / Presentation Block */}
            <div className="bg-black rounded-2xl overflow-hidden relative shadow-xl border border-slate-800 group">
              {activeLesson.videoUrl ? (
                <div className="flex items-center justify-center max-h-[70vh] overflow-hidden">
                  <video
                    src={activeLesson.videoUrl}
                    controls
                    className="w-full h-auto max-h-[70vh] object-contain"
                    poster={course.imageUrl}
                    onPlay={handleVideoPlay}
                  />
                  <div className="absolute top-3 left-3 flex items-center space-x-1 bg-black/70 text-white text-[10px] font-mono px-2.5 py-1.5 rounded-full pointer-events-none">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{lessonViews} views</span>
                  </div>
                </div>
              ) : (
                <div className="aspect-video w-full h-full flex flex-col items-center justify-center bg-brand-blue-950 p-8 text-center text-white">
                  <BookOpen className="w-16 h-16 text-brand-gold/60 mb-4 animate-bounce" />
                  <h3 className="font-serif text-xl font-bold">Written & Scriptural Devotional Lesson</h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    This lesson is a deep reading-based meditation study. Complete the activities below to clear this lesson.
                  </p>
                </div>
              )}
            </div>

            {/* Title & Complete Action Row */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-blue-950">
                    {activeLesson.title}
                  </h2>
                  <ShareButton title={`${course.title} — ${activeLesson.title}`} path={`/?view=course&courseId=${course.id}`} />
                </div>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Lesson Estimated Reading/Study: {activeLesson.duration}
                </p>
              </div>

              <button
                onClick={() => onToggleLessonCompleted(course.id, activeLesson.id)}
                className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow cursor-pointer ${
                  activeLesson.completed 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : 'bg-brand-gold hover:bg-brand-gold-light text-brand-blue-950 hover:scale-[1.01]'
                }`}
              >
                {activeLesson.completed ? (
                  <>
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-600 fill-current" />
                    <span>Completed ✓</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-4.5 h-4.5 text-brand-blue-950" />
                    <span>Mark As Completed</span>
                  </>
                )}
              </button>
            </div>

            {/* Detailed Info Tabs block */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              
              {/* Tab headers */}
              <div className="flex border-b border-slate-100 bg-slate-50/50">
                <button
                  onClick={() => setActiveTab('scripture')}
                  className={`py-4 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    activeTab === 'scripture' 
                      ? 'border-brand-gold text-brand-blue-950 bg-white' 
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Overview & Scripture
                </button>
                <button
                  onClick={() => setActiveTab('practices')}
                  className={`py-4 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    activeTab === 'practices' 
                      ? 'border-brand-gold text-brand-blue-950 bg-white' 
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Practical Directives
                </button>
                <button
                  onClick={() => setActiveTab('reflection')}
                  className={`py-4 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    activeTab === 'reflection' 
                      ? 'border-brand-gold text-brand-blue-950 bg-white' 
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Personal Reflection
                </button>
                <button
                  onClick={() => setActiveTab('discussion')}
                  className={`py-4 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    activeTab === 'discussion' 
                      ? 'border-brand-gold text-brand-blue-950 bg-white' 
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Discussion ({comments.length})
                </button>
              </div>

              {/* Tab Panels */}
              <div className="p-6">
                
                {/* 1. Scripture Tab */}
                {activeTab === 'scripture' && (
                  <div className="space-y-6">
                    {activeLesson.keyVerse && (
                      <div className="bg-brand-blue-950 text-white p-6 rounded-2xl border-l-4 border-brand-gold relative overflow-hidden">
                        <span className="text-[10px] font-mono text-brand-gold font-bold uppercase tracking-widest block mb-2">
                          Key Scripture Portal
                        </span>
                        <p className="font-serif text-lg italic leading-relaxed text-slate-100">
                          {activeLesson.keyVerse}
                        </p>
                      </div>
                    )}

                    <div className="prose max-w-none text-slate-700 text-sm leading-relaxed space-y-4">
                      <p>
                        {activeLesson.content || 'This lesson focuses on aligning your inner prayer life with legal covenant strategies of the scripture. Study the references listed below and spend quality time in intercessory focus to unlock breakthroughs.'}
                      </p>
                      <p>
                        Spiritual alignment requires absolute sincerity and persistent devotion. As you progress, note that the enemy tries to intercept answers in territorial spiritual climates, but persistent alignment breaks all atmospheric boundaries.
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. Practices Tab */}
                {activeTab === 'practices' && (
                  <div className="space-y-4">
                    <h3 className="font-serif font-bold text-brand-blue-950 text-base mb-3">
                      Covenant Action Deliverables
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Fulfillment of these practical assignments is critical to anchor the revelation in your soul.
                    </p>

                    <div className="space-y-3">
                      {activeLesson.practices ? (
                        activeLesson.practices.map((practice, index) => (
                          <div key={index} className="flex items-start p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <span className="w-6 h-6 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold-dark text-xs font-bold mr-3 shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <span className="text-xs sm:text-sm text-slate-700 leading-normal">{practice}</span>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="flex items-start p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <span className="w-6 h-6 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold-dark text-xs font-bold mr-3 shrink-0 mt-0.5">1</span>
                            <span className="text-xs sm:text-sm text-slate-700">Dedicate 30 minutes to structured intercessory warfare between 12am and 3am.</span>
                          </div>
                          <div className="flex items-start p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <span className="w-6 h-6 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold-dark text-xs font-bold mr-3 shrink-0 mt-0.5">2</span>
                            <span className="text-xs sm:text-sm text-slate-700">Write down three key scriptures regarding your positioning in Christ on a card, keeping them visible all day.</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. Reflection Tab */}
                {activeTab === 'reflection' && (
                  <div className="space-y-4">
                    <h3 className="font-serif font-bold text-brand-blue-950 text-base">
                      Spiritual Log Reflection
                    </h3>
                    <p className="text-xs text-slate-500">
                      Write down what the Holy Spirit is saying to you in this lesson. This reflection will be saved automatically into your Personal Spiritual Journal!
                    </p>

                    <div className="space-y-4">
                      <textarea
                        value={reflectionText}
                        onChange={(e) => setReflectionText(e.target.value)}
                        placeholder="Write down your divine insights, covenant claims, or dreams here..."
                        className="w-full h-36 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none"
                      />

                      <div className="flex justify-between items-center">
                        {isSaved ? (
                          <span className="text-xs text-emerald-600 font-semibold flex items-center font-mono">
                            <CheckCircle className="w-4 h-4 mr-1.5 fill-current" /> Saved in Spiritual Journal
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-mono">Confidential & saved securely</span>
                        )}

                        <button
                          onClick={handleSaveReflection}
                          disabled={!reflectionText.trim()}
                          className="px-4 py-2.5 bg-brand-blue-950 hover:bg-brand-blue-900 disabled:bg-slate-300 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5 mr-1.5" />
                          <span>Save Reflection</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Discussion Tab */}
                {activeTab === 'discussion' && (
                  <div className="space-y-6">
                    <h3 className="font-serif font-bold text-brand-blue-950 text-base">
                      Student Cohort Discussion
                    </h3>

                    {/* New comment input */}
                    <form onSubmit={handleAddComment} className="flex gap-3">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Ask a question or post an encouraging word..."
                        className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 outline-none focus:border-brand-gold"
                      />
                      <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="px-4 py-2 bg-brand-gold text-brand-blue-950 text-xs font-bold uppercase rounded-xl hover:bg-brand-gold-light cursor-pointer"
                      >
                        Post
                      </button>
                    </form>

                    {/* Comments list */}
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                      {comments.map((comment) => (
                        <div key={comment.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="font-bold text-brand-blue-950">{comment.author}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{comment.date}</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

          {/* Curriculum Index (Right Sidebar - 1 Column) */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-serif font-bold text-brand-blue-950 text-lg mb-4 flex items-center">
                <ListPlus className="w-5 h-5 mr-2 text-brand-gold" /> Curriculum Outline
              </h3>

              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                {course.modules.map((mod) => (
                  <div key={mod.id} className="space-y-3">
                    <div className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">
                      {mod.title}
                    </div>

                    <div className="space-y-2">
                      {mod.lessons.map((les) => {
                        const isActive = les.id === activeLesson.id;
                        return (
                          <div
                            key={les.id}
                            onClick={() => handleLessonSelect(mod, les)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs gap-3 ${
                              isActive 
                                ? 'bg-brand-blue-950 text-white border-brand-gold' 
                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5">
                              <span className="shrink-0">
                                {les.completed ? (
                                  <CheckCircle className={`w-4 h-4 fill-current ${isActive ? 'text-brand-gold' : 'text-emerald-600'}`} />
                                ) : (
                                  <Play className={`w-3.5 h-3.5 fill-current ${isActive ? 'text-brand-gold' : 'text-slate-400'}`} />
                                )}
                              </span>
                              <span className={`font-medium line-clamp-2 ${isActive ? 'text-white' : 'text-slate-800'}`}>
                                {les.title}
                              </span>
                            </div>

                            <span className={`text-[10px] font-mono shrink-0 ${isActive ? 'text-brand-gold' : 'text-slate-400'}`}>
                              {les.duration}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Link to counseling support during difficult courses */}
            <div className="bg-brand-blue-950 text-white p-6 rounded-2xl border border-brand-gold/25 relative overflow-hidden">
              <h4 className="font-serif font-bold text-brand-gold mb-2">Feeling Stuck or Challenged?</h4>
              <p className="text-xs text-slate-300 leading-normal mb-4">
                The lessons on territorial altars can generate temporary spiritual pressure. Our counselors are online to pray you through.
              </p>
              <button 
                onClick={onBack} // Jumps back, can easily switch to care tab
                className="text-xs text-brand-gold font-bold hover:text-brand-gold-light flex items-center uppercase tracking-wider"
              >
                <span>Speak to Sarah Nkosi</span>
                <ChevronLeft className="w-3.5 h-3.5 ml-1 rotate-180" />
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
