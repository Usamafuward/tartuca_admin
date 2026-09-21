import { useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      icon: <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400 shrink-0" />,
      border: 'border-emerald-500/30 hover:border-emerald-500/50',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
      indicator: 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
    },
    error: {
      icon: <AlertTriangle size={16} className="text-rose-500 dark:text-rose-400 shrink-0" />,
      border: 'border-rose-500/30 hover:border-rose-500/50',
      glow: 'shadow-[0_0_20px_rgba(244,63,94,0.15)]',
      indicator: 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
    },
    info: {
      icon: <Info size={16} className="text-amber-500 dark:text-amber-400 shrink-0" />,
      border: 'border-amber-500/30 hover:border-amber-500/50',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
      indicator: 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'
    }
  };

  const current = config[type] || config.info;

  return (
    <div className={`flex items-center gap-3 min-w-[320px] max-w-md px-4 py-3 rounded-xl bg-white/95 dark:bg-[#0E1017]/90 backdrop-blur-xl border border-slate-200 dark:border-transparent ${current.border} ${current.glow} shadow-2xl transition-all`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.indicator}`} />
      {current.icon}
      <p className="flex-1 text-xs font-medium text-slate-800 dark:text-slate-200 tracking-wide">{message}</p>
      <button 
        onClick={onClose} 
        className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
