import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, GraduationCap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">SkillSync</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              A peer-to-peer skill exchange platform designed specifically for students to share knowledge, collaborate, and grow together.
            </p>
            <div className="flex items-center space-x-2 text-xs text-indigo-400 font-medium pt-1">
              <GraduationCap className="w-4 h-4" />
              <span>Built by Students, for Students</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">Student Dashboard</Link>
              </li>
              <li>
                <a href="#categories" className="hover:text-white transition-colors">Skill Categories</a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Account</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">Create Student Account</Link>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Profile Settings (Exp 3)</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Real-time Chat (Exp 8)</span>
              </li>
            </ul>
          </div>

          {/* College Project Note */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Course Info</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Full Stack Development Lab — <strong className="text-slate-200">Experiment 1: Responsive UI with Tailwind CSS</strong>.
            </p>
            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              ⚡ UI & Routing ready for backend integration in upcoming experiments.
            </div>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SkillSync Peer Exchange. All rights reserved.</p>
          <div className="flex items-center space-x-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>using React & Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
