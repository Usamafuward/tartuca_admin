import React from 'react';

// Base Skeleton Component with Dark Shimmer Effect
export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div 
      className={`bg-slate-800/60 relative overflow-hidden rounded ${className}`}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
    </div>
  );
};

// Dashboard Skeleton
export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-5 rounded-xl border border-white/[0.06]">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-28 mt-1" />
              </div>
              <Skeleton className="w-10 h-10 rounded-lg" />
            </div>
            <div className="mt-4">
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Card */}
      <div className="glass-card rounded-xl border border-white/[0.06] p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="py-3"><Skeleton className="h-3 w-16" /></th>
                <th className="py-3"><Skeleton className="h-3 w-28" /></th>
                <th className="py-3"><Skeleton className="h-3 w-16" /></th>
                <th className="py-3"><Skeleton className="h-3 w-16" /></th>
                <th className="py-3"><Skeleton className="h-3 w-20" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="py-3.5"><Skeleton className="h-3.5 w-14" /></td>
                  <td className="py-3.5"><Skeleton className="h-3.5 w-32" /></td>
                  <td className="py-3.5"><Skeleton className="h-3.5 w-16" /></td>
                  <td className="py-3.5"><Skeleton className="h-3.5 w-16" /></td>
                  <td className="py-3.5"><Skeleton className="h-5 w-20 rounded-full" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Orders Table Row Skeleton
export const OrdersTableSkeleton = ({ rows = 6 }) => {
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-white/[0.04]">
          <td className="px-6 py-4"><Skeleton className="h-3.5 w-14" /></td>
          <td className="px-6 py-4"><Skeleton className="h-3.5 w-20" /></td>
          <td className="px-6 py-4"><Skeleton className="h-3.5 w-32" /></td>
          <td className="px-6 py-4"><Skeleton className="h-3.5 w-16" /></td>
          <td className="px-6 py-4"><Skeleton className="h-3.5 w-16" /></td>
          <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
          <td className="px-6 py-4 text-right">
            <div className="flex items-center justify-end gap-2">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-24 h-8 rounded-lg" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};

// Reservations Cards Skeleton
export const ReservationsSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="glass-card p-5 rounded-xl border border-white/[0.06] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded-sm" />
                <Skeleton className="h-3.5 w-28" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded-sm" />
                <Skeleton className="h-3.5 w-20" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded-sm" />
                <Skeleton className="h-3.5 w-20" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-2">
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex gap-2">
            <Skeleton className="h-8 flex-1 rounded-lg" />
            <Skeleton className="h-8 flex-1 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Menu Items Table Skeleton
export const MenuTableSkeleton = ({ rows = 6 }) => {
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-white/[0.04]">
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </td>
          <td className="px-6 py-4"><Skeleton className="h-3.5 w-24" /></td>
          <td className="px-6 py-4"><Skeleton className="h-3.5 w-16" /></td>
          <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
          <td className="px-6 py-4 text-right">
            <div className="flex items-center justify-end gap-2">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};

// Special Offers Cards Skeleton
export const SpecialOffersSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="glass-card rounded-xl border border-white/[0.06] overflow-hidden flex flex-col justify-between">
          <div>
            <Skeleton className="h-44 w-full rounded-none" />
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
          <div className="p-4 pt-0">
            <div className="flex justify-between items-center pt-3 border-t border-white/[0.06]">
              <Skeleton className="h-4 w-16 rounded" />
              <div className="flex gap-2">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Gallery Grid Skeleton
export const GallerySkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="aspect-square rounded-xl overflow-hidden glass-card border border-white/[0.06]">
          <Skeleton className="w-full h-full rounded-none" />
        </div>
      ))}
    </div>
  );
};

// Reviews List Skeleton
export const ReviewsSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="glass-card p-5 rounded-xl border border-white/[0.06] space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-14 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
};

// Settings Form Skeleton
export const SettingsSkeleton = () => {
  return (
    <div className="glass-card rounded-xl border border-white/[0.06] p-6 md:p-8 animate-pulse space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-3 w-80" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-3 w-44" />
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-white/[0.06]">
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>
    </div>
  );
};
