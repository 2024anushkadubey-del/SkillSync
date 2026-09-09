import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-forest-900 hover:bg-forest-800 active:bg-forest-950 text-white shadow-xs hover:shadow-sm focus:ring-forest-800/40 border border-forest-900',
    secondary: 'bg-stone-900 hover:bg-stone-800 active:bg-stone-950 text-white shadow-xs focus:ring-stone-900/30',
    outline: 'border border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50 text-stone-700 shadow-2xs focus:ring-forest-700/30',
    ghost: 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70 focus:ring-stone-400',
    soft: 'bg-forest-50 hover:bg-forest-100 text-forest-900 font-semibold border border-forest-200/60 focus:ring-forest-700/30',
    danger: 'bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold border border-rose-200/80 focus:ring-rose-500/30',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-5 py-3 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
