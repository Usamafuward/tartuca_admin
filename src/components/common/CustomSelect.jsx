import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  className = '',
  size = 'md', // 'sm' | 'md'
  disabled = false,
  name = '',
  required = false,
  align = 'left',
  width = 'w-full'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const containerRef = useRef(null);

  // Normalize options to [{ value, label, dot, badge, icon }]
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: opt, label: String(opt) };
    }
    return {
      value: opt.value,
      label: opt.label ?? opt.name ?? String(opt.value),
      dot: opt.dot,
      badge: opt.badge,
      icon: opt.icon
    };
  });

  const selectedOption = normalizedOptions.find(opt => String(opt.value) === String(value));

  // Click outside and ESC key listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Check positioning relative to viewport
  const toggleDropdown = () => {
    if (disabled) return;
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < 220);
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (val) => {
    setIsOpen(false);
    if (onChange) {
      // Create synthetic event object so it works with both e.target.value and direct value
      const syntheticEvent = {
        target: { name, value: val },
        currentTarget: { name, value: val },
        value: val
      };
      onChange(syntheticEvent);
    }
  };

  const sizeClasses = size === 'sm'
    ? 'px-3 py-1.5 text-xs rounded-lg'
    : size === 'lg'
    ? 'px-4 py-2.5 text-sm rounded-xl'
    : 'px-3.5 py-2 text-xs rounded-lg';

  return (
    <div className={`relative ${width}`} ref={containerRef}>
      {/* Hidden input for HTML form compliance */}
      {name && (
        <input 
          type="hidden" 
          name={name} 
          value={value ?? ''} 
          required={required} 
        />
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={toggleDropdown}
        className={`w-full flex items-center justify-between gap-2.5 transition-all text-left border select-none ${sizeClasses} ${
          isOpen
            ? 'border-amber-500/60 ring-2 ring-amber-500/20 shadow-md'
            : 'border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20'
        } ${
          disabled
            ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-900 text-slate-400'
            : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-sm cursor-pointer'
        } ${className}`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.dot && (
            <span className={`w-2 h-2 rounded-full shrink-0 ${selectedOption.dot}`} />
          )}
          {selectedOption?.icon && (
            <span className="shrink-0 text-slate-400">{selectedOption.icon}</span>
          )}
          <span className="truncate font-medium">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-mono font-bold">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown 
          size={14} 
          className={`text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-amber-500' : ''
          }`} 
        />
      </button>

      {/* Popover Options List */}
      {isOpen && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} ${
            openUpwards ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } z-[120] min-w-[160px] w-full bg-white dark:bg-[#12151E] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl py-1.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150`}
        >
          <div className="max-h-56 overflow-y-auto modal-scrollbar p-1 space-y-0.5">
            {normalizedOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-400 text-center">
                No options available
              </div>
            ) : (
              normalizedOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);

                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left group ${
                      isSelected
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {opt.dot && (
                        <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dot}`} />
                      )}
                      {opt.icon && (
                        <span className="shrink-0 text-slate-400 group-hover:text-amber-500">{opt.icon}</span>
                      )}
                      <span className="truncate">{opt.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {opt.badge && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 font-mono">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && (
                        <Check size={14} className="text-amber-500 dark:text-amber-400 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
