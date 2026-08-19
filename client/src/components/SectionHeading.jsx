import React from 'react';

export default function SectionHeading({
  badge,
  title,
  subtitle,
  centered = false,
  className = '',
}) {
  return (
    <div className={`${centered ? 'text-center max-w-2xl mx-auto' : 'max-w-xl'} ${className}`}>
      {badge && (
        <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-100/80 rounded-full mb-3">
          {badge}
        </span>
      )}
      {title && (
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
