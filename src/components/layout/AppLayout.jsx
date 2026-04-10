import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from '../navigation/BottomNav';
import { SideNav } from '../navigation/SideNav';

export function AppLayout() {
  return (
    <div className="min-h-screen w-full bg-neoBg">
      <div className="relative mx-auto flex w-full max-w-7xl justify-center md:justify-start">
        <SideNav />

        <main className="min-h-screen w-full bg-neoBg pb-20 md:max-w-3xl md:border-r-[3px] md:border-neoBorder md:pb-0">
          <Outlet />
        </main>

        <aside className="hidden flex-1 p-6 lg:block">
          <div className="surface-panel border-[3px] border-neoBorder p-5 shadow-neo">
            <h3 className="mb-3 text-sm font-black uppercase tracking-[0.2em]">Campus Bulletin</h3>
            <p className="mb-5 text-sm font-bold leading-relaxed text-neoMuted">
              The loudest boards, weirdest confessions, and the clubs worth showing up for live here.
            </p>
            <div className="border-[3px] border-neoBorder bg-neoYellow px-4 py-3 text-xs font-black uppercase shadow-neo-sm">
              New blasts keep dropping. Scroll with caution.
            </div>
          </div>
        </aside>

        <BottomNav />
      </div>
    </div>
  );
}
