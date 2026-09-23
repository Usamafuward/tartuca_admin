import React, { useState, useMemo } from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Calendar } from 'lucide-react';

const RevenueTrendChart = ({ 
  data7d = [], 
  data14d = [], 
  currency = '$',
  cancelledRevenue = 0,
  cancelledOrders = 0
}) => {
  const [timeRange, setTimeRange] = useState('7d'); // '7d' | '14d'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const activeData = useMemo(() => {
    const raw = timeRange === '7d' ? data7d : (data14d.length ? data14d : data7d);
    if (!raw || raw.length === 0) return [];
    return raw;
  }, [timeRange, data7d, data14d]);

  // Derived metrics
  const totalRevenue = useMemo(() => {
    return activeData.reduce((acc, curr) => acc + (Number(curr.revenue) || 0), 0);
  }, [activeData]);

  const totalOrders = useMemo(() => {
    return activeData.reduce((acc, curr) => acc + (Number(curr.orders) || 0), 0);
  }, [activeData]);

  const avgDailyRevenue = useMemo(() => {
    return activeData.length ? totalRevenue / activeData.length : 0;
  }, [activeData, totalRevenue]);

  const avgDailyOrders = useMemo(() => {
    return activeData.length ? (totalOrders / activeData.length).toFixed(1) : '0.0';
  }, [activeData, totalOrders]);

  const grossRevenue = useMemo(() => {
    return totalRevenue + Number(cancelledRevenue || 0);
  }, [totalRevenue, cancelledRevenue]);

  const realizationRate = useMemo(() => {
    if (!grossRevenue) return 100;
    return ((totalRevenue / grossRevenue) * 100).toFixed(1);
  }, [totalRevenue, grossRevenue]);

  // SVG Chart Geometry
  const svgWidth = 650;
  const svgHeight = 160;
  const padding = { top: 15, right: 20, bottom: 25, left: 50 };
  const innerWidth = svgWidth - padding.left - padding.right;
  const innerHeight = svgHeight - padding.top - padding.bottom;

  const maxRevenue = useMemo(() => {
    const max = Math.max(...activeData.map(d => Number(d.revenue) || 0), 100);
    const step = max > 500 ? 200 : max > 200 ? 100 : 50;
    return Math.ceil(max / step) * step;
  }, [activeData]);

  const maxOrders = useMemo(() => {
    const max = Math.max(...activeData.map(d => Number(d.orders) || 0), 5);
    return Math.ceil(max / 5) * 5;
  }, [activeData]);

  // Generate points
  const points = useMemo(() => {
    if (activeData.length === 0) return [];
    const stepX = innerWidth / (activeData.length - 1 || 1);

    return activeData.map((d, i) => {
      const x = padding.left + i * stepX;
      const rev = Number(d.revenue) || 0;
      const y = padding.top + innerHeight - (rev / maxRevenue) * innerHeight;
      const ord = Number(d.orders) || 0;
      const barHeight = (ord / maxOrders) * (innerHeight * 0.5);
      return { ...d, x, y, barHeight, index: i };
    });
  }, [activeData, innerWidth, innerHeight, maxRevenue, maxOrders, padding]);

  // Generate smooth spline curve path
  const { linePath, areaPath } = useMemo(() => {
    if (points.length < 2) {
      if (points.length === 1) {
        const p = points[0];
        const line = `M ${p.x - 10} ${p.y} L ${p.x + 10} ${p.y}`;
        const area = `M ${p.x - 10} ${p.y} L ${p.x + 10} ${p.y} L ${p.x + 10} ${padding.top + innerHeight} L ${p.x - 10} ${padding.top + innerHeight} Z`;
        return { linePath: line, areaPath: area };
      }
      return { linePath: '', areaPath: '' };
    }

    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
    }

    const first = points[0];
    const last = points[points.length - 1];
    const bottomY = padding.top + innerHeight;
    const a = `${d} L ${last.x},${bottomY} L ${first.x},${bottomY} Z`;

    return { linePath: d, areaPath: a };
  }, [points, padding, innerHeight]);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(ratio => {
    const val = maxRevenue * ratio;
    const y = padding.top + innerHeight - ratio * innerHeight;
    return { val: Math.round(val), y };
  });

  const activeHoverPoint = hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : null;

  return (
    <div className="glass-card rounded-2xl border border-slate-200 dark:border-white/[0.08] p-5 shadow-xl flex flex-col justify-between h-full">
      {/* Header with Title and Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20">
              <TrendingUp size={16} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Revenue & Orders Trajectory</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Daily financial inflow with comparative order volume
          </p>
        </div>

        {/* Range Toggle Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                timeRange === '7d'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('14d')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                timeRange === '14d'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Last 14 Days
            </button>
          </div>
        </div>
      </div>

      {/* KPI Callout Highlights - Non-redundant Analytics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-2.5 border-b border-slate-100 dark:border-white/[0.06] text-xs">
        <div className="p-2 rounded-xl bg-slate-50/60 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04]">
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Daily Revenue Pace</p>
          <p className="text-base font-mono font-bold text-amber-600 dark:text-amber-400 mt-0.5 tnum">
            {currency}{currency?.endsWith('.') ? ' ' : ''}{avgDailyRevenue.toFixed(2)}
          </p>
          <span className="text-[10px] text-slate-400 font-mono">{timeRange === '7d' ? '7-day' : '14-day'} pacing</span>
        </div>

        <div className="p-2 rounded-xl bg-slate-50/60 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04]">
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Daily Order Pace</p>
          <p className="text-base font-mono font-bold text-cyan-600 dark:text-cyan-400 mt-0.5 tnum">
            {avgDailyOrders} <span className="text-xs font-normal">/ day</span>
          </p>
          <span className="text-[10px] text-slate-400 font-mono">{totalOrders} orders in period</span>
        </div>

        <div className="p-2 rounded-xl bg-slate-50/60 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04]">
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avoidable Loss</p>
          <p className="text-base font-mono font-bold text-rose-500 dark:text-rose-400 mt-0.5 tnum">
            {currency}{currency?.endsWith('.') ? ' ' : ''}{Number(cancelledRevenue || 0).toFixed(2)}
          </p>
          <span className="text-[10px] text-slate-400 font-mono">{cancelledOrders || 0} voided orders</span>
        </div>

        <div className="p-2 rounded-xl bg-slate-50/60 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04]">
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Revenue Realization</p>
          <p className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tnum">
            {realizationRate}%
          </p>
          <span className="text-[10px] text-slate-400 font-mono">{currency}{grossRevenue.toFixed(2)} gross billed</span>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative pt-3 w-full">
        {/* Floating Tooltip Card */}
        {activeHoverPoint && (
          <div 
            className="absolute z-20 pointer-events-none transition-all duration-150 -translate-x-1/2 -translate-y-full mb-3"
            style={{ 
              left: `${(activeHoverPoint.x / svgWidth) * 100}%`, 
              top: `${(activeHoverPoint.y / svgHeight) * 100}%` 
            }}
          >
            <div className="bg-slate-900/95 dark:bg-[#0B0D13]/95 border border-white/15 text-white rounded-xl px-3 py-2 shadow-2xl backdrop-blur-md text-xs whitespace-nowrap animate-in fade-in zoom-in-95 duration-100">
              <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
                <Calendar size={11} className="text-amber-400" />
                <span>{activeHoverPoint.label} ({activeHoverPoint.date})</span>
              </p>
              <div className="space-y-1 font-mono">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Revenue:
                  </span>
                  <span className="font-bold text-amber-300 tnum">
                    {currency}{Number(activeHoverPoint.revenue).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Orders:
                  </span>
                  <span className="font-bold text-cyan-300 tnum">
                    {activeHoverPoint.orders} orders
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full h-auto overflow-visible select-none"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="revenueAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.38" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>

            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Gridlines & Y-Axis Labels */}
          {yTicks.map((tick, idx) => (
            <g key={idx} className="opacity-80">
              <line
                x1={padding.left}
                y1={tick.y}
                x2={svgWidth - padding.right}
                y2={tick.y}
                stroke="currentColor"
                className="text-slate-200 dark:text-white/[0.06]"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 10}
                y={tick.y + 3}
                textAnchor="end"
                className="text-[10px] font-mono fill-slate-400 dark:fill-slate-500 font-medium"
              >
                {currency}{tick.val}
              </text>
            </g>
          ))}

          {/* Subtle Order Count Background Bars */}
          {points.map((p, idx) => {
            const barWidth = timeRange === '7d' ? 14 : 8;
            const bottomY = padding.top + innerHeight;
            const barY = bottomY - Math.max(p.barHeight, 4);

            return (
              <rect
                key={`bar-${idx}`}
                x={p.x - barWidth / 2}
                y={barY}
                width={barWidth}
                height={Math.max(p.barHeight, 4)}
                rx={barWidth / 2}
                className="fill-cyan-500/20 dark:fill-cyan-400/20 hover:fill-cyan-500/40 transition-colors cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
              />
            );
          })}

          {/* Spline Area Fill */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#revenueAreaGrad)"
            />
          )}

          {/* Spline Glowing Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glowFilter)"
            />
          )}

          {/* Hover Vertical Guide Line */}
          {activeHoverPoint && (
            <line
              x1={activeHoverPoint.x}
              y1={padding.top}
              x2={activeHoverPoint.x}
              y2={padding.top + innerHeight}
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className="opacity-70"
            />
          )}

          {/* Interactive Data Points */}
          {points.map((p, idx) => {
            const isHovered = hoveredIndex === idx;

            return (
              <g 
                key={`point-${idx}`} 
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
              >
                {/* Transparent Hit target for smooth mouseover */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="14"
                  fill="transparent"
                />

                {/* Main Dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? "5" : "3.5"}
                  className="fill-white dark:fill-slate-900 stroke-amber-500 transition-all duration-150"
                  strokeWidth={isHovered ? "2.5" : "2"}
                />

                {/* X-Axis Date Label */}
                <text
                  x={p.x}
                  y={padding.top + innerHeight + 18}
                  textAnchor="middle"
                  className={`text-[10px] font-mono transition-colors ${
                    isHovered 
                      ? 'fill-amber-600 dark:fill-amber-400 font-bold' 
                      : 'fill-slate-500 dark:fill-slate-400'
                  }`}
                >
                  {p.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Daily Timeline Activity Strip */}
      <div className="pt-2.5 pb-1 border-t border-slate-100 dark:border-white/[0.04]">
        <div className={`grid ${timeRange === '7d' ? 'grid-cols-7' : 'grid-cols-7 sm:grid-cols-14'} gap-1.5 text-center`}>
          {activeData.map((d, idx) => {
            const isHovered = hoveredIndex === idx;
            const hasRevenue = Number(d.revenue) > 0;

            return (
              <button
                key={idx}
                type="button"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`p-1.5 rounded-xl text-left transition-all border ${
                  isHovered
                    ? 'bg-amber-500/15 border-amber-500/50 shadow-sm'
                    : hasRevenue
                    ? 'bg-slate-50 dark:bg-white/[0.03] border-amber-500/25 hover:border-amber-500/40'
                    : 'bg-transparent border-transparent hover:bg-slate-50/50 dark:hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 leading-none">{d.label}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${hasRevenue ? 'bg-amber-400' : 'bg-slate-300 dark:bg-slate-700'}`} />
                </div>
                <p className={`text-xs font-mono font-bold mt-1 leading-none ${hasRevenue ? 'text-amber-600 dark:text-amber-300' : 'text-slate-400'}`}>
                  {hasRevenue ? `${currency}${currency?.endsWith('.') ? ' ' : ''}${Number(d.revenue).toFixed(0)}` : `${currency}${currency?.endsWith('.') ? ' ' : ''}0`}
                </p>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono block mt-0.5">
                  {d.orders} {d.orders === 1 ? 'ord' : 'ords'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Footer Legend */}
      <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/[0.04]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 rounded-full bg-amber-500" />
            <span>Revenue ({currency})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-cyan-500/40" />
            <span>Orders Volume</span>
          </div>
        </div>
        <span className="font-mono text-[10px] text-slate-400">Hover points or daily cards for breakdown</span>
      </div>
    </div>
  );
};

export default RevenueTrendChart;
