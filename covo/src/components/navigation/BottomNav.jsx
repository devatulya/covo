import React from 'react';
import { Home, PlusSquare, Search, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function BottomNav() {
  const user = useAuthStore((state) => state.user);

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/explore', icon: Search, label: 'Explore' },
    { to: '/create', icon: PlusSquare, label: 'Create' },
    { to: `/profile/${user?.id || 'guest'}`, icon: User, label: 'Profile' },
  ];

  return (
    <nav className="surface-panel fixed bottom-0 left-0 z-50 w-full border-t-[3px] border-neoBorder md:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink key={item.to} to={item.to} className="flex h-full w-full items-center justify-center">
              {({ isActive }) => (
                <div
                  className={`flex h-12 w-12 items-center justify-center border-[3px] transition-all ${
                    isActive
                      ? 'border-neoBorder bg-neoCyan shadow-neo-sm'
                      : 'border-transparent bg-transparent text-neoMuted'
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isActive ? 'stroke-[2.75px] text-neoText' : 'stroke-[2.25px]'}`} />
                </div>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
