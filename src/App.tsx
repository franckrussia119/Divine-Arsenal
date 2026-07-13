import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import VisitorHome from './components/VisitorHome';
import Dashboard from './components/Dashboard';
import MyCourses from './components/MyCourses';
import CourseLessonView from './components/CourseLessonView';
import BlogView from './components/BlogView';
import PrayerAndCounsel from './components/PrayerAndCounsel';
import ProfileView from './components/ProfileView';
import CounselorAdminDashboard from './components/CounselorAdminDashboard';
import DigitalCityHub from './components/DigitalCityHub';
import GroupsView from './components/GroupsView';
import GroupDetailView from './components/GroupDetailView';
import MusicView from './components/MusicView';
import PodcastView from './components/PodcastView';
import AuthScreen from './components/Auth/AuthScreen';

import { UserRole, Course, BlogPost, PrayerPoint, JournalEntry, Message, CommunityPost, LiveSession } from './types';
import { useAuth } from './context/AuthContext';
import { useTranslation } from './translations';
import { api } from './lib/api';

// Tabs that require a signed-in account.
const PROTECTED_TABS = new Set([
  'dashboard', 'my-courses', 'war-room', 'profile', 'community-city', 'groups',
  'counselor-dashboard', 'admin-dashboard', 'music', 'podcast',
]);

export default function App() {
  const { user, loading: authLoading, logout, updateUser } = useAuth();
  const { setLang } = useTranslation();

  const [currentTab, setCurrentTab] = useState<string>('visitor-home');
  const [showAuth, setShowAuth] = useState(false);
  const [pendingEnrollCourseId, setPendingEnrollCourseId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Catalog data (public — visible to everyone)
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [catalogLoaded, setCatalogLoaded] = useState(false);

  // Signed-in-only data
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [prayers, setPrayers] = useState<PrayerPoint[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);

  const currentRole: UserRole = user ? user.role : 'Visitor';

  // --- Load the public catalog once, for everyone ---
  useEffect(() => {
    Promise.all([api.get<{ courses: Course[] }>('/courses'), api.get<{ posts: BlogPost[] }>('/blog')])
      .then(([coursesRes, blogRes]) => {
        setAllCourses(coursesRes.courses);
        setBlogPosts(blogRes.posts);
      })
      .catch((err) => console.error('Failed to load catalog:', err))
      .finally(() => setCatalogLoaded(true));
  }, []);

  // --- Deep-linking: shared "Share" buttons produce URLs like
  // /?view=blog&postId=X or /?view=course&courseId=X — open that content directly. ---
  useEffect(() => {
    if (!catalogLoaded) return;
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (!view) return;

    if (view === 'blog') {
      const postId = params.get('postId');
      const post = blogPosts.find((p) => p.id === postId);
      if (post) {
        setSelectedBlogPost(post);
        setCurrentTab('blog');
      }
    } else if (view === 'course') {
      const courseId = params.get('courseId');
      const course = allCourses.find((c) => c.id === courseId);
      if (course) {
        if (!user) {
          setPendingEnrollCourseId(course.id);
          setShowAuth(true);
        } else {
          setActiveCourse(course);
        }
      }
    } else if (view === 'community') {
      setCurrentTab('community-city');
    }

    // Clean the URL so refreshing/navigating doesn't keep re-triggering this.
    window.history.replaceState({}, '', window.location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogLoaded]);

  // --- Load the signed-in user's private data whenever they log in/out ---
  useEffect(() => {
    if (!user) {
      setEnrolledCourses([]);
      setActiveCourse(null);
      setPrayers([]);
      setJournals([]);
      setMessages([]);
      setCommunityPosts([]);
      setLiveSessions([]);
      return;
    }

    api.get<{ courses: Course[] }>('/courses/enrolled').then((res) => setEnrolledCourses(res.courses)).catch(console.error);
    api.get<{ prayers: PrayerPoint[] }>('/prayers').then((res) => setPrayers(res.prayers)).catch(console.error);
    api.get<{ entries: JournalEntry[] }>('/journal').then((res) => setJournals(res.entries)).catch(console.error);
    api.get<{ messages: Message[] }>('/messages').then((res) => setMessages(res.messages)).catch(console.error);
    api.get<{ posts: CommunityPost[] }>('/community/posts').then((res) => setCommunityPosts(res.posts)).catch(console.error);
    api.get<{ sessions: LiveSession[] }>('/community/live-sessions').then((res) => setLiveSessions(res.sessions)).catch(console.error);
  }, [user]);

  // If someone was mid-enrolling as a visitor, finish that once they log in.
  useEffect(() => {
    if (user && pendingEnrollCourseId) {
      const id = pendingEnrollCourseId;
      setPendingEnrollCourseId(null);
      handleEnrollCourse(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Visitors get ~4 minutes of free browsing (blog, courses, etc.) before
  // being prompted to create an account — same pattern as Instagram/Facebook.
  useEffect(() => {
    if (user) return; // signed-in users are never gated
    const timer = setTimeout(() => {
      setShowAuth(true);
    }, 4 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [user]);

  // Adapt the app's language to whatever the user chose at signup, every time they log in.
  useEffect(() => {
    if (user?.language === 'fr' || user?.language === 'en') {
      setLang(user.language);
    }
  }, [user?.id]);

  const derivedProfile = useMemo(() => {
    if (!user) return null;
    const lessonsCount = enrolledCourses.reduce(
      (acc, c) => acc + c.modules.reduce((a, m) => a + m.lessons.filter((l) => l.completed).length, 0),
      0
    );
    return {
      ...user,
      coursesCount: enrolledCourses.length,
      lessonsCount,
      certificatesCount: enrolledCourses.filter((c) => c.progress === 100).length,
      prayersCount: prayers.filter((p: any) => p.userId === user.id).length,
    };
  }, [user, enrolledCourses, prayers]);

  const handleSelectCourseAsVisitor = (course: Course) => {
    setPendingEnrollCourseId(course.id);
    setShowAuth(true);
  };

  // --- Course handlers ---
  const handleEnrollCourse = async (courseId: string) => {
    if (!user) {
      setPendingEnrollCourseId(courseId);
      setShowAuth(true);
      return;
    }
    if (enrolledCourses.some((c) => c.id === courseId)) {
      setCurrentTab('my-courses');
      return;
    }
    try {
      const res = await api.post<{ course: Course }>(`/courses/${courseId}/enroll`);
      setEnrolledCourses((prev) => [...prev, res.course]);
      setActiveCourse(res.course);
      setCurrentTab('my-courses');
    } catch (err) {
      console.error('Enroll failed:', err);
    }
  };

  const handleToggleLessonCompleted = async (courseId: string, lessonId: string) => {
    try {
      const res = await api.post<{ course: Course }>(`/courses/${courseId}/lessons/${lessonId}/toggle`);
      setEnrolledCourses((prev) => prev.map((c) => (c.id === courseId ? res.course : c)));
      setActiveCourse((prev) => (prev && prev.id === courseId ? res.course : prev));
    } catch (err) {
      console.error('Toggle lesson failed:', err);
    }
  };

  // --- Prayer handlers ---
  const handleAddPrayer = async (title: string, description: string) => {
    try {
      const res = await api.post<{ prayer: PrayerPoint }>('/prayers', { title, description });
      setPrayers((prev) => [res.prayer, ...prev]);
    } catch (err) {
      console.error('Add prayer failed:', err);
    }
  };

  const handleTogglePrayer = async (id: string) => {
    try {
      const res = await api.post<{ prayer: PrayerPoint }>(`/prayers/${id}/toggle`);
      setPrayers((prev) => prev.map((p) => (p.id === id ? res.prayer : p)));
    } catch (err) {
      console.error('Toggle prayer failed:', err);
    }
  };

  const handleDeclareAnswered = async (id: string, testimonyNote: string) => {
    try {
      const res = await api.post<{ prayer: PrayerPoint }>(`/prayers/${id}/answered`, { testimonyNote });
      setPrayers((prev) => prev.map((p) => (p.id === id ? res.prayer : p)));
    } catch (err) {
      console.error('Declare answered failed:', err);
    }
  };

  const handleIncrementPraying = async (id: string) => {
    try {
      const res = await api.post<{ prayer: PrayerPoint }>(`/prayers/${id}/pray`);
      setPrayers((prev) => prev.map((p) => (p.id === id ? res.prayer : p)));
    } catch (err) {
      console.error('Pray failed:', err);
    }
  };

  // --- Journal handler ---
  const handleAddJournal = async (text: string, category: string, linkedLessonId?: string) => {
    try {
      const res = await api.post<{ entry: JournalEntry }>('/journal', { text, category, linkedLessonId });
      setJournals((prev) => [res.entry, ...prev]);
    } catch (err) {
      console.error('Add journal failed:', err);
    }
  };

  // --- Messaging handler ---
  const handleSendMessage = async (text: string) => {
    try {
      const res = await api.post<{ message: Message }>('/messages', { text });
      setMessages((prev) => [...prev, res.message]);
    } catch (err) {
      console.error('Send message failed:', err);
    }
  };

  // --- Admin / Counselor handlers ---
  const handleAddCourse = async (newCourse: Course) => {
    try {
      const res = await api.post<{ course: Course }>('/courses', newCourse);
      setAllCourses((prev) => [res.course, ...prev]);
    } catch (err) {
      console.error('Create course failed:', err);
    }
  };

  const handleAddBlogPost = async (newPost: BlogPost) => {
    try {
      const res = await api.post<{ post: BlogPost }>('/blog', {
        title: newPost.title,
        category: newPost.category,
        excerpt: newPost.excerpt,
        content: newPost.content,
        authorName: newPost.author,
        authorRole: newPost.authorRole,
        readTime: newPost.readTime,
        imageUrl: newPost.imageUrl,
        featured: newPost.featured,
      });
      setBlogPosts((prev) => [res.post, ...prev]);
    } catch (err) {
      console.error('Create blog post failed:', err);
    }
  };

  const handleCounselorReplyToPrayer = async (prayerId: string, replyText: string) => {
    try {
      await api.post(`/prayers/${prayerId}/reply`, { text: replyText });
    } catch (err) {
      console.error('Reply to prayer failed:', err);
    }
  };

  // --- Community handlers ---
  const handleCreateCommunityPost = async (
    content: string,
    category: CommunityPost['category'],
    imageUrl?: string,
    videoUrl?: string,
    audioUrl?: string
  ) => {
    try {
      const res = await api.post<{ post: CommunityPost }>('/community/posts', { content, category, imageUrl, videoUrl, audioUrl });
      setCommunityPosts((prev) => [res.post, ...prev]);
    } catch (err) {
      console.error('Create post failed:', err);
    }
  };

  const handleLikeCommunityPost = async (id: string) => {
    try {
      const res = await api.post<{ post: CommunityPost }>(`/community/posts/${id}/like`);
      setCommunityPosts((prev) => prev.map((p) => (p.id === id ? res.post : p)));
    } catch (err) {
      console.error('Like post failed:', err);
    }
  };

  const handleAgreeCommunityPost = async (id: string) => {
    try {
      const res = await api.post<{ post: CommunityPost }>(`/community/posts/${id}/agree`);
      setCommunityPosts((prev) => prev.map((p) => (p.id === id ? res.post : p)));
    } catch (err) {
      console.error('Agree post failed:', err);
    }
  };

  const handleAddCommunityComment = async (postId: string, text: string) => {
    try {
      const res = await api.post<{ post: CommunityPost }>(`/community/posts/${postId}/comments`, { content: text });
      setCommunityPosts((prev) => prev.map((p) => (p.id === postId ? res.post : p)));
    } catch (err) {
      console.error('Add comment failed:', err);
    }
  };

  const handleDeleteCommunityPost = async (id: string) => {
    try {
      await api.delete(`/community/posts/${id}`);
      setCommunityPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Delete post failed:', err);
    }
  };

  const handleUpdateProfile = (updatedFields: Partial<NonNullable<typeof derivedProfile>>) => {
    // Optimistic local update, persisted to the DB in the background.
    updateUser(updatedFields);
    api.patch('/profile', updatedFields).catch((err) => console.error('Update profile failed:', err));
  };

  // Show a lightweight loading state while we resolve the session / catalog.
  if (authLoading || !catalogLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-400 text-sm">
        Loading Divine Arsenal…
      </div>
    );
  }

  // Gate protected tabs behind sign-in.
  const needsAuthGate = !user && PROTECTED_TABS.has(currentTab);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans antialiased text-slate-800 selection:bg-brand-gold/30 selection:text-brand-blue-950">

      <Header
        currentRole={currentRole}
        currentTab={currentTab}
        onChangeTab={(tab) => {
          setCurrentTab(tab);
          setSelectedGroupId(null);
        }}
        profile={derivedProfile}
        onSignIn={() => setShowAuth(true)}
        onLogout={() => {
          logout();
          setCurrentTab('visitor-home');
        }}
      />

      <main className="flex-grow">

        {showAuth || needsAuthGate ? (
          <AuthScreen
            onDone={() => setShowAuth(false)}
            onBack={() => {
              setShowAuth(false);
              setPendingEnrollCourseId(null);
              if (needsAuthGate) setCurrentTab('visitor-home');
            }}
          />
        ) : activeCourse ? (
          <CourseLessonView
            course={activeCourse}
            onBack={() => setActiveCourse(null)}
            onToggleLessonCompleted={handleToggleLessonCompleted}
            onAddJournalEntry={handleAddJournal}
          />
        ) : (
          <>
            {currentTab === 'visitor-home' && (
              <VisitorHome
                courses={allCourses}
                blogPosts={blogPosts}
                onSignIn={() => setShowAuth(true)}
                onSelectCourse={(course) => {
                  if (!user) {
                    handleSelectCourseAsVisitor(course);
                  } else {
                    handleEnrollCourse(course.id);
                  }
                }}
                onSelectBlogPost={(post) => {
                  setSelectedBlogPost(post);
                  setCurrentTab('blog');
                }}
              />
            )}

            {currentTab === 'dashboard' && user && (
              <Dashboard
                profile={derivedProfile!}
                currentCourse={enrolledCourses[0]}
                activePrayers={prayers}
                onTogglePrayer={handleTogglePrayer}
                onResumeLesson={(courseId) => {
                  const course = enrolledCourses.find((ec) => ec.id === courseId);
                  if (course) setActiveCourse(course);
                }}
                onNavigate={setCurrentTab}
              />
            )}

            {currentTab === 'my-courses' && user && (
              <MyCourses
                allCourses={allCourses}
                enrolledCourses={enrolledCourses}
                onEnroll={handleEnrollCourse}
                onSelectCourse={setActiveCourse}
                onNavigateToLesson={(courseId) => {
                  const course = enrolledCourses.find((ec) => ec.id === courseId);
                  if (course) setActiveCourse(course);
                }}
              />
            )}

            {currentTab === 'blog' && (
              <BlogView
                posts={blogPosts}
                onSelectPost={setSelectedBlogPost}
                selectedPost={selectedBlogPost}
                onClosePost={() => setSelectedBlogPost(null)}
                onSignIn={() => setShowAuth(true)}
              />
            )}

            {currentTab === 'war-room' && user && (
              <PrayerAndCounsel
                prayers={prayers}
                onAddPrayer={handleAddPrayer}
                onTogglePrayer={handleTogglePrayer}
                onDeclareAnswered={handleDeclareAnswered}
                onIncrementPraying={handleIncrementPraying}
                journals={journals}
                onAddJournal={handleAddJournal}
                messages={messages}
                onSendMessage={handleSendMessage}
              />
            )}

            {currentTab === 'profile' && user && derivedProfile && (
              <ProfileView
                profile={derivedProfile}
                enrolledCourses={enrolledCourses}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {currentTab === 'community-city' && user && derivedProfile && (
              <DigitalCityHub
                profile={derivedProfile}
                posts={communityPosts}
                liveSessions={liveSessions}
                onCreatePost={handleCreateCommunityPost}
                onLikePost={handleLikeCommunityPost}
                onAgreePost={handleAgreeCommunityPost}
                onAddComment={handleAddCommunityComment}
                onDeletePost={handleDeleteCommunityPost}
                onOpenGroups={() => { setSelectedGroupId(null); setCurrentTab('groups'); }}
              />
            )}

            {currentTab === 'groups' && user && (
              selectedGroupId ? (
                <GroupDetailView
                  groupId={selectedGroupId}
                  currentUserId={user?.id ?? ''}
                  isAdminRole={currentRole === 'Admin'}
                  onBack={() => setSelectedGroupId(null)}
                />
              ) : (
                <GroupsView onSelectGroup={setSelectedGroupId} />
              )
            )}

            {currentTab === 'music' && derivedProfile && <MusicView profile={derivedProfile} />}

            {currentTab === 'podcast' && derivedProfile && <PodcastView profile={derivedProfile} />}

            {((currentTab === 'counselor-dashboard' && currentRole === 'Counselor') ||
              (currentTab === 'admin-dashboard' && currentRole === 'Admin')) && (
              <CounselorAdminDashboard
                currentRole={currentRole as 'Counselor' | 'Admin'}
                courses={allCourses}
                onAddCourse={handleAddCourse}
                blogPosts={blogPosts}
                onAddBlogPost={handleAddBlogPost}
                prayers={prayers}
                onCounselorReplyToPrayer={handleCounselorReplyToPrayer}
              />
            )}
          </>
        )}

      </main>

    </div>
  );
}
