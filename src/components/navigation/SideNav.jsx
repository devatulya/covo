import React from 'react';
import { Home, PlusSquare, Search, User } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function SideNav() {
  const user = useAuthStore((state) => state.user);

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/explore', icon: Search, label: 'Explore' },
    { to: '/create', icon: PlusSquare, label: 'New Blast' },
    { to: `/profile/${user?.id || 'guest'}`, icon: User, label: 'Profile' },
  ];

  return (
    <div className="surface-panel hidden h-screen w-[280px] flex-col border-r-[3px] border-neoBorder p-6 md:sticky md:top-0 md:flex">
      <div className="mb-10 mt-2">
        <Link
          to="/"
          className="inline-block rotate-[-2deg] border-[3px] border-neoBorder bg-neoYellow px-3 py-1 text-2xl font-black uppercase tracking-tighter shadow-neo"
        >
          COVO
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-6">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink key={item.to} to={item.to} className="group flex w-max items-center gap-4">
              {({ isActive }) => (
                <>
                  <div
                    className={`flex items-center justify-center border-[3px] p-3 transition-all ${
                      isActive
                        ? 'border-neoBorder bg-neoCyan shadow-neo'
                        : 'border-transparent text-neoMuted group-hover:border-neoBorder group-hover:bg-neoSurfaceMuted group-hover:text-neoText group-hover:shadow-neo-sm'
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${isActive ? 'stroke-[2.75px] text-neoText' : 'stroke-[2.25px]'}`} />
                  </div>
                  <span
                    className={`text-xl font-black uppercase transition-colors ${
                      isActive ? 'text-neoText' : 'text-neoMuted group-hover:text-neoText'
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <Link
        to={`/profile/${user?.id || 'guest'}`}
        className="mt-auto flex items-center gap-3 border-[3px] border-neoBorder p-3 shadow-neo hover:bg-neoSurfaceMuted"
      >
        <div className="h-11 w-11 overflow-hidden border-[3px] border-neoBorder bg-neoPink">
          {user?.avatar ? <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" /> : null}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold uppercase leading-none">{user?.name}</span>
          <span className="text-xs font-bold text-neoMuted">@{user?.username}</span>
        </div>
      </Link>
    </div>
  );
}
