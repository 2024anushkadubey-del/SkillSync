require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Activity = require('../models/Activity');
const SwapRequest = require('../models/SwapRequest');
const { ROLES } = require('../config/rbac');

const connectDB = require('../config/db');

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seed]: Connected to MongoDB. Preparing idempotent data seed...');

    // 1. Clear existing collections for a clean, deterministic RBAC state
    await User.deleteMany({});
    await Category.deleteMany({});
    await Activity.deleteMany({});
    await SwapRequest.deleteMany({});

    console.log('[Seed]: Cleared existing collections.');

    // 2. Seed the 5 RBAC Users
    const usersToCreate = [
      {
        name: 'Alex Rivera (Student)',
        email: 'staff@university.edu',
        password: 'StaffPass123!',
        role: ROLES.STAFF,
        major: 'Computer Science Major (Sophomore)',
        university: 'State Tech University',
        avatar: 'AR',
        completedSwaps: 14,
        rating: 4.9,
        availability: 'Weekdays (After 4 PM) & Saturday mornings',
        bio: 'Passionate about full-stack web development with React & Tailwind. Looking to trade frontend tutoring for UI/UX Figma design critique!',
        skillsOffered: [
          { id: 's1', name: 'React.js', level: 'Advanced', category: 'Development', description: 'Components, hooks, state management, and responsive layouts.' },
          { id: 's2', name: 'JavaScript', level: 'Advanced', category: 'Development', description: 'ES6+, async/await, DOM manipulation, and arrays/objects.' },
          { id: 's3', name: 'Python Basics', level: 'Intermediate', category: 'Development', description: 'Control flow, OOP fundamentals, and script automation.' },
        ],
        skillsWanted: [
          { id: 'w1', name: 'Figma UI/UX', targetLevel: 'Intermediate', category: 'Design', description: 'Design systems, auto-layout, wireframing, and component libraries.' },
          { id: 'w2', name: 'Spanish Conversation', targetLevel: 'Conversational', category: 'Languages', description: 'Grammar review and casual weekly dialogue practice.' },
          { id: 'w3', name: 'Data Structures', targetLevel: 'Advanced', category: 'Academics', description: 'Trees, graphs, recursion, and algorithm optimization.' },
        ],
        internalModerationNotes: 'Student profile verified. Active peer exchange record in good standing.',
        securityStatus: 'Good Standing',
      },
      {
        name: 'Sarah Chen (Senior Mentor)',
        email: 'senior@university.edu',
        password: 'SeniorPass123!',
        role: ROLES.SENIOR,
        major: 'Digital Interaction Design (Senior Mentor)',
        university: 'State Tech University',
        avatar: 'SC',
        completedSwaps: 28,
        rating: 4.95,
        availability: 'Tuesdays & Thursdays (3 PM - 7 PM)',
        bio: 'Senior peer mentor specializing in Design Systems, Figma auto-layout, and user research mentoring.',
        skillsOffered: [
          { id: 's4', name: 'Figma UI/UX Design Systems', level: 'Expert', category: 'Design', description: 'Tokens, component variants, and interactive prototyping.' },
          { id: 's5', name: 'User Testing & Wireframing', level: 'Advanced', category: 'Design', description: 'Usability testing sessions and feedback synthesis.' },
        ],
        skillsWanted: [
          { id: 'w4', name: 'React.js State Management', targetLevel: 'Advanced', category: 'Development', description: 'Redux Toolkit, Context optimization, and SWR caching.' },
        ],
        internalModerationNotes: 'Design Department accredited peer tutor. Senior role privileges active.',
        securityStatus: 'Verified',
      },
      {
        name: 'Prof. Marcus Vance (Coordinator / HR)',
        email: 'hr@university.edu',
        password: 'HRPass123!',
        role: ROLES.HR,
        major: 'Campus Skill Exchange Coordinator',
        university: 'State Tech University Administration',
        avatar: 'MV',
        completedSwaps: 45,
        rating: 5.0,
        availability: 'Mon - Fri (9 AM - 5 PM)',
        bio: 'SkillSync campus coordinator overseeing skill categorization, student moderation, and safe peer exchanges.',
        skillsOffered: [
          { id: 's6', name: 'Academic Mentorship', level: 'Expert', category: 'Academics', description: 'Academic pathways, portfolio reviews, and research methodologies.' },
        ],
        skillsWanted: [
          { id: 'w5', name: 'Cloud Native DevOps', targetLevel: 'Intermediate', category: 'Development', description: 'Docker containerization and CI/CD pipelines.' },
        ],
        internalModerationNotes: 'Administrative staff with student moderation and category management authority.',
        securityStatus: 'Verified',
      },
      {
        name: 'Elena Rostova (Compliance Auditor)',
        email: 'auditor@university.edu',
        password: 'AuditorPass123!',
        role: ROLES.AUDITOR,
        major: 'Academic Compliance & Quality Auditor',
        university: 'University Accreditation Board',
        avatar: 'ER',
        completedSwaps: 0,
        rating: 5.0,
        availability: 'Audit schedule as required',
        bio: 'Read-only compliance auditor inspecting platform logs, role access histories, and security integrity.',
        skillsOffered: [],
        skillsWanted: [],
        internalModerationNotes: 'Auditor account: strictly read-only inspection privileges across all database collections.',
        securityStatus: 'Audited',
      },
      {
        name: 'Devon Administrator (System Admin)',
        email: 'admin@university.edu',
        password: 'AdminPass123!',
        role: ROLES.ADMIN,
        major: 'Lead Platform Systems Administrator',
        university: 'IT Infrastructure Division',
        avatar: 'DA',
        completedSwaps: 50,
        rating: 5.0,
        availability: '24/7 Platform On-call',
        bio: 'Root system administrator with full RBAC access, security privilege enforcement, and database oversight.',
        skillsOffered: [
          { id: 's7', name: 'System Architecture & Security', level: 'Expert', category: 'Development', description: 'RBAC architectures, JWT authentication, and secure data pipelines.' },
        ],
        skillsWanted: [],
        internalModerationNotes: 'Root administrative user with full security clearances.',
        securityStatus: 'Verified',
      },
      // Also add legacy default login user alias so existing test credentials work smoothly
      {
        name: 'Alex Rivera',
        email: 'alex.rivera@university.edu',
        password: 'studentPassword123',
        role: ROLES.STAFF,
        major: 'Computer Science Major (Sophomore)',
        university: 'State Tech University',
        avatar: 'AR',
        completedSwaps: 14,
        rating: 4.9,
        availability: 'Weekdays (After 4 PM) & Saturday mornings',
        bio: 'Passionate about full-stack web development with React & Tailwind. Looking to trade frontend tutoring for UI/UX Figma design critique!',
        skillsOffered: [
          { id: 's1', name: 'React.js', level: 'Advanced', category: 'Development', description: 'Components, hooks, state management, and responsive layouts.' },
          { id: 's2', name: 'JavaScript', level: 'Advanced', category: 'Development', description: 'ES6+, async/await, DOM manipulation, and arrays/objects.' },
          { id: 's3', name: 'Python Basics', level: 'Intermediate', category: 'Development', description: 'Control flow, OOP fundamentals, and script automation.' },
        ],
        skillsWanted: [
          { id: 'w1', name: 'Figma UI/UX', targetLevel: 'Intermediate', category: 'Design', description: 'Design systems, auto-layout, wireframing, and component libraries.' },
          { id: 'w2', name: 'Spanish Conversation', targetLevel: 'Conversational', category: 'Languages', description: 'Grammar review and casual weekly dialogue practice.' },
          { id: 'w3', name: 'Data Structures', targetLevel: 'Advanced', category: 'Academics', description: 'Trees, graphs, recursion, and algorithm optimization.' },
        ],
        internalModerationNotes: 'Standard student account in good standing.',
        securityStatus: 'Good Standing',
      }
    ];

    for (const userData of usersToCreate) {
      const user = new User(userData);
      await user.save();
    }
    console.log(`[Seed]: Created ${usersToCreate.length} RBAC users (Staff, Senior, HR, Auditor, Admin, and Alex Rivera).`);

    // 3. Seed Suggested Student Profiles (for student directory matching)
    const suggestedStudents = [
      {
        name: 'Carlos Mendez',
        email: 'carlos.mendez@university.edu',
        password: 'Password123!',
        role: ROLES.STAFF,
        major: 'International Relations (Senior)',
        university: 'State Tech University',
        avatar: 'CM',
        rating: 4.8,
        completedSwaps: 11,
        availability: 'Flexible on weekends & Friday afternoons',
        bio: 'Native Spanish speaker offering immersive conversational practice and pronunciation guidance.',
        teaches: ['Spanish (Native)', 'Latin American History'],
        wantsToLearn: ['Python Basics', 'Excel Analytics'],
        matchPercentage: 92,
      },
      {
        name: 'Emily Watson',
        email: 'emily.watson@university.edu',
        password: 'Password123!',
        role: ROLES.STAFF,
        major: 'Data Analytics (Sophomore)',
        university: 'State Tech University',
        avatar: 'EW',
        rating: 5.0,
        completedSwaps: 22,
        availability: 'Mondays & Wednesdays (5 PM - 8 PM)',
        bio: 'Strong background in SQL querying and core algorithms. Looking to exchange tutoring for Tailwind CSS.',
        teaches: ['SQL', 'Data Structures', 'Python'],
        wantsToLearn: ['Tailwind CSS', 'Figma'],
        matchPercentage: 88,
      },
      {
        name: 'Marcus Johnson',
        email: 'marcus.johnson@university.edu',
        password: 'Password123!',
        role: ROLES.STAFF,
        major: 'Media Arts & Production (Junior)',
        university: 'State Tech University',
        avatar: 'MJ',
        rating: 4.7,
        completedSwaps: 9,
        availability: 'Weekends all day',
        bio: 'Freelance video editor specializing in DaVinci Resolve color grading and Premiere timelines.',
        teaches: ['Video Editing', 'DaVinci Resolve'],
        wantsToLearn: ['JavaScript', 'HTML/CSS'],
        matchPercentage: 84,
      }
    ];

    for (const studentData of suggestedStudents) {
      const student = new User(studentData);
      await student.save();
    }
    console.log(`[Seed]: Created ${suggestedStudents.length} additional campus student profiles.`);

    // 4. Seed Categories
    const categoriesData = [
      {
        id: 'cat-1',
        name: 'Web Development',
        icon: 'Code2',
        count: '120+ Students',
        color: 'from-forest-800 to-forest-950',
        description: 'React, Node.js, HTML/CSS, Tailwind, Vue, and Web APIs.',
        popularTopics: ['React & Next.js', 'Tailwind CSS Layouts', 'JavaScript Essentials', 'RESTful API Design'],
      },
      {
        id: 'cat-2',
        name: 'UI/UX & Graphic Design',
        icon: 'Palette',
        count: '85+ Students',
        color: 'from-amber-600 to-stone-800',
        description: 'Figma, Adobe XD, Wireframing, User Research & Design Systems.',
        popularTopics: ['Figma Component Libraries', 'Wireframing Workflows', 'Color Theory', 'User Testing'],
      },
      {
        id: 'cat-3',
        name: 'Data Science & AI',
        icon: 'Brain',
        count: '95+ Students',
        color: 'from-emerald-700 to-forest-900',
        description: 'Python, Machine Learning, Pandas, SQL, & Data Visualization.',
        popularTopics: ['Pandas & NumPy', 'SQL Database Queries', 'Scikit-Learn Basics', 'Data Cleaning'],
      },
      {
        id: 'cat-4',
        name: 'Language Exchange',
        icon: 'Globe',
        count: '150+ Students',
        color: 'from-stone-700 to-stone-900',
        description: 'Spanish, French, Mandarin, German, English & Japanese.',
        popularTopics: ['Conversational Spanish', 'Business English', 'Intro French', 'German Vocabulary'],
      },
      {
        id: 'cat-5',
        name: 'Video & Media Production',
        icon: 'Video',
        count: '60+ Students',
        color: 'from-forest-700 to-forest-900',
        description: 'Premiere Pro, DaVinci Resolve, Motion Graphics, & Audio Editing.',
        popularTopics: ['Video Editing Cuts', 'Color Grading in DaVinci', 'Audio Cleanup', 'Thumbnail Design'],
      },
      {
        id: 'cat-6',
        name: 'Academics & STEM Tutoring',
        icon: 'BookOpen',
        count: '110+ Students',
        color: 'from-emerald-800 to-forest-950',
        description: 'Calculus, Linear Algebra, Physics, Chemistry & Statistics.',
        popularTopics: ['Calculus II Integration', 'Linear Algebra Matrices', 'Classical Mechanics', 'Probability'],
      },
    ];

    await Category.insertMany(categoriesData);
    console.log(`[Seed]: Created ${categoriesData.length} skill categories.`);

    // 5. Seed Activities (Including Standard and Sensitive/Restricted Audit logs)
    const activitiesData = [
      {
        id: 'act-1',
        type: 'request_received',
        title: 'Swap Request from Sarah Chen',
        detail: 'Proposed a 1-hour session exchanging Figma Design Systems for React Hooks guidance.',
        timestamp: '2 hours ago',
        status: 'Pending Review',
        partner: 'Sarah Chen',
        isRestricted: false,
      },
      {
        id: 'act-2',
        type: 'swap_completed',
        title: 'Completed Session with Carlos Mendez',
        detail: '1-hour exchange: Conversational Spanish dialogue practice & JavaScript ES6 syntax.',
        timestamp: 'Yesterday',
        status: 'Completed',
        partner: 'Carlos Mendez',
        isRestricted: false,
      },
      {
        id: 'act-3',
        type: 'rating_received',
        title: '5-Star Peer Review from Emily Watson',
        detail: '"Alex explained React state management and props so clearly! Highly recommended partner."',
        timestamp: '3 days ago',
        status: 'Peer Review',
        partner: 'Emily Watson',
        isRestricted: false,
      },
      // SENSITIVE SECURITY AUDIT ENTRIES (Experiment 4 Part 8 - Protected View)
      {
        id: 'act-sec-1',
        type: 'security_audit',
        title: 'RBAC Security Integrity Verification',
        detail: 'Auditor Elena Rostova executed security compliance check on student role privileges.',
        timestamp: '4 hours ago',
        status: 'Security Audited',
        partner: 'System Security Module',
        isRestricted: true, // Only visible to HR, Auditor, Admin
      },
      {
        id: 'act-sec-2',
        type: 'role_assigned',
        title: 'Role Upgrade to Senior Mentor',
        detail: 'Admin Devon Administrator authorized role promotion for Sarah Chen based on academic merit.',
        timestamp: '1 day ago',
        status: 'Role Updated',
        partner: 'Devon Administrator',
        isRestricted: true, // Only visible to HR, Auditor, Admin
      },
    ];

    await Activity.insertMany(activitiesData);
    console.log(`[Seed]: Created ${activitiesData.length} activity records (including restricted audit entries).`);

    console.log('----------------------------------------------------');
    console.log('✅ SEED COMPLETED SUCCESSFULLY!');
    console.log('----------------------------------------------------');
    console.log('Development Credentials Created for RBAC Demonstration:');
    console.log('1. Staff User:   staff@university.edu   / StaffPass123!   [Role: staff]');
    console.log('2. Senior User:  senior@university.edu  / SeniorPass123!  [Role: senior]');
    console.log('3. HR/Mod User:  hr@university.edu      / HRPass123!      [Role: HR]');
    console.log('4. Auditor:      auditor@university.edu / AuditorPass123! [Role: auditor (Read-Only)]');
    console.log('5. Admin User:   admin@university.edu   / AdminPass123!   [Role: admin (Full Access)]');
    console.log('6. Alex Rivera:  alex.rivera@university.edu / studentPassword123 [Role: staff]');
    console.log('----------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedData();
