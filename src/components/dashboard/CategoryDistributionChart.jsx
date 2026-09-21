import React, { useState, useMemo } from 'react';
import { PieChart as PieIcon, Layers } from 'lucide-react';

const PALETTE = [
  { stroke: '#f59e0b', bg: 'bg-amber-500', text: 'text-amber-500', name: 'amber' },
  { stroke: '#06b6d4', bg: 'bg-cyan-500', text: 'text-cyan-500', name: 'cyan' },
  { stroke: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-500', name: 'emerald' },
  { stroke: '#8b5cf6', bg: 'bg-violet-500', text: 'text-violet-500', name: 'violet' },
  { stroke: '#f43f5e', bg: 'bg-rose-500', text: 'text-rose-500', name: 'rose' },
  { stroke: '#3b82f6', bg: 'bg-blue-500', text: 'text-blue-500', name: 'blue' }
];

const CategoryDistributionChart = ({ categories = [], currency = '$', menuStats = null }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // Group into top 4 + 'Other Categories'
  const processedData = useMemo(() => {
    if (!categories || categories.length === 0) return [];

    const total = categories.reduce((acc, c) => acc + (Number(c.revenue) || 0), 0);
    if (total === 0) return [];

    let top = categories.slice(0, 4);
    let rest = categories.slice(4);

    const result = top.map((cat, idx) => ({
      ...cat,
      color: PALETTE[idx % PALETTE.length],
      percentage: Number(((Number(cat.revenue) / total) * 100).toFixed(1))
    }));

    if (rest.length > 0) {
      const otherRevenue = rest.reduce((acc, c) => acc + (Number(c.revenue) || 0), 0);
      const otherQty = rest.reduce((acc, c) => acc + (Number(c.quantity) || 0), 0);
      result.push({
        name: 'Other Categories',
        revenue: otherRevenue,
        quantity: otherQty,
        color: PALETTE[4],
        percentage: Number(((otherRevenue / total) * 100).toFixed(1))
      });
    }

    return result;
  }, [categories]);

  const totalRevenue = useMemo(() => {
    return processedData.reduce((acc, c) => acc + (Number(c.revenue) || 0), 0);
  }, [processedData]);

  // Donut SVG calculations (Stroke Dasharray technique)
  const radius = 56;
  const circumference = 2 * Math.PI * radius;

  const donutSegments = useMemo(() => {
    let accumulatedAngle = 0;
    return processedData.map((item) => {
      const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -accumulatedAngle;
      accumulatedAngle += (item.percentage / 100) * circumference;
      return {
        ...item,
        strokeDasharray,
        strokeDashoffset
      };
    });
  }, [processedData, circumference]);

  const activeItem = hoveredCategory || null;

  return (
    <div className="glass-card rounded-2xl border border-slate-200 dark:border-white/[0.08] p-5 shadow-xl flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/20">
              <PieIcon size={16} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Category Breakdown</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Revenue share across culinary categories
          </p>
        </div>
      </div>

      {processedData.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center">
          <Layers size={32} className="opacity-30 mb-2" />
          <p>No category transactions recorded</p>
        </div>
      ) : (
        <div className="py-3 flex flex-col flex-1 justify-between gap-3">
          {/* Centered Donut Visual */}
          <div className="relative flex items-center justify-center py-1">
            <svg 
              width="150" 
              height="150" 
              viewBox="0 0 150 150" 
              className="-rotate-90 transform select-none"
            >
              {/* Background ring */}
              <circle
                cx="75"
                cy="75"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="15"
                fill="transparent"
              />

              {/* Segments */}
              {donutSegments.map((seg, idx) => {
                const isHovered = hoveredCategory?.name === seg.name;
                return (
                  <circle
                    key={idx}
                    cx="75"
                    cy="75"
                    r={radius}
                    stroke={seg.color.stroke}
                    strokeWidth={isHovered ? "19" : "15"}
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    strokeLinecap="butt"
                    fill="transparent"
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredCategory(seg)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  />
                );
              })}
            </svg>

            {/* Centered Readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate max-w-[95px]">
                {activeItem ? activeItem.name : 'Total Sales'}
              </span>
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5 tnum">
                {activeItem ? `${activeItem.percentage}%` : `${currency}${totalRevenue.toFixed(0)}`}
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono truncate max-w-[95px]">
                {activeItem ? `${currency}${Number(activeItem.revenue).toFixed(2)}` : `${processedData.length} Categories`}
              </span>
            </div>
          </div>

          {/* Category Progress Rows */}
          <div className="w-full space-y-2">
            {processedData.map((item, idx) => {
              const isHovered = hoveredCategory?.name === item.name;

              return (
                <div
                  key={idx}
                  className={`p-1.5 px-2.5 rounded-xl transition-all cursor-pointer border ${
                    isHovered
                      ? 'bg-slate-50 dark:bg-white/[0.04] border-slate-200 dark:border-white/10'
                      : 'border-transparent hover:bg-slate-50/60 dark:hover:bg-white/[0.02]'
                  }`}
                  onMouseEnter={() => setHoveredCategory(item)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                        style={{ backgroundColor: item.color.stroke }}
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate text-[11px]">
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono shrink-0 ml-2">
                      <span className="font-bold text-[11px] text-slate-900 dark:text-white">
                        {item.percentage}%
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 text-[10px] tnum">
                        {currency}{Number(item.revenue).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: item.color.stroke
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span>Catalog: <strong className="text-slate-700 dark:text-slate-200 font-mono">{menuStats?.total ? `${menuStats.total} Items` : `${processedData.length} Categories`}</strong></span>
        {menuStats && menuStats.sold_out > 0 ? (
          <span className="text-amber-600 dark:text-amber-400 font-mono text-[10px] font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            {menuStats.sold_out} Sold Out
          </span>
        ) : menuStats && menuStats.total > 0 ? (
          <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            100% In Stock
          </span>
        ) : (
          <span className="font-mono text-[10px] text-slate-400">Velocity Share</span>
        )}
      </div>
    </div>
  );
};

export default CategoryDistributionChart;
