import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, User, PlusSquare } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function BottomNav() {
  const { user } = useAuthStore();
  
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/explore', icon: Search, label: 'Explore' },
    { to: '/create', icon: PlusSquare, label: 'Create' },
    { to: `/profile/${user?.id || 'guest'}`, icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t-[3px] border-neoBorder z-50 md:hidden">
      <div className="flex items-center justify-around h-16 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex items-center justify-center w-full h-full relative"
            >
              {({ isActive }) => (
                <div className={`p-2 transition-colors ${isActive ? 'bg-neoCyan border-[2.5px] border-neoBorder shadow-neo-sm' : 'text-slate-400 hover:text-neoText hover:bg-slate-50'}`}>
                  <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px] text-neoText' : 'stroke-2'}`} />
                </div>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
