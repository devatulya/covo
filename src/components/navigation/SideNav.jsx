import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, User, PlusSquare } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function SideNav() {
  const { user } = useAuthStore();
  
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/explore', icon: Search, label: 'Explore' },
    { to: '/create', icon: PlusSquare, label: 'New Blast' },
    { to: `/profile/${user?.id || 'guest'}`, icon: User, label: 'Profile' },
  ];

  return (
    <div className="hidden md:flex flex-col w-[280px] sticky top-0 h-screen p-6 border-r-[3px] border-neoBorder bg-white">
      <div className="mb-10 mt-2">
        <h1 className="text-2xl font-black uppercase tracking-tighter bg-neoYellow border-[3px] border-neoBorder px-3 py-1 shadow-neo inline-block rotate-[-2deg]">
          COVO
        </h1>
      </div>

      <nav className="flex-1 flex flex-col gap-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex items-center gap-4 w-min group"
            >
              {({ isActive }) => (
                <>
                  <div className={`p-3 transition-colors ${isActive ? 'bg-neoCyan border-[3px] border-neoBorder shadow-neo' : 'text-slate-500 border-[3px] border-transparent group-hover:border-neoBorder group-hover:text-neoText group-hover:bg-slate-100 group-hover:shadow-neo-sm'}`}>
                    <Icon className={`w-6 h-6 ${isActive ? 'stroke-[3px] text-neoText' : 'stroke-2'}`} />
                  </div>
                  <span className={`text-xl font-black uppercase transition-colors ${isActive ? 'text-neoText' : 'text-slate-500 group-hover:text-neoText'}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
      
      <div className="mt-auto items-center flex gap-3 p-3 border-[3px] border-neoBorder shadow-neo cursor-pointer hover:bg-slate-50">
        <div className="w-10 h-10 border-[2px] border-neoBorder bg-neoPink overflow-hidden">
             <img src={user?.avatar} alt={user?.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col">
            <span className="font-bold text-sm uppercase leading-none">{user?.name}</span>
            <span className="text-xs text-slate-500 font-bold">@{user?.username}</span>
        </div>
      </div>
    </div>
  );
}
