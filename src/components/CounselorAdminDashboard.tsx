import React, { useState, useEffect } from 'react';
import { Course, BlogPost, PrayerPoint, UserProfile } from '../types';
import { PlusCircle, Save, BookOpen, Shield, ShieldAlert, Sparkles, UserCheck, MessageSquare, Flame, Upload, Users, GraduationCap, BarChart3, Video, X, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { uploadFile } from '../lib/uploadWithProgress';

interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalCounselors: number;
  totalAdmins: number;
  totalEnrollments: number;
  totalCourses: number;
  totalPrayers: number;
  totalPosts: number;
  courses: { id: string; title: string; enrolledCount: number; totalLessons: number; avgProgress: number }[];
}

interface AdminStudent {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  homeChurch: string;
  joinedAt: string;
  courses: { courseId: string; title: string; progress: number }[];
}

interface CounselorAdminDashboardProps {
  currentRole: 'Counselor' | 'Admin';
  profile: UserProfile;
  courses: Course[];
  onAddCourse: (newCourse: Course) => void;
  blogPosts: BlogPost[];
  onAddBlogPost: (newPost: BlogPost) => void;
  onDeleteBlogPost: (id: string) => void;
  prayers: PrayerPoint[];
  onCounselorReplyToPrayer: (id: string, replyText: string) => void;
}

export default function CounselorAdminDashboard({
  currentRole,
  profile,
  courses,
  onAddCourse,
  blogPosts,
  onAddBlogPost,
  onDeleteBlogPost,
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
  const [courseIsFree, setCourseIsFree] = useState(true);
  const [coursePrice, setCoursePrice] = useState('$19');
  const [courseImg, setCourseImg] = useState('https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=800');

  interface LessonDraft {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    uploading: boolean;
    progress: number;
  }
  interface ModuleDraft {
    id: string;
    title: string;
    lessons: LessonDraft[];
  }
  const makeEmptyLesson = (): LessonDraft => ({
    id: `les-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: '',
    description: '',
    videoUrl: '',
    uploading: false,
    progress: 0,
  });
  const makeEmptyModule = (n: number): ModuleDraft => ({
    id: `mod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: `Module ${n}`,
    lessons: [makeEmptyLesson()],
  });
  const [courseModules, setCourseModules] = useState<ModuleDraft[]>([makeEmptyModule(1)]);

  const addModule = () => {
    setCourseModules((prev) => [...prev, makeEmptyModule(prev.length + 1)]);
  };
  const removeModule = (modId: string) => {
    setCourseModules((prev) => prev.filter((m) => m.id !== modId));
  };
  const updateModuleTitle = (modId: string, title: string) => {
    setCourseModules((prev) => prev.map((m) => (m.id === modId ? { ...m, title } : m)));
  };
  const addLesson = (modId: string) => {
    setCourseModules((prev) => prev.map((m) => (m.id === modId ? { ...m, lessons: [...m.lessons, makeEmptyLesson()] } : m)));
  };
  const removeLesson = (modId: string, lesId: string) => {
    setCourseModules((prev) => prev.map((m) => (m.id === modId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lesId) } : m)));
  };
  const updateLessonField = (modId: string, lesId: string, field: 'title' | 'description', value: string) => {
    setCourseModules((prev) =>
      prev.map((m) => (m.id === modId ? { ...m, lessons: m.lessons.map((l) => (l.id === lesId ? { ...l, [field]: value } : l)) } : m))
    );
  };
  const setLessonUploadState = (modId: string, lesId: string, patch: Partial<LessonDraft>) => {
    setCourseModules((prev) =>
      prev.map((m) => (m.id === modId ? { ...m, lessons: m.lessons.map((l) => (l.id === lesId ? { ...l, ...patch } : l)) } : m))
    );
  };
  const handleLessonVideoUpload = async (modId: string, lesId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLessonUploadState(modId, lesId, { uploading: true, progress: 0 });
    try {
      const data = await uploadFile<{ url: string }>('/api/uploads/video', 'video', file, {
        onProgress: (p) => setLessonUploadState(modId, lesId, { progress: p }),
      });
      setLessonUploadState(modId, lesId, { videoUrl: data.url, uploading: false, progress: 0 });
    } catch (err) {
      console.error('Lesson video upload failed:', err);
      alert('Could not upload that video. Please try a smaller file.');
      setLessonUploadState(modId, lesId, { uploading: false, progress: 0 });
    } finally {
      e.target.value = '';
    }
  };

  // Admin-only: staff account creation
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffRole, setStaffRole] = useState<'Counselor' | 'Admin'>('Counselor');
  const [staffCreating, setStaffCreating] = useState(false);

  // Admin-only: platform stats
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [staff, setStaff] = useState<{ id: string; name: string; email: string; role: 'Counselor' | 'Admin' }[]>([]);
  const [demotingId, setDemotingId] = useState<string | null>(null);

  const handlePromoteStudent = async (studentId: string, studentName: string) => {
    if (!window.confirm(`Promote ${studentName} to Counselor? They'll gain counselor access across the platform.`)) return;
    setPromotingId(studentId);
    try {
      await api.post(`/admin/students/${studentId}/promote`);
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      triggerNotification(`${studentName} has been promoted to Counselor!`);
    } catch (err: any) {
      alert(err?.message || 'Could not promote that student.');
    } finally {
      setPromotingId(null);
    }
  };

  const handleDemoteCounselor = async (staffId: string, staffName: string) => {
    if (!window.confirm(`Move ${staffName} back down to Student level? They'll lose counselor access.`)) return;
    setDemotingId(staffId);
    try {
      await api.post(`/admin/staff/${staffId}/demote`);
      setStaff((prev) => prev.filter((s) => s.id !== staffId));
      triggerNotification(`${staffName} has been moved back to Student.`);
    } catch (err: any) {
      alert(err?.message || 'Could not demote that account.');
    } finally {
      setDemotingId(null);
    }
  };

  const handleDeleteBlogPostClick = (id: string, title: string) => {
    if (!window.confirm(`Delete the teaching "${title}"? This cannot be undone.`)) return;
    onDeleteBlogPost(id);
  };

  useEffect(() => {
    if (currentRole !== 'Admin') return;
    api.get<AdminStats>('/admin/stats').then(setStats).catch(console.error);
    api.get<{ students: AdminStudent[] }>('/admin/students').then((res) => setStudents(res.students)).catch(console.error);
    api.get<{ staff: { id: string; name: string; email: string; role: 'Counselor' | 'Admin' }[] }>('/auth/staff').then((res) => setStaff(res.staff)).catch(console.error);
  }, [currentRole]);

  // Admin-only: create a real live session
  const [liveTitle, setLiveTitle] = useState('');
  const [liveCategory, setLiveCategory] = useState('Teaching Masterclass');
  const [liveStatus, setLiveStatus] = useState<'live' | 'upcoming'>('upcoming');
  const [liveScheduledTime, setLiveScheduledTime] = useState('');
  const [liveCreating, setLiveCreating] = useState(false);

  const handleCreateLiveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveTitle) return;
    setLiveCreating(true);
    try {
      await api.post('/community/live-sessions', {
        title: liveTitle,
        category: liveCategory,
        status: liveStatus,
        scheduledTime: liveStatus === 'upcoming' ? liveScheduledTime : undefined,
      });
      triggerNotification(`Live session "${liveTitle}" created!`);
      setLiveTitle('');
      setLiveScheduledTime('');
    } catch (err: any) {
      alert(err?.message || 'Could not create that live session.');
    } finally {
      setLiveCreating(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffEmail || !staffPassword) return;
    setStaffCreating(true);
    try {
      await api.post('/auth/create-staff', { name: staffName, email: staffEmail, password: staffPassword, role: staffRole });
      triggerNotification(`${staffRole} account created for ${staffName}!`);
      setStaffName('');
      setStaffEmail('');
      setStaffPassword('');
    } catch (err: any) {
      alert(err?.message || 'Could not create that account.');
    } finally {
      setStaffCreating(false);
    }
  };

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
    if (courseModules.some((m) => m.lessons.some((l) => l.uploading))) {
      alert('Please wait for all lesson videos to finish uploading first.');
      return;
    }

    const newC: Course = {
      id: `course-${Date.now()}`,
      title: courseTitle,
      subtitle: courseSubtitle || 'A premium training pathway for spiritual masters',
      category: courseCategory,
      numLessons: courseModules.reduce((acc, m) => acc + m.lessons.length, 0),
      duration: '2 hours',
      description: courseDesc,
      isFree: courseIsFree,
      price: courseIsFree ? 'Free' : coursePrice,
      imageUrl: courseImg,
      progress: 0,
      modules: courseModules.map((m, mi) => ({
        id: m.id,
        title: m.title || `Module ${mi + 1}`,
        lessons: m.lessons.map((l, li) => ({
          id: l.id,
          title: l.title || `Lesson ${li + 1}`,
          duration: '15 mins',
          videoDuration: '15:00',
          completed: false,
          videoUrl: l.videoUrl || undefined,
          content: l.description || undefined,
        })),
      })),
    };

    onAddCourse(newC);
    triggerNotification(`Successfully published Course: "${courseTitle}" with ${courseModules.length} module(s)!`);
    
    // Reset
    setCourseTitle('');
    setCourseSubtitle('');
    setCourseDesc('');
    setCourseModules([makeEmptyModule(1)]);
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
      author: profile.name,
      authorRole: profile.role === 'Admin' ? 'Admin' : 'Counselor',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
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
      <div className="bg-brand-blue-950 text-white py-8 sm:py-12 border-b border-brand-gold/20 relative overflow-hidden">
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

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold">Modules & Lessons</label>
                    <button
                      type="button"
                      onClick={addModule}
                      className="flex items-center space-x-1 text-[10px] font-bold text-brand-gold-dark hover:text-brand-gold"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add Module</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {courseModules.map((mod, mi) => (
                      <div key={mod.id} className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={mod.title}
                            onChange={(e) => updateModuleTitle(mod.id, e.target.value)}
                            placeholder={`Module ${mi + 1} title`}
                            className="flex-1 p-2 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:border-brand-gold"
                          />
                          {courseModules.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeModule(mod.id)}
                              className="p-2 text-slate-400 hover:text-red-500"
                              title="Remove module"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {mod.lessons.map((les, li) => (
                          <div key={les.id} className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Lesson {li + 1}</span>
                              {mod.lessons.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeLesson(mod.id, les.id)}
                                  className="text-slate-400 hover:text-red-500"
                                  title="Remove lesson"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            <input
                              type="text"
                              value={les.title}
                              onChange={(e) => updateLessonField(mod.id, les.id, 'title', e.target.value)}
                              placeholder="Lesson title"
                              className="w-full p-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-brand-gold"
                            />
                            <textarea
                              value={les.description}
                              onChange={(e) => updateLessonField(mod.id, les.id, 'description', e.target.value)}
                              placeholder="Lesson description"
                              className="w-full h-16 p-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-brand-gold"
                            />
                            <label
                              htmlFor={`lesson-video-${les.id}`}
                              className="flex items-center justify-center space-x-2 w-full p-2.5 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-brand-gold text-slate-500 hover:text-brand-gold transition-colors text-[11px]"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>
                                {les.uploading
                                  ? `Uploading… ${les.progress}%`
                                  : les.videoUrl
                                  ? 'Video uploaded ✓ — click to replace'
                                  : 'Upload video for this lesson'}
                              </span>
                            </label>
                            <input
                              id={`lesson-video-${les.id}`}
                              type="file"
                              accept="video/*"
                              className="hidden"
                              disabled={les.uploading}
                              onChange={(e) => handleLessonVideoUpload(mod.id, les.id, e)}
                            />
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => addLesson(mod.id)}
                          className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-[10px] font-bold text-slate-500 hover:text-brand-gold hover:border-brand-gold transition-colors"
                        >
                          + Add Lesson to this Module
                        </button>
                      </div>
                    ))}
                  </div>
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

              {/* Manage existing teachings */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <h4 className="text-[10px] font-mono text-slate-500 uppercase font-bold mb-3">
                  Manage Teachings ({blogPosts.length})
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {blogPosts.length === 0 ? (
                    <p className="text-xs text-slate-400">No teachings published yet.</p>
                  ) : (
                    blogPosts
                      .filter((p) => currentRole === 'Admin' || p.authorId === profile.id)
                      .map((p) => (
                        <div key={p.id} className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-700 truncate">{p.title}</p>
                            <p className="text-[10px] text-slate-400">{p.author} · {p.date}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteBlogPostClick(p.id, p.title)}
                            className="shrink-0 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete teaching"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 4. ADMIN-ONLY: PLATFORM STATS + STAFF ACCOUNT CREATION */}
        {currentRole === 'Admin' && (
          <div className="mt-8 space-y-8">

            {/* Platform Overview */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-serif font-bold text-brand-blue-950 text-lg mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-brand-gold" /> Platform Overview
              </h3>
              {!stats ? (
                <p className="text-xs text-slate-400">Loading stats…</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Total Users', value: stats.totalUsers },
                      { label: 'Students', value: stats.totalStudents },
                      { label: 'Counselors', value: stats.totalCounselors },
                      { label: 'Enrollments', value: stats.totalEnrollments },
                    ].map((s) => (
                      <div key={s.label} className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
                        <div className="text-2xl font-bold text-brand-blue-950 font-serif">{s.value}</div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono mt-1">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-2">Enrollment by course</span>
                  <div className="space-y-2">
                    {stats.courses.map((c) => (
                      <div key={c.id} className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="font-semibold text-slate-700">{c.title}</span>
                        <span className="text-slate-500 font-mono">{c.enrolledCount} enrolled · avg {c.avgProgress}% complete</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Create Staff Account */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-serif font-bold text-brand-blue-950 text-lg mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-brand-gold" /> Create Counselor / Admin Account
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Only Admins can create Counselor or Admin accounts — everyone else signs up as a Student.
                </p>
                <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
                  <input
                    type="text"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    placeholder="Full name"
                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:border-brand-gold"
                    required
                  />
                  <input
                    type="email"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:border-brand-gold"
                    required
                  />
                  <input
                    type="password"
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    placeholder="Temporary password (min 8 characters)"
                    minLength={8}
                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:border-brand-gold"
                    required
                  />
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value as 'Counselor' | 'Admin')}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50"
                  >
                    <option value="Counselor">Counselor</option>
                    <option value="Admin">Admin</option>
                  </select>
                  <button
                    type="submit"
                    disabled={staffCreating}
                    className="w-full py-3 bg-brand-blue-950 text-white font-bold uppercase tracking-wider rounded-xl hover:bg-brand-blue-900 cursor-pointer disabled:opacity-60"
                  >
                    {staffCreating ? 'Creating…' : 'Create Account'}
                  </button>
                </form>
              </div>

              {/* Staff Accounts */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-serif font-bold text-brand-blue-950 text-lg mb-4 flex items-center">
                  <ShieldAlert className="w-5 h-5 mr-2 text-brand-gold" /> Staff Accounts ({staff.length})
                </h3>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {staff.length === 0 ? (
                    <p className="text-xs text-slate-400">No Counselor/Admin accounts yet.</p>
                  ) : (
                    staff.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-slate-700 truncate">{s.name}</span>
                            <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                              s.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {s.role}
                            </span>
                          </div>
                          <span className="text-slate-400 font-mono text-[10px]">{s.email}</span>
                        </div>
                        {s.role === 'Counselor' && (
                          <button
                            onClick={() => handleDemoteCounselor(s.id, s.name)}
                            disabled={demotingId === s.id}
                            className="shrink-0 px-2.5 py-1 rounded-md bg-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider hover:bg-red-100 hover:text-red-600 disabled:opacity-60"
                          >
                            {demotingId === s.id ? 'Working…' : 'Demote to Student'}
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Enrolled Students */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-serif font-bold text-brand-blue-950 text-lg mb-4 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-brand-gold" /> Enrolled Students ({students.length})
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {students.length === 0 ? (
                    <p className="text-xs text-slate-400">No students yet.</p>
                  ) : (
                    students.map((s) => (
                      <div key={s.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-semibold text-slate-700">{s.name}</span>
                          <span className="text-slate-400 font-mono text-[10px]">{s.email}</span>
                        </div>
                        {s.courses.length === 0 ? (
                          <p className="text-slate-400 mt-1">Not enrolled in any course yet.</p>
                        ) : (
                          <ul className="mt-1 space-y-0.5">
                            {s.courses.map((c) => (
                              <li key={c.courseId} className="text-slate-500">
                                {c.title} — <span className="font-mono">{c.progress}%</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        <button
                          onClick={() => handlePromoteStudent(s.id, s.name)}
                          disabled={promotingId === s.id}
                          className="mt-2 px-2.5 py-1 rounded-md bg-brand-blue-950 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-brand-blue-900 disabled:opacity-60"
                        >
                          {promotingId === s.id ? 'Promoting…' : 'Promote to Counselor'}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Create Live Session */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-serif font-bold text-brand-blue-950 text-lg mb-4 flex items-center">
                  <Video className="w-5 h-5 mr-2 text-brand-gold" /> Create Live Session
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  This replaces the old fake demo sessions — real ones you create here show up in the Live Lobby.
                </p>
                <form onSubmit={handleCreateLiveSession} className="space-y-4 text-xs">
                  <input
                    type="text"
                    value={liveTitle}
                    onChange={(e) => setLiveTitle(e.target.value)}
                    placeholder="Session title"
                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:border-brand-gold"
                    required
                  />
                  <select
                    value={liveCategory}
                    onChange={(e) => setLiveCategory(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50"
                  >
                    <option value="Teaching Masterclass">Teaching Masterclass</option>
                    <option value="Intercession">Intercession</option>
                    <option value="Midnight Altar">Midnight Altar</option>
                    <option value="Prophetic Word">Prophetic Word</option>
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={liveStatus}
                      onChange={(e) => setLiveStatus(e.target.value as 'live' | 'upcoming')}
                      className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="live">Live now</option>
                    </select>
                    {liveStatus === 'upcoming' && (
                      <input
                        type="text"
                        value={liveScheduledTime}
                        onChange={(e) => setLiveScheduledTime(e.target.value)}
                        placeholder="e.g. Tonight at 8PM"
                        className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:border-brand-gold"
                      />
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={liveCreating}
                    className="w-full py-3 bg-brand-blue-950 text-white font-bold uppercase tracking-wider rounded-xl hover:bg-brand-blue-900 cursor-pointer disabled:opacity-60"
                  >
                    {liveCreating ? 'Creating…' : 'Create Live Session'}
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
