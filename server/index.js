require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Models
const User = require('./models/User');
const Category = require('./models/Category');
const Activity = require('./models/Activity');
const SwapRequest = require('./models/SwapRequest');

// RBAC & Auth Middleware
const {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
} = require('./config/rbac');

const {
  authenticate,
  optionalAuthenticate,
  requirePermission,
  requireRole,
  generateToken,
} = require('./middleware/auth');

// Experiment 5 Security Middlewares
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const {
  validateRegister,
  validateLogin,
  validateCreateSkill,
  validateUpdateSkill,
} = require('./middleware/validators');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5001;

// Allowed origins for local development, Docker, and cloud production
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
];

// Append production frontend domain if provided via CLIENT_URL
if (process.env.CLIENT_URL) {
  const urls = process.env.CLIENT_URL.split(',').map((u) => u.trim().replace(/\/$/, '')).filter(Boolean);
  urls.forEach((url) => {
    if (!allowedOrigins.includes(url)) {
      allowedOrigins.push(url);
    }
  });
}

// Experiment 8 & 10: Attach Socket.IO to the HTTP server
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// In-memory store for recent announcements during live demonstration
const liveAnnouncements = [];

// Socket.IO connection and room management
io.on('connection', (socket) => {
  console.log('[Socket.IO]: Client connected:', socket.id);

  socket.on('join-announcements', () => {
    socket.join('announcements');
    console.log(`[Socket.IO]: Socket ${socket.id} joined 'announcements' room`);
  });

  socket.on('disconnect', () => {
    console.log('[Socket.IO]: Client disconnected:', socket.id);
  });
});

// Connect to MongoDB
connectDB();

// ----------------------------------------------------
// GLOBAL SECURITY & CORE MIDDLEWARES (Experiment 5)
// ----------------------------------------------------

// Trust reverse proxy (Nginx) for rate-limiting client IP resolution
app.set('trust proxy', 1);

// 1. Helmet: Secure HTTP headers (XSS, Sniffing, Clickjacking protection)
app.use(helmet());

// 2. CORS: Explicit origin handling for frontend client
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// 3. Body parser
app.use(express.json());

// 4. Rate Limiter: Protect all /api endpoints from abuse
app.use('/api/', apiLimiter);

// Helper to extract initials
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

// POST /api/auth/login (Includes Rate Limiter & express-validator rules)
app.post('/api/auth/login', authLimiter, validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by lowercase email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized (401)',
        message: 'Invalid credentials. User profile not found.',
      });
    }

    // Compare hashed password with bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Unauthorized (401)',
        message: 'Invalid credentials. Please verify your password.',
      });
    }

    // Generate signed JWT with server-verified role
    const token = generateToken(user);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/register (Includes express-validator rules)
app.post('/api/auth/register', validateRegister, async (req, res, next) => {
  try {
    const { name, email, major, password } = req.body;

    // Check if email already registered
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: [{ field: 'email', message: 'An account with this university email already exists.' }],
      });
    }

    const avatar = getInitials(name);

    // SECURITY: Always assign base 'staff' role for public registrations
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // Mongoose pre-save hook will hash this with bcryptjs
      role: ROLES.STAFF,
      major: major ? major.trim() : 'Computer Science Student',
      university: 'State Tech University',
      avatar,
      skillsOffered: [],
      skillsWanted: [],
      securityStatus: 'Good Standing',
    });

    await newUser.save();

    const token = generateToken(newUser);

    return res.status(201).json({
      message: 'Student profile registered successfully',
      token,
      user: newUser.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me (Protected JWT route)
app.get('/api/auth/me', authenticate, async (req, res, next) => {
  try {
    return res.status(200).json({
      user: req.user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------
// EXPERIMENT 6: DEMONSTRATION PROTECTED ROUTES (JWT & RBAC)
// ----------------------------------------------------

// GET /api/protected/user (Accessible to all authenticated users: student/user and admin)
app.get('/api/protected/user', authenticate, async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: `Access granted to user protected resource. Welcome, ${req.user.name}!`,
      accessLevel: 'user',
      user: {
        id: req.user._id.toString(),
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/protected/admin (Accessible strictly to administrators; rejects normal users with 403)
app.get('/api/protected/admin', authenticate, requireRole([ROLES.ADMIN]), async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    return res.status(200).json({
      success: true,
      message: `Access granted to administrator portal. Welcome, Administrator ${req.user.name}!`,
      accessLevel: 'admin',
      adminData: {
        systemStatus: 'Operational',
        database: 'MongoDB skillsync',
        totalRegisteredUsers: totalUsers,
        adminUser: req.user.email,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------
// USER PROFILE & SKILLS ENDPOINTS
// ----------------------------------------------------

// GET /api/user/profile (JWT Protected with safe/admin projections)
app.get('/api/user/profile', optionalAuthenticate, async (req, res, next) => {
  try {
    if (req.user) {
      // If user has HR or Admin role, include admin view
      if (req.user.role === ROLES.HR || req.user.role === ROLES.ADMIN) {
        return res.status(200).json(req.user.toAdminObject());
      }
      return res.status(200).json(req.user.toSafeObject());
    }

    // Fallback default profile if unauthenticated
    const defaultUser = await User.findOne({ email: 'alex.rivera@university.edu' }) || await User.findOne({});
    if (defaultUser) {
      return res.status(200).json(defaultUser.toSafeObject());
    }

    return res.status(404).json({ error: 'No user profile found.' });
  } catch (err) {
    next(err);
  }
});

// GET /api/skills (READ All Skills)
app.get('/api/skills', optionalAuthenticate, async (req, res, next) => {
  try {
    let targetUser = req.user;
    if (!targetUser) {
      targetUser = await User.findOne({ email: 'alex.rivera@university.edu' }) || await User.findOne({});
    }

    if (!targetUser) {
      return res.status(200).json({ offered: [], wanted: [] });
    }

    return res.status(200).json({
      offered: targetUser.skillsOffered || [],
      wanted: targetUser.skillsWanted || [],
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/skills/:id (READ Single Skill)
app.get('/api/skills/:id', optionalAuthenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    let targetUser = req.user;
    if (!targetUser) {
      targetUser = await User.findOne({ email: 'alex.rivera@university.edu' }) || await User.findOne({});
    }

    let skill = targetUser?.skillsOffered?.find((s) => s.id === id) || targetUser?.skillsWanted?.find((s) => s.id === id);

    // If not found in current user, search across other users
    if (!skill) {
      const anyUser = await User.findOne({
        $or: [{ 'skillsOffered.id': id }, { 'skillsWanted.id': id }],
      });
      if (anyUser) {
        skill = anyUser.skillsOffered.find((s) => s.id === id) || anyUser.skillsWanted.find((s) => s.id === id);
      }
    }

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found with the specified ID.' });
    }

    return res.status(200).json(skill);
  } catch (err) {
    next(err);
  }
});

// POST /api/skills (CREATE Skill - Enforces skills:create permission & input validation)
app.post(
  '/api/skills',
  authenticate,
  requirePermission(PERMISSIONS.SKILLS_CREATE),
  validateCreateSkill,
  async (req, res, next) => {
    try {
      const { type, name, level, category, description } = req.body;

      const newId = `${type === 'teach' ? 's' : 'w'}-${Date.now()}`;

      if (type === 'teach') {
        const newSkill = {
          id: newId,
          name: name.trim(),
          level: level || 'Intermediate',
          category: category || 'General',
          description: description || 'Peer instruction and practical exercises.',
        };
        req.user.skillsOffered.push(newSkill);
        await req.user.save();
        return res.status(201).json(newSkill);
      } else if (type === 'learn') {
        const newSkill = {
          id: newId,
          name: name.trim(),
          targetLevel: level || 'Beginner Goal',
          category: category || 'General',
          description: description || 'Looking to learn fundamentals and best practices.',
        };
        req.user.skillsWanted.push(newSkill);
        await req.user.save();
        return res.status(201).json(newSkill);
      }
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/skills/:id (UPDATE Skill - Enforces skills:update permission & input validation)
app.patch(
  '/api/skills/:id',
  authenticate,
  requirePermission(PERMISSIONS.SKILLS_UPDATE),
  validateUpdateSkill,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      let skill = req.user.skillsOffered.find((s) => s.id === id);
      if (!skill) {
        skill = req.user.skillsWanted.find((s) => s.id === id);
      }

      if (!skill) {
        return res.status(404).json({ error: 'Skill not found with the specified ID.' });
      }

      Object.assign(skill, updates);
      await req.user.save();

      return res.status(200).json(skill);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/skills/:id (DELETE Skill - Enforces skills:delete permission)
app.delete(
  '/api/skills/:id',
  authenticate,
  requirePermission(PERMISSIONS.SKILLS_DELETE),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const initialOfferedLength = req.user.skillsOffered.length;
      req.user.skillsOffered = req.user.skillsOffered.filter((s) => s.id !== id);

      const initialWantedLength = req.user.skillsWanted.length;
      req.user.skillsWanted = req.user.skillsWanted.filter((s) => s.id !== id);

      if (
        req.user.skillsOffered.length === initialOfferedLength &&
        req.user.skillsWanted.length === initialWantedLength
      ) {
        return res.status(404).json({ error: 'Skill not found in your profile.' });
      }

      await req.user.save();

      return res.status(200).json({
        success: true,
        message: 'Skill removed successfully.',
        removedId: id,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ----------------------------------------------------
// STUDENTS & CATEGORIES ENDPOINTS
// ----------------------------------------------------

// GET /api/categories
app.get('/api/categories', async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      query = {
        $or: [
          { name: regex },
          { description: regex },
          { popularTopics: regex },
        ],
      };
    }

    const categories = await Category.find(query);
    return res.status(200).json(categories);
  } catch (err) {
    next(err);
  }
});

// GET /api/students
app.get('/api/students', optionalAuthenticate, async (req, res, next) => {
  try {
    const { search, category } = req.query;

    // Build query (exclude self if authenticated)
    let query = {};
    if (req.user) {
      query._id = { $ne: req.user._id };
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { name: regex },
        { major: regex },
        { bio: regex },
        { teaches: regex },
        { wantsToLearn: regex },
        { 'skillsOffered.name': regex },
        { 'skillsWanted.name': regex },
      ];
    }

    const students = await User.find(query);
    let result = students.map((std) => std.toSafeObject());

    if (category && category !== 'All') {
      const catLower = category.toLowerCase();
      result = result.filter(
        (std) =>
          std.teaches?.some((t) => t.toLowerCase().includes(catLower)) ||
          std.wantsToLearn?.some((w) => w.toLowerCase().includes(catLower)) ||
          std.skillsOffered?.some((s) => s.category?.toLowerCase().includes(catLower))
      );
    }

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------
// ACTIVITY & SWAP REQUESTS ENDPOINTS (PROTECTED VIEWS)
// ----------------------------------------------------

// GET /api/activity (Protected View: Sensitive audit logs filtered for regular users)
app.get('/api/activity', optionalAuthenticate, async (req, res, next) => {
  try {
    const userRole = req.user?.role;

    const canViewRestricted = userRole && (
      userRole === ROLES.HR ||
      userRole === ROLES.AUDITOR ||
      userRole === ROLES.ADMIN
    );

    let query = {};
    if (!canViewRestricted) {
      query = { isRestricted: false };
    }

    const activities = await Activity.find(query).sort({ createdAt: -1 }).limit(20);
    return res.status(200).json(activities);
  } catch (err) {
    next(err);
  }
});

// POST /api/swap-requests (Enforces swaps:create permission)
app.post(
  '/api/swap-requests',
  authenticate,
  requirePermission(PERMISSIONS.SWAPS_CREATE),
  async (req, res, next) => {
    try {
      const { studentId, studentName, offeredSkill, wantedSkill, note } = req.body;

      if (!studentId || !studentName) {
        return res.status(400).json({ error: 'Target student information is required.' });
      }

      const swapRequest = new SwapRequest({
        studentId,
        studentName,
        requesterId: req.user._id,
        requesterName: req.user.name,
        offeredSkill: offeredSkill || 'Web Development',
        wantedSkill: wantedSkill || 'Tutoring',
        note: note || '',
        status: 'Pending Review',
      });

      await swapRequest.save();

      const newActivity = new Activity({
        id: `act-${Date.now()}`,
        type: 'request_sent',
        title: `Swap Proposal Sent to ${studentName}`,
        detail: note || `Proposed 1-on-1 session exchanging ${offeredSkill || 'Skills'} for ${wantedSkill || 'tutoring'}.`,
        timestamp: 'Just now',
        status: 'Pending Review',
        partner: studentName,
        userId: req.user._id,
        isRestricted: false,
      });

      await newActivity.save();

      return res.status(201).json({
        success: true,
        message: `Swap request successfully sent to ${studentName}`,
        activity: newActivity,
        swapRequest,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ----------------------------------------------------
// RBAC AUDIT & MANAGEMENT ENDPOINTS
// ----------------------------------------------------

// GET /api/rbac/permissions (Returns role capabilities & permission matrix)
app.get('/api/rbac/permissions', optionalAuthenticate, (req, res) => {
  const currentRole = req.user?.role || 'anonymous';
  return res.status(200).json({
    currentRole,
    grantedPermissions: req.user ? ROLE_PERMISSIONS[currentRole] || [] : [],
    allRoles: ROLES,
    permissionMatrix: ROLE_PERMISSIONS,
  });
});

// GET /api/admin/users (Admin / HR only: shows full student directory with securityStatus & internal notes)
app.get('/api/admin/users', authenticate, requireRole([ROLES.ADMIN, ROLES.HR]), async (req, res, next) => {
  try {
    const users = await User.find({}).select('+internalModerationNotes');
    const fullUsers = users.map((u) => u.toAdminObject());
    return res.status(200).json(fullUsers);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/users/:id/role (Admin only: changes a user's role)
app.patch('/api/admin/users/:id/role', authenticate, requireRole([ROLES.ADMIN]), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, moderationNote } = req.body;

    if (!Object.values(ROLES).includes(role)) {
      return res.status(400).json({
        error: `Invalid role specified. Valid roles are: ${Object.values(ROLES).join(', ')}`,
      });
    }

    const user = await User.findById(id).select('+internalModerationNotes');
    if (!user) {
      return res.status(404).json({ error: 'User record not found.' });
    }

    const oldRole = user.role;
    user.role = role;
    if (moderationNote) {
      user.internalModerationNotes = moderationNote;
    }
    await user.save();

    // Log admin audit action
    const auditActivity = new Activity({
      id: `act-sec-${Date.now()}`,
      type: 'role_assigned',
      title: `Role Modified: ${user.name}`,
      detail: `Administrator ${req.user.name} modified role for ${user.name} from '${oldRole}' to '${role}'.`,
      timestamp: 'Just now',
      status: 'Role Updated',
      partner: req.user.name,
      isRestricted: true,
    });
    await auditActivity.save();

    return res.status(200).json({
      success: true,
      message: `User ${user.name} role successfully updated to ${role}.`,
      user: user.toAdminObject(),
    });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------
// EXPERIMENT 8: REAL-TIME ANNOUNCEMENTS (SOCKET.IO)
// ----------------------------------------------------

// POST /api/announcements (Authorized Admin publishes real-time announcement)
app.post(
  '/api/announcements',
  authenticate,
  requireRole([ROLES.ADMIN]),
  (req, res) => {
    const { message } = req.body;

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Announcement message is required',
      });
    }

    const announcement = {
      id: `ann-${Date.now()}`,
      message: message.trim(),
      author: req.user?.name || 'Administrator',
      timestamp: new Date().toISOString(),
    };

    // Keep the latest 50 announcements in memory for live demonstration
    liveAnnouncements.unshift(announcement);
    if (liveAnnouncements.length > 50) {
      liveAnnouncements.pop();
    }

    // Broadcast to all clients in the announcements room
    io.to('announcements').emit('new-announcement', announcement);

    return res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      announcement,
    });
  }
);

// GET /api/announcements (Fetch recent live announcements)
app.get('/api/announcements', optionalAuthenticate, (req, res) => {
  return res.status(200).json({
    success: true,
    announcements: liveAnnouncements,
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    database: 'MongoDB Connected',
    databaseName: 'skillsync',
    securityHeaders: 'Helmet Active',
    rateLimiting: 'express-rate-limit Active',
    realTimeSocket: 'Socket.IO Active',
    timestamp: new Date().toISOString(),
  });
});

// ----------------------------------------------------
// SECURE ERROR HANDLING (Mounted at bottom)
// ----------------------------------------------------

// Catch-all 404 Handler for undefined API routes
app.use(notFoundHandler);

// Global Centralized Error Handler (suppresses raw stack traces)
app.use(errorHandler);

// Start Server (HTTP + Socket.IO)
server.listen(PORT, () => {
  console.log(`[SkillSync API]: Server running on http://localhost:${PORT}`);
});
