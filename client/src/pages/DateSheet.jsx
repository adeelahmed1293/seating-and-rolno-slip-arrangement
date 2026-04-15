import React from 'react';
import useStore from '../utils/store';
import { buildSlips } from '../utils/exportUtils';
import { Alert } from '../components/ui';

export default function DateSheet() {
  const { result, classes, examInfo, setExamInfo, setSlips, setPage, showToast } = useStore();

  function handle(field, val) {
    setExamInfo({ [field]: val });
  }

  function saveAndPreview() {
    if (!result) { showToast('Generate a seating plan first.', false); return; }
    const slips = buildSlips(classes, result, examInfo);
    setSlips(slips);
    showToast(`✓ ${slips.length} slips built`);
    setPage('slips');
  }

  const Field = ({ label, field, span2 }) => (
    <div className={span2 ? 'col-span-2' : ''}>
      <label className="block text-[10px] text-muted mb-1">{label}</label>
      <input value={examInfo[field] || ''}
        onChange={e => handle(field, e.target.value)}
        className="w-full bg-s2 border border-brd rounded px-2.5 py-1.5 text-[12px] text-tx outline-none focus:border-purple" />
    </div>
  );

  return (
    <div>
      <h1 className="text-[18px] font-medium text-tx mb-0.5">Exam Configuration</h1>
      <p className="text-[11px] text-muted mb-4">M2 · P1 — Configure exam details used on every roll slip</p>

      <div className="bg-surface border border-brd rounded-xl p-4 mb-3">
        <div className="text-[10px] font-semibold text-muted tracking-widest uppercase mb-3">University &amp; Exam Details</div>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <Field label="University / Institution Name" field="uni" span2 />
          <Field label="Exam Name"         field="exam" />
          <Field label="Exam Date"         field="date" />
          <Field label="Day"               field="day"  />
          <Field label="Time"              field="time" />
          <Field label="Block / Venue"     field="block" />
          <Field label="Short Name (Logo)" field="short" />
        </div>
        <Alert type="info">
          These details appear on every student's roll slip. You can change them anytime before exporting.
        </Alert>
      </div>

      {!result && (
        <Alert type="warn" className="mb-3">
          ⚠ Generate a seating plan first before building slips.
        </Alert>
      )}

      {/* Live preview */}
      <div className="bg-surface border border-brd rounded-xl p-4 mb-3">
        <div className="text-[10px] font-semibold text-muted tracking-widest uppercase mb-3">Live Slip Preview</div>
        <div className="flex justify-center">
          <div className="bg-white rounded-lg w-[340px] overflow-hidden shadow-xl">
            <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: '#2E3192' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                style={{ background: 'rgba(255,255,255,0.2)' }}>
                {examInfo.short || 'UNI'}
              </div>
              <div className="text-center flex-1">
                <div className="text-[8px]" style={{ color: 'rgba(255,255,255,0.85)' }}>{examInfo.uni}</div>
                <div className="text-[11px] font-bold text-white tracking-wide">
                  {(examInfo.exam || 'EXAMINATION').toUpperCase()} ROLL SLIP
                </div>
              </div>
              <div className="w-7" />
            </div>
            <div className="px-4 py-3 bg-white">
              <div className="flex gap-3 mb-2.5">
                <div className="flex-1">
                  <div className="text-[7px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">Roll Number</div>
                  <div className="text-[14px] font-bold text-[#2E3192] font-mono">2024-XX-001</div>
                </div>
                <div className="flex-1">
                  <div className="text-[7px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">Class</div>
                  <div className="text-[11px] font-medium text-gray-800">BSCS-1</div>
                </div>
              </div>
              <div className="h-px bg-gray-100 my-2" />
              <div className="flex gap-2 rounded-md p-2 mb-2.5" style={{ background: '#f5f5fc' }}>
                {[['Room','Room 1'],['Seat','R1 C1'],['Block', examInfo.block || 'Block A']].map(([l, v]) => (
                  <div key={l} className="flex-1 text-center">
                    <div className="text-[7px] text-gray-400 uppercase">{l}</div>
                    <div className="text-[12px] font-bold" style={{ color: '#2E3192' }}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2" style={{ borderTop: '0.5px solid #e8e8f0' }}>
                <div className="text-center">
                  <div style={{ borderBottom: '0.5px solid #ccc', width: '100px', height: '16px', marginBottom: '2px' }} />
                  <div className="text-[7px] text-gray-400">Student Signature</div>
                </div>
                <div className="text-center">
                  <div style={{ borderBottom: '0.5px solid #ccc', width: '100px', height: '16px', marginBottom: '2px' }} />
                  <div className="text-[7px] text-gray-400">Invigilator Signature</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={saveAndPreview}
          className="text-[11px] px-4 py-2 rounded-lg bg-gradient-to-r from-teal to-[#0F6E56] text-white font-medium cursor-pointer hover:opacity-90">
          Save &amp; Preview Slips →
        </button>
        <button onClick={() => setPage('generate')}
          className="text-[11px] px-3 py-2 rounded border border-brd text-muted bg-transparent hover:border-muted cursor-pointer">
          ← Generate Plan
        </button>
      </div>
    </div>
  );
}
