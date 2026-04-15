import React, { useState } from 'react';
import useStore from '../utils/store';
import { openAndImport } from '../utils/fileImport';
import { PAL } from '../utils/palette';
import { Alert } from '../components/ui';

export default function ImportData() {
  const { classes, setClasses, setPage, showToast } = useStore();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const loaded = classes.length > 0;
  const total  = classes.reduce((s, c) => s + c.count, 0);

  async function handleOpen() {
    setLoading(true); setError('');
    try {
      const res = await openAndImport();
      if (!res) { setLoading(false); return; }
      setClasses(res.classes);
      showToast(`✓ Loaded ${res.classes.length} classes, ${res.classes.reduce((s, c) => s + c.count, 0)} students`);
    } catch (e) {
      setError(e.message);
      showToast(e.message, false);
    }
    setLoading(false);
  }

  return (
    <div>
      <h1 className="text-[18px] font-medium text-tx mb-0.5">Import Data</h1>
      <p className="text-[11px] text-muted mb-4">M1 · P1 — Upload student roll numbers from Excel or CSV</p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Roll file card */}
        <div className="bg-surface border border-brd rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted tracking-widest uppercase mb-3">
            <span className="w-2 h-2 rounded-sm" style={{ background: '#E91E8C' }} />
            Student Roll Number File
          </div>
          <div
            onClick={handleOpen}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
              ${loaded ? 'border-grn bg-grn/5' : 'border-brd bg-s2 hover:border-pink hover:bg-pink-DEFAULT/5'}`}
          >
            <div className="text-[22px] mb-1.5">{loaded ? '✅' : '📊'}</div>
            {loaded ? (
              <>
                <div className="text-[12px] text-teal-light font-medium">File loaded successfully</div>
                <div className="text-[10px] text-muted mt-0.5">{classes.length} classes · {total} students</div>
              </>
            ) : (
              <>
                <div className="text-[12px] text-muted">Drop Excel (.xlsx) or CSV here</div>
                <div className="text-[10px] text-dim mt-0.5">or click to browse</div>
              </>
            )}
          </div>

          {error && <Alert type="err" className="mt-2">⚠ {error}</Alert>}

          {loaded && (
            <div className="mt-2">
              <Alert type="ok" className="mb-2">
                ✓ <strong>{classes.length} classes</strong> · {total} students loaded
              </Alert>
              <div className="flex flex-wrap gap-1.5">
                {classes.map((c, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: PAL[i % PAL.length].bg, color: PAL[i % PAL.length].fg }}>
                    {c.name} · {c.rollNos.length}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-3">
            <button onClick={handleOpen} disabled={loading}
              className="text-[11px] px-3 py-1.5 rounded-md border border-pink text-pink-light bg-transparent hover:bg-pink-DEFAULT/15 cursor-pointer disabled:opacity-50">
              {loading ? '⏳ Loading…' : '📁 Choose File'}
            </button>
            {loaded && (
              <button onClick={() => setClasses([])}
                className="text-[11px] px-3 py-1.5 rounded-md border border-brd text-muted bg-transparent hover:border-muted cursor-pointer">
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {/* Date sheet card */}
        <div className="bg-surface border border-brd rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted tracking-widest uppercase mb-3">
            <span className="w-2 h-2 rounded-sm bg-amb" />
            Exam Date Sheet — Optional
          </div>
          <div className="border-2 border-dashed border-brd rounded-lg p-6 text-center bg-s2 hover:border-teal hover:bg-teal-DEFAULT/5 transition-all cursor-pointer">
            <div className="text-[22px] mb-1.5">📄</div>
            <div className="text-[12px] text-muted">Configure exam details in Slip Generator</div>
            <div className="text-[10px] text-dim mt-0.5">date, time, venue set manually</div>
          </div>
          <Alert type="info" className="mt-2">
            FALL-2025 defaults pre-loaded. Edit in the Upload Date Sheet tab.
          </Alert>
        </div>
      </div>

      {/* Format guide */}
      <div className="bg-surface border border-brd rounded-xl p-4 mb-3">
        <div className="text-[10px] font-semibold text-muted tracking-widest uppercase mb-2">File Format Guide</div>
        <Alert type="info">
          Row 1: Class names in columns 1, 3, 5… (every 2nd column) &nbsp;|&nbsp;
          Rows 2+: Roll numbers below each class &nbsp;|&nbsp;
          Sheet named <strong className="ml-1">"Registration No"</strong> auto-detected
        </Alert>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setPage('classes')}
          className="text-[11px] px-4 py-2 rounded-lg bg-gradient-to-r from-purple to-[#2E3192] text-white font-medium cursor-pointer hover:opacity-90">
          Next: Class Manager →
        </button>
      </div>
    </div>
  );
}
