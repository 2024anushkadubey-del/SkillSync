import React from 'react';
import Badge from './Badge';

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
        <div className="mb-3">
          <Badge variant="forest" size="md">
            {badge}
          </Badge>
        </div>
      )}
      {title && (
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="mt-2.5 text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
          {subtitle}
        </p>
      )}
    </div>
  );
}
