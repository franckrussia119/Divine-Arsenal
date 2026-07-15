import React, { useState, useEffect, useRef } from 'react';
import { CommunityPost, LiveSession, CommunityComment, UserProfile } from '../types';
import { 
  Flame, Sparkles, MessageSquare, Heart, Video, Users, Share2, 
  Send, Plus, ChevronRight, Image as ImageIcon, Check, Mic, MicOff, 
  VideoOff, ShieldAlert, Radio, HelpCircle, Trophy, Globe, ArrowLeft,
  Tv, Eye, Play, Sparkle, AlertCircle, Trash2
} from 'lucide-react';
import { useTranslation } from '../translations';
import { api } from '../lib/api';
import { uploadFile } from '../lib/uploadWithProgress';
import ShareButton from './ShareButton';

interface DigitalCityHubProps {
  profile: UserProfile;
  posts: CommunityPost[];
  liveSessions: LiveSession[];
  onCreatePost: (content: string, category: CommunityPost['category'], imageUrl?: string, videoUrl?: string, audioUrl?: string) => void;
  onLikePost: (id: string) => void;
  onAgreePost: (id: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onDeletePost: (id: string) => void;
  onOpenGroups: () => void;
}

export default function DigitalCityHub({
  profile,
  posts,
  liveSessions,
  onCreatePost,
  onLikePost,
  onAgreePost,
  onAddComment,
  onDeletePost,
  onOpenGroups
}: DigitalCityHubProps) {
  const { lang, t } = useTranslation();

  const sessions = liveSessions;
  const [activeSession, setActiveSession] = useState<LiveSession | null>(null);
  
  // Tab within community: 'feed' | 'gather' | 'live-lobby'
  const [activeSubTab, setActiveSubTab] = useState<'feed' | 'gather' | 'live-lobby'>('gather'); // Let's make Gather the default now so the user sees it immediately!
  const [feedFilter, setFeedFilter] = useState<'all' | 'testimony' | 'prophetic' | 'prayer-alarm' | 'teaching'>('all');

  // Gather sub-tab states — now backed by the real community_post API (feedType: 'gather')
  const [gatherFilter, setGatherFilter] = useState<'All' | 'Sermon' | 'Testimony' | 'Devotional' | 'Prayer request' | 'Announcement'>('All');
  const [gatherPostCategory, setGatherPostCategory] = useState<'Sermon' | 'Testimony' | 'Devotional' | 'Prayer request' | 'Announcement'>('Devotional');
  const [gatherPostContent, setGatherPostContent] = useState('');
  const [gatherPostYoutube, setGatherPostYoutube] = useState(''); // holds an uploaded video URL now, not a pasted link
  const [gatherPostPhoto, setGatherPostPhoto] = useState(''); // holds an uploaded photo URL
  const [gatherPostAudio, setGatherPostAudio] = useState(''); // holds an uploaded audio URL
  const [showGatherPhotoInput, setShowGatherPhotoInput] = useState(false);
  const [gatherMediaUploading, setGatherMediaUploading] = useState<'image' | 'video' | 'audio' | null>(null);
  const [gatherMediaProgress, setGatherMediaProgress] = useState(0);

  type GatherPost = {
    id: string;
    authorId?: string;
    authorName: string;
    authorAvatar: string;
    authorRole: string;
    category: 'Sermon' | 'Testimony' | 'Devotional' | 'Prayer request' | 'Announcement';
    content: string;
    mediaUrl?: string;
    mediaType?: 'photo' | 'video' | 'audio';
    dateStr: string;
    likes: number;
    isLiked?: boolean;
    comments: any[];
  };

  const toGatherPost = (p: CommunityPost): GatherPost => ({
    id: p.id,
    authorId: p.authorId,
    authorName: p.authorName,
    authorAvatar: p.authorAvatar,
    authorRole: p.authorRole,
    category: (p.category as GatherPost['category']) || 'Devotional',
    content: p.content,
    mediaUrl: p.imageUrl || p.videoUrl || p.audioUrl || undefined,
    mediaType: p.imageUrl ? 'photo' : p.videoUrl ? 'video' : p.audioUrl ? 'audio' : undefined,
    dateStr: p.dateStr,
    likes: p.likes,
    isLiked: p.isLiked,
    comments: p.comments.map((c) => ({
      id: c.id,
      authorName: c.authorName,
      authorAvatar: c.authorAvatar,
      authorRole: c.authorRole,
      content: c.content,
      dateStr: c.dateStr,
    })),
  });

  const [gatherPosts, setGatherPosts] = useState<GatherPost[]>([]);
  const [gatherLoading, setGatherLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ posts: CommunityPost[] }>('/community/posts?feedType=gather')
      .then((res) => setGatherPosts(res.posts.map(toGatherPost)))
      .catch(console.error)
      .finally(() => setGatherLoading(false));
  }, []);

  const [gatherCommentsPostId, setGatherCommentsPostId] = useState<string | null>(null);
  const [newGatherCommentText, setNewGatherCommentText] = useState<{[key: string]: string}>({});

  const handleGatherMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, kind: 'photo' | 'video' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      alert('That file is larger than 50MB. Please choose a smaller one.');
      e.target.value = '';
      return;
    }
    setGatherMediaUploading(kind === 'photo' ? 'image' : kind);
    setGatherMediaProgress(0);
    try {
      const data = await uploadFile<{ url: string }>('/api/uploads/media', 'media', file, {
        onProgress: setGatherMediaProgress,
      });
      if (kind === 'photo') { setGatherPostPhoto(data.url); setGatherPostYoutube(''); setGatherPostAudio(''); }
      else if (kind === 'video') { setGatherPostYoutube(data.url); setGatherPostPhoto(''); setGatherPostAudio(''); }
      else { setGatherPostAudio(data.url); setGatherPostPhoto(''); setGatherPostYoutube(''); }
    } catch (err) {
      console.error('Gather media upload failed:', err);
      alert('Could not upload that file. Please try again.');
    } finally {
      setGatherMediaUploading(null);
      setGatherMediaProgress(0);
      e.target.value = '';
    }
  };

  const handleLikeGatherPost = async (id: string) => {
    try {
      const res = await api.post<{ post: CommunityPost }>(`/community/posts/${id}/like`);
      setGatherPosts((prev) => prev.map((p) => (p.id === id ? toGatherPost(res.post) : p)));
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const handleAddGatherComment = async (postId: string) => {
    const text = newGatherCommentText[postId] || '';
    if (!text.trim()) return;

    try {
      const res = await api.post<{ post: CommunityPost }>(`/community/posts/${postId}/comments`, { content: text });
      setGatherPosts((prev) => prev.map((p) => (p.id === postId ? toGatherPost(res.post) : p)));
      setNewGatherCommentText((prev) => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error('Comment failed:', err);
    }
  };

  const handleDeleteGatherPost = async (id: string) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await api.delete(`/community/posts/${id}`);
      setGatherPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Delete post failed:', err);
    }
  };

  const handlePublishGatherPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gatherPostContent.trim()) return;

    try {
      const res = await api.post<{ post: CommunityPost }>('/community/posts', {
        content: gatherPostContent,
        category: gatherPostCategory,
        imageUrl: gatherPostPhoto || undefined,
        videoUrl: gatherPostYoutube || undefined,
        audioUrl: gatherPostAudio || undefined,
        feedType: 'gather',
      });
      setGatherPosts((prev) => [toGatherPost(res.post), ...prev]);
      setGatherPostContent('');
      setGatherPostYoutube('');
      setGatherPostPhoto('');
      setGatherPostAudio('');
      setShowGatherPhotoInput(false);
    } catch (err) {
      console.error('Publish gather post failed:', err);
    }
  };

  // Create Post Form State
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState<'testimony' | 'prophetic' | 'prayer-alarm' | 'teaching'>('prophetic');
  const [postImage, setPostImage] = useState('');
  const [postVideo, setPostVideo] = useState('');
  const [postAudio, setPostAudio] = useState('');
  const [mediaUploading, setMediaUploading] = useState<'image' | 'video' | 'audio' | null>(null);
  const [mediaUploadProgress, setMediaUploadProgress] = useState(0);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, kind: 'photo' | 'video' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      alert('That file is larger than 50MB. Please choose a smaller one.');
      e.target.value = '';
      return;
    }
    setMediaUploading(kind === 'photo' ? 'image' : kind);
    setMediaUploadProgress(0);
    try {
      const data = await uploadFile<{ url: string }>('/api/uploads/media', 'media', file, {
        onProgress: setMediaUploadProgress,
      });
      if (kind === 'photo') setPostImage(data.url);
      else if (kind === 'video') setPostVideo(data.url);
      else setPostAudio(data.url);
    } catch (err) {
      console.error('Media upload failed:', err);
      alert('Could not upload that file. Please try again.');
    } finally {
      setMediaUploading(null);
      setMediaUploadProgress(0);
      e.target.value = '';
    }
  };
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Comments inline states
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState<{[key: string]: string}>({});

  // Virtual Zoom Sanctuary settings
  const [micActive, setMicActive] = useState(false);
  const [videoActive, setVideoActive] = useState(false);
  const [sanctuaryAgreementFlames, setSanctuaryAgreementFlames] = useState(0);
  const [sanctuaryChat, setSanctuaryChat] = useState<Array<{ name: string; text: string; role: string; time: string }>>([]);
  const [mySanctuaryMessage, setMySanctuaryMessage] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Scroll live chat to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sanctuaryChat]);

  // Post Submission — persisted via the API (see onCreatePost in App.tsx)
  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    onCreatePost(postContent, postCategory, postImage || undefined, postVideo || undefined, postAudio || undefined);
    setPostContent('');
    setPostImage('');
    setPostVideo('');
    setPostAudio('');
    setShowCreateForm(false);
  };

  // Like Toggle — persisted via the API
  const handleLikePost = (id: string) => {
    onLikePost(id);
  };

  // Prayer Agreement Toggle — persisted via the API
  const handleAgreePost = (id: string) => {
    onAgreePost(id);
  };

  // Add Comment — persisted via the API
  const handleAddComment = (postId: string) => {
    const text = newCommentText[postId] || '';
    if (!text.trim()) return;

    onAddComment(postId, text);
    setNewCommentText(prev => ({ ...prev, [postId]: '' }));
  };

  const handleDeletePost = (id: string) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    onDeletePost(id);
  };

  // Send message in virtual Zoom live session
  const handleSendLiveMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mySanctuaryMessage.trim()) return;

    setSanctuaryChat(prev => [
      ...prev,
      {
        name: `${profile.name} (You)`,
        text: mySanctuaryMessage,
        role: profile.role,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setMySanctuaryMessage('');
  };

  const filteredPosts = feedFilter === 'all' 
    ? posts 
    : posts.filter(p => p.category === feedFilter);

  // Note: real-time presence tracking isn't implemented yet, so this starts empty
  // rather than showing fabricated "who's online" data.
  const mockCitizensOnline: Array<{ name: string; avatar: string; role: string; loc: string }> = [];

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 pb-16" id="digital-city-city-view">
      
      {/* 1. TOP HEADER / TITLE HERO FOR DIGITAL CITY */}
      <div className="relative bg-gradient-to-b from-brand-blue-950 via-brand-blue-900 to-slate-900 border-b border-brand-gold/20 py-12 px-4 overflow-hidden">
        {/* Abstract lights mimicking futuristic spiritual city */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-gold/5 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/5 blur-3xl rounded-full"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs text-brand-gold font-mono uppercase tracking-widest mb-1.5">
              <Globe className="w-3.5 h-3.5 text-brand-gold animate-spin-slow" />
              <span>{lang === 'fr' ? "Réseau Numérique des Citoyens de l'Alliance" : "Covenant Citizen Digital Grid"}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center">
              {lang === 'fr' ? "Zion Cité Digitale" : "Zion Digital City"} <Sparkles className="w-6 h-6 text-brand-gold ml-2.5 animate-pulse" />
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
              {lang === 'fr' 
                ? "Bienvenue dans la forteresse spirituelle métropolitaine. Communiquez en toute sécurité, veillez sur les Portes géographiques, partagez des témoignages et accédez à des sanctuaires d'intercession en direct type Zoom en temps réel." 
                : "Welcome to the metropolitan spiritual fortress. Communicate securely, guard geographical Gates, share testimonies, and access live Zoom-like intercession sanctuaries in real-time."}
            </p>
          </div>

          <div className="mt-6 md:mt-0 flex space-x-3">
            <button
              onClick={() => { setActiveSubTab('gather'); setActiveSession(null); }}
              className={`px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center space-x-2 ${
                activeSubTab === 'gather' && !activeSession
                  ? 'bg-brand-gold text-brand-blue-950 shadow-lg shadow-brand-gold/15 scale-[1.03]'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Flame className="w-4 h-4 text-brand-gold" />
              <span>{lang === 'fr' ? "Rassembler (Gather)" : "Gather"}</span>
            </button>
            <button
              onClick={() => { setActiveSubTab('feed'); setActiveSession(null); }}
              className={`px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center space-x-2 ${
                activeSubTab === 'feed' && !activeSession
                  ? 'bg-brand-gold text-brand-blue-950 shadow-lg shadow-brand-gold/15 scale-[1.03]'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>{lang === 'fr' ? "Actualités de la Cité" : "City Square Feed"}</span>
            </button>
            <button
              onClick={() => { setActiveSubTab('live-lobby'); setActiveSession(null); }}
              className={`px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center space-x-2 ${
                activeSubTab === 'live-lobby' || activeSession
                  ? 'bg-brand-gold text-brand-blue-950 shadow-lg shadow-brand-gold/15 scale-[1.03]'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
              <span>{lang === 'fr' ? `Sanctuaires en Direct (${sessions.filter(s => s.status === 'live').length})` : `Live Sanctuaries (${sessions.filter(s => s.status === 'live').length})`}</span>
            </button>
            <button
              onClick={onOpenGroups}
              className="px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center space-x-2 bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              <Users className="w-4 h-4" />
              <span>{t('groups')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. CORE CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* IF A ZOOM-LIKE SANCTUARY SESSION IS ACTIVE */}
        {activeSession ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="virtual-zoom-player-active">
            
            {/* Left: Sanctuary Stream Player & Directives */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Back Link */}
              <button
                onClick={() => setActiveSession(null)}
                className="flex items-center space-x-2 text-xs text-brand-gold font-mono uppercase tracking-wider hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to City Square</span>
              </button>

              {/* Main Virtual Chamber Screen */}
              <div className="bg-slate-950 rounded-2xl border-2 border-brand-gold/30 shadow-2xl relative overflow-hidden">
                
                {/* Header inside stream */}
                <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <div>
                      <h2 className="text-sm font-bold font-serif text-white">{activeSession.title}</h2>
                      <p className="text-[10px] text-slate-400 font-mono">Hosted by {activeSession.hostName} • {activeSession.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-[10px] bg-slate-800 px-3 py-1.5 rounded-lg font-mono">
                    <Eye className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
                    <span>{activeSession.viewerCount + (micActive ? 1 : 0)} Citizens Assembled</span>
                  </div>
                </div>

                {/* Simulated Stream Video Canvas */}
                <div className="aspect-video bg-black flex flex-col items-center justify-center relative group">
                  
                  {/* Glowing background halo of intercessors */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,163,89,0.12)_0%,transparent_70%)] animate-pulse" />

                  {/* Zoom grid look inside the video player */}
                  <div className="absolute inset-0 grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 opacity-80 pointer-events-none">
                    {/* Speaker Cell */}
                    <div className="bg-slate-900/80 border border-brand-gold/30 rounded-xl flex flex-col items-center justify-center p-3 text-center relative col-span-2 sm:col-span-1">
                      <img src={activeSession.hostAvatar} alt={activeSession.hostName} className="w-12 h-12 rounded-full border border-brand-gold/40 mb-2" />
                      <span className="text-[10px] font-bold text-white">{activeSession.hostName}</span>
                      <span className="text-[8px] text-brand-gold font-mono uppercase bg-brand-gold/15 px-1.5 py-0.5 rounded-full mt-1 flex items-center">
                        <Flame className="w-2.5 h-2.5 text-brand-gold mr-1" /> Host Speaker
                      </span>
                    </div>

                    {/* Other participants would appear here once real video is wired up */}
                    <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-3 text-center">
                      <Users className="w-5 h-5 text-slate-600 mb-1" />
                      <span className="text-[8px] text-slate-500 font-mono">Waiting for others…</span>
                    </div>

                    {/* YOUR CELL (Shows if video active) */}
                    <div className="bg-slate-900/80 border border-emerald-500/40 rounded-xl flex flex-col items-center justify-center p-3 text-center relative">
                      {videoActive ? (
                        <div className="absolute inset-0 rounded-xl overflow-hidden bg-emerald-900/20">
                          {/* Animated particle scan to simulate actual webcam */}
                          <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center">
                            <span className="text-[9px] text-emerald-400 font-bold animate-pulse">WEBCAM ACTIVE</span>
                            <span className="text-[7px] text-slate-500 mt-1">Simulating Camera feed</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-1 border border-slate-700">
                            <VideoOff className="w-4 h-4 text-slate-500" />
                          </div>
                          <span className="text-[9px] font-medium text-slate-400">You</span>
                          <span className="text-[7px] text-slate-500 font-mono">Camera Off</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Centered Master Atmospheric visual player */}
                  <div className="text-center z-10 p-6 pointer-events-none">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-gold/15 border-2 border-brand-gold animate-bounce mb-3">
                      <Flame className="w-10 h-10 text-brand-gold animate-pulse" />
                    </div>
                    <p className="font-serif text-lg font-bold text-white tracking-wide">COVENANT SANCTUARY CONNECTED</p>
                    <p className="text-[10px] text-brand-gold uppercase font-mono tracking-widest mt-1">Interactive Divine Altar Broadcast Mode</p>
                  </div>

                  {/* Unleash Fire particle trigger button (over video) */}
                  <div className="absolute bottom-16 right-4 z-20">
                    <button
                      onClick={() => setSanctuaryAgreementFlames(f => f + 12)}
                      className="p-3 bg-gradient-to-tr from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white rounded-full shadow-lg shadow-orange-600/30 transform hover:scale-110 active:scale-95 transition-all duration-200"
                      title="Unleash Fire Agreement Sparks"
                    >
                      <Flame className="w-6 h-6 text-white animate-pulse" />
                    </button>
                    <span className="absolute -top-1 -right-1 bg-brand-blue-950 text-brand-gold text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full border border-brand-gold">
                      Agreement!
                    </span>
                  </div>

                  {/* Interactive Controls Overlay Bar */}
                  <div className="absolute bottom-0 inset-x-0 bg-slate-900/95 border-t border-slate-800 px-6 py-3 flex items-center justify-between z-10">
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setMicActive(!micActive)}
                        className={`p-2.5 rounded-xl text-xs font-bold transition-all ${
                          micActive 
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                        title={micActive ? 'Mute Microphone' : 'Unmute Microphone'}
                      >
                        {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-rose-500" />}
                      </button>

                      <button
                        onClick={() => setVideoActive(!videoActive)}
                        className={`p-2.5 rounded-xl text-xs font-bold transition-all ${
                          videoActive 
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                        title={videoActive ? 'Stop Camera' : 'Start Camera'}
                      >
                        {videoActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4 text-rose-500" />}
                      </button>
                    </div>

                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] font-mono text-slate-400">Corporate Agreement Sparkles:</span>
                      <span className="text-xs font-mono font-bold text-brand-gold flex items-center">
                        <Flame className="w-3.5 h-3.5 text-brand-gold mr-1 fill-brand-gold" />
                        {sanctuaryAgreementFlames.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveSession(null)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg cursor-pointer"
                    >
                      Leave Sanctuary
                    </button>
                  </div>

                </div>

              </div>

              {/* Spiritual Altar Covenant Instructions */}
              <div className="bg-brand-blue-950/40 p-6 rounded-2xl border border-brand-gold/20 flex items-start space-x-4">
                <div className="p-3 rounded-xl bg-brand-gold/15 text-brand-gold mt-1">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-brand-gold">The 50-Year Spiritual Zoom Mandate</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    You are in a synchronized prophetic gateway. Every declaration, flame trigger, and spoken word coordinates directly with the Watchmen team on active intercessory shifts worldwide. Turn on your audio, speak bold decrees, and hold the corporate fortress together.
                  </p>
                </div>
              </div>

            </div>

            {/* Right: Live Sanctuary Chat Room */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl flex flex-col h-[520px] shadow-xl overflow-hidden">
              
              {/* Header */}
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-brand-gold" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-200">Sanctuary Live Chat</span>
                </div>
                <span className="text-[9px] bg-brand-gold/15 text-brand-gold px-2 py-0.5 rounded-full font-mono">
                  SECURE
                </span>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
                {sanctuaryChat.map((chat, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex items-baseline space-x-2">
                      <span className="font-bold text-brand-gold-light">{chat.name}</span>
                      <span className="text-[8px] bg-slate-800 text-slate-400 px-1 rounded uppercase font-mono">{chat.role}</span>
                      <span className="text-[8px] text-slate-500 font-mono ml-auto">{chat.time}</span>
                    </div>
                    <p className="text-slate-300 mt-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80 leading-relaxed">
                      {chat.text}
                    </p>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendLiveMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
                <input
                  type="text"
                  value={mySanctuaryMessage}
                  onChange={(e) => setMySanctuaryMessage(e.target.value)}
                  placeholder="Type a divine decree (e.g., Amen! I break limits!)"
                  className="flex-grow bg-slate-950 border border-slate-800 text-xs text-white p-2.5 rounded-xl focus:border-brand-gold outline-none"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-brand-gold hover:bg-brand-gold-dark text-brand-blue-950 rounded-xl cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>

          </div>
        ) : (
          /* STANDARD DIGITAL CITY LAYOUT (Feed & Lobby switcher) */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* 1. LEFT SIDEBAR: CITY GATES & CHANNELS */}
            <div className="space-y-6">
              
              {/* Profile Card */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-sm text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-gold"></div>
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-16 h-16 rounded-full border-2 border-brand-gold mx-auto object-cover"
                />
                <h3 className="font-serif text-sm font-bold text-white mt-2.5">{profile.name}</h3>
                <span className="text-[9px] font-mono text-brand-gold uppercase tracking-widest bg-brand-gold/10 px-2 py-0.5 rounded-full mt-1.5 inline-block">
                  {profile.role} CITIZEN
                </span>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800/50 text-xs">
                  <div className="text-center">
                    <span className="text-slate-400 text-[10px] block font-mono">Streak</span>
                    <span className="font-bold text-white font-mono flex items-center justify-center">
                      <Flame className="w-3.5 h-3.5 text-brand-gold mr-0.5" /> {profile.streak}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-slate-400 text-[10px] block font-mono">Authority</span>
                    <span className="font-bold text-brand-gold font-mono">Lvl 3</span>
                  </div>
                </div>
              </div>

              {/* The Gateways filter */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3.5">
                <h4 className="text-[10px] uppercase font-mono text-slate-400 font-bold tracking-widest flex items-center">
                  <Globe className="w-3.5 h-3.5 text-brand-gold mr-2" /> GUARD THE GATES
                </h4>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <button
                    onClick={() => { setFeedFilter('all'); setActiveSubTab('feed'); }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
                      feedFilter === 'all' && activeSubTab === 'feed'
                        ? 'bg-brand-blue-900/50 text-brand-gold border-l-2 border-brand-gold font-bold'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <span>Gate of the Whole City</span>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">{posts.length}</span>
                  </button>

                  <button
                    onClick={() => { setFeedFilter('prophetic'); setActiveSubTab('feed'); }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
                      feedFilter === 'prophetic' && activeSubTab === 'feed'
                        ? 'bg-brand-blue-900/50 text-brand-gold border-l-2 border-brand-gold font-bold'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <span>Gate of the Watchmen</span>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">
                      {posts.filter(p => p.category === 'prophetic').length}
                    </span>
                  </button>

                  <button
                    onClick={() => { setFeedFilter('testimony'); setActiveSubTab('feed'); }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
                      feedFilter === 'testimony' && activeSubTab === 'feed'
                        ? 'bg-brand-blue-900/50 text-brand-gold border-l-2 border-brand-gold font-bold'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <span>Gate of Judah (Testimony)</span>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">
                      {posts.filter(p => p.category === 'testimony').length}
                    </span>
                  </button>

                  <button
                    onClick={() => { setFeedFilter('prayer-alarm'); setActiveSubTab('feed'); }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
                      feedFilter === 'prayer-alarm' && activeSubTab === 'feed'
                        ? 'bg-brand-blue-900/50 text-brand-gold border-l-2 border-brand-gold font-bold'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <span>Gate of the Firstborn (Altar)</span>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">
                      {posts.filter(p => p.category === 'prayer-alarm').length}
                    </span>
                  </button>

                  <button
                    onClick={() => { setFeedFilter('teaching'); setActiveSubTab('feed'); }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
                      feedFilter === 'teaching' && activeSubTab === 'feed'
                        ? 'bg-brand-blue-900/50 text-brand-gold border-l-2 border-brand-gold font-bold'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <span>Gate of Nehemiah (Teaching)</span>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">
                      {posts.filter(p => p.category === 'teaching').length}
                    </span>
                  </button>
                </div>
              </div>

              {/* City Statistics */}
              <div className="bg-gradient-to-br from-brand-blue-950 to-slate-950 p-5 rounded-2xl border border-brand-gold/10">
                <h4 className="text-[10px] uppercase font-mono text-brand-gold font-bold tracking-widest mb-3 flex items-center">
                  <Trophy className="w-3.5 h-3.5 text-brand-gold mr-2 animate-pulse" /> City Metropolitan Logs
                </h4>
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Total Citizens Active</span>
                    <span className="font-mono text-white font-bold">12,845</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Midnight Fire Altar Fires</span>
                    <span className="font-mono text-brand-gold font-bold">● ACTIVE</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Decrees Raised Daily</span>
                    <span className="font-mono text-white">4,892</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Answered testimonies</span>
                    <span className="font-mono text-emerald-400 font-bold">+148</span>
                  </div>
                </div>
              </div>

            </div>

            {/* 2. MIDDLE COLUMNS: COMMUNITY FEED SQUARE, GATHER OR LIVE LOBBY */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* ----------------- GATHER SECTION ----------------- */}
              {activeSubTab === 'gather' ? (
                <div className="space-y-6" id="gather-view-container">
                  {/* Gather Header */}
                  <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80">
                    <div className="flex items-start space-x-3.5">
                      <div className="p-3 bg-brand-gold/15 rounded-2xl text-brand-gold">
                        <Flame className="w-8 h-8 fill-brand-gold" />
                      </div>
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-white flex items-center">
                          Gather
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">A place to share what's lighting your path</p>
                      </div>
                    </div>
                  </div>

                  {/* Filter pills */}
                  <div className="flex flex-wrap gap-2" id="gather-pills-container">
                    {(['All', 'Sermon', 'Testimony', 'Devotional', 'Prayer request', 'Announcement'] as const).map(pill => (
                      <button
                        key={pill}
                        onClick={() => setGatherFilter(pill)}
                        className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-all ${
                          gatherFilter === pill
                            ? 'bg-slate-100 text-slate-900 font-bold shadow-lg scale-[1.02]'
                            : 'bg-slate-900/40 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                      >
                        {pill}
                      </button>
                    ))}
                  </div>

                  {/* Posting Card */}
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/80 shadow-xl">
                    <form onSubmit={handlePublishGatherPost} className="space-y-4">
                      {/* Category select dropdown */}
                      <div>
                        <select
                          value={gatherPostCategory}
                          onChange={(e) => setGatherPostCategory(e.target.value as any)}
                          className="w-full sm:w-64 bg-slate-900 border border-slate-800 text-sm text-slate-200 px-4 py-2.5 rounded-xl outline-none focus:border-brand-gold cursor-pointer"
                        >
                          <option value="Devotional">Devotional</option>
                          <option value="Sermon">Sermon</option>
                          <option value="Testimony">Testimony</option>
                          <option value="Prayer request">Prayer request</option>
                          <option value="Announcement">Announcement</option>
                        </select>
                      </div>

                      {/* Textarea */}
                      <textarea
                        value={gatherPostContent}
                        onChange={(e) => setGatherPostContent(e.target.value)}
                        placeholder="What would you like to share?"
                        className="w-full bg-slate-900 border border-slate-800 text-sm text-slate-100 p-4 h-32 rounded-xl focus:border-brand-gold outline-none resize-none"
                        required
                      />

                      {/* Real video upload (max 50MB, camera supported) */}
                      <label
                        htmlFor="gather-video-upload"
                        className="flex items-center justify-center space-x-2 w-full p-3 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-brand-gold text-slate-400 hover:text-brand-gold transition-colors text-sm"
                      >
                        <Video className="w-4 h-4" />
                        <span>
                          {gatherMediaUploading === 'video' ? `Uploading… ${gatherMediaProgress}%` : gatherPostYoutube ? 'Video attached ✓' : 'Add a video / camera (max 50MB)'}
                        </span>
                      </label>
                      <input
                        id="gather-video-upload"
                        type="file"
                        accept="video/*"
                        capture="environment"
                        className="hidden"
                        disabled={!!gatherMediaUploading}
                        onChange={(e) => handleGatherMediaUpload(e, 'video')}
                      />

                      {/* Real audio upload (max 50MB) */}
                      <label
                        htmlFor="gather-audio-upload"
                        className="flex items-center justify-center space-x-2 w-full p-3 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-brand-gold text-slate-400 hover:text-brand-gold transition-colors text-sm"
                      >
                        <Mic className="w-4 h-4" />
                        <span>
                          {gatherMediaUploading === 'audio' ? `Uploading… ${gatherMediaProgress}%` : gatherPostAudio ? 'Audio attached ✓' : 'Add audio'}
                        </span>
                      </label>
                      <input
                        id="gather-audio-upload"
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        disabled={!!gatherMediaUploading}
                        onChange={(e) => handleGatherMediaUpload(e, 'audio')}
                      />

                      {/* Optional Photo Upload */}
                      {showGatherPhotoInput && (
                        <div className="animate-fadeIn">
                          <label
                            htmlFor="gather-photo-upload"
                            className="flex items-center justify-center space-x-2 w-full p-3 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-brand-gold text-slate-400 hover:text-brand-gold transition-colors text-sm"
                          >
                            <ImageIcon className="w-4 h-4" />
                            <span>{gatherMediaUploading === 'image' ? `Uploading… ${gatherMediaProgress}%` : gatherPostPhoto ? 'Photo attached ✓' : 'Add a photo / camera'}</span>
                          </label>
                          <input
                            id="gather-photo-upload"
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            disabled={!!gatherMediaUploading}
                            onChange={(e) => handleGatherMediaUpload(e, 'photo')}
                          />
                        </div>
                      )}

                      {/* Bottom actions row */}
                      <div className="flex items-center justify-between border-t border-slate-800/60 pt-4">
                        {/* Photo attachment selector */}
                        <button
                          type="button"
                          onClick={() => {
                            setShowGatherPhotoInput(!showGatherPhotoInput);
                          }}
                          className={`px-4 py-2 text-xs font-bold rounded-xl border flex items-center space-x-2 transition-colors ${
                            showGatherPhotoInput || gatherPostPhoto
                              ? 'bg-brand-gold/15 border-brand-gold text-brand-gold'
                              : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/50'
                          }`}
                        >
                          <ImageIcon className="w-4 h-4" />
                          <span>Photo</span>
                        </button>

                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => {
                              setGatherPostContent('');
                              setGatherPostYoutube('');
                              setGatherPostPhoto('');
                              setShowGatherPhotoInput(false);
                            }}
                            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-blue-950 font-bold tracking-wider rounded-xl shadow-lg shadow-brand-gold/10 transition-all active:scale-95 cursor-pointer"
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Shared Feed / List */}
                  <div className="space-y-6">
                    {gatherLoading ? (
                      <div className="text-center py-16 text-slate-500 text-sm">Loading…</div>
                    ) : gatherPosts.filter(p => gatherFilter === 'All' || p.category === gatherFilter).length === 0 ? (
                      <div className="text-center py-16 bg-slate-950/40 border border-slate-800/60 rounded-2xl">
                        <p className="text-slate-500 text-sm">Nothing shared here yet. Be the first.</p>
                      </div>
                    ) : (
                      gatherPosts
                        .filter(p => gatherFilter === 'All' || p.category === gatherFilter)
                        .map(post => (
                          <div key={post.id} className="bg-slate-950 rounded-2xl border border-slate-800/80 shadow-md overflow-hidden">
                            {/* Card Header */}
                            <div className="p-5 flex items-start justify-between">
                              <div className="flex items-center space-x-3.5">
                                <img
                                  src={post.authorAvatar}
                                  alt={post.authorName}
                                  className="w-11 h-11 rounded-full border border-slate-800 object-cover"
                                />
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-serif text-sm font-bold text-white">{post.authorName}</h4>
                                    <span className="text-[8px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded uppercase font-mono border border-slate-800/80">
                                      {post.authorRole}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-mono">{post.dateStr}</span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <span className="text-[9px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
                                  {post.category}
                                </span>
                                {(post.authorId === profile.id || profile.role === 'Admin') && (
                                  <button
                                    onClick={() => handleDeleteGatherPost(post.id)}
                                    className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Delete post"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="px-5 pb-4">
                              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                            </div>

                            {/* Media content */}
                            {post.mediaUrl && post.mediaType === 'photo' && (
                              <div className="border-t border-b border-slate-900 overflow-hidden">
                                <img src={post.mediaUrl} alt="Gather upload" className="w-full max-h-80 object-cover" referrerPolicy="no-referrer" />
                              </div>
                            )}

                            {post.mediaUrl && post.mediaType === 'video' && (
                              <div className="border-t border-b border-slate-900 bg-black aspect-video relative">
                                <video src={post.mediaUrl} controls className="w-full h-full" />
                              </div>
                            )}

                            {post.mediaUrl && post.mediaType === 'audio' && (
                              <div className="border-t border-b border-slate-900 bg-slate-900/60 px-5 py-3">
                                <audio src={post.mediaUrl} controls className="w-full h-9" />
                              </div>
                            )}

                            {/* Interaction Bar */}
                            <div className="px-5 py-3.5 bg-slate-900/40 border-t border-slate-800/40 flex items-center justify-between text-xs font-mono text-slate-400">
                              <button
                                onClick={() => handleLikeGatherPost(post.id)}
                                className={`flex items-center space-x-1.5 transition-colors ${post.isLiked ? 'text-red-500' : 'hover:text-red-400'}`}
                              >
                                <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                                <span>{post.likes} Likes</span>
                              </button>

                              <button
                                onClick={() => setGatherCommentsPostId(gatherCommentsPostId === post.id ? null : post.id)}
                                className="flex items-center space-x-1.5 hover:text-slate-200 transition-colors"
                              >
                                <MessageSquare className="w-4 h-4" />
                                <span>{post.comments.length} Comments</span>
                              </button>

                              <ShareButton title={post.content.slice(0, 60)} path={`/?view=community`} dark />
                            </div>

                            {/* Comment Thread */}
                            {gatherCommentsPostId === post.id && (
                              <div className="bg-slate-950 p-5 border-t border-slate-900 space-y-4">
                                {post.comments.length > 0 && (
                                  <div className="space-y-3">
                                    {post.comments.map((comm) => (
                                      <div key={comm.id} className="flex items-start space-x-3 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-900">
                                        <img src={comm.authorAvatar} alt={comm.authorName} className="w-8 h-8 rounded-full border border-slate-800 object-cover" />
                                        <div className="flex-grow">
                                          <div className="flex items-baseline space-x-1.5">
                                            <span className="font-bold text-white font-serif">{comm.authorName}</span>
                                            <span className="text-[8px] text-slate-500 font-mono">({comm.authorRole})</span>
                                            <span className="text-[8px] text-slate-600 font-mono ml-auto">{comm.dateStr}</span>
                                          </div>
                                          <p className="text-slate-300 mt-1 leading-relaxed">{comm.content}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <div className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={newGatherCommentText[post.id] || ''}
                                    onChange={(e) => setNewGatherCommentText({ ...newGatherCommentText, [post.id]: e.target.value })}
                                    placeholder="Write a comment response..."
                                    className="flex-grow bg-slate-900 border border-slate-800 text-xs text-white p-2 rounded-xl focus:border-brand-gold outline-none"
                                  />
                                  <button
                                    onClick={() => handleAddGatherComment(post.id)}
                                    className="p-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-blue-950 rounded-xl font-bold cursor-pointer"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                    )}
                  </div>
                </div>
              ) : activeSubTab === 'feed' ? (
                <>
                  {/* Create Post Card trigger / form */}
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                    {!showCreateForm ? (
                      <div className="flex items-center space-x-3">
                        <img src={profile.avatar} alt={profile.name} className="w-10 h-10 rounded-full border border-slate-800 object-cover" />
                        <button
                          onClick={() => setShowCreateForm(true)}
                          className="flex-grow bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs text-left px-4 py-3 rounded-xl transition-all cursor-pointer font-medium"
                        >
                          Publish a Testimony, Prophetic Insight or Altar Alarm...
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handlePublishPost} className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest font-bold">Publish to the Metropolitan Feed</span>
                          <button
                            type="button"
                            onClick={() => setShowCreateForm(false)}
                            className="text-xs text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>

                        {/* Category Selectors */}
                        <div className="grid grid-cols-4 gap-1.5 text-[9px] uppercase tracking-wider font-mono">
                          {(['testimony', 'prophetic', 'prayer-alarm', 'teaching'] as const).map(cat => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setPostCategory(cat)}
                              className={`p-2 rounded-lg border font-bold transition-all ${
                                postCategory === cat
                                  ? 'bg-brand-gold border-brand-gold text-brand-blue-950'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {cat.replace('-', ' ')}
                            </button>
                          ))}
                        </div>

                        {/* TextArea */}
                        <textarea
                          value={postContent}
                          onChange={(e) => setPostContent(e.target.value)}
                          placeholder="Type your deep anointed post here... include references to fasts, midnight prayers, or covenant scriptures."
                          className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-100 p-3 h-28 rounded-xl focus:border-brand-gold outline-none"
                          required
                        />

                        {/* Media attachment uploads (real files, 50MB max) — camera capture supported on mobile */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label
                              htmlFor="digital-city-photo-upload"
                              className="flex items-center justify-center space-x-2 w-full p-3 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-brand-gold text-slate-400 hover:text-brand-gold transition-colors text-xs"
                            >
                              <ImageIcon className="w-4 h-4" />
                              <span>{mediaUploading === 'image' ? `Uploading… ${mediaUploadProgress}%` : postImage ? 'Photo attached ✓' : 'Photo / camera'}</span>
                            </label>
                            <input
                              id="digital-city-photo-upload"
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="hidden"
                              disabled={!!mediaUploading}
                              onChange={(e) => handleMediaUpload(e, 'photo')}
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="digital-city-video-upload"
                              className="flex items-center justify-center space-x-2 w-full p-3 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-brand-gold text-slate-400 hover:text-brand-gold transition-colors text-xs"
                            >
                              <Video className="w-4 h-4" />
                              <span>{mediaUploading === 'video' ? `Uploading… ${mediaUploadProgress}%` : postVideo ? 'Video attached ✓' : 'Video / camera'}</span>
                            </label>
                            <input
                              id="digital-city-video-upload"
                              type="file"
                              accept="video/*"
                              capture="environment"
                              className="hidden"
                              disabled={!!mediaUploading}
                              onChange={(e) => handleMediaUpload(e, 'video')}
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="digital-city-audio-upload"
                              className="flex items-center justify-center space-x-2 w-full p-3 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-brand-gold text-slate-400 hover:text-brand-gold transition-colors text-xs"
                            >
                              <Mic className="w-4 h-4" />
                              <span>{mediaUploading === 'audio' ? `Uploading… ${mediaUploadProgress}%` : postAudio ? 'Audio attached ✓' : 'Add audio'}</span>
                            </label>
                            <input
                              id="digital-city-audio-upload"
                              type="file"
                              accept="audio/*"
                              className="hidden"
                              disabled={!!mediaUploading}
                              onChange={(e) => handleMediaUpload(e, 'audio')}
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-brand-gold text-brand-blue-950 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-brand-gold-dark cursor-pointer flex items-center justify-center space-x-1"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Publish to Digital City</span>
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Feed stream list */}
                  <div className="space-y-6">
                    {filteredPosts.map((post) => (
                      <div key={post.id} className="bg-slate-950 rounded-2xl border border-slate-800/80 shadow-sm overflow-hidden" id={`cpost-${post.id}`}>
                        
                        {/* Feed Card Header */}
                        <div className="p-5 flex items-start justify-between">
                          <div className="flex items-center space-x-3.5">
                            <img
                              src={post.authorAvatar}
                              alt={post.authorName}
                              className="w-11 h-11 rounded-full border border-slate-800 object-cover"
                            />
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-serif text-sm font-bold text-white">{post.authorName}</h4>
                                <span className="text-[8px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded uppercase font-mono border border-slate-800/80">
                                  {post.authorRole}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono">{post.dateStr}</span>
                            </div>
                          </div>

                          {/* Category Badge + Delete */}
                          <div className="flex items-center space-x-2">
                            <span className={`text-[9px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full ${
                              post.category === 'testimony' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : post.category === 'prophetic'
                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                : post.category === 'prayer-alarm'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                              {post.category}
                            </span>
                            {(post.authorId === profile.id || profile.role === 'Admin') && (
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Delete post"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Content Body */}
                        <div className="px-5 pb-4">
                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                        </div>

                        {/* Attached Image/Video assets */}
                        {post.imageUrl && (
                          <div className="border-t border-b border-slate-900 overflow-hidden">
                            <img src={post.imageUrl} alt="Covenant upload" className="w-full max-h-80 object-cover hover:scale-[1.01] transition-transform duration-300" />
                          </div>
                        )}

                        {post.videoUrl && (
                          <div className="border-t border-b border-slate-900 bg-black aspect-video relative">
                            <video 
                              src={post.videoUrl} 
                              controls 
                              className="w-full h-full"
                              poster="https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800"
                            />
                          </div>
                        )}

                        {post.audioUrl && (
                          <div className="border-t border-b border-slate-900 bg-slate-900/60 px-5 py-3">
                            <audio src={post.audioUrl} controls className="w-full h-9" />
                          </div>
                        )}

                        {/* Interaction Bar */}
                        <div className="px-5 py-3.5 bg-slate-900/40 border-t border-slate-800/40 flex items-center justify-between text-xs font-mono text-slate-400">
                          
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className={`flex items-center space-x-1.5 transition-colors ${post.isLiked ? 'text-red-500' : 'hover:text-red-400'}`}
                          >
                            <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                            <span>{post.likes} Anointed</span>
                          </button>

                          <button
                            onClick={() => handleAgreePost(post.id)}
                            className={`flex items-center space-x-1.5 transition-colors ${post.isAgreed ? 'text-brand-gold' : 'hover:text-brand-gold-light'}`}
                          >
                            <Flame className={`w-4 h-4 ${post.isAgreed ? 'fill-brand-gold text-brand-gold' : ''}`} />
                            <span>{post.prayerAgreements} In Covenant Agreement</span>
                          </button>

                          <button
                            onClick={() => setExpandedCommentsPostId(expandedCommentsPostId === post.id ? null : post.id)}
                            className="flex items-center space-x-1.5 hover:text-slate-200 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>{post.comments.length} Scribes</span>
                          </button>

                          <ShareButton title={post.content.slice(0, 60)} path={`/?view=community`} dark />
                        </div>

                        {/* Expanded comments thread */}
                        {expandedCommentsPostId === post.id && (
                          <div className="bg-slate-950 p-5 border-t border-slate-900 space-y-4">
                            
                            {/* Existing comments */}
                            {post.comments.length > 0 && (
                              <div className="space-y-3">
                                {post.comments.map((comm) => (
                                  <div key={comm.id} className="flex items-start space-x-3 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-900">
                                    <img src={comm.authorAvatar} alt={comm.authorName} className="w-8 h-8 rounded-full border border-slate-800 object-cover" />
                                    <div className="flex-grow">
                                      <div className="flex items-baseline space-x-1.5">
                                        <span className="font-bold text-white font-serif">{comm.authorName}</span>
                                        <span className="text-[8px] text-slate-500 font-mono">({comm.authorRole})</span>
                                        <span className="text-[8px] text-slate-600 font-mono ml-auto">{comm.dateStr}</span>
                                      </div>
                                      <p className="text-slate-300 mt-1 leading-relaxed">{comm.content}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Comment Input */}
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={newCommentText[post.id] || ''}
                                onChange={(e) => setNewCommentText({ ...newCommentText, [post.id]: e.target.value })}
                                placeholder="Write a spiritual scribe response..."
                                className="flex-grow bg-slate-900 border border-slate-800 text-xs text-white p-2 rounded-xl focus:border-brand-gold outline-none"
                              />
                              <button
                                onClick={() => handleAddComment(post.id)}
                                className="p-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-blue-950 rounded-xl font-bold cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </div>

                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* ----------------- LIVE LOBBY SECTION ----------------- */
                <div className="space-y-6">
                  
                  {/* Lobby header banner */}
                  <div className="bg-gradient-to-tr from-brand-blue-950 to-slate-900 p-6 rounded-2xl border border-brand-gold/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-2xl rounded-full"></div>
                    <h3 className="font-serif text-lg font-bold text-white flex items-center">
                      <Tv className="w-5 h-5 mr-2 text-brand-gold animate-pulse" /> Mount Zion live Broadcasting Grid
                    </h3>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      Enter virtual corporate chambers immediately. No downloads or separate software required — full, native, secure video, audio, and prayer portal streaming directly inside our digital city walls.
                    </p>
                  </div>

                  {/* Sessions grid */}
                  <div className="grid grid-cols-1 gap-4">
                    {sessions.map((sess) => (
                      <div key={sess.id} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        
                        <div className="flex items-center space-x-4">
                          {/* Live icon / upcoming icon */}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            sess.status === 'live' 
                              ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                              : 'bg-slate-800 text-slate-500'
                          }`}>
                            <Video className="w-6 h-6" />
                          </div>

                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] text-brand-gold font-mono uppercase bg-brand-gold/15 px-2 py-0.5 rounded-full">
                                {sess.category}
                              </span>
                              {sess.status === 'live' ? (
                                <span className="flex h-2 w-2 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                              ) : null}
                            </div>

                            <h4 className="font-serif text-base font-bold text-white mt-1.5">{sess.title}</h4>
                            <p className="text-xs text-slate-400">Host: {sess.hostName} {sess.scheduledTime ? `• ${sess.scheduledTime}` : ''}</p>
                          </div>
                        </div>

                        {sess.status === 'live' ? (
                          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                            <span className="text-[10px] font-mono text-slate-500 flex items-center">
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              {sess.viewerCount} watching
                            </span>
                            <button
                              onClick={() => {
                                setActiveSession(sess);
                                setSanctuaryAgreementFlames(0);
                              }}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase font-bold tracking-wider rounded-xl cursor-pointer flex items-center space-x-1.5"
                            >
                              <Play className="w-3.5 h-3.5 fill-white" />
                              <span>Enter Sanctuary</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            disabled
                            className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-500 font-mono text-xs uppercase font-bold tracking-wider rounded-xl cursor-not-allowed"
                          >
                            Upcoming Chamber
                          </button>
                        )}

                      </div>
                    ))}
                  </div>

                </div>
              )}

            </div>

            {/* 3. RIGHT SIDEBAR: ONLINE CITIZENS & LIVE CHAMBERS LIST */}
            <div className="space-y-6">
              
              {/* Active Online bubble list */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <h4 className="text-[10px] uppercase font-mono text-slate-400 font-bold tracking-widest mb-4 flex items-center justify-between">
                  <span>CITIZENS ONLINE NOW</span>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                </h4>

                <div className="space-y-4">
                  {mockCitizensOnline.map((citizen, idx) => (
                    <div key={idx} className="flex items-center space-x-3 text-xs">
                      <div className="relative">
                        <img
                          src={citizen.avatar}
                          alt={citizen.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-800"
                        />
                        <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-slate-200">{citizen.name}</span>
                          <span className="text-[7px] text-brand-gold font-mono uppercase bg-brand-gold/15 px-1 rounded">
                            {citizen.loc}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono -mt-0.5">{citizen.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced spiritual weapons banner */}
              <div className="bg-brand-blue-950 border border-brand-gold/20 p-6 rounded-2xl relative overflow-hidden text-center">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(212,163,89,0.06)_0%,transparent_75%)]" />
                <Flame className="w-10 h-10 text-brand-gold mx-auto animate-pulse mb-3" />
                <h3 className="font-serif text-sm font-bold text-white tracking-wide">THE METROPOLITAN SHELTER</h3>
                <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  "Let Zion Rejoice! He has established strong gates for your city, and blessed your children inside." — Psalm 147:13
                </p>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
