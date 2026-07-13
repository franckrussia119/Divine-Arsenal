import React, { useEffect, useState } from 'react';
import { ArrowLeft, Users, UserPlus, Heart, MessageSquare, Send, X } from 'lucide-react';
import { Group, GroupMember, CommunityPost } from '../types';
import { api } from '../lib/api';
import { useTranslation } from '../translations';

interface GroupDetailViewProps {
  groupId: string;
  onBack: () => void;
}

export default function GroupDetailView({ groupId, onBack }: GroupDetailViewProps) {
  const { t } = useTranslation();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get<{ group: Group; members: GroupMember[] }>(`/groups/${groupId}`),
      api.get<{ posts: CommunityPost[] }>(`/community/posts?groupId=${groupId}`),
    ])
      .then(([g, p]) => {
        setGroup(g.group);
        setMembers(g.members);
        setPosts(p.posts);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, [groupId]);

  const handleJoinToggle = async () => {
    if (!group) return;
    setBusy(true);
    try {
      const res = await api.post<{ group: Group }>(`/groups/${groupId}/${group.isMember ? 'leave' : 'join'}`);
      setGroup(res.group);
      load();
    } finally {
      setBusy(false);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    try {
      const res = await api.post<{ post: CommunityPost }>('/community/posts', {
        content: postContent,
        category: 'teaching',
        groupId,
      });
      setPosts((prev) => [res.post, ...prev]);
      setPostContent('');
    } catch (err: any) {
      alert(err?.message || 'Could not post — you may need to join this group first.');
    }
  };

  const handleLike = async (postId: string) => {
    const res = await api.post<{ post: CommunityPost }>(`/community/posts/${postId}/like`);
    setPosts((prev) => prev.map((p) => (p.id === postId ? res.post : p)));
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addEmail.trim()) return;
    setBusy(true);
    try {
      const res = await api.post<{ group: Group; members: GroupMember[] }>(`/groups/${groupId}/members`, { email: addEmail });
      setGroup(res.group);
      setMembers(res.members);
      setAddEmail('');
      setShowAddMember(false);
    } catch (err: any) {
      alert(err?.message || 'Could not add that member.');
    } finally {
      setBusy(false);
    }
  };

  if (loading || !group) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-sm">Loading…</div>;
  }

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-16">
      <div className="bg-brand-blue-950 text-white py-10 border-b border-brand-gold/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={onBack} className="flex items-center space-x-1 text-xs text-slate-300 hover:text-white mb-4">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('groups')}</span>
          </button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-serif text-3xl font-bold">{group.name}</h1>
              <p className="text-sm text-slate-300 mt-1 max-w-xl">{group.description}</p>
              <span className="text-[11px] text-brand-gold font-mono mt-2 inline-block">
                {group.memberCount} {t('members')}
              </span>
            </div>
            <button
              onClick={handleJoinToggle}
              disabled={busy}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-60 ${
                group.isMember ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-brand-gold text-brand-blue-950 hover:bg-brand-gold-light'
              }`}
            >
              {group.isMember ? t('leaveGroup') : t('joinGroup')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Post feed */}
        <div className="lg:col-span-2 space-y-4">
          {group.isMember && (
            <form onSubmit={handlePost} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder={`Post something to ${group.name}…`}
                className="w-full h-20 p-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-gold"
              />
              <button
                type="submit"
                className="flex items-center space-x-2 px-4 py-2 bg-brand-blue-950 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-brand-blue-900"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </form>
          )}

          {posts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <p className="text-sm text-slate-500">No posts in this group yet.</p>
            </div>
          ) : (
            posts.map((p) => (
              <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <img src={p.authorAvatar} alt={p.authorName} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <div className="text-xs font-semibold text-slate-700">{p.authorName}</div>
                    <div className="text-[10px] text-slate-400">{p.dateStr}</div>
                  </div>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{p.content}</p>
                {p.imageUrl && <img src={p.imageUrl} alt="" className="mt-3 rounded-lg max-h-80 w-full object-cover" />}
                {p.videoUrl && <video src={p.videoUrl} controls className="mt-3 rounded-lg max-h-80 w-full" />}
                <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleLike(p.id)}
                    className={`flex items-center space-x-1 text-xs ${p.isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                  >
                    <Heart className="w-4 h-4" fill={p.isLiked ? 'currentColor' : 'none'} />
                    <span>{p.likes}</span>
                  </button>
                  <span className="flex items-center space-x-1 text-xs text-slate-400">
                    <MessageSquare className="w-4 h-4" />
                    <span>{p.comments.length}</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Members sidebar */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif font-bold text-brand-blue-950 flex items-center">
                <Users className="w-4 h-4 mr-2 text-brand-gold" /> {members.length} {t('members')}
              </h3>
              {group.isAdmin && (
                <button onClick={() => setShowAddMember((s) => !s)} className="text-brand-gold-dark hover:text-brand-gold" title="Add member">
                  {showAddMember ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                </button>
              )}
            </div>

            {showAddMember && (
              <form onSubmit={handleAddMember} className="mb-4 flex space-x-2">
                <input
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="member@email.com"
                  className="flex-1 p-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-brand-gold"
                  required
                />
                <button type="submit" disabled={busy} className="px-3 py-2 bg-brand-blue-950 text-white text-xs rounded-lg disabled:opacity-60">
                  Add
                </button>
              </form>
            )}

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {members.map((m) => (
                <div key={m.userId} className="flex items-center space-x-2">
                  <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full object-cover" />
                  <span className="text-xs text-slate-700 flex-1">{m.name}</span>
                  {m.role === 'admin' && <span className="text-[9px] text-brand-gold-dark font-mono uppercase">admin</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
