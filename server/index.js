const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());

// In-Memory Database / Mock Store
let currentUserProfile = {
  id: "usr-alex",
  name: "Alex Rivera",
  email: "alex.rivera@university.edu",
  role: "Computer Science Major (Sophomore)",
  university: "State Tech University",
  avatar: "AR",
  completedSwaps: 14,
  rating: 4.9,
  availability: "Weekdays (After 4 PM) & Saturday mornings",
  bio: "Passionate about full-stack web development with React & Tailwind. Looking to trade frontend tutoring for UI/UX Figma design critique and Spanish conversation practice!",
  skillsOffered: [
    { id: "s1", name: "React.js", level: "Advanced", category: "Development", description: "Components, hooks, state management, and responsive layouts." },
    { id: "s2", name: "JavaScript", level: "Advanced", category: "Development", description: "ES6+, async/await, DOM manipulation, and arrays/objects." },
    { id: "s3", name: "Python Basics", level: "Intermediate", category: "Development", description: "Control flow, OOP fundamentals, and script automation." },
  ],
  skillsWanted: [
    { id: "w1", name: "Figma UI/UX", targetLevel: "Intermediate", category: "Design", description: "Design systems, auto-layout, wireframing, and component libraries." },
    { id: "w2", name: "Spanish Conversation", targetLevel: "Conversational", category: "Languages", description: "Grammar review and casual weekly dialogue practice." },
    { id: "w3", name: "Data Structures", targetLevel: "Advanced", category: "Academics", description: "Trees, graphs, recursion, and algorithm optimization." },
  ],
};

let categories = [
  {
    id: "cat-1",
    name: "Web Development",
    icon: "Code2",
    count: "120+ Students",
    color: "from-forest-800 to-forest-950",
    description: "React, Node.js, HTML/CSS, Tailwind, Vue, and Web APIs.",
    popularTopics: ["React & Next.js", "Tailwind CSS Layouts", "JavaScript Essentials", "RESTful API Design"],
  },
  {
    id: "cat-2",
    name: "UI/UX & Graphic Design",
    icon: "Palette",
    count: "85+ Students",
    color: "from-amber-600 to-stone-800",
    description: "Figma, Adobe XD, Wireframing, User Research & Design Systems.",
    popularTopics: ["Figma Component Libraries", "Wireframing Workflows", "Color Theory", "User Testing"],
  },
  {
    id: "cat-3",
    name: "Data Science & AI",
    icon: "Brain",
    count: "95+ Students",
    color: "from-emerald-700 to-forest-900",
    description: "Python, Machine Learning, Pandas, SQL, & Data Visualization.",
    popularTopics: ["Pandas & NumPy", "SQL Database Queries", "Scikit-Learn Basics", "Data Cleaning"],
  },
  {
    id: "cat-4",
    name: "Language Exchange",
    icon: "Globe",
    count: "150+ Students",
    color: "from-stone-700 to-stone-900",
    description: "Spanish, French, Mandarin, German, English & Japanese.",
    popularTopics: ["Conversational Spanish", "Business English", "Intro French", "German Vocabulary"],
  },
  {
    id: "cat-5",
    name: "Video & Media Production",
    icon: "Video",
    count: "60+ Students",
    color: "from-forest-700 to-forest-900",
    description: "Premiere Pro, DaVinci Resolve, Motion Graphics, & Audio Editing.",
    popularTopics: ["Video Editing Cuts", "Color Grading in DaVinci", "Audio Cleanup", "Thumbnail Design"],
  },
  {
    id: "cat-6",
    name: "Academics & STEM Tutoring",
    icon: "BookOpen",
    count: "110+ Students",
    color: "from-emerald-800 to-forest-950",
    description: "Calculus, Linear Algebra, Physics, Chemistry & Statistics.",
    popularTopics: ["Calculus II Integration", "Linear Algebra Matrices", "Classical Mechanics", "Probability"],
  },
];

let suggestedStudents = [
  {
    id: "user-101",
    name: "Sarah Chen",
    major: "Digital Interaction Design (Junior)",
    university: "State Tech University",
    avatar: "SC",
    rating: 4.9,
    swapsCount: 18,
    availability: "Tuesdays & Thursdays (3 PM - 7 PM)",
    bio: "Passionate about creating clean UI systems and design tokens. Happy to teach Figma fundamentals in exchange for help with React components.",
    teaches: ["Figma UI", "Design Systems", "User Testing"],
    wantsToLearn: ["React.js", "JavaScript"],
    matchPercentage: 96,
  },
  {
    id: "user-102",
    name: "Carlos Mendez",
    major: "International Relations (Senior)",
    university: "State Tech University",
    avatar: "CM",
    rating: 4.8,
    swapsCount: 11,
    availability: "Flexible on weekends & Friday afternoons",
    bio: "Native Spanish speaker offering immersive conversational practice and pronunciation guidance. Eager to pick up Python for data processing.",
    teaches: ["Spanish (Native)", "Latin American History"],
    wantsToLearn: ["Python Basics", "Excel Analytics"],
    matchPercentage: 92,
  },
  {
    id: "user-103",
    name: "Emily Watson",
    major: "Data Analytics (Sophomore)",
    university: "State Tech University",
    avatar: "EW",
    rating: 5.0,
    swapsCount: 22,
    availability: "Mondays & Wednesdays (5 PM - 8 PM)",
    bio: "Strong background in SQL querying and core algorithms. Looking to exchange tutoring for modern Tailwind CSS and web styling techniques.",
    teaches: ["SQL", "Data Structures", "Python"],
    wantsToLearn: ["Tailwind CSS", "Figma"],
    matchPercentage: 88,
  },
  {
    id: "user-104",
    name: "Marcus Johnson",
    major: "Media Arts & Production (Junior)",
    university: "State Tech University",
    avatar: "MJ",
    rating: 4.7,
    swapsCount: 9,
    availability: "Weekends all day",
    bio: "Freelance video editor specializing in DaVinci Resolve color grading and Premiere timelines. Looking to learn basic HTML/CSS & JS for a portfolio site.",
    teaches: ["Video Editing", "DaVinci Resolve"],
    wantsToLearn: ["JavaScript", "HTML/CSS"],
    matchPercentage: 84,
  },
];

let recentActivity = [
  {
    id: "act-1",
    type: "request_received",
    title: "Swap Request from Sarah Chen",
    detail: "Proposed a 1-hour session exchanging Figma Design Systems for React Hooks guidance.",
    timestamp: "2 hours ago",
    status: "Pending Review",
    partner: "Sarah Chen",
  },
  {
    id: "act-2",
    type: "swap_completed",
    title: "Completed Session with Carlos Mendez",
    detail: "1-hour exchange: Conversational Spanish dialogue practice & JavaScript ES6 syntax.",
    timestamp: "Yesterday",
    status: "Completed",
    partner: "Carlos Mendez",
  },
  {
    id: "act-3",
    type: "rating_received",
    title: "5-Star Peer Review from Emily Watson",
    detail: '"Alex explained React state management and props so clearly! Highly recommended partner."',
    timestamp: "3 days ago",
    status: "Peer Review",
    partner: "Emily Watson",
  },
];

// Helper to extract user initials
function getInitials(name) {
  if (!name) return 'ST';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// ----------------------------------------------------
// AUTHENTICATION ENDPOINTS
// ----------------------------------------------------

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Validation failed: Email and password are required.",
    });
  }

  if (!email.includes('@')) {
    return res.status(400).json({
      error: "Please enter a valid university email address.",
    });
  }

  // Safe user payload (never return password)
  const safeUser = {
    id: currentUserProfile.id,
    name: currentUserProfile.name,
    email: email.toLowerCase(),
    role: currentUserProfile.role,
    university: currentUserProfile.university,
    avatar: currentUserProfile.avatar,
  };

  const token = `skillsync_jwt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  return res.status(200).json({
    message: "Login successful",
    token,
    user: safeUser,
  });
});

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { name, email, major, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      error: "Validation failed: Name, email, and password are required.",
    });
  }

  if (!email.includes('@')) {
    return res.status(400).json({
      error: "Please provide a valid student email address.",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: "Password must be at least 6 characters long.",
    });
  }

  const avatar = getInitials(name);
  const role = major ? `${major}` : 'Student Member';

  // Update in-memory user profile
  currentUserProfile = {
    ...currentUserProfile,
    id: `usr-${Date.now()}`,
    name,
    email: email.toLowerCase(),
    role,
    avatar,
  };

  const safeUser = {
    id: currentUserProfile.id,
    name: currentUserProfile.name,
    email: currentUserProfile.email,
    role: currentUserProfile.role,
    university: currentUserProfile.university,
    avatar: currentUserProfile.avatar,
  };

  const token = `skillsync_jwt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  return res.status(201).json({
    message: "Student profile registered successfully",
    token,
    user: safeUser,
  });
});

// GET /api/auth/me
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Unauthorized: No valid session token provided." });
  }

  return res.status(200).json({
    user: {
      id: currentUserProfile.id,
      name: currentUserProfile.name,
      email: currentUserProfile.email,
      role: currentUserProfile.role,
      university: currentUserProfile.university,
      avatar: currentUserProfile.avatar,
    },
  });
});

// ----------------------------------------------------
// USER PROFILE & SKILLS ENDPOINTS
// ----------------------------------------------------

// GET /api/user/profile
app.get('/api/user/profile', (req, res) => {
  return res.status(200).json(currentUserProfile);
});

// GET /api/skills
app.get('/api/skills', (req, res) => {
  return res.status(200).json({
    offered: currentUserProfile.skillsOffered,
    wanted: currentUserProfile.skillsWanted,
  });
});

// POST /api/skills
app.post('/api/skills', (req, res) => {
  const { type, name, level, category, description } = req.body;

  if (!name || !type) {
    return res.status(400).json({ error: "Skill name and type ('teach' or 'learn') are required." });
  }

  const newId = `${type === 'teach' ? 's' : 'w'}-${Date.now()}`;

  if (type === 'teach') {
    const newSkill = {
      id: newId,
      name: name.trim(),
      level: level || 'Intermediate',
      category: category || 'General',
      description: description || 'Peer instruction and practical exercises.',
    };
    currentUserProfile.skillsOffered.push(newSkill);
    return res.status(201).json(newSkill);
  } else if (type === 'learn') {
    const newSkill = {
      id: newId,
      name: name.trim(),
      targetLevel: level || 'Beginner Goal',
      category: category || 'General',
      description: description || 'Looking to learn fundamentals and best practices.',
    };
    currentUserProfile.skillsWanted.push(newSkill);
    return res.status(201).json(newSkill);
  } else {
    return res.status(400).json({ error: "Invalid skill type. Must be 'teach' or 'learn'." });
  }
});

// PATCH /api/skills/:id
app.patch('/api/skills/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  let skill = currentUserProfile.skillsOffered.find((s) => s.id === id);
  let isTeach = true;

  if (!skill) {
    skill = currentUserProfile.skillsWanted.find((s) => s.id === id);
    isTeach = false;
  }

  if (!skill) {
    return res.status(404).json({ error: "Skill not found with the specified ID." });
  }

  Object.assign(skill, updates);
  return res.status(200).json(skill);
});

// DELETE /api/skills/:id
app.delete('/api/skills/:id', (req, res) => {
  const { id } = req.params;

  const initialOfferedLength = currentUserProfile.skillsOffered.length;
  currentUserProfile.skillsOffered = currentUserProfile.skillsOffered.filter((s) => s.id !== id);

  const initialWantedLength = currentUserProfile.skillsWanted.length;
  currentUserProfile.skillsWanted = currentUserProfile.skillsWanted.filter((s) => s.id !== id);

  if (
    currentUserProfile.skillsOffered.length === initialOfferedLength &&
    currentUserProfile.skillsWanted.length === initialWantedLength
  ) {
    return res.status(404).json({ error: "Skill not found." });
  }

  return res.status(200).json({
    success: true,
    message: "Skill removed successfully.",
    removedId: id,
  });
});

// ----------------------------------------------------
// STUDENTS & CATEGORIES ENDPOINTS
// ----------------------------------------------------

// GET /api/categories
app.get('/api/categories', (req, res) => {
  const { search } = req.query;
  let result = [...categories];

  if (search) {
    const query = search.toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.popularTopics.some((t) => t.toLowerCase().includes(query))
    );
  }

  return res.status(200).json(result);
});

// GET /api/students
app.get('/api/students', (req, res) => {
  const { search, category } = req.query;
  let result = [...suggestedStudents];

  if (search) {
    const query = search.toLowerCase();
    result = result.filter(
      (std) =>
        std.name.toLowerCase().includes(query) ||
        std.major.toLowerCase().includes(query) ||
        std.bio.toLowerCase().includes(query) ||
        std.teaches.some((t) => t.toLowerCase().includes(query)) ||
        std.wantsToLearn.some((w) => w.toLowerCase().includes(query))
    );
  }

  if (category && category !== 'All') {
    const catLower = category.toLowerCase();
    result = result.filter(
      (std) =>
        std.teaches.some((t) => t.toLowerCase().includes(catLower)) ||
        std.wantsToLearn.some((w) => w.toLowerCase().includes(catLower))
    );
  }

  return res.status(200).json(result);
});

// ----------------------------------------------------
// ACTIVITY & SWAP REQUESTS ENDPOINTS
// ----------------------------------------------------

// GET /api/activity
app.get('/api/activity', (req, res) => {
  return res.status(200).json(recentActivity);
});

// POST /api/swap-requests
app.post('/api/swap-requests', (req, res) => {
  const { studentId, studentName, offeredSkill, wantedSkill, note } = req.body;

  if (!studentId || !studentName) {
    return res.status(400).json({ error: "Target student information is required." });
  }

  const newActivity = {
    id: `act-${Date.now()}`,
    type: "request_sent",
    title: `Swap Proposal Sent to ${studentName}`,
    detail: note || `Proposed 1-on-1 session exchanging ${offeredSkill || 'Frontend'} for ${wantedSkill || 'tutoring'}.`,
    timestamp: "Just now",
    status: "Pending Review",
    partner: studentName,
  };

  recentActivity.unshift(newActivity);

  return res.status(201).json({
    success: true,
    message: `Swap request successfully sent to ${studentName}`,
    activity: newActivity,
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`SkillSync BFF API Server running on http://localhost:${PORT}`);
});
