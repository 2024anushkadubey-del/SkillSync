import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Menu, X, ArrowRight, LayoutDashboard, LogOut, User } from 'lucide-react';
import Dropdown from './Dropdown';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const profileMenuItems = [
    {
      label: 'Student Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      onClick: () => navigate('/dashboard'),
      active: isActive('/dashboard'),
    },
    {
      label: `Signed in as ${user?.name || 'Alex Rivera'}`,
      badge: user?.role ? user.role.split('(')[0].trim() : 'CS Major',
      disabled: true,
    },
    { divider: true },
    {
      label: 'Sign Out',
      icon: <LogOut className="w-4 h-4 text-rose-500" />,
      onClick: handleLogout,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/90 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & Brand Identity */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-forest-900 flex items-center justify-center text-white shadow-xs group-hover:bg-forest-800 transition-colors">
              <Sparkles className="w-4.5 h-4.5 text-forest-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-stone-900">
                  SkillSync
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-forest-50 text-forest-800 border border-forest-200/70">
                  Student Exchange
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">Peer-to-peer university skill sharing</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-forest-900 bg-forest-100/60 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
              }`}
            >
              Home
            </Link>
            <a
              href="#categories"
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100/70 transition-colors"
            >
              Explore Skills
            </a>
            <a
              href="#how-it-works"
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100/70 transition-colors"
            >
              How It Works
            </a>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'text-forest-900 bg-forest-100/60 font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                }`}
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Auth Action Buttons & User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <Dropdown
                align="right"
                items={profileMenuItems}
                trigger={({ isOpen }) => (
                  <button
                    type="button"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs font-semibold ${
                      isOpen
                        ? 'bg-forest-50 border-forest-300 text-forest-900 ring-2 ring-forest-800/10'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-lg bg-forest-900 text-white font-bold text-[10px] flex items-center justify-center">
                      {user?.avatar || 'AR'}
                    </div>
                    <span>{user?.name || 'Alex Rivera'}</span>
                  </button>
                )}
              />
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100/60 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-forest-900 hover:bg-forest-800 active:bg-forest-950 shadow-xs hover:shadow-sm transition-all"
                >
                  Join Platform
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-stone-200 bg-[#FAF8F5] px-4 pt-2 pb-5 space-y-3 animate-slide-up">
          <div className="flex flex-col space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/') ? 'bg-forest-100 text-forest-900 font-semibold' : 'text-stone-700'
              }`}
            >
              Home
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive('/dashboard') ? 'bg-forest-100 text-forest-900 font-semibold' : 'text-stone-700'
                }`}
              >
                Student Dashboard
              </Link>
            )}
            <a
              href="#categories"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              Explore Skills
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              How It Works
            </a>
          </div>

          <div className="pt-3 border-t border-stone-200 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2.5 px-3 py-2 bg-white rounded-xl border border-stone-200">
                  <div className="w-7 h-7 rounded-lg bg-forest-900 text-white font-bold text-xs flex items-center justify-center">
                    {user?.avatar || 'AR'}
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-stone-900">{user?.name || 'Alex Rivera'}</p>
                    <p className="text-[11px] text-stone-500">{user?.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-center py-2 px-4 rounded-xl font-semibold text-sm text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 px-4 rounded-xl font-semibold text-sm text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 px-4 rounded-xl font-semibold text-sm text-white bg-forest-900 hover:bg-forest-800 transition-colors"
                >
                  Register Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
