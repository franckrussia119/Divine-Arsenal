import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'Password123!';

async function upsertUser(data: {
  name: string;
  email: string;
  role: 'Student' | 'Counselor' | 'Admin';
  bio?: string;
  homeChurch?: string;
  avatar?: string;
  whatsapp?: string;
  streak?: number;
  plan?: string;
  planPrice?: string;
  renewsDate?: string;
}) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  return prisma.user.upsert({
    where: { email: data.email },
    update: {},
    create: { ...data, password: passwordHash, emailVerified: true },
  });
}

async function main() {
  console.log('Seeding demo accounts (all use the password: %s)', DEMO_PASSWORD);

  const student = await upsertUser({
    name: 'Daniel Okafor',
    email: 'daniel@divinearsenal.org',
    role: 'Student',
    bio: 'Seeking to walk in the fullness of apostolic authority and build a disciplined life of prayer.',
    homeChurch: 'Covenant Chapel, Lagos',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150',
    whatsapp: '+237600000000',
    streak: 12,
    plan: 'All-Access Member',
    planPrice: '$15 / month',
    renewsDate: 'Aug 1, 2026',
  });

  const counselor = await upsertUser({
    name: 'Sister Sarah Nkosi',
    email: 'sarah@divinearsenal.org',
    role: 'Counselor',
    bio: 'Head of Counseling, Divine Arsenal.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150',
  });

  const admin = await upsertUser({
    name: 'Pastor Joel Adeleke',
    email: 'joel@divinearsenal.org',
    role: 'Admin',
    bio: 'Founder, Arsenal Global Network.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150',
  });

  const chioma = await upsertUser({
    name: 'Sister Chioma Nwachukwu',
    email: 'chioma@divinearsenal.org',
    role: 'Counselor',
    bio: 'Intercessory General.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150',
  });

  const marcus = await upsertUser({
    name: 'Evangelist Marcus Sterling',
    email: 'marcus@divinearsenal.org',
    role: 'Counselor',
    bio: 'Watchman Prophet.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150',
  });

  // --- Courses ---
  const existingCourses = await prisma.course.count();
  if (existingCourses === 0) {
    await prisma.course.create({
      data: {
        title: 'Strategic Prayer & Spiritual Warfare',
        subtitle: 'Master the art of intercession and tear down strongholds',
        category: 'Spiritual Warfare',
        duration: '6 hours',
        description:
          'Learn the systemic strategies of prayer, understanding divine courtrooms, territorial spirits, and the power of anointed decrees to manifest breakthrough.',
        isFree: true,
        price: null,
        imageUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=800',
        modules: {
          create: [
            {
              title: 'Module 1: The Foundations of Spiritual Authority',
              order: 0,
              lessons: {
                create: [
                  {
                    title: '1. Understanding Your Position in Christ',
                    duration: '22 mins',
                    videoDuration: '22:15',
                    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                    keyVerse:
                      'Ephesians 2:6 - "And God raised us up with Christ and seated us with him in the heavenly realms in Christ Jesus."',
                    keyVerseRef: 'Ephesians 2:6',
                    practices: [
                      'Spend 10 minutes in silence declaring your positioning in the heavenly realms.',
                      'Write down three fears and replace them with scriptures of authority.',
                    ],
                    content:
                      'Spiritual authority is not based on feeling, emotion, or personal holiness. It is based entirely on your positioning.',
                    order: 0,
                  },
                  {
                    title: '2. The Legal Framework of Prayer & Decrees',
                    duration: '18 mins',
                    videoDuration: '18:40',
                    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
                    keyVerse:
                      'Job 22:28 - "You will also declare a thing, and it will be established for you; so light will shine on your ways."',
                    keyVerseRef: 'Job 22:28',
                    practices: [
                      'Read Leviticus 26 and write down your covenant rights.',
                      'Create a prayer decree regarding your family protection.',
                    ],
                    content:
                      "Prayer is a legal transaction in the spiritual realm. In the courtrooms of heaven, Jesus is our Advocate.",
                    order: 1,
                  },
                  {
                    title: '3. Activating the Armor of God Daily',
                    duration: '25 mins',
                    videoDuration: '25:10',
                    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                    keyVerse:
                      "Ephesians 6:11 - \"Put on the full armor of God, so that you can take your stand against the devil's schemes.\"",
                    keyVerseRef: 'Ephesians 6:11',
                    practices: [
                      'Go through each piece of armor in prayer tomorrow morning.',
                      'Evaluate which piece of your armor has been vulnerable lately.',
                    ],
                    content:
                      'The armor of God is not metaphorical imagery; it represents real spiritual garments of light.',
                    order: 2,
                  },
                ],
              },
            },
            {
              title: 'Module 2: Territorial Warfare and Strongholds',
              order: 1,
              lessons: {
                create: [
                  {
                    title: '4. Discerning Territorial Strongholds',
                    duration: '30 mins',
                    videoDuration: '30:05',
                    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
                    keyVerse:
                      '2 Corinthians 10:4 - "The weapons we fight with are not the weapons of the world. On the contrary, they have divine power to demolish strongholds."',
                    keyVerseRef: '2 Corinthians 10:4',
                    practices: [
                      'Map out the spiritual patterns of your local city or neighborhood.',
                      'Identify the prominent spiritual strongholds in your family line.',
                    ],
                    content:
                      'Cities and nations are influenced by specific ruling principalities.',
                    order: 0,
                  },
                  {
                    title: '5. Fasting as a Catalyst for Deliverance',
                    duration: '20 mins',
                    videoDuration: '20:15',
                    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                    keyVerse:
                      'Isaiah 58:6 - "Is not this the kind of fasting I have chosen: to loose the chains of injustice and untie the cords of the yoke, to set the oppressed free?"',
                    keyVerseRef: 'Isaiah 58:6',
                    practices: [
                      'Plan a 24-hour fast focused purely on breakthrough in one stubborn area.',
                      'Drink sufficient water and replace meal times with scripture reading.',
                    ],
                    content: 'Fasting does not change God; it changes us.',
                    order: 1,
                  },
                ],
              },
            },
          ],
        },
      },
    });

    await prisma.course.create({
      data: {
        title: 'The Daniel Covenant: Fasting & Focus',
        subtitle: 'Unlock deeper communion and prophetic clarity through disciplined fasting',
        category: 'Fasting & Discipleship',
        duration: '3 hours',
        description:
          'Walk step-by-step through the 21-day Daniel Fast. Learn the spiritual protocols of continuous focus, prophetic interpretation, and dream discernment.',
        isFree: true,
        price: null,
        imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
        modules: {
          create: [
            {
              title: 'Module 1: Prophetic Alignment',
              order: 0,
              lessons: {
                create: [
                  {
                    title: '1. Setting the Heart to Understand',
                    duration: '25 mins',
                    videoDuration: '25:00',
                    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
                    keyVerse:
                      'Daniel 10:12 - "Do not be afraid, Daniel. Since the first day that you set your mind to gain understanding..."',
                    keyVerseRef: 'Daniel 10:12',
                    practices: ['Journal your objective goals for your next fast.', 'Humble yourself and yield expectations.'],
                    content: "The power of Daniel's fast was not the dietary restriction, but the setting of his heart.",
                    order: 0,
                  },
                  {
                    title: '2. Sound of Breakthrough in the Heavens',
                    duration: '25 mins',
                    videoDuration: '25:00',
                    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                    keyVerse:
                      'Daniel 10:13 - "But the prince of the Persian kingdom resisted me twenty-one days..."',
                    keyVerseRef: 'Daniel 10:13',
                    practices: ['Continue standing in prayer even when you see no immediate answer.', 'Praise God in advance for victory.'],
                    content: 'Delays in prayers are not denials.',
                    order: 1,
                  },
                ],
              },
            },
          ],
        },
      },
    });

    await prisma.course.create({
      data: {
        title: 'Spiritual Warfare & Discernment',
        subtitle: 'Learn to distinguish the voices of spirits, angels, and the Holy Ghost',
        category: 'Discernment',
        duration: '5 hours',
        description:
          'An advanced curriculum on developing a sensitive spirit, interpreting dreams, discerning spiritual atmospheres, and casting out negative spiritual entities.',
        isFree: true,
        price: null,
        imageUrl: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&q=80&w=800',
        modules: {
          create: [
            {
              title: 'Module 1: Spiritual Atmospheres',
              order: 0,
              lessons: {
                create: [
                  {
                    title: '1. Sensing the Spiritual Climate',
                    duration: '30 mins',
                    videoDuration: '30:00',
                    keyVerse: 'Hebrews 5:14 - "But solid food is for the mature, who by constant use have trained themselves..."',
                    keyVerseRef: 'Hebrews 5:14',
                    order: 0,
                  },
                ],
              },
            },
          ],
        },
      },
    });

    await prisma.course.create({
      data: {
        title: 'Foundations of Anointed Faith',
        subtitle: 'The fundamental spiritual protocols for every believer',
        category: 'Foundations',
        duration: '4 hours',
        description:
          'A completely free starter course to solidify your covenant, master prayer devotionals, understand scriptural validation, and speak in heavenly tongues.',
        isFree: true,
        price: 'Free',
        imageUrl: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=800',
        modules: {
          create: [
            {
              title: 'Module 1: Salvation & Covenant',
              order: 0,
              lessons: {
                create: [
                  {
                    title: '1. The New Creation Realities',
                    duration: '20 mins',
                    videoDuration: '20:00',
                    keyVerse: '2 Corinthians 5:17 - "Therefore, if anyone is in Christ, the new creation has come..."',
                    keyVerseRef: '2 Corinthians 5:17',
                    order: 0,
                  },
                ],
              },
            },
          ],
        },
      },
    });
    console.log('Created 4 sample courses.');
  }

  // --- Enroll the demo student in the first two courses ---
  const courses = await prisma.course.findMany({ orderBy: { createdAt: 'asc' }, take: 2 });
  for (const course of courses) {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: student.id, courseId: course.id } },
      update: {},
      create: { userId: student.id, courseId: course.id, progress: 0 },
    });
  }

  // --- Blog posts ---
  if ((await prisma.blogPost.count()) === 0) {
    await prisma.blogPost.createMany({
      data: [
        {
          title: 'Understanding Spiritual Resistance and Territorial Altars',
          category: 'faith',
          excerpt:
            'Have you ever felt a heavy blanket of discouragement the moment you attempt to pray? Discover how territorial altars function.',
          content:
            'Many believers suffer from invisible limits because they are operating in atmospheres dominated by un-demolished altars. In Judges 6, Gideon had to tear down his father\'s altar of Baal before he could fight the Midianites. Three steps to overthrow territorial resistance: targeted scriptural intercession, sacrificial devotion, and covenant giving.',
          authorId: admin.id,
          authorName: admin.name,
          authorRole: 'Founder, Arsenal Global Network',
          readTime: '6 min read',
          imageUrl: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&q=80&w=600',
          featured: true,
        },
        {
          title: 'The Prophetic Significance of the Midnight Watch',
          category: 'prayer',
          excerpt: 'Why did the walls of Jericho fall? Why did Paul and Silas pray at midnight?',
          content:
            'The hours between midnight and 3:00 AM are critical spiritual windows. Training yourself to arise at midnight sets the pace of the day, intercepts attacks, and secures answers that are resisted during daytime.',
          authorId: counselor.id,
          authorName: counselor.name,
          authorRole: 'Head of Counseling, Divine Arsenal',
          readTime: '5 min read',
          imageUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=600',
        },
      ],
    });
    console.log('Created sample blog posts.');
  }

  // --- Prayer points (owned by the demo student) ---
  if ((await prisma.prayerPoint.count()) === 0) {
    const p1 = await prisma.prayerPoint.create({
      data: {
        title: 'Divine Financial Breakthrough for Family Debt',
        description: 'Petitioning the Lord for release from legacy family debts. Declaring Psalm 34 over our business ventures.',
        status: 'active',
        userId: student.id,
      },
    });
    await prisma.prayerAgreement.createMany({
      data: [
        { prayerId: p1.id, userId: counselor.id },
        { prayerId: p1.id, userId: admin.id },
      ],
      skipDuplicates: true,
    });

    await prisma.prayerPoint.create({
      data: {
        title: "Complete Healing of Mother's Left Knee Joint",
        description: 'Standing on Isaiah 53:5 - by His stripes she is healed.',
        status: 'answered',
        testimonyNote: 'Testimony: She walked 2km completely pain-free! Doctors were stunned.',
        userId: student.id,
      },
    });
    console.log('Created sample prayer points.');
  }

  // --- Journal entries ---
  if ((await prisma.journalEntry.count()) === 0) {
    await prisma.journalEntry.create({
      data: {
        text: 'A profound shift during midnight prayers. Reminded of Ephesians 2:6 — I am not under the storm; I am seated above it with Him.',
        category: 'REFLECTION',
        userId: student.id,
      },
    });
    console.log('Created sample journal entry.');
  }

  // --- Welcome message from the counselor ---
  if ((await prisma.message.count()) === 0) {
    await prisma.message.create({
      data: {
        text: 'Shalom Daniel. I reviewed your prayer requests. Remember that God is your ultimate source, and covenant doors are about to swing wide open.',
        senderId: counselor.id,
        receiverId: student.id,
      },
    });
    console.log('Created a welcome message.');
  }

  // --- Community posts ---
  if ((await prisma.communityPost.count()) === 0) {
    const post1 = await prisma.communityPost.create({
      data: {
        content:
          'Spiritual soldiers! I am sensing a mighty movement in the mid-heavens today. Let Ephesians 3:20 be your decree. What gates are you guarding today?',
        category: 'prophetic',
        authorId: admin.id,
        imageUrl: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=800',
      },
    });
    await prisma.communityComment.create({
      data: { content: 'Amen! Standing in agreement with this word.', postId: post1.id, authorId: counselor.id },
    });
    await prisma.communityLike.createMany({
      data: [{ postId: post1.id, userId: counselor.id }, { postId: post1.id, userId: student.id }],
      skipDuplicates: true,
    });

    await prisma.communityPost.create({
      data: {
        content:
          'DECLARED ANSWERED! Months ago I asked for prayer against family limitations. Today my brother secured his dream job! Keep praying, saints!',
        category: 'testimony',
        authorId: chioma.id,
      },
    });

    await prisma.communityPost.create({
      data: {
        content:
          'EMERGENCY ALTAR ALARM: The Holy Spirit is prompting a shield of prayer around our students facing trials this month. Join the virtual prayer room tonight at 11 PM EST.',
        category: 'prayer-alarm',
        authorId: marcus.id,
      },
    });
    console.log('Created sample community posts.');
  }

  // --- Live sessions ---
  if ((await prisma.liveSession.count()) === 0) {
    await prisma.liveSession.createMany({
      data: [
        {
          title: 'Midnight Altar: Tearing Down Regional Strongholds',
          hostName: admin.name,
          hostAvatar: admin.avatar,
          viewerCount: 412,
          status: 'live',
          category: 'Midnight Altar',
        },
        {
          title: 'Gate of Judah: Prophetic Worship & Healing Rain',
          hostName: chioma.name,
          hostAvatar: chioma.avatar,
          viewerCount: 184,
          status: 'live',
          category: 'Intercession',
        },
        {
          title: 'Interpretation Masterclass: Translating Angelic Whispers',
          hostName: marcus.name,
          hostAvatar: marcus.avatar,
          viewerCount: 0,
          status: 'upcoming',
          scheduledTime: 'Tonight at 8:00 PM EST',
          category: 'Teaching Masterclass',
        },
      ],
    });
    console.log('Created sample live sessions.');
  }

  console.log('\nDemo logins (all use password "%s"):', DEMO_PASSWORD);
  console.log('  Student:   daniel@divinearsenal.org');
  console.log('  Counselor: sarah@divinearsenal.org');
  console.log('  Admin:     joel@divinearsenal.org');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
