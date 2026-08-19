import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Star,
  BookOpen,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Award,
  Search,
  Filter,
  Check,
  X
} from 'lucide-react';

import Button from '../components/Button';
import StudentCard from '../components/StudentCard';
import { mockCurrentUser, mockSuggestedStudents, mockRecentActivity } from '../data/mockData';

export default function Dashboard() {
  const [user, setUser] = useState(mockCurrentUser);
  const [newTeachSkill, setNewTeachSkill] = useState('');
  const [newLearnSkill, setNewLearnSkill] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [activities, setActivities] = useState(mockRecentActivity);

  // Add skill handlers for UI state interactivity
  const handleAddTeachSkill = (e) => {
    e.preventDefault();
    if (!newTeachSkill.trim()) return;
    const newSkill = {
      id: `s-${Date.now()}`,
      name: newTeachSkill.trim(),
      level: 'Intermediate',
      category: 'General',
    };
    setUser({
      ...user,
      skillsOffered: [...user.skillsOffered, newSkill],
    });
    setNewTeachSkill('');
  };

  const handleRemoveTeachSkill = (id) => {
    setUser({
      ...user,
      skillsOffered: user.skillsOffered.filter(s => s.id !== id),
    });
  };

  const handleAddLearnSkill = (e) => {
    e.preventDefault();
    if (!newLearnSkill.trim()) return;
    const newSkill = {
      id: `w-${Date.now()}`,
      name: newLearnSkill.trim(),
      targetLevel: 'Beginner',
      category: 'General',
    };
    setUser({
      ...user,
      skillsWanted: [...user.skillsWanted, newSkill],
    });
    setNewLearnSkill('');
  };

  const handleRemoveLearnSkill = (id) => {
    setUser({
      ...user,
      skillsWanted: user.skillsWanted.filter(s => s.id !== id),
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* WELCOME SECTION */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Welcome back, {user.name}! 🎓
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            You have <strong className="text-white font-semibold">2 active swap requests</strong> pending from compatible student peers this week.
          </p>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-3 sm:gap-4 z-10">
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center min-w-[90px]">
            <span className="block text-2xl font-black text-white">{user.completedSwaps}</span>
            <span className="text-[11px] text-slate-300 uppercase tracking-wider font-medium">Swaps Done</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center min-w-[90px]">
            <div className="flex items-center justify-center space-x-1 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              <span className="text-2xl font-black text-white">{user.rating}</span>
            </div>
            <span className="text-[11px] text-slate-300 uppercase tracking-wider font-medium">Peer Rating</span>
          </div>
        </div>
      </div>

      {/* DASHBOARD GRID CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Profile Summary & Skill Lists (2 Cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* PROFILE SUMMARY CARD */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  {user.avatar}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">{user.name}</h2>
                  <p className="text-sm font-medium text-indigo-600 flex items-center gap-1.5 mt-0.5">
                    <GraduationCap className="w-4 h-4" />
                    {user.role}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{user.university}</p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200 self-start sm:self-auto">
                <CheckCircle className="w-4 h-4" />
                Active Student
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Student Bio</h3>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                "{user.bio}"
              </p>
            </div>
          </div>

          {/* SKILLS I CAN TEACH SECTION */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  Skills I Can Teach
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Skills you are comfortable tutoring or exchanging with peers.
                </p>
              </div>

              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {user.skillsOffered.length} Skills Listed
              </span>
            </div>

            {/* Tags Grid */}
            <div className="flex flex-wrap gap-2.5">
              {user.skillsOffered.map((skill) => (
                <div
                  key={skill.id}
                  className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-semibold transition-all hover:bg-emerald-100"
                >
                  <span>{skill.name}</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-emerald-200/80 px-2 py-0.5 rounded-md text-emerald-900">
                    {skill.level}
                  </span>
                  <button
                    onClick={() => handleRemoveTeachSkill(skill.id)}
                    className="text-emerald-600 hover:text-emerald-900 focus:outline-none ml-1 opacity-60 group-hover:opacity-100 transition-opacity"
                    title="Remove skill"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Add Form */}
            <form onSubmit={handleAddTeachSkill} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newTeachSkill}
                onChange={(e) => setNewTeachSkill(e.target.value)}
                placeholder="Add a new skill you can teach (e.g. Node.js, Calculus)..."
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-1">
                <Plus className="w-4 h-4" />
                Add Skill
              </Button>
            </form>
          </div>

          {/* SKILLS I WANT TO LEARN SECTION */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                  Skills I Want to Learn
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Skills you are looking to master through peer skill exchanges.
                </p>
              </div>

              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {user.skillsWanted.length} Target Skills
              </span>
            </div>

            {/* Tags Grid */}
            <div className="flex flex-wrap gap-2.5">
              {user.skillsWanted.map((skill) => (
                <div
                  key={skill.id}
                  className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 text-sm font-semibold transition-all hover:bg-indigo-100"
                >
                  <span>{skill.name}</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-indigo-200/80 px-2 py-0.5 rounded-md text-indigo-900">
                    {skill.targetLevel}
                  </span>
                  <button
                    onClick={() => handleRemoveLearnSkill(skill.id)}
                    className="text-indigo-600 hover:text-indigo-900 focus:outline-none ml-1 opacity-60 group-hover:opacity-100 transition-opacity"
                    title="Remove skill"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Add Form */}
            <form onSubmit={handleAddLearnSkill} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newLearnSkill}
                onChange={(e) => setNewLearnSkill(e.target.value)}
                placeholder="Add a skill you want to learn (e.g. Machine Learning, German)..."
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
              <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 gap-1">
                <Plus className="w-4 h-4" />
                Add Skill
              </Button>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: Recent Activity & Suggested Matches */}
        <div className="space-y-8">
          
          {/* RECENT ACTIVITY & SWAP REQUEST PLACEHOLDER */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Recent Activity
              </h3>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Live Feed
              </span>
            </div>

            <div className="space-y-4">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{act.title}</span>
                    <span className="text-[10px] text-slate-400">{act.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{act.detail}</p>
                  <div className="pt-1 flex items-center justify-between">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-700">
                      {act.status}
                    </span>
                    <span className="text-[10px] text-indigo-600 font-semibold cursor-pointer hover:underline">
                      View details →
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center border-t border-slate-100">
              <p className="text-xs text-slate-500">
                💬 Real-time chat & websocket notifications will be enabled in <strong>Experiment 8</strong>.
              </p>
            </div>
          </div>

          {/* QUICK HELP / EXPERIMENT ROADMAP CARD */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 border border-indigo-100 space-y-3 text-xs text-indigo-950">
            <div className="flex items-center gap-2 font-bold text-sm text-indigo-900">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>SkillSync Experiment Roadmap</span>
            </div>
            <p className="leading-relaxed text-indigo-900/80">
              You are currently viewing <strong className="text-indigo-950">Experiment 1</strong> (Responsive Tailwind CSS UI & React Router).
            </p>
            <ul className="space-y-1.5 text-indigo-900/70 pt-1">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Exp 1: Responsive Tailwind UI (Done)
              </li>
              <li className="flex items-center gap-1.5 text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                Exp 2: React Hooks State Integration
              </li>
              <li className="flex items-center gap-1.5 text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                Exp 4: Node + Express + MongoDB
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* SUGGESTED PEER MATCHES SECTION */}
      <div className="pt-6 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              Suggested Student Matches
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Peers at State Tech University with complementary skills matching your profile.
            </p>
          </div>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full self-start sm:self-auto">
            4 Best Matches Found
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockSuggestedStudents.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      </div>

    </div>
  );
}
