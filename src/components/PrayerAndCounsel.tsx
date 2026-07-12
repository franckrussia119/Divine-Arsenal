import React, { useState } from 'react';
import { PrayerPoint, JournalEntry, Counselor, Message } from '../types';
import { sampleCounselors, sampleMessages } from '../data';
import { Shield, CheckCircle, Heart, PenTool, MessageSquare, Send, Calendar, Sparkles, BookOpen, PlusCircle, Check, Info } from 'lucide-react';

interface PrayerAndCounselProps {
  prayers: PrayerPoint[];
  onAddPrayer: (title: string, description: string) => void;
  onTogglePrayer: (id: string) => void;
  onDeclareAnswered: (id: string, testimony: string) => void;
  onIncrementPraying: (id: string) => void;
  
  journals: JournalEntry[];
  onAddJournal: (text: string, category: string) => void;
  
  messages: Message[];
  onSendMessage: (text: string) => void;
}

export default function PrayerAndCounsel({
  prayers,
  onAddPrayer,
  onTogglePrayer,
  onDeclareAnswered,
  onIncrementPraying,
  
  journals,
  onAddJournal,
  
  messages,
  onSendMessage
}: PrayerAndCounselProps) {
  const [activeCareTab, setActiveCareTab] = useState<'war' | 'journal' | 'counsel'>('war');
  
  // Prayer form
  const [showAddPrayer, setShowAddPrayer] = useState(false);
  const [newPrayerTitle, setNewPrayerTitle] = useState('');
  const [newPrayerDesc, setNewPrayerDesc] = useState('');

  // Testimony declaration
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [testimonyText, setTestimonyText] = useState('');

  // Journal form
  const [journalCategory, setJournalCategory] = useState('REFLECTION');
  const [journalText, setJournalText] = useState('');
  const [journalSaved, setJournalSaved] = useState(false);

  // Chat form
  const [chatInput, setChatInput] = useState('');

  const handleDeployPrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrayerTitle.trim() || !newPrayerDesc.trim()) return;
    onAddPrayer(newPrayerTitle, newPrayerDesc);
    setNewPrayerTitle('');
    setNewPrayerDesc('');
    setShowAddPrayer(false);
  };

  const handleTestimonySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answeringId || !testimonyText.trim()) return;
    onDeclareAnswered(answeringId, testimonyText);
    setAnsweringId(null);
    setTestimonyText('');
  };

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalText.trim()) return;
    onAddJournal(journalText, journalCategory);
    setJournalText('');
    setJournalSaved(true);
    setTimeout(() => setJournalSaved(false), 3000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput);
    setChatInput('');
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-16" id="prayer-and-care-page">
      
      {/* 1. Header Hero Banner */}
      <div className="bg-brand-blue-950 text-white py-12 border-b border-brand-gold/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-gold/5 blur-3xl rounded-full"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="text-[10px] text-brand-gold font-mono uppercase tracking-widest font-bold">
            The Student Inner Life & Care Layer
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mt-2">The Prayer Room & Counselor Care</h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto mt-2 leading-relaxed">
            Mobilize community prayer, journal deep prophetic reflections, and direct-message counseling staff in absolute security and faith.
          </p>

          {/* Sub Navigation Tabs */}
          <div className="flex justify-center mt-10" id="care-layer-tabs">
            <div className="inline-flex bg-brand-blue-900/60 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setActiveCareTab('war')}
                className={`px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center space-x-2 transition-all cursor-pointer ${
                  activeCareTab === 'war' ? 'bg-brand-gold text-brand-blue-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>War Room Prayers</span>
              </button>
              
              <button
                onClick={() => setActiveCareTab('journal')}
                className={`px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center space-x-2 transition-all cursor-pointer ${
                  activeCareTab === 'journal' ? 'bg-brand-gold text-brand-blue-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <PenTool className="w-4 h-4" />
                <span>Spiritual Journal</span>
              </button>

              <button
                onClick={() => setActiveCareTab('counsel')}
                className={`px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center space-x-2 transition-all cursor-pointer ${
                  activeCareTab === 'counsel' ? 'bg-brand-gold text-brand-blue-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Counselor Chat</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* 2. WAR ROOM SUB-TAB */}
        {activeCareTab === 'war' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Prayers List Column (Left - 2 Columns) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-mono text-slate-500 font-bold">
                  ACTIVE PRAYER PORTALS ({prayers.filter(p => p.status === 'active').length})
                </span>
                <button
                  onClick={() => setShowAddPrayer(!showAddPrayer)}
                  className="px-4 py-2 bg-brand-blue-950 hover:bg-brand-blue-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center space-x-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Request Intercession</span>
                </button>
              </div>

              {/* Add Prayer Collapsible Form */}
              {showAddPrayer && (
                <form onSubmit={handleDeployPrayer} className="bg-white p-6 rounded-2xl border-2 border-brand-gold/30 shadow-lg space-y-4 animate-in slide-in-from-top-4 duration-200">
                  <h3 className="font-serif font-bold text-brand-blue-950 text-base">Request Dynamic Intercession Shield</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">Prayer Request Title</label>
                      <input
                        type="text"
                        value={newPrayerTitle}
                        onChange={(e) => setNewPrayerTitle(e.target.value)}
                        placeholder="e.g., Spiritual Breakthrough for Leadership Transition"
                        className="w-full p-3 text-xs sm:text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-gold"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">Details & Scriptural Foundation</label>
                      <textarea
                        value={newPrayerDesc}
                        onChange={(e) => setNewPrayerDesc(e.target.value)}
                        placeholder="Please elaborate on your request and name any specific scriptures you are standing on..."
                        className="w-full h-24 p-3 text-xs sm:text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-gold"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddPrayer(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-brand-gold text-brand-blue-950 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-brand-gold-light"
                    >
                      Deploy Shield
                    </button>
                  </div>
                </form>
              )}

              {/* Live Testimony Submit Form Overlay */}
              {answeringId && (
                <form onSubmit={handleTestimonySubmit} className="bg-emerald-50 border-2 border-emerald-300 p-6 rounded-2xl space-y-4 shadow-lg">
                  <h3 className="font-serif font-bold text-emerald-950 text-base">Declare Answered Testimony!</h3>
                  <p className="text-xs text-slate-600">
                    Share exactly how the Lord responded to encourage other intercessors in the army.
                  </p>
                  <textarea
                    value={testimonyText}
                    onChange={(e) => setTestimonyText(e.target.value)}
                    placeholder="Type your testimony here (e.g. 'Yesterday doctors ran tests and found the tumor completely vanished! Praise God!')"
                    className="w-full h-24 p-3 text-xs sm:text-sm border border-emerald-200 rounded-lg outline-none focus:border-emerald-600 bg-white"
                    required
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setAnsweringId(null)}
                      className="px-4 py-2 text-xs text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 text-white text-xs font-bold uppercase rounded-lg hover:bg-emerald-700"
                    >
                      Publish Testimony
                    </button>
                  </div>
                </form>
              )}

              {/* Prayers Loop */}
              <div className="space-y-4">
                {prayers.map((p) => (
                  <div key={p.id} className={`p-6 rounded-2xl bg-white border shadow-sm transition-all ${
                    p.status === 'answered' ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                            p.status === 'answered' ? 'bg-emerald-100 text-emerald-800' : 'bg-brand-gold/15 text-brand-gold-dark'
                          }`}>
                            {p.status === 'answered' ? 'Answered Testimony' : 'Active Intercession'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{p.dateStr}</span>
                        </div>
                        <h4 className={`font-serif text-base font-bold text-brand-blue-950 mt-1.5 ${
                          p.status === 'answered' ? 'line-through text-slate-500' : ''
                        }`}>{p.title}</h4>
                      </div>

                      {/* Complete / Answered CTA Toggle */}
                      {p.status === 'active' ? (
                        <button
                          onClick={() => setAnsweringId(p.id)}
                          className="px-3.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold uppercase tracking-wide rounded-lg flex items-center space-x-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Answered</span>
                        </button>
                      ) : (
                        <span className="text-xs font-serif font-bold text-emerald-700 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1 text-emerald-600 fill-current" /> Victory Declared!
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-3 leading-relaxed font-sans">{p.description}</p>

                    {p.testimonyNote && (
                      <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-slate-700 font-serif italic relative overflow-hidden">
                        <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5">Testimony</span>
                        {p.testimonyNote}
                      </div>
                    )}

                    {/* Support count widget */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Active spiritual shielding
                      </span>
                      
                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-semibold text-slate-600">
                          <strong>{p.prayingCount}</strong> interceding
                        </span>
                        
                        <button
                          onClick={() => onIncrementPraying(p.id)}
                          disabled={p.status === 'answered'}
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            p.status === 'answered'
                              ? 'text-slate-300 border-slate-200 bg-slate-50'
                              : 'text-brand-gold-dark hover:text-white border-brand-gold/30 hover:bg-brand-gold-dark'
                          }`}
                          title="Support this prayer in the spirit"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Shield Covenant Sidebar */}
            <div className="space-y-6">
              <div className="bg-brand-blue-950 text-white p-6 rounded-2xl border border-brand-gold/20 relative overflow-hidden">
                <span className="text-brand-gold text-[10px] font-mono uppercase tracking-widest font-bold">The Protocol</span>
                <h3 className="font-serif text-lg font-bold text-white mt-1 mb-3">Understanding the Shield</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  When you submit a request to the War Room, it is automatically routed to our 24/7 global intercession network. Anointed covenant warriors pick up your request instantly, ensuring continuous midnight vigilance.
                </p>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-[11px] leading-normal italic text-slate-300">
                  "Again, truly I tell you that if two of you on earth agree about anything they ask for, it will be done for them by my Father in heaven." — Matthew 18:19
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 3. SPIRITUAL JOURNAL SUB-TAB */}
        {activeCareTab === 'journal' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Journal Input block (Left - 1 Column) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
              <h3 className="font-serif font-bold text-brand-blue-950 text-base mb-4 flex items-center">
                <PenTool className="w-5 h-5 mr-2 text-brand-gold" /> Write Spiritual Entry
              </h3>

              <form onSubmit={handleSaveJournal} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-slate-500 mb-1">
                    Entry Category
                  </label>
                  <select
                    value={journalCategory}
                    onChange={(e) => setJournalCategory(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-brand-gold"
                  >
                    <option value="REFLECTION">STUDY REFLECTION</option>
                    <option value="GRATITUDE">GRATITUDE DIARY</option>
                    <option value="DREAM">PROPHETIC DREAM LOG</option>
                    <option value="COVENANT DECREE">COVENANT DECREE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-slate-500 mb-1">
                    Your Confidential Text
                  </label>
                  <textarea
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    placeholder="What has the Spirit whispered? What keys did you unlock today?"
                    className="w-full h-40 p-3 text-xs sm:text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-gold bg-slate-50/50"
                    required
                  />
                </div>

                {journalSaved && (
                  <p className="text-xs text-emerald-600 font-semibold flex items-center font-mono">
                    <CheckCircle className="w-4 h-4 mr-1.5 fill-current" /> Saved in Confidential Log
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-blue-950 hover:bg-brand-blue-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Save Entry
                </button>
              </form>
            </div>

            {/* Journal Timeline Feed (Right - 2 Columns) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="text-xs font-mono font-bold text-slate-500 pl-2">
                HISTORIC JOURNAL TIMELINE ({journals.length})
              </div>

              <div className="space-y-4">
                {journals.map((entry) => (
                  <div key={entry.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-gold-dark"></div>
                    
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-mono font-bold bg-brand-gold/15 text-brand-gold-dark px-2.5 py-0.5 rounded-full uppercase">
                        {entry.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1" /> {entry.dateStr}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-serif whitespace-pre-line">
                      {entry.text}
                    </p>

                    {entry.linkedLessonId && (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-[10px] text-slate-400 font-mono">
                        <BookOpen className="w-3.5 h-3.5 mr-1 text-brand-gold" />
                        Linked to Lesson Study Code: {entry.linkedLessonId}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 4. COUNSELOR CHAT SUB-TAB */}
        {activeCareTab === 'counsel' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Counselor details sidebar (Left - 1 Column) */}
            <div className="space-y-6 h-fit">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                <div className="w-20 h-20 rounded-full border-2 border-brand-gold p-1 mx-auto relative">
                  <img
                    src={sampleCounselors[0].avatar}
                    alt={sampleCounselors[0].name}
                    className="w-full h-full rounded-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 block h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                
                <h3 className="font-serif text-lg font-bold text-brand-blue-950 mt-4">
                  {sampleCounselors[0].name}
                </h3>
                <span className="text-xs text-brand-gold-dark font-semibold font-mono block mt-0.5">
                  Assigned Counseling Minister
                </span>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Sarah carries an apostolic alignment mantle, specializing in deliverance counseling, breaking generational chains, and midnight intercession training.
                </p>

                <div className="mt-6 border-t border-slate-100 pt-4 grid grid-cols-2 gap-2 text-left">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[9px] text-slate-400 font-mono block uppercase">Status</span>
                    <span className="text-[11px] font-bold text-emerald-600 font-sans">{sampleCounselors[0].status}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[9px] text-slate-400 font-mono block uppercase">Response</span>
                    <span className="text-[11px] font-bold text-brand-blue-950 font-sans">{sampleCounselors[0].replyTime}</span>
                  </div>
                </div>
              </div>

              {/* Confidentiality Alert */}
              <div className="bg-brand-blue-900/5 border border-brand-blue-900/20 p-4 rounded-2xl text-xs text-slate-600 flex items-start gap-2.5">
                <Info className="w-5 h-5 text-brand-blue-900 shrink-0 mt-0.5" />
                <p className="leading-normal">
                  All messaging inside the Divine Arsenal Care portal is completely confidential and subject to secure encryption standards.
                </p>
              </div>
            </div>

            {/* Live Chat Pane (Right - 2 Columns) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[550px] overflow-hidden">
              
              {/* Chat Title bar */}
              <div className="bg-brand-blue-950 text-white p-4 border-b border-brand-gold/15 flex justify-between items-center shrink-0">
                <div className="flex items-center space-x-3">
                  <img
                    src={sampleCounselors[0].avatar}
                    alt={sampleCounselors[0].name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-serif text-sm font-bold">{sampleCounselors[0].name}</h4>
                    <span className="text-[9px] text-emerald-400 font-mono font-semibold block">Online Now</span>
                  </div>
                </div>
                
                <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
                  Direct Line Care
                </span>
              </div>

              {/* Message History pane */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                {messages.map((msg) => {
                  const isDaniel = msg.senderId === 'student-1';
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col max-w-[80%] ${
                        isDaniel ? 'ml-auto items-end' : 'mr-auto items-start'
                      }`}
                    >
                      <div className="text-[9px] text-slate-400 font-mono mb-1">
                        {msg.senderName} • {msg.timestamp}
                      </div>
                      <div className={`p-4.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                        isDaniel 
                          ? 'bg-brand-blue-950 text-white rounded-tr-none' 
                          : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message inputs form */}
              <form onSubmit={handleSendChat} className="p-4 bg-white border-t border-slate-200 flex gap-3 shrink-0">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type your message to Sister Sarah..."
                  className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-200 outline-none focus:border-brand-gold"
                />
                
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="px-5 py-3 bg-brand-gold text-brand-blue-950 hover:bg-brand-gold-light disabled:bg-slate-200 disabled:text-slate-400 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center space-x-1 transition-all cursor-pointer"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
