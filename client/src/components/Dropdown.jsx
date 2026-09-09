import React, { useState, useRef, useEffect } from 'react';

export default function Dropdown({
  trigger,
  items,
  children,
  align = 'left',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {typeof trigger === 'function' ? trigger({ isOpen }) : trigger}
      </div>

      {/* Menu Content */}
      {isOpen && (
        <div
          className={`absolute z-40 mt-2 min-w-[200px] rounded-xl bg-white border border-stone-200 p-1.5 shadow-lg shadow-stone-900/5 focus:outline-none animate-slide-up ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          role="menu"
        >
          {items
            ? items.map((item, index) => {
                if (item.divider) {
                  return <div key={index} className="my-1 border-t border-stone-100" />;
                }

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      if (item.onClick) item.onClick();
                      setIsOpen(false);
                    }}
                    disabled={item.disabled}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                      item.active
                        ? 'bg-forest-50 text-forest-900 font-semibold'
                        : 'text-stone-700 hover:bg-stone-50 hover:text-stone-900'
                    } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    role="menuitem"
                  >
                    {item.icon && <span className="text-stone-400 shrink-0">{item.icon}</span>}
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })
            : (typeof children === 'function' ? children({ close: () => setIsOpen(false) }) : children)}
        </div>
      )}
    </div>
  );
}
