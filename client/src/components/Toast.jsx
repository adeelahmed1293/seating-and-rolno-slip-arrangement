import React from 'react';
import useStore from '../utils/store';

export default function Toast() {
  const { toast } = useStore();
  return (
    <div
      className={`fixed bottom-5 right-5 px-3.5 py-2 rounded-lg text-[11px] z-50 transition-all duration-300 pointer-events-none border
        ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        ${toast.ok
          ? 'bg-grn/15 border-grn/30 text-teal-light'
          : 'bg-dng-DEFAULT/15 border-dng-DEFAULT/30 text-dng-light'
        }`}
    >
      {toast.msg}
    </div>
  );
}
