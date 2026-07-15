import React, { useEffect, useState } from 'react';
import { Users, Plus, X, Loader2 } from 'lucide-react';
import { Group } from '../types';
import { api } from '../lib/api';
import { useTranslation } from '../translations';

interface GroupsViewProps {
  onSelectGroup: (groupId: string) => void;
}

export default function GroupsView({ onSelectGroup }: GroupsViewProps) {
  const { t } = useTranslation();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadGroups = () => {
    setLoading(true);
    api
      .get<{ groups: Group[] }>('/groups')
      .then((res) => setGroups(res.groups))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(loadGroups, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await api.post<{ group: Group }>('/groups', { name, description });
      setGroups((prev) => [res.group, ...prev]);
      setName('');
      setDescription('');
      setShowCreate(false);
    } catch (err) {
      console.error('Create group failed:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleMembership = async (group: Group) => {
    setBusyId(group.id);
    try {
      const res = await api.post<{ group: Group }>(`/groups/${group.id}/${group.isMember ? 'leave' : 'join'}`);
      setGroups((prev) => prev.map((g) => (g.id === group.id ? res.group : g)));
    } catch (err) {
      console.error('Group membership update failed:', err);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-16" id="groups-view">
      <div className="bg-brand-blue-950 text-white py-8 sm:py-12 border-b border-brand-gold/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-gold/5 blur-3xl rounded-full"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-brand-gold font-mono uppercase tracking-widest mb-1">
              <Users className="w-3.5 h-3.5" />
              <span>{t('groups')}</span>
            </div>
            <h1 className="font-serif text-3xl font-bold">{t('groups')}</h1>
          </div>
          <button
            onClick={() => setShowCreate((s) => !s)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-gold text-brand-blue-950 font-semibold text-xs uppercase tracking-wider hover:bg-brand-gold-light transition-colors"
          >
            {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{t('createGroup')}</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {showCreate && (
          <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">{t('groupName')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-gold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">{t('groupDescription')}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-20 p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-gold"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="flex items-center space-x-2 px-5 py-2.5 bg-brand-blue-950 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-brand-blue-900 disabled:opacity-60"
            >
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{t('createGroup')}</span>
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : groups.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border border-slate-200">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">{t('noGroupsYet')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {groups.map((g) => (
              <div
                key={g.id}
                onClick={() => onSelectGroup(g.id)}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col cursor-pointer hover:border-brand-gold/50 hover:shadow-md transition-all duration-200"
              >
                <h3 className="font-serif text-lg font-bold text-brand-blue-950">{g.name}</h3>
                <p className="text-xs text-slate-500 mt-1 flex-1 line-clamp-3">{g.description || '—'}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {g.memberCount} {t('members')}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleMembership(g); }}
                    disabled={busyId === g.id}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-60 ${
                      g.isMember
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-brand-gold text-brand-blue-950 hover:bg-brand-gold-light'
                    }`}
                  >
                    {g.isMember ? t('leaveGroup') : t('joinGroup')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
