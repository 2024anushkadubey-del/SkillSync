import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, GraduationCap, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-forest-700 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-forest-200" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">SkillSync</span>
            </Link>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              A peer-to-peer student skill exchange network where students teach what they know and master what they need through direct collaboration.
            </p>
            <div className="flex items-center space-x-2 text-xs text-forest-400 font-medium pt-1">
              <GraduationCap className="w-4 h-4" />
              <span>Campus Student Skill Network</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">Platform</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home Page</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">Student Dashboard</Link>
              </li>
              <li>
                <a href="#categories" className="hover:text-white transition-colors">Explore Categories</a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">How Skill Swaps Work</a>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">Community</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">Student Sign In</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">Create Free Profile</Link>
              </li>
              <li>
                <span className="text-stone-500">Peer Exchange Guidelines</span>
              </li>
              <li>
                <span className="text-stone-500">Campus Code of Conduct</span>
              </li>
            </ul>
          </div>

          {/* Practical Project Info */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">Platform Information</h4>
            <p className="text-xs text-stone-400 leading-relaxed mb-3">
              Full Stack Development Lab — <strong className="text-stone-200">SkillSync Peer Exchange UI</strong>.
            </p>
            <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/80 text-xs text-stone-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-forest-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Responsive & Accessible</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Built with component-driven architecture, Flexbox, and CSS Grid.
              </p>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} SkillSync Peer Exchange. All rights reserved.</p>
          <div className="flex items-center space-x-1.5">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>using React, Vite & Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
