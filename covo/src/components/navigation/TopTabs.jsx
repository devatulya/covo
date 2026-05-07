import React from 'react';
import { useUiStore } from '../../store/uiStore';

const defaultTabs = ['GLOBAL', 'COLLEGE'];

export function TopTabs({ tabs = defaultTabs, onSelect }) {
  const { activeTab, setActiveTab } = useUiStore((state) => ({
    activeTab: state.activeTab,
    setActiveTab: state.setActiveTab,
  }));

  const handleSelect = (tab) => {
    setActiveTab(tab);
    onSelect?.(tab);
  };

  return (
    <div className="surface-panel sticky top-[73px] z-30 border-b-[3px] border-neoBorder p-2">
      <div className="flex h-11 w-full items-center overflow-hidden border-[3px] border-neoBorder shadow-neo-sm">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleSelect(tab)}
            className={`h-full flex-1 whitespace-nowrap px-2 text-[10px] font-black uppercase tracking-[0.12em] transition-colors sm:text-xs ${
              index !== tabs.length - 1 ? 'border-r-[3px] border-neoBorder' : ''
            } ${activeTab === tab ? 'bg-neoCyan text-neoText' : 'surface-panel text-neoMuted hover:bg-neoSurfaceMuted'}`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
