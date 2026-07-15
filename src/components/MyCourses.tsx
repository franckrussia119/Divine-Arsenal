import React, { useState } from 'react';
import { Course } from '../types';

import { BookOpen, Award, CheckCircle, Clock, Play, Sparkles, ChevronRight, Bookmark, ArrowRight, ShieldAlert } from 'lucide-react';

interface MyCoursesProps {
  allCourses: Course[];
  enrolledCourses: Course[];
  onEnroll: (courseId: string) => void;
  onSelectCourse: (course: Course) => void;
  onNavigateToLesson: (courseId: string, lessonId: string) => void;
}

export default function MyCourses({
  enrolledCourses,
  allCourses,
  onEnroll,
  onSelectCourse,
  onNavigateToLesson
}: MyCoursesProps) {
  const [activeSubTab, setActiveSubTab] = useState<'my' | 'all'>('my');
  const [showBillingAlert, setShowBillingAlert] = useState(true);

  // Filter available courses (not in enrolledCourses)
  const availableCourses = allCourses.filter(
    c => !enrolledCourses.some(ec => ec.id === c.id)
  );

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-16" id="my-courses-page">
      
      {/* 1. Header Banner */}
      <div className="bg-brand-blue-950 text-white py-7 sm:py-10 border-b border-brand-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-white">Spiritual Training Academy</h1>
            <p className="text-xs text-slate-300 mt-1">
              "Study to show thyself approved unto God..." — 2 Timothy 2:15
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-brand-gold/15 border border-brand-gold/30 px-4 py-2 rounded-xl text-brand-gold text-xs font-semibold font-mono">
            <Sparkles className="w-4 h-4" />
            <span>ALL-ACCESS SUBSCRIBER</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Subscription Info Banner */}
        {showBillingAlert && (
          <div className="bg-gradient-to-r from-brand-blue-900 to-brand-blue-950 p-4 rounded-2xl border border-brand-gold/20 text-white text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center space-x-3 text-center sm:text-left">
              <span className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold shrink-0">
                ★
              </span>
              <div>
                <span className="font-semibold text-brand-gold">Your Subscription is Active</span>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  All premium courses are completely unlocked under your $15/mo All-Access membership. Next renewal: Aug 1, 2026.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowBillingAlert(false)}
              className="text-[10px] uppercase font-mono text-slate-300 hover:text-white px-2.5 py-1 border border-white/10 hover:border-white/30 rounded cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 mb-8">
          <button
            onClick={() => setActiveSubTab('my')}
            className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'my' 
                ? 'border-brand-gold text-brand-blue-950 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            My Enrolled Academy ({enrolledCourses.length})
          </button>
          <button
            onClick={() => setActiveSubTab('all')}
            className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'all' 
                ? 'border-brand-gold text-brand-blue-950 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            All Available Courses ({allCourses.length})
          </button>
        </div>

        {/* Course Lists */}
        {activeSubTab === 'my' ? (
          <div>
            {enrolledCourses.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center max-w-lg mx-auto mt-8">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-serif text-lg font-bold text-brand-blue-950">No Enrolled Courses</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  You are not enrolled in any courses yet. Browse all available courses to begin your spiritual training journey today!
                </p>
                <button
                  onClick={() => setActiveSubTab('all')}
                  className="mt-6 px-5 py-2.5 bg-brand-gold text-brand-blue-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer"
                >
                  Browse All Courses
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {enrolledCourses.map((course) => {
                  const completedLessons = course.modules.reduce(
                    (acc, mod) => acc + mod.lessons.filter(l => l.completed).length, 0
                  );
                  const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);

                  return (
                    <div 
                      key={course.id}
                      onClick={() => onSelectCourse(course)}
                      className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col group"
                    >
                      <div className="relative h-44 overflow-hidden bg-brand-blue-950">
                        <img
                          src={course.imageUrl}
                          alt={course.title}
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute top-4 right-4 bg-brand-blue-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-semibold text-brand-gold border border-brand-gold/20 font-mono">
                          {course.progress === 100 ? '🎉 COMPLETED' : `${course.progress}% PROGRESS`}
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-brand-gold-dark font-mono font-bold uppercase tracking-widest block mb-1">
                            {course.category}
                          </span>
                          <h3 className="font-serif text-lg font-bold text-brand-blue-950 leading-snug group-hover:text-brand-gold transition-colors mb-2">
                            {course.title}
                          </h3>
                          
                          {/* Progress bar info */}
                          <div className="mt-4 mb-2 flex justify-between items-center text-xs font-semibold font-mono text-slate-500">
                            <span>Progress</span>
                            <span>{completedLessons}/{totalLessons} Lessons Done</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
                            <div 
                              className="bg-brand-gold h-1.5 rounded-full" 
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-mono flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1 text-brand-gold" /> {course.duration}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectCourse(course);
                            }}
                            className="px-4 py-2 bg-brand-blue-950 hover:bg-brand-blue-900 text-white text-xs font-bold rounded-lg uppercase tracking-wider flex items-center cursor-pointer"
                          >
                            <span>{course.progress === 100 ? 'Review Lessons' : 'Resume Course'}</span>
                            <ChevronRight className="w-3.5 h-3.5 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allCourses.map((course) => {
              const isEnrolled = enrolledCourses.some(ec => ec.id === course.id);

              return (
                <div 
                  key={course.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group"
                >
                  <div className="relative h-44 overflow-hidden bg-brand-blue-950">
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute top-4 right-4 bg-brand-blue-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-semibold text-brand-gold border border-brand-gold/20 font-mono">
                      {course.isFree ? 'Free Course' : 'Premium Course'}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-brand-gold-dark font-mono font-bold uppercase tracking-widest block mb-1">
                        {course.category}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-brand-blue-950 leading-snug mb-2">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                        {course.description}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs font-mono text-slate-500">
                        <span className="block font-bold text-brand-blue-950 text-sm">{course.isFree ? 'FREE' : course.price}</span>
                        <span className="block text-[10px] mt-0.5">{course.numLessons} Lessons</span>
                      </div>
                      
                      {isEnrolled ? (
                        <button
                          onClick={() => onSelectCourse(course)}
                          className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg uppercase tracking-wider flex items-center cursor-pointer"
                        >
                          <span>Enrolled (Resume)</span>
                          <CheckCircle className="w-3.5 h-3.5 ml-1 text-emerald-600 fill-current" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onEnroll(course.id)}
                          className="px-4 py-2 bg-brand-gold hover:bg-brand-gold-light text-brand-blue-950 text-xs font-bold rounded-lg uppercase tracking-wider flex items-center shadow cursor-pointer"
                        >
                          <span>Enroll Now</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
