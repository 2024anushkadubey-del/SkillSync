import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowLeft, ArrowRight, Eye, EyeOff, AlertCircle, Loader2, ShieldCheck, UserCheck } from 'lucide-react';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';

const DEMO_ROLES = [
  {
    role: 'staff',
    label: 'Student (Staff)',
    email: 'staff@university.edu',
    pass: 'StaffPass123!',
    desc: 'Standard student permissions: manage own skills & swap proposals.',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
    tag: 'Staff',
  },
  {
    role: 'senior',
    label: 'Senior Mentor',
    email: 'senior@university.edu',
    pass: 'SeniorPass123!',
    desc: 'Senior student mentor: inherits staff + advanced workshop offerings.',
    color: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100',
    tag: 'Senior',
  },
  {
    role: 'HR',
    label: 'Coordinator (HR)',
    email: 'hr@university.edu',
    pass: 'HRPass123!',
    desc: 'Campus coordinator: category management & student moderation view.',
    color: 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100',
    tag: 'HR',
  },
  {
    role: 'auditor',
    label: 'Compliance Auditor',
    email: 'auditor@university.edu',
    pass: 'AuditorPass123!',
    desc: 'Quality auditor: READ-ONLY access across all data. Mutations blocked.',
    color: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
    tag: 'Auditor (Read-Only)',
  },
  {
    role: 'admin',
    label: 'System Admin',
    email: 'admin@university.edu',
    pass: 'AdminPass123!',
    desc: 'Full administrator: complete access to all models, logs & role controls.',
    color: 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100',
    tag: 'Admin',
  },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Controlled form state
  const [email, setEmail] = useState('staff@university.edu');
  const [password, setPassword] = useState('StaffPass123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form submission and validation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fromPath = location.state?.from?.pathname || '/dashboard';

  const selectDemoRole = (demo) => {
    setEmail(demo.email);
    setPassword(demo.pass);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Client-side validation
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please fill in both your student email and password.');
      return;
    }

    if (!email.includes('@')) {
      setErrorMessage('Please enter a valid university email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      // Navigate to intended page upon successful authentication
      navigate(fromPath, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Unable to sign in. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-xl w-full space-y-6 bg-white p-7 sm:p-9 rounded-2xl border border-stone-200/90 shadow-lg shadow-stone-900/5 relative">
        
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center text-xs font-semibold text-stone-500 hover:text-forest-900 transition-colors gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        {/* Card Header */}
        <div className="text-center pt-1">
          <div className="w-11 h-11 rounded-xl bg-forest-900 text-white flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
            <Sparkles className="w-5 h-5 text-forest-200" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            Sign In to SkillSync
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-stone-500">
            Peer-to-peer university skill sharing
          </p>
        </div>

        {/* Role Quick Selectors */}
        <div className="bg-stone-50/80 border border-stone-200 rounded-xl p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-800" />
              Choose a role to sign in:
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DEMO_ROLES.map((demo) => {
              const isSelected = email === demo.email;
              return (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => selectDemoRole(demo)}
                  className={`text-left p-2 rounded-lg border text-xs transition-all ${
                    isSelected
                      ? 'border-forest-900 bg-forest-900 text-white shadow-xs'
                      : `${demo.color} border`
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{demo.tag}</span>
                    {isSelected && <UserCheck className="w-3 h-3 text-forest-200" />}
                  </div>
                  <div className={`text-[10px] truncate ${isSelected ? 'text-forest-200' : 'text-stone-600'}`}>
                    {demo.email}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Validation error message if triggered */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800 animate-slide-up">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Sign In Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          
          {/* Email Field */}
          <div>
            <label className="form-label">
              University Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@university.edu"
                className="form-input pl-10"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="form-label mb-0">
                Password
              </label>
              <button
                type="button"
                className="text-xs text-forest-800 font-medium hover:underline focus:outline-none"
                onClick={() => alert('In a production environment, a password reset link would be emailed to your student address.')}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input pl-10 pr-10"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-600 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me option */}
          <div className="flex items-center justify-between pt-0.5 text-xs text-stone-600">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-forest-900 focus:ring-forest-800 border-stone-300 w-3.5 h-3.5"
                disabled={isSubmitting}
              />
              <span>Remember me on this browser</span>
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full mt-2"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing In...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                Sign In to Dashboard
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>

        </form>

        {/* Footer Link to Register */}
        <div className="pt-4 border-t border-stone-100 text-center text-xs text-stone-600">
          Don't have a student profile yet?{' '}
          <Link to="/register" className="font-bold text-forest-900 hover:underline">
            Register for free
          </Link>
        </div>

      </div>
    </div>
  );
}
