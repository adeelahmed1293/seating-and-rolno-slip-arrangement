import React from 'react';

/** Sort button — shows ↑ ↓ ⇅ */
export function SortBtn({ col, sort, onSort }) {
  const active = sort.key === col;
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onSort(col); }}
      className="inline-flex items-center ml-1 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
    >
      {active
        ? <span className="text-teal-light text-[10px]">{sort.dir === 'asc' ? '↑' : '↓'}</span>
        : <span className="text-dim text-[10px]">⇅</span>
      }
    </button>
  );
}

/** Inline sort toolbar used in several pages */
export function SortBar({ sorts, sort, onSort, onClear, right }) {
  return (
    <div className="flex items-center gap-2 mb-3 text-[10px] flex-wrap">
      <span className="text-muted">Sort:</span>
      {sorts.map(([k, l]) => (
        <button key={k} onClick={() => onSort(k)}
          className={`px-2 py-0.5 rounded border cursor-pointer transition-colors
            ${sort.key === k ? 'border-teal text-teal-light bg-teal/10' : 'border-brd text-muted hover:border-muted'}`}>
          {l} {sort.key === k ? (sort.dir === 'asc' ? '↑' : '↓') : '⇅'}
        </button>
      ))}
      {sort.key && (
        <button onClick={onClear} className="px-2 py-0.5 rounded border border-brd text-dim hover:border-muted cursor-pointer">
          × Clear
        </button>
      )}
      {right && <div className="ml-auto flex gap-2">{right}</div>}
    </div>
  );
}

/** Generic pill badge */
export function Pill({ variant = 'grey', children, className = '' }) {
  const styles = {
    teal:   'bg-teal-DEFAULT/10 border-teal-DEFAULT/30 text-teal-light',
    green:  'bg-grn/12 border-grn/30 text-teal-light',
    red:    'bg-dng-DEFAULT/12 border-dng-DEFAULT/30 text-dng-light',
    amber:  'bg-amb/12 border-amb/30 text-yellow-300',
    grey:   'bg-white/5 border-brd text-muted',
    purple: 'bg-purple-DEFAULT/12 border-purple-DEFAULT/30 text-purple-light',
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full border font-mono ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}

/** Alert bar */
export function Alert({ type = 'info', children, className = '' }) {
  const styles = {
    ok:   'bg-grn/10 border-grn/30 text-teal-light',
    warn: 'bg-amb/10 border-amb/30 text-yellow-300',
    err:  'bg-dng-DEFAULT/10 border-dng-DEFAULT/30 text-dng-light',
    info: 'bg-blue-600/10 border-blue-400/25 text-blue-300',
  };
  return (
    <div className={`flex items-start gap-2 text-[11px] px-3 py-2 rounded-lg border ${styles[type]} ${className}`}>
      {children}
    </div>
  );
}

/** Number +/− control */
export function NumCtrl({ value, onChange, min = 1, max = 50 }) {
  const adj = (delta) => {
    const v = Math.max(min, Math.min(max, value + delta));
    onChange(v);
  };
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => adj(-1)}
        className="w-6 h-6 rounded border border-brd bg-s2 text-muted text-sm flex items-center justify-center cursor-pointer hover:border-teal hover:text-teal-light transition-colors">
        −
      </button>
      <input type="number" value={value}
        onChange={e => onChange(Math.max(min, Math.min(max, +e.target.value)))}
        className="w-14 text-center font-mono text-[13px] bg-s2 border border-brd rounded px-2 py-1 text-tx outline-none focus:border-purple"
      />
      <button onClick={() => adj(1)}
        className="w-6 h-6 rounded border border-brd bg-s2 text-muted text-sm flex items-center justify-center cursor-pointer hover:border-teal hover:text-teal-light transition-colors">
        +
      </button>
    </div>
  );
}
