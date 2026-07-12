import { Course, BlogPost, PrayerPoint, JournalEntry, Counselor, Message, UserProfile } from './types';

export const initialProfile: UserProfile = {
  id: 'student-1',
  name: 'Daniel Okafor',
  email: 'daniel.okafor@divinearsenal.org',
  phone: '+234 812 345 6789',
  role: 'Student',
  bio: 'Seeking to walk in the fullness of apostolic authority and build a disciplined life of prayer.',
  homeChurch: 'Covenant Chapel, Lagos',
  joinedDate: 'Joined Nov 2024',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150',
  streak: 12,
  coursesCount: 2,
  lessonsCount: 8,
  certificatesCount: 1,
  prayersCount: 4,
  plan: 'All-Access Member',
  planPrice: '$15 / month',
  renewsDate: 'Aug 1, 2026'
};

export const sampleCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Strategic Prayer & Spiritual Warfare',
    subtitle: 'Master the art of intercession and tear down strongholds',
    category: 'Spiritual Warfare',
    numLessons: 12,
    duration: '6 hours',
    description: 'Learn the systemic strategies of prayer, understanding divine courtrooms, territorial spirits, and the power of anointed decrees to manifest breakthrough.',
    isFree: false,
    price: '$29',
    imageUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=800',
    progress: 45,
    modules: [
      {
        id: 'mod-1-1',
        title: 'Module 1: The Foundations of Spiritual Authority',
        lessons: [
          {
            id: 'lesson-1-1',
            title: '1. Understanding Your Position in Christ',
            duration: '22 mins',
            videoDuration: '22:15',
            completed: true,
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            keyVerse: 'Ephesians 2:6 - "And God raised us up with Christ and seated us with him in the heavenly realms in Christ Jesus."',
            keyVerseRef: 'Ephesians 2:6',
            practices: [
              'Spend 10 minutes in silence declaring your positioning in the heavenly realms.',
              'Write down three fears and replace them with scriptures of authority.'
            ],
            content: 'Spiritual authority is not based on feeling, emotion, or personal holiness. It is based entirely on your positioning. When you understand that you are seated at the right hand of the Father, your prayer style changes from begging to decreeing.'
          },
          {
            id: 'lesson-1-2',
            title: '2. The Legal Framework of Prayer & Decrees',
            duration: '18 mins',
            videoDuration: '18:40',
            completed: true,
            videoUrl: 'https://www.w3schools.com/html/movie.mp4',
            keyVerse: 'Job 22:28 - "You will also declare a thing, and it will be established for you; so light will shine on your ways."',
            keyVerseRef: 'Job 22:28',
            practices: [
              'Read Leviticus 26 and write down your covenant rights.',
              'Create a prayer decree regarding your family protection.'
            ],
            content: 'Prayer is a legal transaction in the spiritual realm. In the courtrooms of heaven, Jesus is our Advocate, and Satan is the accuser. When we petition, we present legislative arguments based on God\'s Word and the Blood of Jesus.'
          },
          {
            id: 'lesson-1-3',
            title: '3. Activating the Armor of God Daily',
            duration: '25 mins',
            videoDuration: '25:10',
            completed: false,
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            keyVerse: 'Ephesians 6:11 - "Put on the full armor of God, so that you can take your stand against the devil\'s schemes."',
            keyVerseRef: 'Ephesians 6:11',
            practices: [
              'Go through each piece of armor in prayer tomorrow morning.',
              'Evaluate which piece of your armor has been vulnerable lately.'
            ],
            content: 'The armor of God is not metaphorical imagery; it represents real spiritual garments of light. Putting on the helmet of salvation protects your thought patterns, while the shield of faith extinguishes specific fiery darts of doubt.'
          }
        ]
      },
      {
        id: 'mod-1-2',
        title: 'Module 2: Territorial Warfare and Strongholds',
        lessons: [
          {
            id: 'lesson-1-4',
            title: '4. Discerning Territorial Strongholds',
            duration: '30 mins',
            videoDuration: '30:05',
            completed: false,
            videoUrl: 'https://www.w3schools.com/html/movie.mp4',
            keyVerse: '2 Corinthians 10:4 - "The weapons we fight with are not the weapons of the world. On the contrary, they have divine power to demolish strongholds."',
            keyVerseRef: '2 Corinthians 10:4',
            practices: [
              'Map out the spiritual patterns of your local city or neighborhood.',
              'Identify the prominent spiritual strongholds in your family line.'
            ],
            content: 'Cities and nations are influenced by specific ruling principalities. Recognizing patterns of greed, depression, or rebellion in a geographical area helps target intercession directly at the roots rather than fighting symptoms.'
          },
          {
            id: 'lesson-1-5',
            title: '5. Fasting as a Catalyst for Deliverance',
            duration: '20 mins',
            videoDuration: '20:15',
            completed: false,
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            keyVerse: 'Isaiah 58:6 - "Is not this the kind of fasting I have chosen: to loose the chains of injustice and untie the cords of the yoke, to set the oppressed free?"',
            keyVerseRef: 'Isaiah 58:6',
            practices: [
              'Plan a 24-hour fast focused purely on breakthrough in one stubborn area.',
              'Drink sufficient water and replace meal times with scripture reading.'
            ],
            content: 'Fasting does not change God; it changes us. It subdues the fleshly desires and tunes our spiritual antennae to hear clearly from the Holy Spirit. Stubborn situations yield when backed by prayer and fasting.'
          }
        ]
      }
    ]
  },
  {
    id: 'course-2',
    title: 'The Daniel Covenant: Fasting & Focus',
    subtitle: 'Unlock deeper communion and prophetic clarity through disciplined fasting',
    category: 'Fasting & Discipleship',
    numLessons: 6,
    duration: '3 hours',
    description: 'Walk step-by-step through the 21-day Daniel Fast. Learn the spiritual protocols of continuous focus, prophetic interpretation, and dream discernment.',
    isFree: false,
    price: '$19',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
    progress: 100,
    modules: [
      {
        id: 'mod-2-1',
        title: 'Module 1: Prophetic Alignment',
        lessons: [
          {
            id: 'lesson-2-1',
            title: '1. Setting the Heart to Understand',
            duration: '25 mins',
            videoDuration: '25:00',
            completed: true,
            videoUrl: 'https://www.w3schools.com/html/movie.mp4',
            keyVerse: 'Daniel 10:12 - "Do not be afraid, Daniel. Since the first day that you set your mind to gain understanding and to humble yourself before your God, your words were heard."',
            keyVerseRef: 'Daniel 10:12',
            practices: [
              'Journal your objective goals for your next fast.',
              'Humble yourself and yield expectations.'
            ],
            content: 'The power of Daniel\'s fast was not the dietary restriction, but the setting of his heart. Breakthrough begins the very first second you humble your soul in prayer.'
          },
          {
            id: 'lesson-2-2',
            title: '2. Sound of Breakthrough in the Heavens',
            duration: '25 mins',
            videoDuration: '25:00',
            completed: true,
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            keyVerse: 'Daniel 10:13 - "But the prince of the Persian kingdom resisted me twenty-one days. Then Michael, one of the chief princes, came to help me..."',
            keyVerseRef: 'Daniel 10:13',
            practices: [
              'Continue standing in prayer even when you see no immediate answer.',
              'Praise God in advance for victory.'
            ],
            content: 'Understand that delays in prayers are not denials. The spiritual resistance in territorial spaces is active, but your persistence recruits angelic enforcement to release your answers.'
          }
        ]
      }
    ]
  },
  {
    id: 'course-3',
    title: 'Spiritual Warfare & Discernment',
    subtitle: 'Learn to distinguish the voices of spirits, angels, and the Holy Ghost',
    category: 'Discernment',
    numLessons: 10,
    duration: '5 hours',
    description: 'An advanced curriculum on developing a sensitive spirit, interpreting dreams, discerning spiritual atmospheres, and casting out negative spiritual entities.',
    isFree: false,
    price: '$35',
    imageUrl: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&q=80&w=800',
    progress: 0,
    modules: [
      {
        id: 'mod-3-1',
        title: 'Module 1: Spiritual Atmospheres',
        lessons: [
          {
            id: 'lesson-3-1',
            title: '1. Sensing the Spiritual Climate',
            duration: '30 mins',
            videoDuration: '30:00',
            completed: false,
            keyVerse: 'Hebrews 5:14 - "But solid food is for the mature, who by constant use have trained themselves to distinguish good from evil."',
            keyVerseRef: 'Hebrews 5:14'
          }
        ]
      }
    ]
  },
  {
    id: 'course-4',
    title: 'Foundations of Anointed Faith',
    subtitle: 'The fundamental spiritual protocols for every believer',
    category: 'Foundations',
    numLessons: 8,
    duration: '4 hours',
    description: 'A completely free starter course to solidify your covenant, master prayer devotionals, understand scriptural validation, and speak in heavenly tongues.',
    isFree: true,
    price: 'Free',
    imageUrl: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=800',
    progress: 0,
    modules: [
      {
        id: 'mod-4-1',
        title: 'Module 1: Salvation & Covenant',
        lessons: [
          {
            id: 'lesson-4-1',
            title: '1. The New Creation Realities',
            duration: '20 mins',
            videoDuration: '20:00',
            completed: false,
            keyVerse: '2 Corinthians 5:17 - "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!"',
            keyVerseRef: '2 Corinthians 5:17'
          }
        ]
      }
    ]
  }
];

export const sampleBlogPosts: BlogPost[] = [
  {
    id: 'post-1',
    title: 'Understanding Spiritual Resistance and Territoral Altars',
    category: 'faith',
    excerpt: 'Have you ever felt a heavy blanket of discouragement the moment you attempt to pray? Discover the physics of the spiritual realm and how territorial altars function.',
    content: `Many believers suffer from invisible limits, not due to lack of faith or effort, but because they are operating in geographic atmospheres dominated by un-demolished altars. 

### What is a Spiritual Altar?
An altar is a designated portal of communication between the physical and the spiritual realm. Altars are built by sacrifice and maintained through continuous devotion. There are positive covenant altars (like the ones built by Abraham) and negative idolatrous altars (like the altars of Baal).

### Why Geographic Climates Resist You
In Judges 6, we see Gideon living in defeat. God did not send Gideon to fight the Midianites first; instead, his primary instruction was to **tear down his father's altar of Baal**. Gideon had to replace it with an altar to Yahweh.
If your city is marked by blood sacrifices, historical greed, or severe corruption, there are invisible territorial grids that actively broadcast discouragement, heavy sleepiness, and confusion whenever prayer fires are lit.

### Three Steps to Overthrow Territorial Resistance:
1. **Targeted Scriptural Intercession**: Do not spray generic prayers. Pray scriptures targeting the principalities of that city (e.g., Psalm 24: "Lift up your heads, O ye gates!").
2. **Sacrificial Devotion**: Tearing down structural altars requires establishing a stronger, constant fire of morning and midnight intercession.
3. **Covenant Giving**: Releasing seeds and tithes establishes an economic portal that breaks the spirit of lack and territorial bondage.

*Read this, absorb it, and declare over your house: 'No strange altar will swallow my voice!'*`,
    author: 'Pastor Joel Adeleke',
    authorRole: 'Founder, Arsenal Global Network',
    date: 'Jul 4, 2026',
    readTime: '6 min read',
    imageUrl: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&q=80&w=600',
    featured: true
  },
  {
    id: 'post-2',
    title: 'The Prophetic Significance of the Midnight Watch',
    category: 'prayer',
    excerpt: 'Why did the walls of Jericho fall? Why did Paul and Silas pray at midnight? Unpack the deep authority hidden between 12 AM and 3 AM.',
    content: `The hours between midnight and 3:00 AM are the most critical spiritual windows of the entire day. In almost every major biblical breakthrough or judgment, the midnight hour was the trigger.

### The Physics of the Midnight Watch
During the day, physical activity and ambient noise occupy the airwaves. At night, the physical world sleeps, and spiritual entities (both light and dark) mobilize.
- **The Passover Judgment**: Exodus 12:29 - "At midnight the Lord struck down all the firstborn in Egypt..."
- **Deliverance of Apostles**: Acts 16:25 - "About midnight Paul and Silas were praying and singing hymns to God, and the other prisoners were listening to them. Suddenly there was such a violent earthquake..."

### Why You Must Stand Guard
Midnight is when covenants are renewed in dark covens. If you sleep through the midnight hour consistently, you suffer from the effects of arrows flying by night (Psalm 91:5). By training yourself to arise for even 30 minutes at midnight, you:
1. Set the pace of the day before anyone else wakes up.
2. Intercept witchcraft attacks and scatter legal spiritual claims against your family.
3. Secure immediate angelic answers to prayers that are resisted during daytime.

Begin tonight by setting your alarm for 12:00 AM. Sing three songs of adoration, read two chapters of Psalms aloud, and decree victory over your morning.`,
    author: 'Evangelist Sarah Nkosi',
    authorRole: 'Head of Counseling, Divine Arsenal',
    date: 'Jul 1, 2026',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'post-3',
    title: 'Nurturing Spiritual Intimacy in a Chaotic Home',
    category: 'family',
    excerpt: 'Spiritual growth does not require a remote monastery. How to build a persistent family altar amidst diapers, school schedules, and modern work stress.',
    content: `It is easy to be holy in a isolated prayer tower, but the true test of your spiritual stature is how you maintain the fire of Christ in the middle of domestic chaos.

### The Domestic Altar
Deuteronomy 6:7 commands: "Impress them on your children. Talk about them when you sit at home and when you walk along the road..." Your children\'s primary spiritual mentor is not their Sunday school teacher; it is you.

### Practical Family Protocols:
- **The 10-Minute Huddle**: Start every morning with a high-energy scripture declaration and 3 minutes of singing together before school.
- **No-Phone Zones during Meals**: Establish the dining table as a sanctuary of fellowship where testimony and gratitude are spoken.
- **Atmospheric Worship**: Play soft instrumental worship throughout the house. It completely alters the atmospheric peace, driving out irritation and contention.`,
    author: 'Pastor Joel Adeleke',
    authorRole: 'Founder, Arsenal Global Network',
    date: 'Jun 28, 2026',
    readTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1473643080040-6459ed1149b5?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'post-4',
    title: 'Leadership Lessons from the Life of Nehemiah',
    category: 'leadership',
    excerpt: 'Rebuilding broken walls requires equal parts spiritual alignment and administrative genius. Discover Nehemiah\'s secret framework for resilient project leadership.',
    content: `Nehemiah succeeded not just because he fasted and wept, but because he knew how to organize people, handle active opposition, and build physical infrastructure securely.

### The Double-Handed Protocol
Nehemiah 4:17 says: "Those who carried materials did their work with one hand and held a weapon in the other."
True leadership in the Kingdom is double-handed:
1. **The Tool**: Professional competence, organization, clear communication, and milestones.
2. **The Sword**: Active spiritual warfare, daily vigilance, intercession, and shielding your team.

Never neglect your competent execution for "pure prayer", and never rely purely on your business intellect while your prayer altar is cold.`,
    author: 'Bro. David Mensah',
    authorRole: 'Director of Operations',
    date: 'Jun 15, 2026',
    readTime: '8 min read',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600'
  }
];

export const initialPrayerPoints: PrayerPoint[] = [
  {
    id: 'prayer-1',
    title: 'Divine Financial Breakthrough for Family Debt',
    description: 'Petitioning the Lord for release from $5,000 legacy family debts. Declaring Psalm 34 over our business ventures.',
    status: 'active',
    prayingCount: 14,
    daysAgo: '2 days ago',
    dateStr: 'Jul 3, 2026'
  },
  {
    id: 'prayer-2',
    title: 'Complete Healing of Mother\'s Left Knee Joint',
    description: 'Mother has been experiencing severe arthritis and mobility issues. Standing on Isaiah 53:5 - by His stripes she is healed.',
    status: 'answered',
    prayingCount: 42,
    daysAgo: 'Answered yesterday',
    dateStr: 'Jul 4, 2026',
    testimonyNote: 'Testimony: Yesterday afternoon she walked 2km completely pain-free! Doctors were stunned.'
  },
  {
    id: 'prayer-3',
    title: 'Apostolic Boldness & Utterance in Lagos Crusade',
    description: 'Praying for utterance, signs, wonders, and salvation of souls at the upcoming community outreach on July 20th.',
    status: 'active',
    prayingCount: 31,
    daysAgo: '5 days ago',
    dateStr: 'Jun 30, 2026'
  }
];

export const initialJournalEntries: JournalEntry[] = [
  {
    id: 'journal-1',
    text: 'A profound shift during midnight prayers. Felt an overwhelming blanket of peace when speaking on position in Christ. Reminded of Ephesians 2:6. I am not under the storm; I am seated above it with Him.',
    category: 'REFLECTION',
    dateStr: 'Jul 4, 2026 23:45',
    linkedLessonId: 'lesson-1-1'
  },
  {
    id: 'journal-2',
    text: 'Woke up with an immense weight of gratitude. Yesterday\'s counseling session was so eye-opening. Counselors here carry a rare apostolic weight. I feel mentored and secure.',
    category: 'GRATITUDE',
    dateStr: 'Jul 2, 2026 08:30'
  }
];

export const sampleCounselors: Counselor[] = [
  {
    id: 'counselor-1',
    name: 'Sister Sarah Nkosi',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150',
    status: 'Available now',
    replyTime: 'Replies in minutes'
  },
  {
    id: 'counselor-2',
    name: 'Brother David Mensah',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150',
    status: 'Active today',
    replyTime: 'Replies in an hour'
  }
];

export const sampleMessages: Message[] = [
  {
    id: 'msg-1',
    senderId: 'counselor-1',
    receiverId: 'student-1',
    senderName: 'Sister Sarah Nkosi',
    text: 'Shalom Daniel. I reviewed your prayer requests regarding the family debt. Remember that God is your ultimate source, and covenant doors are about to swing wide open.',
    timestamp: 'Jul 4, 2026 14:32'
  },
  {
    id: 'msg-2',
    senderId: 'student-1',
    receiverId: 'counselor-1',
    senderName: 'Daniel Okafor',
    text: 'Thank you sister. I have been standing in prayer at the midnight watch and writing down my covenant claims. Your words are a great encouragement.',
    timestamp: 'Jul 4, 2026 15:10'
  }
];

export const sampleCommunityPosts: any[] = [
  {
    id: 'cpost-1',
    authorName: 'Pastor Joel Adeleke',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150',
    authorRole: 'Founder, AG Network',
    category: 'prophetic',
    content: 'Spiritual soldiers! I am sensing a mighty movement in the mid-heavens today. A specific covenant door of financial rest is swinging open for anyone who has stood on the midnight watch this week. Let Ephesians 3:20 be your decree. What Gates are you guarding today?',
    dateStr: '2 hours ago',
    likes: 142,
    prayerAgreements: 98,
    imageUrl: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=800',
    comments: [
      {
        id: 'ccom-1',
        authorName: 'Sister Sarah Nkosi',
        authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150',
        authorRole: 'Head of Counseling',
        content: 'Amen! Standing in agreement. We guarded the Gate of the Firstborn at midnight and broke the spirit of limitation over five families!',
        dateStr: '1 hour ago'
      },
      {
        id: 'ccom-2',
        authorName: 'Daniel Okafor',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150',
        authorRole: 'Student',
        content: 'Father! I receive this prophetic directive into my spirit! No delay is permitted!',
        dateStr: '30 mins ago'
      }
    ]
  },
  {
    id: 'cpost-2',
    authorName: 'Sister Chioma Nwachukwu',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150',
    authorRole: 'Intercessory General',
    category: 'testimony',
    content: 'DECLARED ANSWERED! 🌟 Months ago, I asked for prayers against structural family limitations. Today, my elder brother secured his executive position in New York with a fully-funded relocation package! The legal claims of darkness were demolished at the altar! Keep praying, saints!',
    dateStr: '5 hours ago',
    likes: 289,
    prayerAgreements: 174,
    comments: [
      {
        id: 'ccom-3',
        authorName: 'Bro. David Mensah',
        authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150',
        authorRole: 'Operations Director',
        content: 'To God be the entire glory! This is what happens when deep intercession meets covenant alignment.',
        dateStr: '4 hours ago'
      }
    ]
  },
  {
    id: 'cpost-3',
    authorName: 'Evangelist Marcus Sterling',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150',
    authorRole: 'Watchman Prophet',
    category: 'prayer-alarm',
    content: 'EMERGENCY ALTAR ALARM: 🚨 The Holy Spirit is prompting a shield of prayer around our students facing professional trials this month. We are initiating a spontaneous 3-Hour Virtual Prayer room tonight at 11 PM EST. Let us raise our shields as a single, indivisible city!',
    dateStr: '1 day ago',
    likes: 95,
    prayerAgreements: 110,
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    comments: []
  }
];

export const sampleLiveSessions: any[] = [
  {
    id: 'live-1',
    title: 'Midnight Altar: Tearing Down Regional Strongholds',
    hostName: 'Pastor Joel Adeleke',
    hostAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150',
    viewerCount: 412,
    status: 'live',
    category: 'Midnight Altar'
  },
  {
    id: 'live-2',
    title: 'Gate of Judah: Prophetic Worship & Healing Rain',
    hostName: 'Sister Chioma Nwachukwu',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150',
    viewerCount: 184,
    status: 'live',
    category: 'Intercession'
  },
  {
    id: 'live-3',
    title: 'Interpretation Masterclass: Translating Angelic Whispers',
    hostName: 'Evangelist Marcus Sterling',
    hostAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150',
    viewerCount: 0,
    status: 'upcoming',
    scheduledTime: 'Tonight at 8:00 PM EST',
    category: 'Teaching Masterclass'
  }
];

