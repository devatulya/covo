import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from '../navigation/BottomNav';
import { SideNav } from '../navigation/SideNav';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-neoBg flex justify-center w-full">
      <div className="flex w-full max-w-7xl relative justify-center md:justify-start">
        {/* Desktop Sidebar */}
        <SideNav />

        {/* Main Feed Content */}
        <main className="w-full md:max-w-2xl bg-neoBg pb-20 md:pb-0 md:border-r-[3px] border-neoBorder min-h-screen">
          <Outlet />
        </main>

        {/* Desktop Right Sidebar Spacer/Ads (optional future extension) */}
        <aside className="hidden lg:block flex-1 p-6">
           <div className="border-[3px] border-neoBorder bg-neoCyan p-4 shadow-neo">
               <h3 className="font-black text-sm uppercase mb-2">Campus Bulletin</h3>
               <p className="text-xs font-bold leading-relaxed mb-4">Welcome to the rawest social network on campus. Go post a blast.</p>
           </div>
        </aside>

        {/* Mobile Nav */}
        <BottomNav />
      </div>
    </div>
  );
}
