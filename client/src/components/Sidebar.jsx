import React from 'react';
import useStore from '../utils/store';

const NAV = [
  { section: 'Overview' },
  { id: 'dashboard',  label: 'Dashboard',          dot: '#5B4FD6', active: 'ap'  },
  { section: 'Seating Module' },
  { id: 'import',     label: 'Import Data',         dot: '#E91E8C', active: 'apk' },
  { id: 'classes',    label: 'Class Manager',       dot: '#E91E8C', active: 'apk' },
  { id: 'rooms',      label: 'Room Groups',         dot: '#E91E8C', active: 'apk' },
  { id: 'generate',   label: 'Generate Plan',       dot: '#E91E8C', active: 'apk' },
  { id: 'roomview',   label: 'Room View',           dot: '#E91E8C', active: 'apk' },
  { id: 'directory',  label: 'Roll Directory',      dot: '#E91E8C', active: 'apk' },
  { section: 'Roll Slips' },
  { id: 'datesheet',  label: 'Upload Date Sheet',   dot: '#00A896', active: 'at'  },
  { id: 'slips',      label: 'Slip Preview & Export', dot: '#00A896', active: 'at' },
];

const STYLE = {
  ap:  'bg-purple-DEFAULT/15 border-purple',
  apk: 'bg-pink-DEFAULT/15 border-pink',
  at:  'bg-teal-DEFAULT/15 border-teal',
};
const TEXT = {
  ap: 'text-purple-light', apk: 'text-pink-light', at: 'text-teal-light',
};

export default function Sidebar() {
  const { page, setPage } = useStore();

  return (
    <aside
      className="w-[210px] flex-shrink-0 bg-surface border-r border-white/[0.07] flex flex-col overflow-y-auto"
      style={{ WebkitAppRegion: 'drag' }}
    >
      {/* Logo */}
      <div className="px-3.5 py-4 border-b border-white/[0.07]" style={{ WebkitAppRegion: 'no-drag' }}>
        <div className="text-[12px] font-medium text-tx leading-tight">Exam Management System</div>
        <div className="text-[9px] text-muted mt-0.5 font-mono">React 18 · Tailwind · Electron</div>
      </div>

      {/* Nav items */}
      {NAV.map((item, i) => {
        if (item.section) {
          return (
            <div key={i} className="text-[9px] font-semibold text-muted tracking-widest uppercase px-3.5 pt-3 pb-1"
              style={{ WebkitAppRegion: 'no-drag' }}>
              {item.section}
            </div>
          );
        }
        const isActive = page === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            style={{ WebkitAppRegion: 'no-drag' }}
            className={`flex items-center gap-2 px-3 py-[7px] border-l-2 cursor-pointer transition-colors duration-100 text-left w-full
              ${isActive ? `${STYLE[item.active]} border-l-2` : 'border-transparent hover:bg-white/[0.04]'}`}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.dot }} />
            <span className={`text-[11px] ${isActive ? TEXT[item.active] : 'text-muted'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </aside>
  );
}
