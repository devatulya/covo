import React, { useState } from 'react';
import { ArrowLeft, Image, Link2, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CreatePost() {
  const [ghostMode, setGhostMode] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-neoBg pb-20">
      <div className="bg-white border-b-[3px] border-neoBorder px-4 py-4 flex items-center justify-between">
        <Link to="/" className="w-8 h-8 flex items-center justify-center border-[3px] border-neoBorder bg-neoCyan shadow-neo-sm text-neoText">
          <ArrowLeft className="w-5 h-5 stroke-[3px]" />
        </Link>
        <h1 className="text-lg font-black tracking-tighter uppercase">New Blast</h1>
        <span className="text-xs font-bold text-neoPurple underline">Drafts</span>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-4">
        {/* Select Zone */}
        <button className="w-full bg-neoYellow border-[3px] border-neoBorder text-neoText font-bold text-left px-4 py-3 shadow-neo flex items-center justify-between">
          <span>SELECT ZONE</span>
          <span className="text-xl">▾</span>
        </button>

        {/* Text Area */}
        <div className="bg-white border-[3px] border-neoBorder shadow-neo flex flex-col h-64">
          <textarea 
            className="w-full flex-1 p-4 resize-none outline-none font-bold text-sm bg-transparent placeholder-slate-300"
            placeholder="SPILL THE TEA... WHAT'S HAPPENING ON CAMPUS?"
          />
          <div className="border-t-[3px] border-neoBorder p-2 flex items-center justify-between">
            <div className="flex items-center gap-3 px-2">
              <Image className="w-5 h-5 stroke-[2px] text-slate-600" />
              <Link2 className="w-5 h-5 stroke-[2px] text-slate-600" />
              <BarChart2 className="w-5 h-5 stroke-[2px] text-slate-600" />
            </div>
            <span className="text-[10px] font-bold text-slate-400">0/280</span>
          </div>
        </div>

        {/* Ghost Mode */}
        <div className="bg-white border-[3px] border-neoBorder shadow-neo p-3 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👻</span>
            <div>
              <h3 className="font-bold text-xs">GHOST MODE</h3>
              <p className="text-[10px] font-medium text-slate-500 uppercase leading-tight">Post anonymously to this board</p>
            </div>
          </div>
          <button 
            onClick={() => setGhostMode(!ghostMode)}
            className={`w-12 h-6 border-[3px] border-neoBorder flex items-center transition-colors ${ghostMode ? 'bg-neoCyan' : 'bg-slate-200'}`}
          >
            <div className={`w-4 h-4 bg-white border-[3px] border-neoBorder transition-transform ${ghostMode ? 'translate-x-6' : ''}`} />
          </button>
        </div>

        {/* Submit */}
        <button className="w-full bg-neoPink text-white font-black uppercase text-xl py-4 border-[3px] border-neoBorder shadow-neo active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
          BLAST IT 🚀
        </button>
      </div>
    </div>
  );
}
