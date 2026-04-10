import React from 'react';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function Profile() {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col min-h-screen bg-neoBg pb-20 md:pb-0">
      <div className="bg-white border-b-[3px] border-neoBorder px-4 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="md:hidden">
          <Link to="/" className="w-8 h-8 flex items-center justify-center border-[3px] border-neoBorder hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5 stroke-[3px]" />
          </Link>
        </div>
        <div className="hidden md:block w-8"></div>
        
        <h1 className="text-lg font-black tracking-tighter uppercase">PROFILE</h1>
        
        <Link to="/settings" className="w-8 h-8 flex items-center justify-center border-[3px] border-neoBorder bg-neoYellow shadow-neo-sm hover:bg-[#ffe000] transition-colors">
          <SettingsIcon className="w-5 h-5 stroke-[3px]" />
        </Link>
      </div>

      <div className="p-4 md:p-8 flex flex-col items-center max-w-4xl mx-auto w-full">
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 w-full mb-8">
            <div className="flex flex-col items-center md:items-start flex-shrink-0">
                {/* Avatar */}
                <div className="relative mb-4">
                  <div className="w-24 h-24 md:w-32 md:h-32 border-[3px] border-neoBorder bg-neoYellow shadow-neo flex-shrink-0 overflow-hidden group">
                    <img src={user?.avatar} alt={user?.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="absolute -bottom-2 -right-4 bg-neoCyan text-neoText font-bold text-[10px] uppercase px-2 py-0.5 border-[3px] border-neoBorder">
                    ONLINE
                  </div>
                </div>
                <h2 className="text-xl md:text-3xl font-black uppercase tracking-wide mt-2 leading-none">{user?.name}</h2>
                <p className="text-xs md:text-sm font-bold text-slate-500">@{user?.username}</p>
            </div>

            <div className="flex-1 flex flex-col items-center md:items-start w-full md:mt-2">
                {/* Bio */}
                <div className="w-full max-w-[280px] md:max-w-md border-[3px] border-dashed border-neoBorder bg-white p-4 text-center md:text-left shadow-neo-sm mb-6">
                <p className="text-xs md:text-sm font-bold leading-relaxed whitespace-pre-line">
                    "Design Major. Coffee Addict.{"\n"}
                    Making things break since '03 👾"
                </p>
                </div>

                {/* Stats */}
                <div className="w-full max-w-md flex flex-wrap md:flex-nowrap gap-3">
                    <StatBox label="CONNECTS" value="342" />
                    <StatBox label="POSTS" value="87" />
                    <StatBox label="YEAR" value="'26" />
                </div>
            </div>
        </div>

        {/* Joined Clubs */}
        <div className="w-full mb-8">
            <div className="w-full flex items-center justify-between mb-4 border-b-[3px] border-neoBorder pb-2">
                <h3 className="font-black text-sm md:text-lg uppercase">JOINED CLUBS</h3>
                <span className="text-[10px] md:text-xs font-bold text-neoText hover:bg-neoCyan px-2 border-2 border-transparent hover:border-neoBorder py-0.5 transition-all cursor-pointer">VIEW ALL</span>
            </div>
            
            <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                <ClubCard title="Argument Clinic" type="DEBATE" color="bg-blue-400" icon="⚖️" />
                <ClubCard title="Robotics Club" type="ENGINEERING" color="bg-neoOrange" icon="🤖" />
                <div className="col-span-2 md:col-span-1">
                    <ClubCard title="UX / UI Society" type="DESIGN" color="bg-neoCyan" icon="🛠️" />
                </div>
            </div>
        </div>

        {/* Preferences */}
        <div className="w-full">
            <div className="w-full flex items-center justify-between mb-4 border-b-[3px] border-neoBorder pb-2">
                <h3 className="font-black text-sm md:text-lg uppercase">PREFERENCES</h3>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                <ToggleBox label="DARK MODE" icon="🌙" />
                <ToggleBox label="NOTIFICATIONS" icon="🔔" active />
            </div>
        </div>

      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="flex-1 bg-white border-[3px] border-neoBorder p-3 flex flex-col items-center justify-center shadow-neo-sm hover:-translate-y-1 transition-transform">
      <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase">{label}</span>
      <span className="text-xl md:text-3xl font-black">{value}</span>
    </div>
  );
}

function ClubCard({ title, type, color, icon }) {
  return (
    <div className={`${color} border-[3px] border-neoBorder p-3 shadow-neo relative h-24 md:h-32 flex flex-col justify-end group hover:-translate-y-1 transition-transform cursor-pointer`}>
      <div className="absolute top-2 right-2 w-8 h-8 md:w-10 md:h-10 bg-white border-[3px] border-neoBorder rounded-full flex items-center justify-center text-sm md:text-lg group-hover:rotate-12 transition-transform">
        {icon}
      </div>
      <span className="text-[9px] md:text-[10px] font-black uppercase text-neoText bg-white/50 px-1.5 w-max mb-1 mix-blend-overlay">{type}</span>
      <h4 className="font-bold text-xs md:text-sm uppercase leading-tight">{title}</h4>
    </div>
  );
}

function ToggleBox({ label, icon, active }) {
  return (
    <div className="w-full bg-white border-[3px] border-neoBorder p-4 flex items-center justify-between shadow-neo hover:bg-slate-50 cursor-pointer">
      <div className="flex items-center gap-3">
        <span className="text-xl md:text-2xl">{icon}</span>
        <span className="font-bold text-xs md:text-sm uppercase tracking-wide">{label}</span>
      </div>
      <div className={`w-12 h-6 border-[3px] border-neoBorder flex items-center transition-colors ${active ? 'bg-neoCyan' : 'bg-slate-200'}`}>
        <div className={`w-5 h-5 bg-white border-2 border-neoBorder transition-transform ${active ? 'translate-x-[22px]' : '-translate-x-0.5'}`} />
      </div>
    </div>
  );
}
