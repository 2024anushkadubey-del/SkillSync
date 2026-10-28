import React, { useState } from 'react';
import useSWR from 'swr';
import {
  GraduationCap,
  Star,
  Plus,
  Clock,
  Sparkles,
  CheckCircle,
  Repeat,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  Calendar,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Eye,
  Key,
  Users,
  Check,
  XCircle,
  Database,
  ArrowRight,
  Radio,
} from 'lucide-react';

import Button from '../components/Button';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import StudentCard from '../components/StudentCard';
import LiveAnnouncements from '../components/LiveAnnouncements';
import { useAuth } from '../hooks/useAuth';
import { useSkills } from '../hooks/useSkills';
import { useSessionTime } from '../hooks/useSessionTime';
import { fetcher, activityApi, protectedApi } from '../services/api';
import api from '../services/api';
import { mockCurrentUser, mockSuggestedStudents, mockRecentActivity } from '../data/mockData';

// Static RBAC Permission Matrix for Experiment 4 reference
const RBAC_MATRIX = [
  { perm: 'skills:view', label: 'View Skills Catalog', desc: 'Browse public skills & search', staff: true, senior: true, hr: true, auditor: true, admin: true },
  { perm: 'skills:create', label: 'Add Skills', desc: 'Publish teach & learn skills', staff: true, senior: true, hr: true, auditor: false, admin: true },
  { perm: 'skills:delete', label: 'Delete Skills', desc: 'Remove existing skills', staff: true, senior: true, hr: true, auditor: false, admin: true },
  { perm: 'swaps:create', label: 'Send Swap Requests', desc: 'Propose 1-on-1 exchanges', staff: true, senior: true, hr: true, auditor: false, admin: true },
  { perm: 'users:view', label: 'View Student Directory', desc: 'Browse public student profiles', staff: true, senior: true, hr: true, auditor: true, admin: true },
  { perm: 'users:view_sensitive', label: 'View Sensitive Moderation Notes', desc: 'Restricted administrative view', staff: false, senior: false, hr: true, auditor: false, admin: true },
  { perm: 'users:manage_role', label: 'Manage & Assign Roles', desc: 'Promote/demote user RBAC roles', staff: false, senior: false, hr: false, auditor: false, admin: true },
  { perm: 'audit:view', label: 'Inspect Security Audit Logs', desc: 'Compliance audit trail inspection', staff: false, senior: false, hr: true, auditor: true, admin: true },
];

export default function Dashboard() {
  const { user: authUser } = useAuth();
  const { skillsOffered, skillsWanted, addSkill, removeSkill } = useSkills();
  const { currentDate, currentTime } = useSessionTime();
  const [activeTab, setActiveTab] = useState('overview');

  // SWR: Fetch live profile and user skill data
  const {
    data: userProfile,
    error: profileError,
    isLoading: isProfileLoading,
    mutate: mutateProfile,
  } = useSWR('/api/user/profile', fetcher, {
    fallbackData: {
      ...mockCurrentUser,
      ...(authUser ? { name: authUser.name, email: authUser.email, role: authUser.role, avatar: authUser.avatar } : {}),
    },
    revalidateOnFocus: true,
  });

  // SWR: Fetch suggested campus matches
  const {
    data: suggestedStudents,
    error: studentsError,
    isLoading: isStudentsLoading,
  } = useSWR('/api/students', fetcher, {
    fallbackData: mockSuggestedStudents,
  });

  // SWR: Fetch live activity log and swap proposals (includes sensitive logs for auditor/admin)
  const {
    data: activities,
    error: activitiesError,
    isLoading: isActivitiesLoading,
    mutate: mutateActivities,
  } = useSWR('/api/activity', fetcher, {
    fallbackData: mockRecentActivity,
  });

  // SWR: Admin / HR users list (if privileged)
  const isPrivileged = authUser?.role === 'admin' || authUser?.role === 'HR';
  const {
    data: adminUsers,
    mutate: mutateAdminUsers,
  } = useSWR(isPrivileged ? '/api/admin/users' : null, fetcher);

  // Display user state fallback
  const user = userProfile || {
    ...mockCurrentUser,
    ...(authUser ? { name: authUser.name, email: authUser.email, role: authUser.role, avatar: authUser.avatar } : {}),
  };

  const currentRole = (authUser?.role || user?.role || 'staff').toLowerCase();
  const isAuditor = currentRole === 'auditor';
  const isAdmin = currentRole === 'admin';
  const isHR = currentRole === 'hr';

  const studentsList = Array.isArray(suggestedStudents) ? suggestedStudents : mockSuggestedStudents;
  const activityList = Array.isArray(activities) ? activities : mockRecentActivity;

  // Form State: Add Teach Skill
  const [newTeachSkill, setNewTeachSkill] = useState('');
  const [newTeachLevel, setNewTeachLevel] = useState('Intermediate');
  const [isAddingTeach, setIsAddingTeach] = useState(false);
  const [teachError, setTeachError] = useState('');

  // Form State: Add Learn Skill
  const [newLearnSkill, setNewLearnSkill] = useState('');
  const [newLearnLevel, setNewLearnLevel] = useState('Beginner');
  const [isAddingLearn, setIsAddingLearn] = useState(false);
  const [learnError, setLearnError] = useState('');

  // Modals state
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);
  const [swapModalStudent, setSwapModalStudent] = useState(null);
  const [swapNote, setSwapNote] = useState('');
  const [activityModalItem, setActivityModalItem] = useState(null);
  const [requestedStudents, setRequestedStudents] = useState({});
  const [isSubmittingSwap, setIsSubmittingSwap] = useState(false);
  const [swapSuccess, setSwapSuccess] = useState(false);
  const [swapError, setSwapError] = useState('');

  // Admin Role Update State
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [adminActionMessage, setAdminActionMessage] = useState('');

  // Experiment 6: JWT & Role Test Console State
  const [exp6UserResult, setExp6UserResult] = useState(null);
  const [exp6AdminResult, setExp6AdminResult] = useState(null);
  const [isTestingUserRoute, setIsTestingUserRoute] = useState(false);
  const [isTestingAdminRoute, setIsTestingAdminRoute] = useState(false);

  const testUserRoute = async () => {
    setIsTestingUserRoute(true);
    setExp6UserResult(null);
    try {
      const res = await protectedApi.getUserData();
      setExp6UserResult({ success: true, status: 200, data: res });
    } catch (err) {
      setExp6UserResult({
        success: false,
        status: err.status || 401,
        message: err.message || 'Access Denied',
        data: err.data,
      });
    } finally {
      setIsTestingUserRoute(false);
    }
  };

  const testAdminRoute = async () => {
    setIsTestingAdminRoute(true);
    setExp6AdminResult(null);
    try {
      const res = await protectedApi.getAdminData();
      setExp6AdminResult({ success: true, status: 200, data: res });
    } catch (err) {
      setExp6AdminResult({
        success: false,
        status: err.status || 403,
        message: err.message || 'Access Denied (403 Forbidden)',
        data: err.data,
      });
    } finally {
      setIsTestingAdminRoute(false);
    }
  };

  // ----------------------------------------------------
  // SKILL MUTATION HANDLERS
  // ----------------------------------------------------

  const handleAddTeachSkill = async (e) => {
    e.preventDefault();
    if (!newTeachSkill.trim()) {
      setTeachError('Please enter a valid skill name.');
      return;
    }
    setTeachError('');
    setIsAddingTeach(true);

    try {
      await addSkill({
        type: 'teach',
        name: newTeachSkill.trim(),
        level: newTeachLevel,
        category: 'Development',
      });
      setNewTeachSkill('');
    } catch (err) {
      setTeachError(err.message || 'Failed to add teaching skill. Please try again.');
    } finally {
      setIsAddingTeach(false);
    }
  };

  const handleRemoveTeachSkill = async (id) => {
    try {
      setTeachError('');
      await removeSkill(id);
    } catch (err) {
      setTeachError(err.message || 'Failed to remove skill.');
    }
  };

  const handleAddLearnSkill = async (e) => {
    e.preventDefault();
    if (!newLearnSkill.trim()) {
      setLearnError('Please enter a target skill name.');
      return;
    }
    setLearnError('');
    setIsAddingLearn(true);

    try {
      await addSkill({
        type: 'learn',
        name: newLearnSkill.trim(),
        level: newLearnLevel,
        category: 'Design',
      });
      setNewLearnSkill('');
    } catch (err) {
      setLearnError(err.message || 'Failed to add target learning skill. Please try again.');
    } finally {
      setIsAddingLearn(false);
    }
  };

  const handleRemoveLearnSkill = async (id) => {
    try {
      setLearnError('');
      await removeSkill(id);
    } catch (err) {
      setLearnError(err.message || 'Failed to remove skill.');
    }
  };

  // ----------------------------------------------------
  // SWAP REQUEST MUTATION HANDLERS
  // ----------------------------------------------------

  const handleInitiateSwap = (student) => {
    setSwapModalStudent(student);
    setSwapNote(`Hi ${student.name}! I'd like to schedule an exchange session to learn ${student.teaches?.[0] || 'skills'}.`);
    setSwapSuccess(false);
    setSwapError('');
  };

  const handleConfirmSwap = async () => {
    if (!swapModalStudent) return;
    setIsSubmittingSwap(true);
    setSwapError('');

    try {
      await activityApi.createSwapRequest({
        studentId: swapModalStudent.id || swapModalStudent._id,
        studentName: swapModalStudent.name,
        offeredSkill: skillsOffered[0]?.name || 'Web Development',
        wantedSkill: swapModalStudent.teaches?.[0] || 'Peer Tutoring',
        note: swapNote,
      });

      setRequestedStudents((prev) => ({
        ...prev,
        [swapModalStudent.id || swapModalStudent._id]: true,
      }));

      await mutateActivities();
      setSwapSuccess(true);

      setTimeout(() => {
        setSwapModalStudent(null);
        setSwapSuccess(false);
      }, 1400);
    } catch (err) {
      setSwapError(err.message || 'Failed to send swap request. (Auditor accounts lack swaps:create permission)');
    } finally {
      setIsSubmittingSwap(false);
    }
  };

  // ----------------------------------------------------
  // ADMIN ROLE CHANGE HANDLER
  // ----------------------------------------------------
  const handleChangeUserRole = async (targetId, newRole) => {
    setUpdatingUserId(targetId);
    setAdminActionMessage('');
    try {
      const res = await api.patch(`/admin/users/${targetId}/role`, {
        role: newRole,
        moderationNote: `Role changed to ${newRole} by admin on ${new Date().toLocaleDateString()}`,
      });
      setAdminActionMessage(`Role successfully updated to '${newRole}'.`);
      await mutateAdminUsers();
      await mutateActivities();
    } catch (err) {
      setAdminActionMessage(err.message || 'Failed to update user role.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'rose';
      case 'auditor': return 'amber';
      case 'hr': return 'purple';
      case 'senior': return 'blue';
      default: return 'forest';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      
      {/* AUDITOR READ-ONLY SECURITY BANNER */}
      {isAuditor && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3.5 text-amber-900 shadow-2xs animate-slide-up">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-sm text-amber-950 flex items-center gap-2">
              <span>Auditor Mode · Read Only</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-bold">
                Role: Auditor
              </span>
            </p>
            <p className="text-amber-800 leading-relaxed">
              You are signed in with the <strong>Auditor</strong> role. You have read-only access across student profiles, categories, and activity records. Skill creation, deletion, and swap proposals are restricted for this role.
            </p>
          </div>
        </div>
      )}

      {/* WORKSPACE STATUS & DATABASE STRIP */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white rounded-xl border border-stone-200/90 text-xs text-stone-600 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
          </span>
          <span className="font-bold text-stone-900 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-forest-800" />
            MongoDB Connected
          </span>
          <span className="text-stone-300 hidden sm:inline">•</span>
          <span className="text-stone-500 hidden sm:inline font-mono">db: skillsync</span>
          <span className="text-stone-300 hidden sm:inline">•</span>
          <span className="text-stone-500 hidden sm:inline">{user.university}</span>
        </div>
        <div className="flex items-center gap-3 text-stone-500 font-medium">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span>{currentDate}</span>
          </span>
          <span className="text-stone-300">•</span>
          <span className="flex items-center gap-1.5 text-forest-900 font-semibold tabular-nums">
            <Clock className="w-3.5 h-3.5 text-forest-700" />
            <span>{currentTime}</span>
          </span>
        </div>
      </div>

      {/* WELCOME BANNER */}
      <div className="bg-sand-100 rounded-2xl p-6 sm:p-8 border border-sand-300/80 flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
              currentRole === 'admin' ? 'bg-rose-100 text-rose-800 border-rose-300' :
              currentRole === 'auditor' ? 'bg-amber-100 text-amber-800 border-amber-300' :
              currentRole === 'hr' ? 'bg-purple-100 text-purple-800 border-purple-300' :
              currentRole === 'senior' ? 'bg-blue-100 text-blue-800 border-blue-300' :
              'bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}>
              Role: {currentRole.toUpperCase()}
            </span>
            <span className="text-xs text-stone-500 font-medium">
              {user.securityStatus || 'Verified Account'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Welcome back, {user.name} 👋
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
            You currently have <strong className="text-stone-900 font-bold">{skillsOffered?.length || 0} skills</strong> listed to teach and <strong className="text-stone-900 font-bold">{skillsWanted?.length || 0} skills</strong> to learn.
          </p>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-3 rounded-xl border border-stone-200 text-center min-w-[95px] shadow-2xs">
            <span className="block text-2xl font-black text-stone-900">{user.completedSwaps || 0}</span>
            <span className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">Swaps Done</span>
          </div>

          <div className="bg-white px-4 py-3 rounded-xl border border-stone-200 text-center min-w-[95px] shadow-2xs">
            <div className="flex items-center justify-center space-x-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <span className="text-2xl font-black text-stone-900">{user.rating || 4.9}</span>
            </div>
            <span className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">Peer Rating</span>
          </div>
        </div>
      </div>

      {/* DASHBOARD TAB NAVIGATION */}
      <div className="border-b border-stone-200 flex items-center space-x-2 overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-forest-900 text-forest-900 bg-white shadow-2xs'
              : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
          }`}
        >
          Overview & Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('skills')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'skills'
              ? 'border-forest-900 text-forest-900 bg-white shadow-2xs'
              : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
          }`}
        >
          My Skills ({(skillsOffered?.length || 0) + (skillsWanted?.length || 0)})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('matches')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'matches'
              ? 'border-forest-900 text-forest-900 bg-white shadow-2xs'
              : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
          }`}
        >
          Suggested Matches ({studentsList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'activity'
              ? 'border-forest-900 text-forest-900 bg-white shadow-2xs'
              : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
          }`}
        >
          Recent Activity ({activityList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('rbac')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'rbac'
              ? 'border-forest-900 text-forest-900 bg-white shadow-2xs'
              : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-forest-700" />
          <span>Access & Permissions</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'announcements'
              ? 'border-forest-900 text-forest-900 bg-white shadow-2xs'
              : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-forest-700" />
          <span>Live Announcements</span>
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Experiment 8: Real-Time Live Announcements Stream */}
          <LiveAnnouncements isAdmin={isAdmin} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main 2 Cols: Profile Summary + Skills Overview */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Student Profile Card */}
            <div className="card-surface p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100">
                <div className="flex items-center space-x-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-forest-900 text-white font-black text-xl flex items-center justify-center shadow-2xs">
                    {user.avatar || 'AR'}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-stone-900">{user.name}</h2>
                    <p className="text-xs font-medium text-forest-800 flex items-center gap-1.5 mt-0.5">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {user.major || user.role}
                    </p>
                    <p className="text-[11px] text-stone-500 mt-0.5">{user.university}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                    currentRole === 'admin' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                    currentRole === 'auditor' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    currentRole === 'hr' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                    currentRole === 'senior' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                    'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    Role: {currentRole}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500 block mb-1.5">
                  Student Bio & Focus
                </span>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-sand-50/70 p-3.5 rounded-xl border border-stone-200/80">
                  "{user.bio}"
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500 block mb-1">
                  Availability for Peer Swaps
                </span>
                <div className="flex items-center gap-2 text-xs text-stone-700">
                  <Clock className="w-3.5 h-3.5 text-forest-700" />
                  <span>{user.availability}</span>
                </div>
              </div>
            </div>

            {/* Quick Skills Summary Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Skills I Can Teach Snippet */}
              <div className="card-surface p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-forest-600" />
                    Skills I Can Teach
                  </h3>
                  <Badge variant="forest" size="sm">
                    {skillsOffered?.length || 0} Active
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[50px]">
                  {skillsOffered?.length === 0 ? (
                    <span className="text-xs text-stone-400 italic">No teaching skills added yet.</span>
                  ) : (
                    skillsOffered?.map((skill) => (
                      <Badge key={skill.id} variant="forest" size="md">
                        <span>{skill.name}</span>
                        <span className="text-[10px] opacity-75">({skill.level})</span>
                      </Badge>
                    ))
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('skills')}
                  className="w-full text-xs"
                >
                  Manage Teach Skills
                </Button>
              </div>

              {/* Skills I Want to Learn Snippet */}
              <div className="card-surface p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-stone-500" />
                    Skills I Want to Learn
                  </h3>
                  <Badge variant="neutral" size="sm">
                    {skillsWanted?.length || 0} Target
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[50px]">
                  {skillsWanted?.length === 0 ? (
                    <span className="text-xs text-stone-400 italic">No target skills added yet.</span>
                  ) : (
                    skillsWanted?.map((skill) => (
                      <Badge key={skill.id} variant="neutral" size="md">
                        <span>{skill.name}</span>
                        <span className="text-[10px] opacity-75">({skill.targetLevel || skill.level})</span>
                      </Badge>
                    ))
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('skills')}
                  className="w-full text-xs"
                >
                  Manage Learn Skills
                </Button>
              </div>

            </div>

          </div>

          {/* Right Column: Activity Feed Snippet */}
          <div className="space-y-6">
            <div className="card-surface p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-forest-800" />
                  Recent Activity
                </h3>
                <span className="text-[10px] uppercase tracking-wider font-bold text-stone-400">
                  Updates
                </span>
              </div>

              <div className="space-y-3">
                {activityList.slice(0, 3).map((act) => (
                  <div
                    key={act.id}
                    onClick={() => setActivityModalItem(act)}
                    className="p-3 rounded-xl bg-sand-50/60 border border-stone-200/80 hover:bg-stone-50 cursor-pointer transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-900">{act.title}</span>
                      <span className="text-[10px] text-stone-400">{act.timestamp}</span>
                    </div>
                    <p className="text-xs text-stone-600 line-clamp-2">{act.detail}</p>
                    <div className="pt-1 flex items-center justify-between">
                      <Badge variant="neutral" size="sm">
                        {act.status}
                      </Badge>
                      <span className="text-[10px] text-forest-800 font-semibold">
                        Details →
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('activity')}
                className="w-full text-xs"
              >
                View Full Activity History
              </Button>
            </div>

            {/* Quick RBAC Info Snippet */}
            <div className="card-surface p-5 bg-forest-50/50 border-forest-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-forest-900">
                <ShieldCheck className="w-4 h-4 text-forest-700" />
                <span>Role-Based Access</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Your permissions are determined by your role (<strong>{currentRole}</strong>). You can sign in with different roles from the login screen to access specific features.
              </p>
            </div>
          </div>

        </div>
        </div>
      )}

      {/* 2. MY SKILLS TAB */}
      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          
          {/* Skills I Can Teach Section */}
          <div className="card-surface p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-forest-600" />
                  Skills I Can Teach
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Subjects you feel confident tutoring or reviewing with peers.
                </p>
              </div>
              <Badge variant="forest" size="md">
                {skillsOffered?.length || 0} Listed
              </Badge>
            </div>

            {teachError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{teachError}</span>
              </div>
            )}

            {/* Skills List with Remove Action */}
            <div className="space-y-2.5 min-h-[120px]">
              {skillsOffered?.length === 0 ? (
                <p className="text-xs text-stone-400 italic py-4 text-center">No skills listed yet. Add one below!</p>
              ) : (
                skillsOffered?.map((skill) => (
                  <div
                    key={skill.id}
                    className="p-3 rounded-xl bg-forest-50/50 border border-forest-200/70 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900">{skill.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-forest-200/80 text-forest-900 font-bold">
                          {skill.level}
                        </span>
                      </div>
                      {skill.description && (
                        <p className="text-[11px] text-stone-500 mt-0.5">{skill.description}</p>
                      )}
                    </div>
                    {!isAuditor && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTeachSkill(skill.id)}
                        className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-white transition-colors"
                        title="Remove skill"
                        aria-label="Remove skill"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Add Skill Form */}
            {isAuditor ? (
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Read-Only Account: Skill creation disabled for Auditor role.</span>
              </div>
            ) : (
              <form onSubmit={handleAddTeachSkill} className="space-y-3 pt-3 border-t border-stone-100">
                <label className="form-label">Add a Skill You Can Teach</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newTeachSkill}
                    onChange={(e) => setNewTeachSkill(e.target.value)}
                    placeholder="e.g. Tailwind CSS, Linear Algebra..."
                    className="form-input flex-1"
                    disabled={isAddingTeach}
                  />
                  <select
                    value={newTeachLevel}
                    onChange={(e) => setNewTeachLevel(e.target.value)}
                    className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-forest-800/20"
                    disabled={isAddingTeach}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <Button type="submit" size="sm" className="whitespace-nowrap" disabled={isAddingTeach || !newTeachSkill.trim()}>
                    {isAddingTeach ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Skills I Want to Learn Section */}
          <div className="card-surface p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-500" />
                  Skills I Want to Learn
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Subjects you want to pick up from peers this semester.
                </p>
              </div>
              <Badge variant="neutral" size="md">
                {skillsWanted?.length || 0} Target
              </Badge>
            </div>

            {learnError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{learnError}</span>
              </div>
            )}

            {/* Skills List with Remove Action */}
            <div className="space-y-2.5 min-h-[120px]">
              {skillsWanted?.length === 0 ? (
                <p className="text-xs text-stone-400 italic py-4 text-center">No skills requested yet. Add one below!</p>
              ) : (
                skillsWanted?.map((skill) => (
                  <div
                    key={skill.id}
                    className="p-3 rounded-xl bg-sand-50 border border-stone-200 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900">{skill.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-200 text-stone-800 font-bold">
                          {skill.targetLevel || skill.level}
                        </span>
                      </div>
                      {skill.description && (
                        <p className="text-[11px] text-stone-500 mt-0.5">{skill.description}</p>
                      )}
                    </div>
                    {!isAuditor && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLearnSkill(skill.id)}
                        className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-white transition-colors"
                        title="Remove skill"
                        aria-label="Remove skill"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Add Skill Form */}
            {isAuditor ? (
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Read-Only Account: Skill creation disabled for Auditor role.</span>
              </div>
            ) : (
              <form onSubmit={handleAddLearnSkill} className="space-y-3 pt-3 border-t border-stone-100">
                <label className="form-label">Add a Target Skill to Learn</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newLearnSkill}
                    onChange={(e) => setNewLearnSkill(e.target.value)}
                    placeholder="e.g. Machine Learning, German..."
                    className="form-input flex-1"
                    disabled={isAddingLearn}
                  />
                  <select
                    value={newLearnLevel}
                    onChange={(e) => setNewLearnLevel(e.target.value)}
                    className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-forest-800/20"
                    disabled={isAddingLearn}
                  >
                    <option value="Beginner">Beginner Goal</option>
                    <option value="Conversational">Conversational</option>
                    <option value="Intermediate">Intermediate Goal</option>
                    <option value="Advanced">Advanced Goal</option>
                  </select>
                  <Button type="submit" size="sm" className="whitespace-nowrap" disabled={isAddingLearn || !newLearnSkill.trim()}>
                    {isAddingLearn ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>

        </div>
      )}

      {/* 3. SUGGESTED MATCHES TAB */}
      {activeTab === 'matches' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                Suggested Student Skill Matches
              </h3>
              <p className="text-xs text-stone-500">
                Peers on campus whose skills complement your profile.
              </p>
            </div>
            <Badge variant="forest" size="md">
              {studentsList.length} Compatible Matches
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {studentsList.map((student) => (
              <StudentCard
                key={student.id || student._id}
                student={student}
                isRequested={!!requestedStudents[student.id || student._id]}
                onViewProfile={(std) => setSelectedStudentForModal(std)}
                onRequestSwap={(std) => handleInitiateSwap(std)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 4. RECENT ACTIVITY TAB */}
      {activeTab === 'activity' && (
        <div className="card-surface p-6 space-y-6 animate-fade-in max-w-3xl mx-auto">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Exchange Session & Request Log
              </h3>
              <p className="text-xs text-stone-500">
                History of completed peer swaps and pending invitations.
                {(isAuditor || isAdmin || isHR) && (
                  <span className="ml-1 text-forest-800 font-bold">(Includes Protected Security Audits)</span>
                )}
              </p>
            </div>
            <Badge variant="neutral" size="sm">
              {activityList.length} Records
            </Badge>
          </div>

          <div className="space-y-4">
            {activityList.map((act) => (
              <div
                key={act.id || act._id}
                onClick={() => setActivityModalItem(act)}
                className={`p-4 rounded-xl border cursor-pointer transition-colors space-y-2 ${
                  act.isRestricted
                    ? 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/60'
                    : 'bg-sand-50/70 border-stone-200/80 hover:bg-sand-100/60'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm">{act.title}</span>
                    {act.isRestricted && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                        Restricted Audit
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-stone-400">{act.timestamp}</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{act.detail}</p>
                <div className="pt-2 flex items-center justify-between border-t border-stone-200/50">
                  <Badge variant={act.isRestricted ? 'amber' : 'forest'} size="sm">
                    {act.status}
                  </Badge>
                  <span className="text-xs text-forest-800 font-semibold">
                    View Log Details →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. RBAC SECURITY MATRIX TAB (EXPERIMENT 4 CORE ARTIFACT) */}
      {activeTab === 'rbac' && (
        <div className="space-y-8 animate-fade-in">

          {/* Top Header Card */}
          <div className="card-surface p-6 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-forest-800" />
                  <h2 className="text-lg sm:text-xl font-bold text-stone-900">
                    Access Control & Role Permissions
                  </h2>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Role definitions, permissions, and security policies for SkillSync.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 font-medium">Your Active Role:</span>
                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-xl border ${
                  currentRole === 'admin' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                  currentRole === 'auditor' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                  currentRole === 'hr' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                  currentRole === 'senior' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                  'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  {currentRole}
                </span>
              </div>
            </div>

            {/* Role Hierarchy Tree Visualization */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                1. Role Hierarchy
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <div className="font-bold text-emerald-950 flex items-center justify-between">
                    <span>1. Staff (Student)</span>
                    <Badge variant="success" size="sm">Base</Badge>
                  </div>
                  <p className="text-emerald-800 text-[11px]">
                    Standard student member. Can manage own skills and send swap requests.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                  <div className="font-bold text-blue-950 flex items-center justify-between">
                    <span>2. Senior Mentor</span>
                    <Badge variant="blue" size="sm">Inherits Staff</Badge>
                  </div>
                  <p className="text-blue-800 text-[11px]">
                    Inherits all Staff capabilities + mentor workshop endorsements.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 space-y-1">
                  <div className="font-bold text-purple-950 flex items-center justify-between">
                    <span>3. Coordinator (HR)</span>
                    <Badge variant="purple" size="sm">Management</Badge>
                  </div>
                  <p className="text-purple-800 text-[11px]">
                    Category management, student moderation notes & restricted audit logs.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                  <div className="font-bold text-amber-950 flex items-center justify-between">
                    <span>4. Auditor</span>
                    <Badge variant="amber" size="sm">Read-Only</Badge>
                  </div>
                  <p className="text-amber-800 text-[11px]">
                    Strictly read-only inspection across all collections. Zero write/delete.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-rose-950">5. System Admin: </span>
                  <span className="text-rose-800 text-[11px]">
                    Full root authorization across all models, role changes, sensitive views, and system logs.
                  </span>
                </div>
                <Badge variant="rose" size="sm">Full Access</Badge>
              </div>
            </div>
          </div>

          {/* Access Control Permission Matrix Table */}
          <div className="card-surface p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  2. Permission Matrix
                </h3>
                <p className="text-xs text-stone-500">
                  Summary of permissions and access levels by role.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-sand-50/80 text-stone-700">
                    <th className="p-3 font-bold">Permission / Capability</th>
                    <th className="p-3 font-bold">Description</th>
                    <th className={`p-3 font-bold text-center ${currentRole === 'staff' ? 'bg-emerald-100 text-emerald-950' : ''}`}>Staff</th>
                    <th className={`p-3 font-bold text-center ${currentRole === 'senior' ? 'bg-blue-100 text-blue-950' : ''}`}>Senior</th>
                    <th className={`p-3 font-bold text-center ${currentRole === 'hr' ? 'bg-purple-100 text-purple-950' : ''}`}>HR</th>
                    <th className={`p-3 font-bold text-center ${currentRole === 'auditor' ? 'bg-amber-100 text-amber-950' : ''}`}>Auditor</th>
                    <th className={`p-3 font-bold text-center ${currentRole === 'admin' ? 'bg-rose-100 text-rose-950' : ''}`}>Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {RBAC_MATRIX.map((row) => (
                    <tr key={row.perm} className="hover:bg-sand-50/40 transition-colors">
                      <td className="p-3 font-mono text-[11px] font-bold text-stone-900">{row.perm}</td>
                      <td className="p-3 text-stone-600">{row.label}</td>
                      <td className={`p-3 text-center ${currentRole === 'staff' ? 'bg-emerald-50/50' : ''}`}>
                        {row.staff ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-stone-300 mx-auto" />}
                      </td>
                      <td className={`p-3 text-center ${currentRole === 'senior' ? 'bg-blue-50/50' : ''}`}>
                        {row.senior ? <Check className="w-4 h-4 text-blue-600 mx-auto" /> : <X className="w-4 h-4 text-stone-300 mx-auto" />}
                      </td>
                      <td className={`p-3 text-center ${currentRole === 'hr' ? 'bg-purple-50/50' : ''}`}>
                        {row.hr ? <Check className="w-4 h-4 text-purple-600 mx-auto" /> : <X className="w-4 h-4 text-stone-300 mx-auto" />}
                      </td>
                      <td className={`p-3 text-center ${currentRole === 'auditor' ? 'bg-amber-50/50' : ''}`}>
                        {row.auditor ? <Check className="w-4 h-4 text-amber-600 mx-auto" /> : <X className="w-4 h-4 text-rose-400 mx-auto" />}
                      </td>
                      <td className={`p-3 text-center ${currentRole === 'admin' ? 'bg-rose-50/50' : ''}`}>
                        {row.admin ? <Check className="w-4 h-4 text-rose-600 mx-auto" /> : <X className="w-4 h-4 text-stone-300 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Protected Sensitive Data & Views (Part 8 Demonstration) */}
          <div className="card-surface p-6 space-y-4">
            <div className="pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-forest-800" />
                3. Protected Data & Security
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                How sensitive records and private fields are protected across the platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-sand-50 border border-stone-200 space-y-2">
                <span className="font-bold text-stone-900 block text-sm">🔒 Passwords</span>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  Never returned in any API responses. Passwords are encrypted one-way using <strong>bcryptjs (10 salt rounds)</strong> before MongoDB persistence.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-sand-50 border border-stone-200 space-y-2">
                <span className="font-bold text-stone-900 block text-sm">🛡️ Internal Moderation Notes</span>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  Hidden by default (<code className="font-mono">select: false</code> in Mongoose). Only projected when authenticated requester has <strong>HR</strong> or <strong>Admin</strong> privileges.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-sand-50 border border-stone-200 space-y-2">
                <span className="font-bold text-stone-900 block text-sm">📋 Security Audit Logs</span>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  Restricted system activities (<code className="font-mono">isRestricted: true</code>) are omitted for standard student queries and only visible to <strong>Auditor</strong>, <strong>HR</strong>, and <strong>Admin</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Admin / HR Live Student Security & Role Management (Admin only) */}
          {isPrivileged && (
            <div className="card-surface p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                <div>
                  <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-forest-800" />
                    4. User & Role Management ({adminUsers?.length || 0} Users)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Manage platform users and update account roles.
                  </p>
                </div>

                {adminActionMessage && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {adminActionMessage}
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 bg-sand-50 text-stone-700">
                      <th className="p-2.5 font-bold">User Name</th>
                      <th className="p-2.5 font-bold">Email</th>
                      <th className="p-2.5 font-bold">Current Role</th>
                      <th className="p-2.5 font-bold">Security Status</th>
                      <th className="p-2.5 font-bold">Internal Moderation Notes</th>
                      {isAdmin && <th className="p-2.5 font-bold text-right">Promote / Reassign</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {adminUsers?.map((u) => (
                      <tr key={u.id || u._id} className="hover:bg-sand-50/30">
                        <td className="p-2.5 font-bold text-stone-900">{u.name}</td>
                        <td className="p-2.5 text-stone-600 font-mono text-[11px]">{u.email}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            u.role === 'admin' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                            u.role === 'auditor' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            u.role === 'HR' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                            u.role === 'senior' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                            'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-2.5 text-stone-600 font-medium">{u.securityStatus || 'Verified'}</td>
                        <td className="p-2.5 text-stone-500 italic max-w-xs truncate">
                          {u.internalModerationNotes || 'Standard account.'}
                        </td>
                        {isAdmin && (
                          <td className="p-2.5 text-right">
                            <select
                              value={u.role}
                              disabled={updatingUserId === (u.id || u._id)}
                              onChange={(e) => handleChangeUserRole(u.id || u._id, e.target.value)}
                              className="px-2 py-1 bg-white border border-stone-200 rounded-lg text-[11px] font-medium text-stone-700 focus:outline-none focus:ring-1 focus:ring-forest-800"
                            >
                              <option value="staff">staff</option>
                              <option value="senior">senior</option>
                              <option value="HR">HR</option>
                              <option value="auditor">auditor</option>
                              <option value="admin">admin</option>
                            </select>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EXPERIMENT 6: JWT AUTHENTICATION & USER/ADMIN ROLE TESTING CONSOLE */}
          <div className="card-surface p-6 sm:p-7 space-y-5 border-2 border-forest-900/10 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-forest-900 text-white">
                    Experiment 6
                  </span>
                  <h3 className="text-base font-bold text-stone-900">
                    JWT Authentication & Role Permission Verification
                  </h3>
                </div>
                <p className="text-xs text-stone-500">
                  Live verification of token-guarded routes: User access vs. Administrator authorization.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-stone-500">Authenticated as:</span>
                <span className="font-bold text-stone-800">{authUser?.name || 'Student'}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                  currentRole === 'admin' ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  {currentRole}
                </span>
              </div>
            </div>

            {/* Test Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Test 1: User Protected Route */}
              <div className="p-4 rounded-xl bg-sand-50/70 border border-stone-200/90 space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-stone-900">GET /api/protected/user</span>
                    <Badge variant="success" size="sm">User & Admin</Badge>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Requires valid JWT. Accessible to standard students (User/Staff) and Administrators.
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={testUserRoute}
                  disabled={isTestingUserRoute}
                  className="w-full justify-center text-xs font-semibold"
                >
                  {isTestingUserRoute ? 'Calling Endpoint...' : 'Test User Protected Route'}
                </Button>

                {exp6UserResult && (
                  <div className={`p-3 rounded-lg text-xs border ${
                    exp6UserResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    <div className="font-bold flex items-center justify-between">
                      <span>HTTP Status: {exp6UserResult.status} {exp6UserResult.success ? 'OK' : 'Error'}</span>
                      <span className="text-[10px] uppercase font-mono">{exp6UserResult.data?.accessLevel || 'Result'}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed">
                      {exp6UserResult.data?.message || exp6UserResult.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Test 2: Admin Protected Route */}
              <div className="p-4 rounded-xl bg-sand-50/70 border border-stone-200/90 space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-stone-900">GET /api/protected/admin</span>
                    <Badge variant="rose" size="sm">Admin Only</Badge>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Requires valid JWT and Admin role. Normal users are rejected with HTTP 403 Forbidden.
                  </p>
                </div>

                <Button
                  variant={currentRole === 'admin' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={testAdminRoute}
                  disabled={isTestingAdminRoute}
                  className="w-full justify-center text-xs font-semibold"
                >
                  {isTestingAdminRoute ? 'Calling Endpoint...' : 'Test Admin Protected Route'}
                </Button>

                {exp6AdminResult && (
                  <div className={`p-3 rounded-lg text-xs border ${
                    exp6AdminResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    <div className="font-bold flex items-center justify-between">
                      <span>HTTP Status: {exp6AdminResult.status} {exp6AdminResult.success ? 'OK' : 'Forbidden'}</span>
                      <span className="text-[10px] uppercase font-mono">
                        {exp6AdminResult.success ? 'Admin Access Granted' : 'Access Denied (403)'}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed">
                      {exp6AdminResult.data?.message || exp6AdminResult.message}
                    </p>
                    {exp6AdminResult.data?.adminData && (
                      <div className="mt-2 pt-2 border-t border-emerald-200/60 font-mono text-[10px] text-emerald-800">
                        Total Users: {exp6AdminResult.data.adminData.totalRegisteredUsers} | System: {exp6AdminResult.data.adminData.systemStatus}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 6. LIVE ANNOUNCEMENTS DEDICATED TAB (EXPERIMENT 8) */}
      {activeTab === 'announcements' && (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          <LiveAnnouncements isAdmin={isAdmin} />
        </div>
      )}

      {/* SUGGESTED PEERS ROW ON OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="pt-6 border-t border-stone-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-stone-900">
                Recommended Student Matches
              </h3>
              <p className="text-xs sm:text-sm text-stone-500">
                Peers looking for React/JS skills who offer Figma, Spanish, and Data Structures.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('matches')}
              className="self-start sm:self-auto"
            >
              View All Matches
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {studentsList.map((student) => (
              <StudentCard
                key={student.id || student._id}
                student={student}
                isRequested={!!requestedStudents[student.id || student._id]}
                onViewProfile={(std) => setSelectedStudentForModal(std)}
                onRequestSwap={(std) => handleInitiateSwap(std)}
              />
            ))}
          </div>
        </div>
      )}

      {/* STUDENT PROFILE PREVIEW MODAL */}
      <Modal
        isOpen={!!selectedStudentForModal}
        onClose={() => setSelectedStudentForModal(null)}
        title="Student Profile"
        subtitle={selectedStudentForModal?.university}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setSelectedStudentForModal(null)}>
              Close
            </Button>
            {!isAuditor && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const std = selectedStudentForModal;
                  setSelectedStudentForModal(null);
                  handleInitiateSwap(std);
                }}
              >
                <Repeat className="w-3.5 h-3.5 mr-1" />
                Request Swap
              </Button>
            )}
          </>
        }
      >
        {selectedStudentForModal && (
          <div className="space-y-4 text-stone-700">
            <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
              <div className="w-12 h-12 rounded-xl bg-forest-100 text-forest-900 font-bold text-base flex items-center justify-center border border-forest-200">
                {selectedStudentForModal.avatar}
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-base">{selectedStudentForModal.name}</h4>
                <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {selectedStudentForModal.major}
                </p>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500 block mb-1">
                Student Bio
              </span>
              <p className="text-xs leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200 text-stone-700">
                "{selectedStudentForModal.bio}"
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500 block mb-1">
                Availability
              </span>
              <div className="flex items-center gap-1.5 text-xs text-stone-700">
                <Clock className="w-3.5 h-3.5 text-forest-700" />
                <span>{selectedStudentForModal.availability}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500 block mb-1.5">
                  Can Teach:
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedStudentForModal.teaches?.map((skill, i) => (
                    <Badge key={i} variant="forest" size="sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500 block mb-1.5">
                  Wants to Learn:
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedStudentForModal.wantsToLearn?.map((skill, i) => (
                    <Badge key={i} variant="neutral" size="sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* SWAP REQUEST CONFIRMATION MODAL */}
      <Modal
        isOpen={!!swapModalStudent}
        onClose={() => setSwapModalStudent(null)}
        title="Send Swap Request"
        subtitle={`Propose a peer skill exchange with ${swapModalStudent?.name}`}
        footer={
          !swapSuccess && (
            <>
              <Button variant="outline" size="sm" onClick={() => setSwapModalStudent(null)} disabled={isSubmittingSwap}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmSwap} disabled={isSubmittingSwap}>
                {isSubmittingSwap ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Sending Request...
                  </span>
                ) : (
                  'Confirm & Send Request'
                )}
              </Button>
            </>
          )
        }
      >
        {swapModalStudent && (
          <div className="space-y-4">
            {swapSuccess ? (
              <div className="text-center py-6 space-y-2 animate-scale-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-stone-900">Swap Request Sent!</h4>
                <p className="text-xs text-stone-500">
                  {swapModalStudent.name} will receive your swap proposal for {swapModalStudent.teaches?.[0] || 'skills'}.
                </p>
              </div>
            ) : (
              <>
                {swapError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{swapError}</span>
                  </div>
                )}

                <div className="p-3.5 bg-sand-50 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-1.5">
                  <p className="font-semibold text-stone-900">Exchange Proposal Summary:</p>
                  <p>• You teach: <strong className="text-forest-900">{skillsOffered?.[0]?.name || 'Web Development'}</strong></p>
                  <p>• {swapModalStudent.name} teaches: <strong className="text-forest-900">{swapModalStudent.teaches?.[0] || 'Peer Tutoring'}</strong></p>
                </div>

                <div>
                  <label className="form-label">
                    Proposed Session Topic & Notes
                  </label>
                  <textarea
                    rows={3}
                    value={swapNote}
                    onChange={(e) => setSwapNote(e.target.value)}
                    placeholder="Describe what you would like to work on..."
                    className="w-full p-3 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-800/20"
                    disabled={isSubmittingSwap}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* ACTIVITY LOG DETAIL MODAL */}
      <Modal
        isOpen={!!activityModalItem}
        onClose={() => setActivityModalItem(null)}
        title="Activity Log Details"
        subtitle={activityModalItem?.timestamp}
        footer={
          <Button variant="primary" size="sm" onClick={() => setActivityModalItem(null)}>
            Close
          </Button>
        }
      >
        {activityModalItem && (
          <div className="space-y-4 text-xs text-stone-700">
            <div className={`p-3.5 rounded-xl border space-y-1 ${
              activityModalItem.isRestricted ? 'bg-amber-50 border-amber-200' : 'bg-sand-50 border-stone-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 text-sm block">{activityModalItem.title}</span>
                {activityModalItem.isRestricted && (
                  <Badge variant="amber" size="sm">Security Audit</Badge>
                )}
              </div>
              <p className="text-stone-600 leading-relaxed">{activityModalItem.detail}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-600">Partner / Actor:</span>
              <span className="font-bold text-stone-900">{activityModalItem.partner}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-600">Status:</span>
              <Badge variant={activityModalItem.isRestricted ? 'amber' : 'forest'} size="sm">
                {activityModalItem.status}
              </Badge>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
