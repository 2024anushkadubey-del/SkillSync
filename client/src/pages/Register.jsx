import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, User, Mail, Lock, ArrowLeft, ArrowRight, Eye, EyeOff, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  // Controlled form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [major, setMajor] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Form submission and validation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Client-side validation
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (!email.includes('@')) {
      setErrorMessage('Please enter a valid university email address.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password should be at least 6 characters long.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Please agree to the SkillSync Student Exchange Guidelines.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        major: major.trim() || 'Computer Science (Sophomore)',
        password,
      });

      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please verify your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-md w-full space-y-6 bg-white p-7 sm:p-9 rounded-2xl border border-stone-200/90 shadow-lg shadow-stone-900/5 relative">
        
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center text-xs font-semibold text-stone-500 hover:text-forest-900 transition-colors gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className="text-center pt-1">
          <div className="w-11 h-11 rounded-xl bg-forest-900 text-white flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
            <Sparkles className="w-5 h-5 text-forest-200" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            Create Student Profile
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-stone-500">
            Join your university peer skill exchange community
          </p>
        </div>

        {/* Validation Error Message */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800 animate-slide-up">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Register Form */}
        <form className="space-y-3.5" onSubmit={handleSubmit}>
          
          {/* Name Field */}
          <div>
            <label className="form-label">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                className="form-input pl-10"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Student Email Field */}
          <div>
            <label className="form-label">
              Student Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="form-input pl-10"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Major/Degree Field */}
          <div>
            <label className="form-label">
              Major & Year (Optional)
            </label>
            <div className="relative">
              <BookOpen className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="e.g. Computer Science (Sophomore)"
                className="form-input pl-10"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="form-label">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password (min 6 chars)"
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

          {/* Confirm Password Field */}
          <div>
            <label className="form-label">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="form-input pl-10"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="pt-1 flex items-start space-x-2 text-xs text-stone-600">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded text-forest-900 focus:ring-forest-800 border-stone-300 w-3.5 h-3.5"
              disabled={isSubmitting}
            />
            <label htmlFor="terms" className="cursor-pointer select-none">
              I agree to the SkillSync Student Exchange Guidelines & Code of Conduct.
            </label>
          </div>

          {/* Register Submit Button */}
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full mt-2"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Profile...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                Complete Registration
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>

        </form>

        {/* Footer Link to Login */}
        <div className="pt-4 border-t border-stone-100 text-center text-xs text-stone-600">
          Already registered on SkillSync?{' '}
          <Link to="/login" className="font-bold text-forest-900 hover:underline">
            Sign In here
          </Link>
        </div>

      </div>
    </div>
  );
}
