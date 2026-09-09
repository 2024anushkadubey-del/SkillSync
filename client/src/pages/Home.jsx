import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import {
  ArrowRight,
  Search,
  BookOpen,
  Zap,
  ChevronDown,
  Clock,
  GraduationCap,
  CheckCircle,
  Repeat,
  ChevronRight,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';

import Button from '../components/Button';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Dropdown from '../components/Dropdown';
import SectionHeading from '../components/SectionHeading';
import SkillCard from '../components/SkillCard';
import StudentCard from '../components/StudentCard';
import { fetcher, activityApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { mockCategories, mockSuggestedStudents } from '../data/mockData';

export default function Home() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  
  // SWR: Fetch live skill categories and students
  const {
    data: categories,
    error: categoriesError,
    isLoading: isCategoriesLoading,
  } = useSWR('/api/categories', fetcher, {
    fallbackData: mockCategories,
  });

  const {
    data: students,
    error: studentsError,
    isLoading: isStudentsLoading,
  } = useSWR('/api/students', fetcher, {
    fallbackData: mockSuggestedStudents,
  });

  const categoryList = Array.isArray(categories) ? categories : mockCategories;
  const studentList = Array.isArray(students) ? students : mockSuggestedStudents;

  // Modals state
  const [activeCategoryModal, setActiveCategoryModal] = useState(null);
  const [activeStudentModal, setActiveStudentModal] = useState(null);
  const [swapModalStudent, setSwapModalStudent] = useState(null);
  const [swapNote, setSwapNote] = useState('');
  const [requestedStudents, setRequestedStudents] = useState({});
  const [isSubmittingSwap, setIsSubmittingSwap] = useState(false);
  const [swapSuccess, setSwapSuccess] = useState(false);
  const [swapError, setSwapError] = useState('');

  // Filtered categories based on search & category filter
  const filteredCategories = useMemo(() => {
    return categoryList.filter((cat) => {
      const matchesSearch =
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cat.popularTopics && cat.popularTopics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
      const matchesCategory =
        selectedCategoryFilter === 'All' || cat.name.toLowerCase().includes(selectedCategoryFilter.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [categoryList, searchQuery, selectedCategoryFilter]);

  // Handle Swap Request Modal
  const handleInitiateSwap = (student) => {
    setSwapModalStudent(student);
    setSwapNote(`Hi ${student.name}! I saw your profile and would love to arrange a 1-hour skill swap session this week.`);
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
        offeredSkill: user?.skillsOffered?.[0]?.name || 'Web Development',
        wantedSkill: swapModalStudent.teaches[0] || 'Peer Tutoring',
        note: swapNote,
      });

      setRequestedStudents((prev) => ({
        ...prev,
        [swapModalStudent.id]: true,
      }));
      setSwapSuccess(true);

      setTimeout(() => {
        setSwapModalStudent(null);
        setSwapSuccess(false);
      }, 1400);
    } catch (err) {
      setSwapError(err.message || 'Failed to submit swap request. Please try again.');
    } finally {
      setIsSubmittingSwap(false);
    }
  };

  const categoryFilterItems = [
    { label: 'All Categories', onClick: () => setSelectedCategoryFilter('All'), active: selectedCategoryFilter === 'All' },
    { label: 'Web Development', onClick: () => setSelectedCategoryFilter('Web Development'), active: selectedCategoryFilter === 'Web Development' },
    { label: 'UI/UX Design', onClick: () => setSelectedCategoryFilter('UI/UX'), active: selectedCategoryFilter === 'UI/UX' },
    { label: 'Data Science & AI', onClick: () => setSelectedCategoryFilter('Data Science'), active: selectedCategoryFilter === 'Data Science' },
    { label: 'Languages', onClick: () => setSelectedCategoryFilter('Language'), active: selectedCategoryFilter === 'Language' },
    { label: 'STEM & Academics', onClick: () => setSelectedCategoryFilter('STEM'), active: selectedCategoryFilter === 'STEM' },
  ];

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-sand-50/70 pt-10 pb-16 lg:pt-18 lg:pb-24 border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Campus Tag Badge */}
            <div className="inline-flex items-center">
              <Badge variant="forest" size="lg" dot>
                <span>State Tech Student Skill Exchange Platform</span>
              </Badge>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.15]">
              Teach What You Know.{' '}
              <span className="text-forest-800">
                Learn What You Need.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-stone-600 leading-relaxed font-normal max-w-2xl mx-auto">
              SkillSync connects campus peers for direct 1-on-1 skill barter. Exchange coding tutoring for design critique, language practice for calculus, and build your portfolio together.
            </p>

            {/* Hero Action CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto shadow-xs">
                  Create Student Profile
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>

              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Explore Student Dashboard
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>

            {/* Interactive Search & Category Filter Bar */}
            <div className="pt-6 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-2xl border border-stone-200 shadow-xs">
                
                {/* Search Input */}
                <div className="relative flex-1 flex items-center">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search skills (e.g. React, Figma, Spanish, Python)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none bg-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs text-stone-400 hover:text-stone-600 mr-2 px-1"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Dropdown Filter */}
                <div className="border-t sm:border-t-0 sm:border-l border-stone-200 pt-2 sm:pt-0 sm:pl-2 flex items-center">
                  <Dropdown
                    items={categoryFilterItems}
                    trigger={({ isOpen }) => (
                      <button
                        type="button"
                        className={`w-full sm:w-auto flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-50 hover:bg-stone-100 transition-colors ${
                          isOpen ? 'ring-2 ring-forest-800/20' : ''
                        }`}
                      >
                        <span className="truncate max-w-[130px]">{selectedCategoryFilter}</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  />
                </div>

              </div>
            </div>

            {/* Trust Metrics */}
            <div className="pt-8 border-t border-stone-200 grid grid-cols-3 gap-4 max-w-lg mx-auto text-center">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-stone-900">500+</p>
                <p className="text-xs text-stone-500 font-medium mt-0.5">Enrolled Peers</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-forest-800">40+</p>
                <p className="text-xs text-stone-500 font-medium mt-0.5">Subject Topics</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-stone-900">1.2k+</p>
                <p className="text-xs text-stone-500 font-medium mt-0.5">Swaps Completed</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* VALUE PROPOSITIONS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          centered
          badge="Why SkillSync"
          title="Direct Peer Learning Without Paywalls"
          subtitle="Collaborate directly with campus peers who excel in subjects you want to master."
        />

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-surface p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-forest-50 border border-forest-200/70 text-forest-800 flex items-center justify-center mb-5">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 mb-2">1-on-1 Skill Swaps</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Match with peers based on complementary skills. Exchange an hour of your frontend guidance for an hour of UI design feedback.
              </p>
            </div>
          </div>

          <div className="card-surface p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-800 flex items-center justify-center mb-5">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 mb-2">Verified Campus Peers</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Connect safely with university peers. View student profiles, completed swap records, and verified peer ratings before initiating a session.
              </p>
            </div>
          </div>

          <div className="card-surface p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-800 flex items-center justify-center mb-5">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 mb-2">Zero-Cost Knowledge Sharing</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                No expensive tutoring fees or subscription locks. SkillSync operates on a 100% direct barter model where your skills are your currency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SKILL CATEGORIES SECTION */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <SectionHeading
            badge="Explore Topics"
            title="Browse Skill Categories"
            subtitle="Find the exact technical, academic, or creative skill you need support with."
          />
          {selectedCategoryFilter !== 'All' && (
            <button
              onClick={() => setSelectedCategoryFilter('All')}
              className="text-xs font-semibold text-forest-800 hover:underline self-start sm:self-auto"
            >
              Reset Category Filter
            </button>
          )}
        </div>

        {filteredCategories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-8 space-y-3">
            <p className="text-base font-bold text-stone-700">No categories found matching "{searchQuery}"</p>
            <p className="text-xs text-stone-500">Try searching for terms like React, Python, Figma, or Spanish.</p>
            <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setSelectedCategoryFilter('All'); }}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <SkillCard
                key={category.id}
                category={category}
                onSelect={() => setActiveCategoryModal(category)}
              />
            ))}
          </div>
        )}
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900 text-white p-8 sm:p-12 lg:p-16 rounded-3xl border border-stone-800 space-y-10 shadow-lg">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="neutral" size="md">
              <span>Step-by-Step Flow</span>
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              How SkillSync Works
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed font-normal">
              Get matched with compatible student partners in three straightforward steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-stone-800/80 p-6 sm:p-7 rounded-2xl border border-stone-700/70 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-forest-700 text-white font-bold text-xs flex items-center justify-center">
                1
              </div>
              <h3 className="text-base font-bold text-white">Create Your Skill Profile</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                List the skills you feel confident teaching (e.g. React, Python) and the skills you want to learn (e.g. Figma UI, Spanish).
              </p>
            </div>

            <div className="bg-stone-800/80 p-6 sm:p-7 rounded-2xl border border-stone-700/70 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-forest-700 text-white font-bold text-xs flex items-center justify-center">
                2
              </div>
              <h3 className="text-base font-bold text-white">Discover Compatible Peers</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Browse student profiles filtered by complementary skill matches, campus course majors, and peer ratings.
              </p>
            </div>

            <div className="bg-stone-800/80 p-6 sm:p-7 rounded-2xl border border-stone-700/70 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-forest-700 text-white font-bold text-xs flex items-center justify-center">
                3
              </div>
              <h3 className="text-base font-bold text-white">Request & Exchange Knowledge</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Send a structured swap request, coordinate a study session, and review each other after finishing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED STUDENT PEERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <SectionHeading
            badge="Peer Community"
            title="Featured Campus Skill Exchangers"
            subtitle="Connect with students actively looking to trade knowledge this semester."
          />
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="self-start sm:self-auto">
              Open Dashboard
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {studentList.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              isRequested={!!requestedStudents[student.id]}
              onViewProfile={(std) => setActiveStudentModal(std)}
              onRequestSwap={(std) => handleInitiateSwap(std)}
            />
          ))}
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-sand-100 rounded-3xl p-8 sm:p-12 border border-sand-300/80 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              Ready to Swap Skills on Campus?
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Create your student profile today, list your strengths, and start learning from fellow university peers.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full">
                Register Free Profile
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORY DETAILS MODAL */}
      <Modal
        isOpen={!!activeCategoryModal}
        onClose={() => setActiveCategoryModal(null)}
        title={activeCategoryModal?.name}
        subtitle={`${activeCategoryModal?.count} currently trading skills in this category`}
        footer={
          <Button variant="primary" size="sm" onClick={() => setActiveCategoryModal(null)}>
            Close Details
          </Button>
        }
      >
        {activeCategoryModal && (
          <div className="space-y-4 text-stone-700">
            <p className="text-sm leading-relaxed">
              {activeCategoryModal.description}
            </p>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                Popular Exchange Topics
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeCategoryModal.popularTopics?.map((topic, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-sand-50 border border-stone-200 text-xs font-medium text-stone-800 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-forest-700" />
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-forest-50 border border-forest-200/80 text-xs text-forest-900 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
              <span>
                You can add or request any of these topics directly in your Student Dashboard.
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* STUDENT PROFILE PREVIEW MODAL */}
      <Modal
        isOpen={!!activeStudentModal}
        onClose={() => setActiveStudentModal(null)}
        title="Student Profile Preview"
        subtitle={activeStudentModal?.university}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setActiveStudentModal(null)}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                const std = activeStudentModal;
                setActiveStudentModal(null);
                handleInitiateSwap(std);
              }}
            >
              <Repeat className="w-3.5 h-3.5 mr-1" />
              Request Skill Swap
            </Button>
          </>
        }
      >
        {activeStudentModal && (
          <div className="space-y-4 text-stone-700">
            {/* Header snippet */}
            <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
              <div className="w-12 h-12 rounded-xl bg-forest-100 text-forest-900 font-bold text-base flex items-center justify-center border border-forest-200">
                {activeStudentModal.avatar}
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-base">{activeStudentModal.name}</h4>
                <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {activeStudentModal.major}
                </p>
              </div>
            </div>

            {/* Bio */}
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500 block mb-1">
                About Student
              </span>
              <p className="text-xs leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200/70 text-stone-700">
                "{activeStudentModal.bio}"
              </p>
            </div>

            {/* Availability */}
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500 block mb-1">
                Typical Availability
              </span>
              <div className="flex items-center gap-1.5 text-xs text-stone-700">
                <Clock className="w-3.5 h-3.5 text-forest-700" />
                <span>{activeStudentModal.availability}</span>
              </div>
            </div>

            {/* Skills grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500 block mb-1.5">
                  Offers (Can Teach):
                </span>
                <div className="flex flex-wrap gap-1">
                  {activeStudentModal.teaches?.map((skill, i) => (
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
                  {activeStudentModal.wantsToLearn?.map((skill, i) => (
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
                  {swapModalStudent.name} has been notified. You can manage active requests on your dashboard.
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

                <div className="p-3 bg-sand-50 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-1.5">
                  <p className="font-semibold text-stone-900">Exchange Proposal Summary:</p>
                  <p>• You teach: <strong className="text-forest-900">{user?.skillsOffered?.[0]?.name || 'React.js'}</strong></p>
                  <p>• {swapModalStudent.name} teaches: <strong className="text-forest-900">{swapModalStudent.teaches[0]}</strong></p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Optional Note to {swapModalStudent.name}
                  </label>
                  <textarea
                    rows={3}
                    value={swapNote}
                    onChange={(e) => setSwapNote(e.target.value)}
                    placeholder="Hi! I'd love to swap 1 hour of React help for your guidance on Figma design systems..."
                    className="w-full p-3 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-800/20"
                    disabled={isSubmittingSwap}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
}
