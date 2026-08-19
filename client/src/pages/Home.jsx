import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Search,
  BookOpen,
  Users,
  MessageSquare,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

import Button from '../components/Button';
import SectionHeading from '../components/SectionHeading';
import SkillCard from '../components/SkillCard';
import StudentCard from '../components/StudentCard';
import { mockCategories, mockSuggestedStudents } from '../data/mockData';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredCategories = mockCategories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/60 via-slate-50 to-white pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Campus Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/70 border border-indigo-200/80 text-indigo-700 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Campus Peer Skill Exchange Network</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Teach What You Know.{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
                Learn What You Need.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
              SkillSync connects university students to trade skills directly. Swap coding tutoring for UI design, language practice for calculus, and boost your portfolio together without tuition costs.
            </p>

            {/* Hero Action CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-indigo-500/20 gap-2 text-base">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Link to="/dashboard">
                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 text-base">
                  Explore Student Dashboard
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Quick Search Bar */}
            <div className="pt-6 max-w-xl mx-auto">
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search skills e.g., React, Figma, Spanish, Python..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Trust Counters */}
            <div className="pt-8 border-t border-slate-200/60 grid grid-cols-3 gap-4 max-w-lg mx-auto text-center">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">500+</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Active Students</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600">40+</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Skill Categories</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">1.2k+</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Swaps Completed</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PLATFORM EXPLANATION / FEATURES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          centered
          badge="Why SkillSync?"
          title="Designed for Student Collaboration"
          subtitle="Stop spending money on video courses. Learn hands-on directly from peers who excel in subjects you want to master."
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">1-to-1 Skill Swaps</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Match with peers whose strengths match your goals. Exchange an hour of your web development knowledge for an hour of UI design feedback.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Verified Peer Network</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Connect safely with fellow university students. Build your profile, showcase your skills, and earn peer endorsements and ratings.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Zero Cost Learning</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              No subscription fees or paywalls. SkillSync operates on a 100% barter exchange economy where knowledge is the only currency.
            </p>
          </div>
        </div>
      </section>

      {/* SKILL CATEGORIES SECTION */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <SectionHeading
          badge="Skill Categories"
          title="Explore What Students Are Teaching"
          subtitle="From web development frameworks to foreign languages and media editing, find the exact skill you want to learn."
        />

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <SkillCard
              key={category.id}
              category={category}
              onSelect={() => setSelectedCategory(category.name)}
            />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="bg-slate-900 text-white py-16 lg:py-20 rounded-3xl max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 shadow-xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">How SkillSync Works</h2>
          <p className="mt-3 text-slate-400 text-base">
            Start exchanging skills in minutes with fellow campus students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Step 1 */}
          <div className="bg-slate-800/70 p-8 rounded-2xl border border-slate-700/60 relative">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mb-6 shadow-md">
              1
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Create Your Profile</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              List the skills you can teach (e.g., React, Python) and the skills you want to learn (e.g., Figma UI design, Spanish).
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-800/70 p-8 rounded-2xl border border-slate-700/60 relative">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mb-6 shadow-md">
              2
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Discover Compatible Peers</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Browse student cards matched by complementary skills. Find peers looking to learn what you teach and vice-versa.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-800/70 p-8 rounded-2xl border border-slate-700/60 relative">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mb-6 shadow-md">
              3
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Send Swap Request</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Send a skill-exchange request with a single click, schedule your session, and start learning together!
            </p>
          </div>

        </div>
      </section>

      {/* FEATURED STUDENT MATCHES PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <SectionHeading
            badge="Peer Community"
            title="Featured Student Skill Exchangers"
            subtitle="Connect with active students offering high-demand skills on campus right now."
          />
          <Link to="/dashboard">
            <Button variant="outline" className="gap-1.5 self-start md:self-auto">
              View All Peers
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockSuggestedStudents.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Ready to Swap Skills Today?</h3>
            <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
              Join hundreds of students already building their resume skills, passing tough exams, and mastering new technologies together.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-white text-indigo-700 hover:bg-indigo-50 shadow-md">
                Create Free Profile
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
