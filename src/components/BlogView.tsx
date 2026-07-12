import React, { useState } from 'react';

import { BlogPost } from '../types';
import { Search, ChevronRight, Compass, Calendar, Clock, X, Sparkles, BookOpen, Heart } from 'lucide-react';

interface BlogViewProps {
  posts: BlogPost[];
  onSelectPost: (post: BlogPost) => void;
  selectedPost: BlogPost | null;
  onClosePost: () => void;
  onSignIn: () => void;
}

export default function BlogView({
  posts,
  onSelectPost,
  selectedPost,
  onClosePost,
  onSignIn
}: BlogViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['all', 'faith', 'prayer', 'family', 'leadership'];

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = posts.find(p => p.featured) || posts[0];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-16" id="blog-teachings-page">
      
      {/* 1. Header Hero Banner */}
      <div className="bg-brand-blue-950 text-white py-12 border-b border-brand-gold/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-gold/5 blur-3xl rounded-full"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="text-[10px] text-brand-gold font-mono uppercase tracking-widest font-bold">
            The Living Word Portal
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold mt-2">Teachings & spiritual Fuel</h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto mt-2 leading-relaxed">
            Unpack biblical templates, strategic intercessions, and leadership structures. Open to all believers globally.
          </p>

          {/* Search bar inside header */}
          <div className="max-w-md mx-auto mt-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teachings, scriptures, altars..."
              className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm text-slate-900 bg-white rounded-xl shadow-lg border border-slate-200 focus:border-brand-gold focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Category Pill Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 scrollbar-none mb-8 border-b border-slate-200">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4.5 py-2 text-xs font-semibold rounded-full capitalize whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-brand-blue-950 text-white shadow shadow-brand-blue-950/20' 
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Teachings' : cat}
            </button>
          ))}
        </div>

        {/* Blog Content List */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center max-w-md mx-auto border border-slate-200">
            <p className="text-sm text-slate-500">No blog posts found matching your search query.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="mt-4 px-4 py-2 bg-brand-blue-950 text-white text-xs font-bold rounded-lg uppercase cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <div 
                key={post.id}
                onClick={() => onSelectPost(post)}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col group"
              >
                <div className="relative h-48 overflow-hidden bg-brand-blue-950">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover opacity-85 group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-brand-blue-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-semibold text-brand-gold border border-brand-gold/20 font-mono uppercase">
                    {post.category}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center text-[10px] text-slate-400 font-mono mb-2">
                      <Calendar className="w-3.5 h-3.5 mr-1" /> {post.date}
                      <span className="mx-2">•</span>
                      <Clock className="w-3.5 h-3.5 mr-1" /> {post.readTime}
                    </div>
                    
                    <h3 className="font-serif text-lg font-bold text-brand-blue-950 group-hover:text-brand-gold-dark transition-colors mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="block font-serif font-bold text-slate-800">{post.author}</span>
                      <span className="block text-[10px] text-brand-gold-dark font-sans">{post.authorRole}</span>
                    </div>
                    
                    <span className="text-brand-blue-950 hover:text-brand-gold font-bold flex items-center">
                      Read <ChevronRight className="w-4 h-4 ml-0.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* 2. Full Article Overlay Reader Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-brand-blue-950/80 backdrop-blur-sm flex justify-center items-start overflow-y-auto p-4 sm:p-6 md:p-10">
          <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border border-brand-gold/15 relative my-4 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Close button */}
            <button
              onClick={onClosePost}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full transition-all duration-150 z-20 cursor-pointer"
              title="Close article"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Banner block */}
            <div className="relative h-64 sm:h-80 bg-brand-blue-950">
              <img
                src={selectedPost.imageUrl}
                alt={selectedPost.title}
                className="w-full h-full object-cover opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-blue-950 via-brand-blue-950/40 to-transparent"></div>
              
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="bg-brand-gold text-brand-blue-950 text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  Category: {selectedPost.category}
                </span>
                
                <h1 className="font-serif text-2xl sm:text-3xl font-bold mt-3 leading-tight">
                  {selectedPost.title}
                </h1>
              </div>
            </div>

            {/* Post details */}
            <div className="p-6 sm:p-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 text-xs text-slate-500 font-mono mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-brand-gold/15 flex items-center justify-center font-serif text-brand-blue-950 font-bold border border-brand-gold/30">
                    {selectedPost.author.charAt(0)}
                  </div>
                  <div>
                    <span className="block font-bold text-slate-800">{selectedPost.author}</span>
                    <span className="block text-[10px] text-brand-gold-dark font-sans">{selectedPost.authorRole}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span>Published: {selectedPost.date}</span>
                  <span>•</span>
                  <span>{selectedPost.readTime}</span>
                </div>
              </div>

              {/* Parsed blog text content */}
              <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4 font-sans">
                {selectedPost.content.split('\n\n').map((paragraph, index) => {
                  if (paragraph.startsWith('###')) {
                    return (
                      <h3 key={index} className="font-serif font-bold text-lg sm:text-xl text-brand-blue-950 mt-6 mb-3">
                        {paragraph.replace('###', '').trim()}
                      </h3>
                    );
                  }
                  if (paragraph.startsWith('-')) {
                    return (
                      <ul key={index} className="list-disc pl-5 space-y-1.5 my-3 text-sm">
                        {paragraph.split('\n').map((item, idx) => (
                          <li key={idx}>{item.replace('-', '').trim()}</li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p key={index} className="leading-relaxed">
                      {paragraph}
                    </p>
                  );
                })}
              </div>

              {/* End of article spiritual CTA */}
              <div className="mt-10 bg-slate-50 border border-brand-gold/25 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h4 className="font-serif font-bold text-brand-blue-950">
                    Has this teaching anointed your path?
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Sign in to join a course cohort, maintain a daily devotion streak, and message Sarah Nkosi.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClosePost();
                    onSignIn();
                  }}
                  className="px-5 py-2.5 bg-brand-gold hover:bg-brand-gold-light text-brand-blue-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer whitespace-nowrap"
                >
                  Create Student Profile
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
