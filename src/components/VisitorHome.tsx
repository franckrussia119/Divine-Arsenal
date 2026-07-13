import React, { useState, useEffect } from 'react';

import { Course, BlogPost } from '../types';
import { initialPrayerPoints } from '../data';
import { BookOpen, Sparkles, Flame, Shield, ArrowRight, Heart, Users, MessageSquare, Compass, Play, Calendar, Lock } from 'lucide-react';
import { useTranslation } from '../translations';

interface VisitorHomeProps {
  courses: Course[];
  blogPosts: BlogPost[];
  onSignIn: () => void;
  onSelectCourse: (course: Course) => void;
  onSelectBlogPost: (post: BlogPost) => void;
}

export default function VisitorHome({
  courses,
  blogPosts,
  onSignIn,
  onSelectCourse,
  onSelectBlogPost
}: VisitorHomeProps) {
  const { lang, t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'Spiritual Warfare' | 'Fasting & Discipleship'>('all');

  const heroBackgrounds = [
    'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1600',
    'https://images.unsplash.com/photo-1476231682828-37e571bc172f?auto=format&fit=crop&q=80&w=1600',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1600',
  ];
  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroBackgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);


  const filteredCourses = selectedCategory === 'all'
    ? courses
    : courses.filter(c => c.category === selectedCategory);

  const featuredPost = blogPosts.find(p => p.featured) || blogPosts[0];
  const regularPosts = featuredPost ? blogPosts.filter(p => p.id !== featuredPost.id).slice(0, 2) : [];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800" id="visitor-home-page">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-brand-blue-950 text-white py-20 lg:py-32 border-b border-brand-gold/30">
        {/* Sliding background photos */}
        <div className="absolute inset-0">
          {heroBackgrounds.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              aria-hidden="true"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                i === heroSlide ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          {/* Darken photos so text stays readable, and keep the brand tint */}
          <div className="absolute inset-0 bg-brand-blue-950/80"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.15)_0,transparent_100%)]"></div>
        </div>

        {/* Slide indicator dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {heroBackgrounds.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroSlide(i)}
              aria-label={`Show background ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === heroSlide ? 'bg-brand-gold w-6' : 'bg-white/30'}`}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/95 shadow-xl shadow-black/20 flex items-center justify-center p-2.5">
              <img src="/logo.png" alt="Divine Arsenal" className="w-full h-full object-contain" />
            </div>

            <div className="inline-flex items-center space-x-2 bg-brand-gold/15 border border-brand-gold/30 px-3.5 py-1.5 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-brand-gold animate-pulse" />
              <span className="text-xs uppercase tracking-widest text-brand-gold font-semibold font-mono">
                {t('visitorHeroTag')}
              </span>
            </div>
            
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-none text-white mb-6">
              {t('visitorHeroTitle')}
            </h1>
            
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mb-10 font-sans">
              {t('visitorHeroSub')}
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={onSignIn}
                className="w-full sm:w-auto px-8 py-4 bg-brand-gold hover:bg-brand-gold-light text-brand-blue-950 font-bold tracking-wider rounded-xl shadow-lg shadow-brand-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2 group cursor-pointer"
                id="hero-cta-primary"
              >
                <span>{lang === 'fr' ? 'COMMENCER GRATUITEMENT' : 'GET STARTED FREE'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <a
                href="#courses-section"
                className="w-full sm:w-auto px-8 py-4 bg-brand-blue-900/60 hover:bg-brand-blue-900 text-white font-semibold rounded-xl border border-white/10 hover:border-white/30 transition-all duration-200 text-center block cursor-pointer"
                id="hero-cta-secondary"
              >
                {lang === 'fr' ? 'Parcourir les Cours' : 'Browse Curriculum'}
              </a>
            </div>
          </div>
        </div>

        {/* 2. Stat Ribbons */}
        <div className="mt-16 border-t border-white/5 bg-brand-blue-950/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="font-serif text-3xl sm:text-4xl text-brand-gold font-bold">15,000+</div>
                <div className="text-xs text-slate-300 uppercase tracking-widest font-mono mt-1">
                  {lang === 'fr' ? 'Croyants Inscrits' : 'Believers Enrolled'}
                </div>
              </div>
              <div>
                <div className="font-serif text-3xl sm:text-4xl text-brand-gold font-bold">4.9/5</div>
                <div className="text-xs text-slate-300 uppercase tracking-widest font-mono mt-1">
                  {lang === 'fr' ? 'Satisfaction des Cours' : 'Course Satisfaction'}
                </div>
              </div>
              <div>
                <div className="font-serif text-3xl sm:text-4xl text-brand-gold font-bold">120+</div>
                <div className="text-xs text-slate-300 uppercase tracking-widest font-mono mt-1">
                  {lang === 'fr' ? "Témoignages d'Exaucement" : 'Answered Testimonies'}
                </div>
              </div>
              <div>
                <div className="font-serif text-3xl sm:text-4xl text-brand-gold font-bold">24/7</div>
                <div className="text-xs text-slate-300 uppercase tracking-widest font-mono mt-1">
                  {lang === 'fr' ? "Équipes d'Intercession" : 'Intercession Teams'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Direct feed of teachings, moved up so visitors see real content immediately */}
      <section className="py-20 bg-white" id="teachings-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-gold uppercase tracking-widest font-mono">
              The Written word
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-brand-blue-950 font-bold mt-2 mb-4">
              The Living Teachings & Blog
            </h2>
            <p className="text-slate-600">
              No login or account needed. Our blog serves as anointed fuel for your growth, loaded with biblical models, declarations, and templates.
            </p>
          </div>

          {featuredPost ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Featured Post Card (Span 2) */}
            <div 
              onClick={() => onSelectBlogPost(featuredPost)}
              className="lg:col-span-2 bg-brand-blue-950 text-white rounded-3xl overflow-hidden border border-brand-gold/20 flex flex-col md:flex-row hover:shadow-2xl transition-all duration-300 cursor-pointer group"
            >
              <div className="md:w-1/2 relative min-h-64 md:min-h-full">
                <img
                  src={featuredPost.imageUrl}
                  alt={featuredPost.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-102 transition-transform duration-300"
                />
                <span className="absolute top-6 left-6 bg-brand-gold text-brand-blue-950 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase">
                  Featured Teaching
                </span>
              </div>
              <div className="md:w-1/2 p-8 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-brand-gold uppercase tracking-widest font-semibold block mb-2">
                    Category: {featuredPost.category}
                  </span>
                  <h3 className="font-serif text-2xl font-bold leading-tight mb-4 group-hover:text-brand-gold transition-colors">
                    {featuredPost.title}
                  </h3>
                  <p className="text-sm text-slate-300 line-clamp-4 leading-relaxed mb-6">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-4 border-t border-white/10">
                  <div>
                    <span className="block text-white font-serif text-sm">{featuredPost.author}</span>
                    <span className="text-[10px] text-brand-gold font-sans">{featuredPost.authorRole}</span>
                  </div>
                  <span>{featuredPost.readTime}</span>
                </div>
              </div>
            </div>

            {/* Regular Post Teasers (Stack 2) */}
            <div className="space-y-6 flex flex-col justify-between">
              {regularPosts.map((post) => (
                <div 
                  key={post.id}
                  onClick={() => onSelectBlogPost(post)}
                  className="bg-slate-50 hover:bg-slate-100 p-6 rounded-2xl border border-slate-200 cursor-pointer transition-all duration-200 group flex-1 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-mono text-brand-gold-dark font-bold uppercase tracking-widest block mb-2">
                      {post.category} — {post.date}
                    </span>
                    <h4 className="font-serif text-lg font-bold text-brand-blue-950 leading-snug group-hover:text-brand-gold-dark transition-colors mb-2 line-clamp-2">
                      {post.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-200/60 font-mono">
                    <span className="font-serif font-semibold text-slate-800">{post.author}</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
          ) : (
            <div className="text-center py-12 px-6 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-sm text-slate-500">No teachings have been published yet — check back soon.</p>
            </div>
          )}

          {/* CTA prompting user to login/sign up */}
          <div className="mt-12 bg-gradient-to-r from-brand-blue-950 to-brand-blue-900 rounded-2xl p-6 sm:p-8 border border-brand-gold/20 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <h3 className="font-serif text-xl sm:text-2xl text-brand-gold font-bold">
                Ready to turn these teachings into habit?
              </h3>
              <p className="text-sm text-slate-300 mt-1">
                Create a student profile to save study progress, track scripture logs, and receive personal counsel.
              </p>
            </div>
            <button
              onClick={onSignIn}
              className="px-6 py-3 bg-brand-gold hover:bg-brand-gold-light text-brand-blue-950 font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-brand-gold/10 transition-all duration-200 whitespace-nowrap cursor-pointer"
            >
              CREATE A STUDENT PROFILE
            </button>
          </div>

        </div>
      </section>

      {/* 3. Core Modules Value Pitch (The 3 Pillars) */}
      <section className="py-20 bg-white" id="three-pillars-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl text-brand-blue-950 font-bold mb-4">
              {lang === 'fr' ? 'Conçu pour une Transformation Spirituelle Profonde' : 'Designed for Deep Spiritual Transformation'}
            </h2>
            <p className="text-slate-600">
              {lang === 'fr' ? 'Le Divine Arsenal est plus qu\'une plateforme d\'apprentissage. C\'est un sanctuaire numérique robuste fondé sur trois piliers de croissance spirituelle.' : 'The Divine Arsenal is more than a learning platform. It is a robust digital sanctuary built upon three core pillars of Christian growth.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Pillar 1 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-brand-blue-900/10 flex items-center justify-center text-brand-blue-900 mb-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-brand-blue-950 mb-3">
                {lang === 'fr' ? '1. Formations et Cours' : '1. Training & Courses'}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {lang === 'fr' ? 'Des modules structurés avec des leçons vidéo haute définition, des fiches d\'écritures et des devoirs pratiques.' : 'Structured modules with high-definition video lessons, scripture sheets, and practical assignments. Complete assessments to earn authenticated spiritual growth certificates.'}
              </p>
              <span className="text-xs text-brand-gold font-bold uppercase tracking-wider font-mono">
                {lang === 'fr' ? 'Niveaux Gratuits & Premium' : 'Free & Premium Tiers'}
              </span>
            </div>

            {/* Pillar 2 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-brand-gold/25 flex items-center justify-center text-brand-blue-950 mb-6">
                <Flame className="w-6 h-6 text-brand-gold-dark" />
              </div>
              <h3 className="font-serif text-xl font-bold text-brand-blue-950 mb-3">
                {lang === 'fr' ? '2. Enseignements & Directives' : '2. Living Teachings & Blog'}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {lang === 'fr' ? 'Plongez dans le combat spirituel de minuit et les structures d\'autels familiaux avec des articles oints remplis d\'écritures.' : 'Deep dives into territorial warfare, midnight intercession watches, and family altar structures. Fresh, anointed articles loaded with biblical references and strategic actions.'}
              </p>
              <span className="text-xs text-brand-gold font-bold uppercase tracking-wider font-mono">
                {lang === 'fr' ? '100% Gratuit & Ouvert' : '100% Free & Searchable'}
              </span>
            </div>

            {/* Pillar 3 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-brand-blue-900/10 flex items-center justify-center text-brand-blue-900 mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-brand-blue-950 mb-3">
                {lang === 'fr' ? "3. Accompagnement Personnel" : "3. Personal Care Layer"}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {lang === 'fr' ? "Un sanctuaire privé avec un tableau de prière interactif, un journal d'écriture intime, et un chat direct avec des conseillers spirituels oints." : "A private sanctuary with an interactive prayer board (to mark items answered) and private spiritual journaling, directly backed by a direct counselor chat system."}
              </p>
              <span className="text-xs text-brand-gold font-bold uppercase tracking-wider font-mono">
                {lang === 'fr' ? "Chiffré & Confidentiel" : "Encrypted & Confidential"}
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Interactive Courses Preview */}
      <section className="py-20 bg-slate-100" id="courses-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl text-brand-blue-950 font-bold mb-3">
                {lang === 'fr' ? "Débloquez des Parcours d'Apprentissage Oints" : "Unlock Anointed Learning Paths"}
              </h2>
              <p className="text-slate-600 max-w-xl">
                {lang === 'fr' ? "Que vous soyez un débutant cherchant des fondements solides ou un intercesseur chevronné visant le combat spirituel stratégique." : "Whether you are a beginner looking for core foundations or a seasoned intercessor aiming for strategic spiritual warfare, we have a pathway for you."}
              </p>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex items-center mt-6 md:mt-0 space-x-2 bg-white p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  selectedCategory === 'all' ? 'bg-brand-blue-950 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'fr' ? "Tous les Cours" : "All Courses"}
              </button>
              <button
                onClick={() => setSelectedCategory('Spiritual Warfare')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  selectedCategory === 'Spiritual Warfare' ? 'bg-brand-blue-950 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'fr' ? "Combat" : "Warfare"}
              </button>
              <button
                onClick={() => setSelectedCategory('Fasting & Discipleship')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  selectedCategory === 'Fasting & Discipleship' ? 'bg-brand-blue-950 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'fr' ? "Jeûne" : "Fasting"}
              </button>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredCourses.map((course) => (
              <div 
                key={course.id} 
                onClick={() => onSelectCourse(course)}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col group"
              >
                <div className="relative h-48 overflow-hidden bg-brand-blue-950">
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-brand-blue-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-semibold text-brand-gold font-mono uppercase tracking-widest border border-brand-gold/30">
                    {course.isFree ? 'Free Access' : 'Premium'}
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block mb-1">
                      {course.category}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-brand-blue-950 leading-snug group-hover:text-brand-gold-dark transition-colors mb-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-3 mb-4">
                      {course.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span className="flex items-center">
                      <BookOpen className="w-3.5 h-3.5 mr-1 text-brand-gold" />
                      {course.numLessons} Lessons
                    </span>
                    <span className="font-bold text-brand-blue-950 text-sm">
                      {course.isFree ? 'FREE' : course.price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Living Teachings (Blog Section) */}

      {/* 6. Dynamic Prayer Wall Peek */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            
            <div className="lg:col-span-1">
              <span className="text-xs font-mono font-bold text-brand-gold-dark uppercase tracking-widest block mb-1">
                The Care Layer
              </span>
              <h2 className="font-serif text-3xl text-brand-blue-950 font-bold mb-4 leading-tight">
                An Active Prayer Shield For Every Battle
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Your spiritual journey shouldn't be lonely. Through the Care Layer, students publish active prayer shields, share direct testimonies, and communicate confidentially with anointed counseling ministers.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-5 h-5 rounded bg-brand-gold/20 flex items-center justify-center text-brand-gold-dark mr-3 mt-1 shrink-0">
                    <span className="text-xs">✔</span>
                  </div>
                  <span className="text-xs text-slate-700">Add requests privately or publish to the community shield.</span>
                </div>
                <div className="flex items-start">
                  <div className="w-5 h-5 rounded bg-brand-gold/20 flex items-center justify-center text-brand-gold-dark mr-3 mt-1 shrink-0">
                    <span className="text-xs">✔</span>
                  </div>
                  <span className="text-xs text-slate-700">Mark prayers as "answered" to inspire other intercessors.</span>
                </div>
                <div className="flex items-start">
                  <div className="w-5 h-5 rounded bg-brand-gold/20 flex items-center justify-center text-brand-gold-dark mr-3 mt-1 shrink-0">
                    <span className="text-xs">✔</span>
                  </div>
                  <span className="text-xs text-slate-700">Receive custom spiritual directives and prophetic advice.</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="text-xs uppercase tracking-widest text-slate-400 font-bold font-mono pl-2 flex justify-between items-center">
                <span>Active Intercessions</span>
                <span className="text-brand-gold-dark">Live Wall</span>
              </div>
              
              {initialPrayerPoints.map((p) => (
                <div key={p.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase tracking-wider ${
                        p.status === 'answered' ? 'bg-emerald-100 text-emerald-800' : 'bg-brand-gold/20 text-brand-gold-dark'
                      }`}>
                        {p.status === 'answered' ? 'Answered Testimony' : 'Active Intercession'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{p.daysAgo}</span>
                    </div>
                    <h4 className="font-serif text-sm font-bold text-brand-blue-950 mt-1">{p.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{p.description}</p>
                    {p.testimonyNote && (
                      <p className="text-xs text-emerald-600 font-medium mt-1 font-mono">{p.testimonyNote}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3 shrink-0">
                    <span className="text-xs text-slate-400 font-mono">
                      <strong>{p.prayingCount}</strong> interceding
                    </span>
                    <button 
                      onClick={onSignIn}
                      className="px-3.5 py-1.5 bg-brand-blue-950 hover:bg-brand-blue-900 text-white text-[11px] font-bold rounded-lg uppercase tracking-wider whitespace-nowrap cursor-pointer"
                    >
                      Intercede
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 7. Footer / Closing Pitch */}
      <footer className="bg-brand-blue-950 text-slate-300 py-16 border-t border-brand-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-brand-gold/15 flex items-center justify-center border border-brand-gold/40">
              <Shield className="w-6 h-6 text-brand-gold" />
            </div>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-white font-bold tracking-tight mb-4">
            Build Your Spiritual Arsenal Today
          </h2>
          <p className="text-sm max-w-xl mx-auto mb-8">
            Access immediate breakthrough. Establish structures of prayer, learn from seasoned global pastors, and find complete accountability.
          </p>
          <button
            onClick={onSignIn}
            className="px-8 py-3.5 bg-brand-gold hover:bg-brand-gold-light text-brand-blue-950 font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-brand-gold/25 transition-all duration-200 cursor-pointer"
          >
            Create Your Account
          </button>
          
          <div className="mt-12 pt-8 border-t border-white/5 text-[11px] font-mono text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span>© 2026 Divine Arsenal. All covenant rights reserved.</span>
            <div className="flex space-x-4">
              <span>Equipping Believers Globally</span>
              <span>•</span>
              <span>Anointed Teachings</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
