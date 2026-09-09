import React from 'react';

export default function Badge({
  children,
  variant = 'forest',
  size = 'md',
  dot = false,
  className = '',
}) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full transition-colors';

  const variants = {
    forest: 'bg-forest-50 text-forest-800 border border-forest-200/80',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-800 border border-amber-200/80',
    neutral: 'bg-stone-100 text-stone-700 border border-stone-200/80',
    indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-200/70',
    outline: 'bg-white text-stone-700 border border-stone-200 shadow-2xs',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-xs font-semibold gap-1.5',
  };

  const dotColors = {
    forest: 'bg-forest-600',
    success: 'bg-emerald-600',
    amber: 'bg-amber-600',
    neutral: 'bg-stone-500',
    indigo: 'bg-indigo-600',
    outline: 'bg-stone-400',
  };

  return (
    <span className={`${baseStyles} ${variants[variant] || variants.forest} ${sizes[size] || sizes.md} ${className}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.forest}`} />
      )}
      {children}
    </span>
  );
}
