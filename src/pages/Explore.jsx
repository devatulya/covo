import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Explore() {
  return (
    <div className="flex flex-col min-h-screen bg-neoBg pb-20 md:pb-0">
      <div className="bg-white border-b-[3px] border-neoBorder px-4 py-4 flex items-center justify-between sticky top-0 z-40 md:border-b-[3px]">
        <h1 className="text-xl font-black tracking-tighter">EXPLORE</h1>
        <Link to="/" className="w-8 h-8 flex items-center justify-center border-[3px] border-neoBorder bg-neoCyan shadow-neo-sm hover:bg-[#00e5cc]">
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto w-full">
        <div className="w-full bg-white border-[3px] border-neoBorder shadow-neo flex items-center px-4 py-3">
          <input 
            type="text" 
            placeholder="Search communities, tags..." 
            className="w-full border-none outline-none font-bold text-sm bg-transparent placeholder-slate-400"
          />
          <span className="text-neoPurple font-black text-xl hover:scale-110 transition-transform cursor-pointer">🔍</span>
        </div>

        <div>
          <h2 className="bg-neoText text-white inline-block px-3 py-1 font-bold italic mb-4 -skew-x-6 tracking-wide text-sm md:text-lg shadow-neo">
            TRENDING TOPICS
          </h2>
          <div className="flex flex-wrap gap-3">
            <div className="border-[3px] border-neoBorder bg-neoYellow px-3 py-1.5 font-bold text-sm shadow-neo-sm hover:-translate-y-1 transition-transform cursor-pointer">#ProfRant 🔥</div>
            <div className="border-[3px] border-neoBorder bg-neoPink text-white px-3 py-1.5 font-bold text-sm shadow-neo-sm hover:-translate-y-1 transition-transform cursor-pointer">#FinalsWeek 📚</div>
            <div className="border-[3px] border-neoBorder bg-neoCyan px-3 py-1.5 font-bold text-sm shadow-neo-sm hover:-translate-y-1 transition-transform cursor-pointer">#MemeWars 🤡</div>
            <div className="border-[3px] border-neoBorder bg-white px-3 py-1.5 font-bold text-sm shadow-neo-sm hover:-translate-y-1 transition-transform cursor-pointer">#CampusFood 🍕</div>
            <div className="border-[3px] border-neoBorder bg-neoCyan px-3 py-1.5 font-bold text-sm shadow-neo-sm hover:-translate-y-1 transition-transform cursor-pointer">#DormLife 😴</div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="bg-neoText text-white inline-block px-3 py-1 font-bold italic -skew-x-6 tracking-wide text-sm md:text-lg shadow-neo">
              COMMUNITIES
            </h2>
            <span className="text-xs font-bold underline cursor-pointer hover:text-neoPurple">View All</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CommunityCard color="bg-neoOrange" title="Engineering Club" desc="Build stuff, break stuff." members="1.2k" />
            <CommunityCard color="bg-neoPurple" title="Chess Club" desc="Gambits and endgames." members="450" />
            <CommunityCard color="bg-neoPink" title="Digital Arts" desc="Pixels > Paint" members="890" checked />
            <CommunityCard color="bg-neoYellow" title="Varsity Esports" desc="GLHF" members="2.5k" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CommunityCard({ color, title, desc, members, checked }) {
  return (
    <div className="bg-white border-[3px] border-neoBorder p-3 shadow-neo flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 border-[3px] border-neoBorder ${color} flex items-center justify-center group-hover:-rotate-6 transition-transform`}>
          <div className="w-5 h-5 bg-white mix-blend-overlay opacity-30"></div>
        </div>
        <div>
          <h3 className="font-bold text-sm">{title}</h3>
          <p className="text-xs text-slate-500 font-medium">{desc}</p>
          <p className="text-[10px] font-bold text-green-600 mt-0.5">● {members} Members</p>
        </div>
      </div>
      <div className={`w-8 h-8 rounded-full border-[3px] border-neoBorder flex items-center justify-center font-bold ${checked ? 'bg-neoText text-white' : 'bg-transparent text-neoText group-hover:bg-neoYellow transition-colors'}`}>
        {checked ? '✓' : '+'}
      </div>
    </div>
  );
}
