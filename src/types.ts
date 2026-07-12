export type UserRole = 'Visitor' | 'Student' | 'Counselor' | 'Admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  bio: string;
  homeChurch: string;
  joinedDate: string;
  avatar: string;
  streak: number;
  coursesCount: number;
  lessonsCount: number;
  certificatesCount: number;
  prayersCount: number;
  plan: string;
  planPrice: string;
  renewsDate: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoDuration: string;
  completed: boolean;
  videoUrl?: string;
  keyVerse?: string;
  keyVerseRef?: string;
  practices?: string[];
  content?: string;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  numLessons: number;
  duration: string;
  description: string;
  isFree: boolean;
  price?: string;
  imageUrl: string;
  progress: number; // percentage
  modules: CourseModule[];
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  imageUrl: string;
  featured?: boolean;
}

export interface PrayerPoint {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'answered';
  prayingCount: number;
  daysAgo: string;
  dateStr: string;
  testimonyNote?: string;
  userId?: string;
}

export interface JournalEntry {
  id: string;
  text: string;
  category: string; // 'GRATITUDE' | 'REFLECTION' | etc.
  dateStr: string;
  linkedLessonId?: string;
}

export interface Counselor {
  id: string;
  name: string;
  avatar: string;
  status: string; // 'Available now' or replies timeline
  replyTime: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  senderName: string;
}

export interface CommunityComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  content: string;
  dateStr: string;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  likes: number;
  prayerAgreements: number;
  dateStr: string;
  category: 'testimony' | 'prophetic' | 'prayer-alarm' | 'teaching';
  comments: CommunityComment[];
  isLiked?: boolean;
  isAgreed?: boolean;
}

export interface LiveSession {
  id: string;
  title: string;
  hostName: string;
  hostAvatar: string;
  viewerCount: number;
  status: 'live' | 'upcoming';
  scheduledTime?: string;
  category: 'Intercession' | 'Prophetic Word' | 'Teaching Masterclass' | 'Midnight Altar';
}
