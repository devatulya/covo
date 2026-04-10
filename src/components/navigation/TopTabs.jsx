import React from 'react';
import { useUiStore } from '../../store/uiStore';

export function TopTabs() {
  const { activeTab, setActiveTab } = useUiStore();
  const tabs = ['COLLEGE', 'SUB-COMMUNITIES', 'MY FEED'];

  return (
    <div className="bg-white border-b-[3px] border-neoBorder p-2">
      <div className="flex items-center gap-0 w-full overflow-hidden border-[3px] border-neoBorder h-10 bg-white shadow-neo-sm">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 whitespace-nowrap px-2 py-1 text-[10px] sm:text-xs font-bold transition-colors h-full ${
              index !== tabs.length - 1 ? 'border-r-[3px] border-neoBorder' : ''
            } ${
              activeTab === tab
                ? 'bg-neoCyan text-neoText'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
