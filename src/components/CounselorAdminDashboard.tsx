import React, { useState } from 'react';
import { Course, BlogPost, PrayerPoint } from '../types';
import { PlusCircle, Save, BookOpen, Shield, ShieldAlert, Sparkles, UserCheck, MessageSquare, Flame } from 'lucide-react';

interface CounselorAdminDashboardProps {
  currentRole: 'Counselor' | 'Admin';
  courses: Course[];
  onAddCourse: (newCourse: Course) => void;
  blogPosts: BlogPost[];
  onAddBlogPost: (newPost: BlogPost) => void;
  prayers: PrayerPoint[];
  onCounselorReplyToPrayer: (id: string, replyText: string) => void;
}

export default function CounselorAdminDashboard({
  currentRole,
  courses,
  onAddCourse,
  blogPosts,
  onAddBlogPost,
  prayers,
  onCounselorReplyToPrayer
}: CounselorAdminDashboardProps) {
  
  // Counselor replies state
  const [activeReplyPrayerId, setActiveReplyPrayerId] = useState<string | null>(null);
  const [counselorReply, setCounselorReply] = useState('');

  // Course Form State
  const [courseTitle, setCourseTitle] = useState('');
  const [courseSubtitle, setCourseSubtitle] = useState('');
  const [courseCategory, setCourseCategory] = useState('Spiritual Warfare');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseIsFree, setCourseIsFree] = useState(false);
  const [coursePrice, setCoursePrice] = useState('$19');
  const [courseImg, setCourseImg] = useState('https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=800');

  // Blog Form State
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState('faith');
  const [postExcerpt, setPostExcerpt] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImg, setPostImg] = useState('https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=600');

  const [notification, setNotification] = useState('');

  const triggerNotification = (text: string) => {
    setNotification(text);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle || !courseDesc) return;
    
    const newC: Course = {
      id: `course-${Date.now()}`,
      title: courseTitle,
      subtitle: courseSubtitle || 'A premium training pathway for spiritual masters',
      category: courseCategory,
      numLessons: 3,
      duration: '2 hours',
      description: courseDesc,
      isFree: courseIsFree,
      price: courseIsFree ? 'Free' : coursePrice,
      imageUrl: courseImg,
      progress: 0,
      modules: [
        {
          id: `mod-${Date.now()}`,
          title: 'Module 1: Divine Entrances',
          lessons: [
            {
              id: `les-${Date.now()}-1`,
              title: '1. Foundations of Covenant Authority',
              duration: '15 mins',
              videoDuration: '15:00',
              completed: false,
              keyVerse: 'Colossians 1:13 - "He has delivered us from the domain of darkness and transferred us to the kingdom of his beloved Son."'
            }
          ]
        }
      ]
    };

    onAddCourse(newC);
    triggerNotification(`Successfully published Course: "${courseTitle}"!`);
    
    // Reset
    setCourseTitle('');
    setCourseSubtitle('');
    setCourseDesc('');
  };

  const handleCreateBlogPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle || !postContent) return;

    const newP: BlogPost = {
      id: `post-${Date.now()}`,
      title: postTitle,
      category: postCategory,
      excerpt: postExcerpt || 'Explore the deep spiritual mechanics of prayer and faith.',
      content: postContent,
      author: 'Pastor Joel Adeleke',
      authorRole: 'Founder, AG Network',
      date: 'Jul 5, 2026',
      readTime: '5 min read',
      imageUrl: postImg
    };

    onAddBlogPost(newP);
    triggerNotification(`Successfully published Teaching: "${postTitle}"!`);

    // Reset
    setPostTitle('');
    setPostExcerpt('');
    setPostContent('');
  };

  const handleCounselorReply = (id: string) => {
    if (!counselorReply.trim()) return;
    onCounselorReplyToPrayer(id, counselorReply);
    setActiveReplyPrayerId(null);
    setCounselorReply('');
    triggerNotification('Reply sent back to student securely!');
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-16" id="counselor-admin-dashboard">
      
      {/* 1. Header Hero Banner */}
      <div className="bg-brand-blue-950 text-white py-12 border-b border-brand-gold/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-gold/5 blur-3xl rounded-full"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center space-x-2 text-xs text-brand-gold font-mono uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Staff Covenant Authorization Level</span>
          </div>
          
          <h1 className="font-serif text-3xl font-bold">
            {currentRole === 'Counselor' ? 'Counselor Care & Intercession Suite' : 'Admin & Spiritual Author Console'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">
            {currentRole === 'Counselor' 
              ? 'Anointed counseling interface to answer incoming intercession requests and direct divine directive counsel.'
              : 'Add new anointed courses, curriculum structures, and publish living public teachings to grow our digital SEO footprint.'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Dynamic Alerts */}
        {notification && (
          <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 p-4 rounded-xl text-xs font-mono font-bold mb-8 animate-bounce">
            ✔ {notification}
          </div>
        )}

        {/* 2. COUNSELOR VIEW COMPONENT */}
        {currentRole === 'Counselor' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Live Requests assigned */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-mono text-slate-500 font-bold uppercase">
                  Incoming Student Intercessions Shield List ({prayers.filter(p => p.status === 'active').length})
                </span>
              </div>

              <div className="space-y-4">
                {prayers.filter(p => p.status === 'active').map((p) => (
                  <div key={p.id} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-brand-gold-dark font-mono uppercase font-bold bg-brand-gold/15 px-2 py-0.5 rounded-full">Active Portal Request</span>
                        <h4 className="font-serif text-base font-bold text-brand-blue-950 mt-1">{p.title}</h4>
                      </div>
                      
                      <button
                        onClick={() => setActiveReplyPrayerId(p.id)}
                        className="px-3 py-1.5 bg-brand-blue-950 hover:bg-brand-blue-900 text-white text-[11px] font-bold uppercase tracking-wider rounded-lg cursor-pointer"
                      >
                        Send Counsel Reply
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{p.description}</p>

                    {/* Counselor inline responding form */}
                    {activeReplyPrayerId === p.id && (
                      <div className="mt-4 p-4 bg-slate-50 rounded-xl border-2 border-brand-gold/30 space-y-3">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Compose Counselor Spiritual Response</span>
                        <textarea
                          value={counselorReply}
                          onChange={(e) => setCounselorReply(e.target.value)}
                          placeholder="Compose counseling reply (e.g. 'Shalom child of God. I have spent time at midnight praying regarding this. God is releasing doors...')"
                          className="w-full h-24 p-3 bg-white border border-slate-200 text-xs rounded-lg outline-none focus:border-brand-gold"
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setActiveReplyPrayerId(null)}
                            className="text-xs text-slate-500 font-bold"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleCounselorReply(p.id)}
                            className="px-4 py-1.5 bg-brand-gold text-brand-blue-950 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-brand-gold-dark cursor-pointer"
                          >
                            Send Direct Reply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Counsel Protocols sidebar */}
            <div className="space-y-6">
              <div className="bg-brand-blue-950 text-white p-6 rounded-2xl border border-brand-gold/20 relative overflow-hidden">
                <h3 className="font-serif text-lg font-bold text-brand-gold mb-2 flex items-center">
                  <UserCheck className="w-5 h-5 mr-2" /> Counselor Directives
                </h3>
                <ul className="space-y-3 text-xs text-slate-300 leading-relaxed list-disc pl-4">
                  <li>Review student prayer shielding history before drafting counsel.</li>
                  <li>Direct scriptural legal foundations inside every reply.</li>
                  <li>Incorporate references to midnight watches or covenants.</li>
                </ul>
              </div>
            </div>

          </div>
        ) : (
          /* 3. ADMIN VIEW COMPONENT */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* 1. Add Course Module */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-serif font-bold text-brand-blue-950 text-lg mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-brand-gold" /> Author & Create New Course
              </h3>

              <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">Course Title</label>
                  <input
                    type="text"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    placeholder="e.g. Masterclass on Prophetic Dream Translation"
                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:border-brand-gold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">Course Subtitle</label>
                  <input
                    type="text"
                    value={courseSubtitle}
                    onChange={(e) => setCourseSubtitle(e.target.value)}
                    placeholder="e.g. Learn the protocol for interpreting dreams and angelic timelines"
                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:border-brand-gold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">Category</label>
                    <select
                      value={courseCategory}
                      onChange={(e) => setCourseCategory(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50"
                    >
                      <option value="Spiritual Warfare">Spiritual Warfare</option>
                      <option value="Fasting & Discipleship">Fasting & Discipleship</option>
                      <option value="Discernment">Discernment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">Price</label>
                    <input
                      type="text"
                      value={coursePrice}
                      onChange={(e) => setCoursePrice(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    checked={courseIsFree}
                    onChange={(e) => setCourseIsFree(e.target.checked)}
                    id="admin-course-is-free"
                    className="rounded text-brand-gold focus:ring-brand-gold"
                  />
                  <label htmlFor="admin-course-is-free" className="font-semibold text-slate-700">This is a completely Free course</label>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">Course Long Description</label>
                  <textarea
                    value={courseDesc}
                    onChange={(e) => setCourseDesc(e.target.value)}
                    placeholder="Elaborate on the module structure, duration, expectations..."
                    className="w-full h-24 p-2.5 border border-slate-200 rounded-lg outline-none focus:border-brand-gold"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-blue-950 text-white font-bold uppercase tracking-wider rounded-xl hover:bg-brand-blue-900 cursor-pointer"
                >
                  Publish Anointed Course
                </button>
              </form>
            </div>

            {/* 2. Add Blog Teachings Module */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-serif font-bold text-brand-blue-950 text-lg mb-4 flex items-center">
                <Flame className="w-5 h-5 mr-2 text-brand-gold" /> Author & Create Living Teachings
              </h3>

              <form onSubmit={handleCreateBlogPost} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">Teaching Title</label>
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="e.g. Breaking Generational Legacies of Lack"
                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:border-brand-gold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">Teaching Category</label>
                  <select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50"
                  >
                    <option value="faith">Faith</option>
                    <option value="prayer">Prayer</option>
                    <option value="family">Family</option>
                    <option value="leadership">Leadership</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">Short Excerpt (SEO snippet)</label>
                  <input
                    type="text"
                    value={postExcerpt}
                    onChange={(e) => setPostExcerpt(e.target.value)}
                    placeholder="e.g. Identify the patterns of poverty inside your bloodline and apply biblical legal frameworks..."
                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">Post Content (Supports ### headings and lists)</label>
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Type deep anointed details. Support your claim with Ephesians, Psalms..."
                    className="w-full h-32 p-2.5 border border-slate-200 rounded-lg outline-none focus:border-brand-gold"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-blue-950 text-white font-bold uppercase tracking-wider rounded-xl hover:bg-brand-blue-900 cursor-pointer"
                >
                  Publish Living Blog Teaching
                </button>
              </form>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
