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
  Calendar
} from 'lucide-react';

import Button from '../components/Button';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import StudentCard from '../components/StudentCard';
import { useAuth } from '../hooks/useAuth';
import { useSkills } from '../hooks/useSkills';
import { useSessionTime } from '../hooks/useSessionTime';
import { fetcher, activityApi } from '../services/api';
import { mockCurrentUser, mockSuggestedStudents, mockRecentActivity } from '../data/mockData';

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

  // SWR: Fetch live activity log and swap proposals
  const {
    data: activities,
    error: activitiesError,
    isLoading: isActivitiesLoading,
    mutate: mutateActivities,
  } = useSWR('/api/activity', fetcher, {
    fallbackData: mockRecentActivity,
  });

  // Display user state fallback
  const user = userProfile || {
    ...mockCurrentUser,
    ...(authUser ? { name: authUser.name, email: authUser.email, role: authUser.role, avatar: authUser.avatar } : {}),
  };

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

  // ----------------------------------------------------
  // SKILL MUTATION HANDLERS (CONTEXT API GLOBAL STATE UPDATERS)
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
      await removeSkill(id);
    } catch (err) {
      console.error('Failed to remove skill:', err);
    }
  };

  const handleAddLearnSkill = async (e) => {
    e.preventDefault();
    if (!newLearnSkill.trim()) {
      setLearnError('Please enter a valid skill name.');
      return;
    }
    setLearnError('');
    setIsAddingLearn(true);

    try {
      await addSkill({
        type: 'learn',
        name: newLearnSkill.trim(),
        level: newLearnLevel,
        category: 'General',
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
      await removeSkill(id);
    } catch (err) {
      console.error('Failed to remove skill:', err);
    }
  };

  // ----------------------------------------------------
  // SWAP REQUEST MUTATION HANDLERS
  // ----------------------------------------------------

  const handleInitiateSwap = (student) => {
    setSwapModalStudent(student);
    setSwapNote(`Hi ${student.name}! I'd like to schedule an exchange session to learn ${student.teaches[0]}.`);
    setSwapSuccess(false);
    setSwapError('');
  };

  const handleConfirmSwap = async () => {
    if (!swapModalStudent) return;
    setIsSubmittingSwap(true);
    setSwapError('');

    try {
      await activityApi.createSwapRequest({
        studentId: swapModalStudent.id,
        studentName: swapModalStudent.name,
        offeredSkill: skillsOffered[0]?.name || 'Web Development',
        wantedSkill: swapModalStudent.teaches[0] || 'Peer Tutoring',
        note: swapNote,
      });

      setRequestedStudents((prev) => ({
        ...prev,
        [swapModalStudent.id]: true,
      }));

      await mutateActivities();
      setSwapSuccess(true);

      setTimeout(() => {
        setSwapModalStudent(null);
        setSwapSuccess(false);
      }, 1400);
    } catch (err) {
      setSwapError(err.message || 'Failed to send swap request. Please try again.');
    } finally {
      setIsSubmittingSwap(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      
      {/* WORKSPACE ACTIVE STATUS STRIP */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white rounded-xl border border-stone-200/90 text-xs text-stone-600 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
          </span>
          <span className="font-bold text-stone-900">Workspace Active</span>
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
          <div className="inline-flex items-center">
            <Badge variant="forest" size="sm" dot>
              <span>Student Dashboard</span>
            </Badge>
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
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
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
                      {user.role}
                    </p>
                    <p className="text-[11px] text-stone-500 mt-0.5">{user.university}</p>
                  </div>
                </div>

                <Badge variant="success" size="md" dot>
                  <span>Active Student</span>
                </Badge>
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

            {/* Quick Tips Box */}
            <div className="card-surface p-5 bg-forest-50/50 border-forest-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-forest-900">
                <Sparkles className="w-4 h-4 text-forest-700" />
                <span>Peer Exchange Tip</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Add specific sub-topics to your skills (e.g. "React Hooks" instead of just "Web Dev") to receive more accurate student match recommendations.
              </p>
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
                    <button
                      type="button"
                      onClick={() => handleRemoveTeachSkill(skill.id)}
                      className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-white transition-colors"
                      title="Remove skill"
                      aria-label="Remove skill"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Skill Form */}
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
                    <button
                      type="button"
                      onClick={() => handleRemoveLearnSkill(skill.id)}
                      className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-white transition-colors"
                      title="Remove skill"
                      aria-label="Remove skill"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Skill Form */}
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
                key={student.id}
                student={student}
                isRequested={!!requestedStudents[student.id]}
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
              </p>
            </div>
            <Badge variant="neutral" size="sm">
              {activityList.length} Records
            </Badge>
          </div>

          <div className="space-y-4">
            {activityList.map((act) => (
              <div
                key={act.id}
                onClick={() => setActivityModalItem(act)}
                className="p-4 rounded-xl bg-sand-50/70 border border-stone-200/80 hover:bg-sand-100/60 cursor-pointer transition-colors space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-900 text-sm">{act.title}</span>
                  <span className="text-[11px] text-stone-400">{act.timestamp}</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{act.detail}</p>
                <div className="pt-2 flex items-center justify-between border-t border-stone-200/50">
                  <Badge variant="forest" size="sm">
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
                key={student.id}
                student={student}
                isRequested={!!requestedStudents[student.id]}
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
                  {swapModalStudent.name} will receive your swap proposal for {swapModalStudent.teaches[0]}.
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
                  <p>• You teach: <strong className="text-forest-900">{skillsOffered?.[0]?.name || 'React.js'}</strong></p>
                  <p>• {swapModalStudent.name} teaches: <strong className="text-forest-900">{swapModalStudent.teaches[0]}</strong></p>
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
            <div className="p-3.5 bg-sand-50 rounded-xl border border-stone-200 space-y-1">
              <span className="font-bold text-stone-900 text-sm block">{activityModalItem.title}</span>
              <p className="text-stone-600 leading-relaxed">{activityModalItem.detail}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-600">Partner Student:</span>
              <span className="font-bold text-stone-900">{activityModalItem.partner}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-600">Status:</span>
              <Badge variant="forest" size="sm">
                {activityModalItem.status}
              </Badge>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
