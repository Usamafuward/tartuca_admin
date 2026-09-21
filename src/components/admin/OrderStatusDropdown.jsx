import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Loader2 } from 'lucide-react';

const STATUS_CONFIGS = {
  pending: {
    label: 'Pending',
    dot: 'bg-amber-500 dark:bg-amber-400',
    pill: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 hover:bg-amber-500/20',
  },
  cooking: {
    label: 'Preparing',
    dot: 'bg-cyan-500 dark:bg-cyan-400',
    pill: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/25 hover:bg-cyan-500/20',
  },
  delivered: {
    label: 'Delivered',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
    pill: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20',
  },
  cancelled: {
    label: 'Cancelled',
    dot: 'bg-rose-500 dark:bg-rose-400',
    pill: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/25',
  },
};

const DEFAULT_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'cooking', label: 'Preparing' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const getAvailableStatusOptions = (currentStatus) => {
  const s = currentStatus ? currentStatus.toLowerCase() : '';
  if (s === 'pending') {
    return DEFAULT_OPTIONS;
  } else if (s === 'cooking') {
    return DEFAULT_OPTIONS.filter((opt) => opt.value !== 'pending');
  } else if (s === 'delivered') {
    return DEFAULT_OPTIONS.filter((opt) => opt.value === 'delivered');
  } else if (s === 'cancelled') {
    return DEFAULT_OPTIONS.filter((opt) => opt.value === 'cancelled');
  }
  return DEFAULT_OPTIONS;
};

const OrderStatusDropdown = ({
  status,
  onStatusChange,
  isUpdating = false,
  disabled = false,
  size = 'sm',
  align = 'right',
  options,
  variant = 'minimal', // 'minimal' | 'pill'
  width
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const dropdownRef = useRef(null);

  const currentStatus = status ? status.toLowerCase() : 'pending';
  const cfg = STATUS_CONFIGS[currentStatus] || {
    label: currentStatus,
    dot: 'bg-slate-400',
    pill: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
  };

  const availableOptions = options || getAvailableStatusOptions(currentStatus);
  const isActionDisabled = disabled || isUpdating || currentStatus === 'cancelled' || availableOptions.length <= 1;

  const defaultWidth = width || (size === 'md' ? 'w-[124px]' : 'w-[108px]');

  // Handle click outside & escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
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

  // Check if dropdown should open upwards if near bottom of screen
  const toggleDropdown = () => {
    if (isActionDisabled) return;
    if (!isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < 180);
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (newStatus) => {
    setIsOpen(false);
    if (newStatus !== currentStatus) {
      onStatusChange(newStatus);
    }
  };

  const sizeClasses = size === 'md'
    ? 'px-3 py-1.5 text-xs'
    : 'px-2.5 py-1 text-[11px]';

  return (
    <div className={`relative inline-block text-left ${defaultWidth}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={isActionDisabled}
        onClick={toggleDropdown}
        className={`w-full flex items-center justify-between gap-1.5 rounded-lg font-medium transition-all select-none ${sizeClasses} ${
          variant === 'minimal'
            ? `${
                isOpen
                  ? 'border-amber-500/60 ring-2 ring-amber-500/20 text-slate-900 dark:text-white shadow-xs'
                  : 'border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-300'
              } ${
                isActionDisabled
                  ? 'opacity-50 cursor-not-allowed bg-slate-100/60 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-white/[0.05]'
                  : 'bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-2xs cursor-pointer active:scale-[0.98]'
              } border`
            : `${cfg.pill} shadow-sm ${
                isActionDisabled
                  ? 'opacity-70 cursor-not-allowed'
                  : 'cursor-pointer active:scale-95'
              }`
        }`}
        title={currentStatus === 'cancelled' ? 'Cancelled orders cannot be altered' : 'Change order status'}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {isUpdating ? (
            <Loader2 size={size === 'md' ? 12 : 11} className="animate-spin text-amber-500 shrink-0" />
          ) : (
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
          )}
          <span className="truncate capitalize text-left">
            {isUpdating ? 'Updating...' : cfg.label}
          </span>
        </div>
        {!isActionDisabled && (
          <ChevronDown
            size={size === 'md' ? 12 : 11}
            className={`text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-amber-500' : ''
            }`}
          />
        )}
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} ${
            openUpwards ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } z-[80] min-w-[130px] w-max bg-white dark:bg-[#12151E] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl py-1.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150`}
        >
          <div className="px-2.5 py-1 mb-1 border-b border-slate-100 dark:border-white/5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Change Status
            </p>
          </div>
          <div className="space-y-0.5 px-1">
            {availableOptions.map((opt) => {
              const optCfg = STATUS_CONFIGS[opt.value] || { dot: 'bg-slate-400' };
              const isSelected = opt.value === currentStatus;

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                    isSelected
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${optCfg.dot}`} />
                    <span>{opt.label}</span>
                  </div>
                  {isSelected && (
                    <Check size={13} className="text-amber-500 dark:text-amber-400 ml-3 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStatusDropdown;
